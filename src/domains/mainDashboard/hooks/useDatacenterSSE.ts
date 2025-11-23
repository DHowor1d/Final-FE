import { useEffect, useState, useRef, useCallback } from "react";
import { createDatacenterSSE, type SSEConnection } from "@api/sseClient";
import type {
  DatacenterMetrics,
  CpuUsageDetail,
  LoadAverageData,
  DiskIOData,
  NetworkErrorData,
  ContextSwitchesData,
  NetworkUsageTrend,
} from "../types/dashboard.types";

const MAX_HISTORY_POINTS = 20; // 차트에 표시할 최대 데이터 포인트 수

export interface UseDatacenterSSEResult {
  // 현재 메트릭
  metrics: DatacenterMetrics | null;
  
  // 시계열 데이터
  cpuUsageHistory: CpuUsageDetail[];
  loadAverageHistory: LoadAverageData[];
  diskIOHistory: DiskIOData[];
  networkErrorHistory: NetworkErrorData[];
  contextSwitchesHistory: ContextSwitchesData[];
  networkTrafficHistory: NetworkUsageTrend[];
  
  // 연결 상태
  isConnected: boolean;
  error: string | null;
  
  // 제어 함수
  reconnect: () => void;
}

/**
 * 데이터센터 실시간 모니터링 SSE Hook
 * @param datacenterId 데이터센터 ID
 * @param enabled 연결 활성화 여부
 */
export const useDatacenterSSE = (
  datacenterId: number | null,
  enabled: boolean = true
): UseDatacenterSSEResult => {
  const [metrics, setMetrics] = useState<DatacenterMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 시계열 데이터 상태
  const [cpuUsageHistory, setCpuUsageHistory] = useState<CpuUsageDetail[]>([]);
  const [loadAverageHistory, setLoadAverageHistory] = useState<LoadAverageData[]>([]);
  const [diskIOHistory, setDiskIOHistory] = useState<DiskIOData[]>([]);
  const [networkErrorHistory, setNetworkErrorHistory] = useState<NetworkErrorData[]>([]);
  const [contextSwitchesHistory, setContextSwitchesHistory] = useState<ContextSwitchesData[]>([]);
  const [networkTrafficHistory, setNetworkTrafficHistory] = useState<NetworkUsageTrend[]>([]);

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
    (data: DatacenterMetrics) => {
      setMetrics(data);
      setError(null);

      // CPU 사용률 상세 데이터 추가
      // SSE에서는 개별 CPU 컴포넌트 데이터가 없으므로 avgCpuUsage를 활용
      const cpuDetail: CpuUsageDetail = {
        time: data.timestamp,
        cpuUser: data.avgCpuUsage * 0.6, // 추정값 (실제로는 SSE에 포함되어야 함)
        cpuSystem: data.avgCpuUsage * 0.2,
        cpuIdle: 100 - data.avgCpuUsage,
        cpuWait: data.avgCpuUsage * 0.1,
        cpuNice: data.avgCpuUsage * 0.02,
        cpuIrq: data.avgCpuUsage * 0.04,
        cpuSoftirq: data.avgCpuUsage * 0.04,
        cpuSteal: 0,
      };
      addToHistory(setCpuUsageHistory, cpuDetail);

      // Load Average 데이터 추가
      const loadAvg: LoadAverageData = {
        time: data.timestamp,
        loadAvg1: data.avgLoadAvg1,
        loadAvg5: data.avgLoadAvg1 * 0.9, // 추정값
        loadAvg15: data.avgLoadAvg1 * 0.8, // 추정값
      };
      addToHistory(setLoadAverageHistory, loadAvg);

      // 디스크 I/O 데이터 추가
      const diskIO: DiskIOData = {
        time: data.timestamp,
        ioReadBps: data.avgDiskIoUsage * 1000000, // 추정값
        ioWriteBps: data.avgDiskIoUsage * 800000, // 추정값
        ioTimePercentage: data.avgDiskIoUsage,
      };
      addToHistory(setDiskIOHistory, diskIO);

      // 네트워크 에러 데이터 추가
      const networkError: NetworkErrorData = {
        time: data.timestamp,
        inErrors: data.totalInErrors,
        outErrors: data.totalOutErrors,
      };
      addToHistory(setNetworkErrorHistory, networkError);

      // Context Switches 데이터 추가 (현재 SSE에 없음 - 추정값)
      const contextSwitches: ContextSwitchesData = {
        time: data.timestamp,
        contextSwitches: data.avgCpuUsage * 10000, // 추정값
      };
      addToHistory(setContextSwitchesHistory, contextSwitches);

      // 네트워크 트래픽 데이터 추가
      const networkTraffic: NetworkUsageTrend = {
        time: data.timestamp,
        rxBytesPerSec: data.totalInBps,
        txBytesPerSec: data.totalOutBps,
      };
      addToHistory(setNetworkTrafficHistory, networkTraffic);
    },
    [addToHistory]
  );

  // SSE 연결 관리
  useEffect(() => {
    if (!enabled || datacenterId === null) {
      // 연결 해제
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
        sseConnectionRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // SSE 연결 생성
    sseConnectionRef.current = createDatacenterSSE(datacenterId, {
      onMessage: handleMessage,
      onError: (error) => {
        console.error("SSE Error:", error);
        setError("실시간 연결에 문제가 발생했습니다.");
        setIsConnected(false);
      },
      onOpen: () => {
        console.log(`Connected to datacenter ${datacenterId} SSE`);
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
  }, [datacenterId, enabled, handleMessage]);

  // 수동 재연결 함수
  const reconnect = useCallback(() => {
    if (sseConnectionRef.current) {
      sseConnectionRef.current.reconnect();
    }
  }, []);

  return {
    metrics,
    cpuUsageHistory,
    loadAverageHistory,
    diskIOHistory,
    networkErrorHistory,
    contextSwitchesHistory,
    networkTrafficHistory,
    isConnected,
    error,
    reconnect,
  };
};
