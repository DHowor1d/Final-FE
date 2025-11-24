import { useEffect, useState, useRef, useCallback } from "react";
import { createRackSSE, type SSEConnection } from "@api/sseClient";
import type {
  RackMetrics,
  CpuUsageData,
  NetworkUsageTrend,
  TemperatureHumidityData,
} from "@domains/mainDashboard/types/dashboard.types";

const MAX_HISTORY_POINTS = 20; // 차트에 표시할 최대 데이터 포인트 수

export interface UseRackSSEResult {
  // 현재 메트릭
  metrics: RackMetrics | null;
  
  // 시계열 데이터
  cpuUsageHistory: CpuUsageData[];
  networkTrafficHistory: NetworkUsageTrend[];
  temperatureHumidityHistory: TemperatureHumidityData[];
  
  // 연결 상태
  isConnected: boolean;
  error: string | null;
  
  // 제어 함수
  reconnect: () => void;
}

/**
 * 랙 실시간 모니터링 SSE Hook
 * @param rackId 랙 ID
 * @param enabled 연결 활성화 여부
 */
export const useRackSSE = (
  rackId: number | null,
  enabled: boolean = true
): UseRackSSEResult => {
  const [metrics, setMetrics] = useState<RackMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 시계열 데이터 상태
  const [cpuUsageHistory, setCpuUsageHistory] = useState<CpuUsageData[]>([]);
  const [networkTrafficHistory, setNetworkTrafficHistory] = useState<NetworkUsageTrend[]>([]);
  const [temperatureHumidityHistory, setTemperatureHumidityHistory] = useState<TemperatureHumidityData[]>([]);

  const sseConnectionRef = useRef<SSEConnection | null>(null);

  // SSE 메시지 처리
  const handleMessage = useCallback((data: RackMetrics) => {
    // 데이터 유효성 검증
    if (!data || !data.cpuStats || !data.networkStats || !data.environment) {
      console.warn('Incomplete SSE data received:', data);
      return;
    }

    setMetrics(data);
    setError(null);

    // CPU 사용량 데이터 추가
    setCpuUsageHistory((prev) => {
      const cpuUsage: CpuUsageData = {
        time: data.timestamp,
        avgUsage: data.cpuStats.avgUsage,
        maxUsage: data.cpuStats.maxUsage,
        minUsage: 0, // 랙 데이터에는 min이 없으므로 0으로 설정
      };
      const updated = [...prev, cpuUsage];
      if (updated.length > MAX_HISTORY_POINTS) {
        return updated.slice(updated.length - MAX_HISTORY_POINTS);
      }
      return updated;
    });

    // 네트워크 트래픽 데이터 추가
    setNetworkTrafficHistory((prev) => {
      const networkTraffic: NetworkUsageTrend = {
        time: data.timestamp,
        rxBytesPerSec: data.networkStats.totalRxMbps * 1000000 / 8, // Mbps to bytes/sec
        txBytesPerSec: data.networkStats.totalTxMbps * 1000000 / 8,
      };
      const updated = [...prev, networkTraffic];
      if (updated.length > MAX_HISTORY_POINTS) {
        return updated.slice(updated.length - MAX_HISTORY_POINTS);
      }
      return updated;
    });

    // 온습도 데이터 추가
    setTemperatureHumidityHistory((prev) => {
      const tempHumidity: TemperatureHumidityData = {
        time: data.timestamp,
        temperature: data.environment.temperature,
        humidity: data.environment.humidity,
      };
      const updated = [...prev, tempHumidity];
      if (updated.length > MAX_HISTORY_POINTS) {
        return updated.slice(updated.length - MAX_HISTORY_POINTS);
      }
      return updated;
    });
  }, []);

  // SSE 연결 관리
  useEffect(() => {
    if (!enabled || rackId === null) {
      // 연결 해제
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
        sseConnectionRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // SSE 연결 생성
    sseConnectionRef.current = createRackSSE(rackId, {
      onMessage: handleMessage,
      onError: (error) => {
        console.error("SSE Error:", error);
        setError("실시간 연결에 문제가 발생했습니다.");
        setIsConnected(false);
      },
      onOpen: () => {
        console.log(`Connected to rack ${rackId} SSE`);
        setIsConnected(true);
        setError(null);
      },
      reconnectDelay: 3000,
      maxReconnectAttempts: 10,
    });

    // 클린업
    return () => {
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
        sseConnectionRef.current = null;
      }
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rackId, enabled]);

  // 수동 재연결 함수
  const reconnect = useCallback(() => {
    if (sseConnectionRef.current) {
      sseConnectionRef.current.reconnect();
    }
  }, []);

  return {
    metrics,
    cpuUsageHistory,
    networkTrafficHistory,
    temperatureHumidityHistory,
    isConnected,
    error,
    reconnect,
  };
};
