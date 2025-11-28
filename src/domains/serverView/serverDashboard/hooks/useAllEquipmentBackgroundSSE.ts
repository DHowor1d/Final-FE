/**
 * @author 구희원
 * @description 모든 장비의 백그라운드 SSE 연결 훅
 */

import { useEffect, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { getAccessToken, BASE_URL } from "@/api/client";
import type { DiskMonitoringData, SystemMonitoringData } from "../types";

/**
 * SSE 이벤트
 */
interface SSEEvent extends Event {
  data: string;
}

/**
 * 간단한 메트릭 정보
 */
export interface SimpleMetrics {
  cpu: number;
  memory: number;
  disk: number;
}

/**
 * 백그라운드 SSE 콜백
 */
interface BackgroundSSECallbacks {
  onMetricsUpdate: (equipmentId: number, metrics: SimpleMetrics) => void;
  onConnectionError?: (equipmentId: number, error: Event) => void;
}

/**
 * System 모니터링 데이터 타입 가드
 */
const isSystemMonitoringData = (
  data: unknown
): data is SystemMonitoringData => {
  return typeof data === "object" && data !== null && "cpuIdle" in data;
};

/**
 * Disk 모니터링 데이터 타입 가드
 */
const isDiskMonitoringData = (data: unknown): data is DiskMonitoringData => {
  return typeof data === "object" && data !== null && "usedPercentage" in data;
};

/**
 * System 및 Disk 데이터에서 메트릭 추출
 */
const extractMetricsFromSystemData = (
  systemData: SystemMonitoringData | null,
  diskData: DiskMonitoringData | null
): SimpleMetrics | null => {
  if (!systemData) return null;

  const cpu = Math.max(0, 100 - systemData.cpuIdle);
  const memory = systemData.usedMemoryPercentage || 0;
  const disk = diskData?.usedPercentage || 0;

  return {
    cpu: Number(cpu.toFixed(1)),
    memory: Number(memory.toFixed(1)),
    disk: Number(disk.toFixed(1)),
  };
};

/**
 * 모든 장비의 백그라운드 SSE 연결 훅
 *
 * 여러 장비의 실시간 모니터링 데이터를 동시에 수신하여 메트릭을 업데이트합니다.
 * 연결 실패 시 지수 백오프 전략으로 재연결을 시도합니다.
 *
 * @param {number[]} equipmentIds - 모니터링할 장비 ID 목록
 * @param {BackgroundSSECallbacks} callbacks - SSE 이벤트 콜백
 */
export const useAllEquipmentBackgroundSSE = (
  equipmentIds: number[],
  callbacks: BackgroundSSECallbacks
) => {
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!equipmentIds || equipmentIds.length === 0) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      return;
    }

    const eventSourceMap = new Map<number, EventSource>();

    /**
     * 특정 장비에 SSE 연결
     */
    const connectToEquipment = (equipmentId: number) => {
      try {
        const url = `${BASE_URL}/monitoring/subscribe/equipment/${equipmentId}`;

        let latestSystemData: SystemMonitoringData | null = null;
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 5;
        const RECONNECT_DELAY = 3000;

        const eventSource = new EventSourcePolyfill(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }) as EventSource;

        // System 데이터 수신
        eventSource.addEventListener("system", (event: Event) => {
          try {
            const sseEvent = event as SSEEvent;
            const parsedData = JSON.parse(sseEvent.data);

            if (isSystemMonitoringData(parsedData)) {
              latestSystemData = parsedData;
            } else {
              console.warn(
                `[Equipment ${equipmentId}] Invalid system data:`,
                parsedData
              );
            }
          } catch (error) {
            console.error(
              `[Equipment ${equipmentId}] System data parse error:`,
              error
            );
          }
        });

        // Disk 데이터 수신 → 메트릭 업데이트
        eventSource.addEventListener("disk", (event: Event) => {
          try {
            const sseEvent = event as SSEEvent;
            const parsedData = JSON.parse(sseEvent.data);

            if (isDiskMonitoringData(parsedData)) {
              const metrics = extractMetricsFromSystemData(
                latestSystemData,
                parsedData
              );
              if (metrics) {
                callbacksRef.current.onMetricsUpdate(equipmentId, metrics);
              }
            } else {
              console.warn(
                `[Equipment ${equipmentId}] Invalid disk data:`,
                parsedData
              );
            }
          } catch (error) {
            console.error(
              `[Equipment ${equipmentId}] Disk data parse error:`,
              error
            );
          }
        });

        // 에러 처리 및 재연결
        eventSource.onerror = (error: Event) => {
          console.error(
            `[Equipment ${equipmentId}] SSE connection error:`,
            error
          );
          eventSource.close();
          eventSourceMap.delete(equipmentId);
          callbacksRef.current.onConnectionError?.(equipmentId, error);

          // 지수 백오프로 재연결
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);

            setTimeout(() => {
              if (equipmentIds.includes(equipmentId)) {
                console.log(
                  `[Equipment ${equipmentId}] Reconnecting... (attempt ${reconnectAttempts})`
                );
                connectToEquipment(equipmentId);
              }
            }, delay);
          } else {
            console.error(
              `[Equipment ${equipmentId}] Max reconnection attempts reached`
            );
          }
        };

        eventSourceMap.set(equipmentId, eventSource);
      } catch (error) {
        console.error(
          `[Equipment ${equipmentId}] Failed to create SSE connection:`,
          error
        );
      }
    };

    // 모든 장비에 동시 연결
    equipmentIds.forEach((equipmentId) => {
      connectToEquipment(equipmentId);
    });

    // Cleanup
    return () => {
      eventSourceMap.forEach((eventSource, equipmentId) => {
        console.log(`[Equipment ${equipmentId}] Closing SSE connection`);
        eventSource.close();
      });
      eventSourceMap.clear();
    };
  }, [equipmentIds]);
};
