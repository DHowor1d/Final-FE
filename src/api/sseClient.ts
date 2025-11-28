/**
 * @author 김대호
 * @description SSE (Server-Sent Events) 클라이언트 - 서버로부터 실시간 데이터 스트림을 수신하는 클라이언트
 * 데이터센터, 서버실, 랙, 장비 등의 모니터링 데이터를 SSE로 수신
 * 자동 재연결 기능 포함, 최대 재연결 횟수 및 딥레이 설정 가능
 * AbortController를 사용하여 연결 종료 및 재연결 관리
 * Access Token 기반 인증으로 보안 연결 유지
 */

import { getAccessToken } from "./client";

const BASE_URL = "https://api.serverway.shop/api";

/**
 * @interface SSEOptions
 * @description SSE 연결 옵션 타입 정의
 * @template T - 수신할 데이터의 타입
 */
export interface SSEOptions<T = unknown> {
  onMessage: (data: T) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export interface SSEConnection {
  close: () => void;
  reconnect: () => void;
  isConnected: () => boolean;
}


/**
 * @function createSSEConnection
 * @description SSE 연결을 생성하고 관리하는 핵심 함수
 * @template T - 수신할 데이터의 타입
 * @param {string} endpoint - SSE 엔드포인트 URL
 * @param {SSEOptions<T>} options - SSE 연결 옵션 (콜백 함수, 재연결 설정 포함)
 * @returns {SSEConnection} SSE 연결 제어 객체 (close, reconnect, isConnected 메서드)
 */
export const createSSEConnection = <T = unknown>(
  endpoint: string,
  options: SSEOptions<T>
): SSEConnection => {
  let abortController: AbortController | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  let isManualClose = false;

  const {
    onMessage,
    onError,
    onOpen,
    reconnectDelay = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const connect = async () => {
    try {
      // 이전 연결 정리
      if (abortController) {
        abortController.abort();
      }

      abortController = new AbortController();
      const accessToken = getAccessToken();

      if (!accessToken) {
        console.error("No access token available for SSE connection");
        if (onError) {
          onError(new Event("error"));
        }
        return;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
        credentials: "include",
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      // 연결 성공
      reconnectAttempts = 0;
      if (onOpen) {
        onOpen();
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      // 스트림 읽기
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("SSE stream closed");
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) {
            continue;
          }

          const payload = line.substring(5).trim();
          if (!payload) {
            continue;
          }

          // 일부 서버는 연결 확인을 위해 단순 문자열을 보낼 수 있으므로 JSON 형태만 처리
          if (!payload.startsWith("{") && !payload.startsWith("[")) {
            if (import.meta.env.DEV) {
              console.debug("Ignoring non-JSON SSE payload:", payload);
            }
            continue;
          }

          try {
            const data = JSON.parse(payload);
            onMessage(data);
          } catch (error) {
            console.error("Failed to parse SSE data:", error, payload);
          }
        }
      }

      // 정상 종료가 아닌 경우 재연결 시도
      if (!isManualClose) {
        attemptReconnect();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("SSE connection aborted");
        return;
      }

      console.error("SSE connection error:", error);
      if (onError) {
        onError(new Event("error"));
      }

      // 재연결 시도
      if (!isManualClose) {
        attemptReconnect();
      }
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error(
        `Max reconnect attempts (${maxReconnectAttempts}) reached`
      );
      return;
    }

    reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`
    );

    reconnectTimeout = setTimeout(() => {
      connect();
    }, reconnectDelay);
  };

  const close = () => {
    isManualClose = true;

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  const reconnect = () => {
    close();
    isManualClose = false;
    reconnectAttempts = 0;
    connect();
  };

  const isConnected = () => {
    return abortController !== null && !isManualClose;
  };

  // 초기 연결 시작
  connect();

  return {
    close,
    reconnect,
    isConnected,
  };
};

/**
 * 데이터센터 모니터링 SSE 연결 생성
 */
export const createDatacenterSSE = <T = unknown>(
  datacenterId: number,
  options: Omit<SSEOptions<T>, "onOpen"> & { onOpen?: () => void }
) => {
  return createSSEConnection(
    `/monitoring/subscribe/datacenter/${datacenterId}`,
    options
  );
};

/**
 * 서버실 모니터링 SSE 연결 생성 (추후 사용)
 */
export const createServerRoomSSE = <T = unknown>(
  serverRoomId: number,
  options: Omit<SSEOptions<T>, "onOpen"> & { onOpen?: () => void }
) => {
  return createSSEConnection(
    `/monitoring/subscribe/serverroom/${serverRoomId}`,
    options
  );
};

/**
 * 랙 모니터링 SSE 연결 생성 (추후 사용)
 */
export const createRackSSE = <T = unknown>(
  rackId: number,
  options: Omit<SSEOptions<T>, "onOpen"> & { onOpen?: () => void }
) => {
  return createSSEConnection(`/monitoring/subscribe/rack/${rackId}`, options);
};

/**
 * 알림 SSE 연결 생성
 */
export const createAlertSSE = <T = unknown>(
  options: Omit<SSEOptions<T>, "onOpen"> & { onOpen?: () => void }
) => {
  return createSSEConnection(`/alerts/subscribe`, options);
};
