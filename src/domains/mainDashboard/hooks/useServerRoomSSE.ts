import { useEffect, useState, useRef, useCallback } from "react";
import { createServerRoomSSE, type SSEConnection } from "@api/sseClient";
import type {
  ServerRoomMetrics,
  LoadAverageData,
  DiskUsageData,
  CpuUsageData,
  NetworkErrorData,
  NetworkUsageTrend,
  TemperatureHumidityData,
} from "../types/dashboard.types";

const MAX_HISTORY_POINTS = 20; // 차트에 표시할 최대 데이터 포인트 수

export interface UseServerRoomSSEResult {
  // 현재 메트릭
  metrics: ServerRoomMetrics | null;
  
  // 시계열 데이터
  loadAverageHistory: LoadAverageData[];
  diskUsageHistory: DiskUsageData[];
  cpuUsageHistory: CpuUsageData[];
  networkErrorHistory: NetworkErrorData[];
  networkTrafficHistory: NetworkUsageTrend[];
  temperatureHumidityHistory: TemperatureHumidityData[];
  
  // 연결 상태
  isConnected: boolean;
  error: string | null;
  
  // 제어 함수
  reconnect: () => void;
}

/**
 * 서버룸 실시간 모니터링 SSE Hook
 * @param serverRoomId 서버룸 ID
 * @param enabled 연결 활성화 여부
 */
export const useServerRoomSSE = (
  serverRoomId: number | null,
  enabled: boolean = true
): UseServerRoomSSEResult => {
  const [metrics, setMetrics] = useState<ServerRoomMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 시계열 데이터 상태
  const [loadAverageHistory, setLoadAverageHistory] = useState<LoadAverageData[]>([]);
  const [diskUsageHistory, setDiskUsageHistory] = useState<DiskUsageData[]>([]);
  const [cpuUsageHistory, setCpuUsageHistory] = useState<CpuUsageData[]>([]);
  const [networkErrorHistory, setNetworkErrorHistory] = useState<NetworkErrorData[]>([]);
  const [networkTrafficHistory, setNetworkTrafficHistory] = useState<NetworkUsageTrend[]>([]);
  const [temperatureHumidityHistory, setTemperatureHumidityHistory] = useState<TemperatureHumidityData[]>([]);

  const sseConnectionRef = useRef<SSEConnection | null>(null);

  // 시계열 데이터 추가 헬퍼 함수
  const addToHistory = useCallback(<T,>(
    setHistory: React.Dispatch<React.SetStateAction<T[]>>,
    newData: T
  ) => {
    setHistory((prev) => {
      const updated = [...prev, newData];
      // 최대 개수 유지
      if (updated.length > MAX_HISTORY_POINTS) {
        return updated.slice(updated.length - MAX_HISTORY_POINTS);
      }
      return updated;
    });
  }, []);

  // SSE 메시지 처리
  const handleMessage = useCallback(
    (data: ServerRoomMetrics) => {
      setMetrics(data);
      setError(null);

      // Load Average 데이터 추가
      const loadAvg: LoadAverageData = {
        time: data.timestamp,
        loadAvg1: data.avgLoadAvg1,
        loadAvg5: data.avgLoadAvg1 * 0.9, // 추정값
        loadAvg15: data.avgLoadAvg1 * 0.8, // 추정값
      };
      addToHistory(setLoadAverageHistory, loadAvg);

      // 디스크 사용량 데이터 추가
      const diskUsage: DiskUsageData = {
        time: data.timestamp,
        avgUsage: data.avgDiskUsage,
        maxUsage: data.maxDiskUsage,
        minUsage: data.minDiskUsage,
      };
      addToHistory(setDiskUsageHistory, diskUsage);

      // CPU 사용량 데이터 추가
      const cpuUsage: CpuUsageData = {
        time: data.timestamp,
        avgUsage: data.avgCpuUsage,
        maxUsage: data.maxCpuUsage,
        minUsage: data.minCpuUsage,
      };
      addToHistory(setCpuUsageHistory, cpuUsage);

      // 네트워크 에러 데이터 추가
      const networkError: NetworkErrorData = {
        time: data.timestamp,
        inErrors: data.totalInErrors,
        outErrors: data.totalOutErrors,
      };
      addToHistory(setNetworkErrorHistory, networkError);

      // 네트워크 트래픽 데이터 추가
      const networkTraffic: NetworkUsageTrend = {
        time: data.timestamp,
        rxBytesPerSec: data.totalInBps,
        txBytesPerSec: data.totalOutBps,
      };
      addToHistory(setNetworkTrafficHistory, networkTraffic);

      // 온습도 데이터 추가
      const tempHumidity: TemperatureHumidityData = {
        time: data.timestamp,
        temperature: data.avgTemperature,
        humidity: data.avgHumidity,
      };
      addToHistory(setTemperatureHumidityHistory, tempHumidity);
    },
    [addToHistory]
  );

  // SSE 연결 관리
  useEffect(() => {
    if (!enabled || serverRoomId === null) {
      // 연결 해제
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
        sseConnectionRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // SSE 연결 생성
    sseConnectionRef.current = createServerRoomSSE(serverRoomId, {
      onMessage: handleMessage,
      onError: (error) => {
        console.error("SSE Error:", error);
        setError("실시간 연결에 문제가 발생했습니다.");
        setIsConnected(false);
      },
      onOpen: () => {
        console.log(`Connected to serverRoom ${serverRoomId} SSE`);
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
  }, [serverRoomId, enabled, handleMessage]);

  // 수동 재연결 함수
  const reconnect = useCallback(() => {
    if (sseConnectionRef.current) {
      sseConnectionRef.current.reconnect();
    }
  }, []);

  return {
    metrics,
    loadAverageHistory,
    diskUsageHistory,
    cpuUsageHistory,
    networkErrorHistory,
    networkTrafficHistory,
    temperatureHumidityHistory,
    isConnected,
    error,
    reconnect,
  };
};
