/**
 * @author 구희원
 * @description 모니터링 데이터 전역 상태 관리 스토어
 */

import { create } from "zustand";
import type {
  SystemMonitoringData,
  DiskMonitoringData,
  NetworkMonitoringData,
} from "../types";

/**
 * 간단한 메트릭 정보
 */
export interface SimpleMetrics {
  cpu: number;
  memory: number;
  disk: number;
}

/**
 * 장비별 히스토리 저장 구조
 */
interface DeviceHistory {
  systemHistory: SystemMonitoringData[];
  diskHistory: DiskMonitoringData[];
  networkHistory: NetworkMonitoringData[][];
}

/**
 * 모니터링 상태
 */
interface MonitoringState {
  // 현재 선택된 장비
  selectedDeviceId: number | null;

  // 현재 선택된 장비의 최신 데이터 (차트용)
  systemData: SystemMonitoringData | null;
  diskData: DiskMonitoringData | null;
  networkData: NetworkMonitoringData[] | null;
  systemHistory: SystemMonitoringData[];
  diskHistory: DiskMonitoringData[];
  networkHistory: NetworkMonitoringData[][];

  // 모든 장비의 최신 메트릭 (임계치 표시용)
  deviceMetricsMap: Map<number, SimpleMetrics>;

  // 장비별 히스토리 저장소 (선택된 장비가 바뀔 때 참조)
  deviceHistoryMap: Map<number, DeviceHistory>;

  // Setters
  setSelectedDeviceId: (deviceId: number | null) => void;
  setSystemData: (data: SystemMonitoringData) => void;
  setDiskData: (data: DiskMonitoringData) => void;
  setNetworkData: (data: NetworkMonitoringData[]) => void;
  setDeviceMetrics: (deviceId: number, metrics: SimpleMetrics) => void;

  // 히스토리 로드 (선택된 장비가 바뀔 때 호출)
  loadDeviceHistory: (deviceId: number) => void;

  clearHistory: () => void;
}

/**
 * 최대 히스토리 길이 (120개 데이터 포인트)
 */
const MAX_HISTORY_LENGTH = 120;

/**
 * 모니터링 데이터 전역 상태 관리 스토어
 *
 * - 선택된 장비의 실시간 모니터링 데이터 및 히스토리 관리
 * - 모든 장비의 최신 메트릭 관리 (임계치 표시용)
 * - 장비별 히스토리 캐싱으로 장비 전환 시 데이터 유지
 */
export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  selectedDeviceId: null,
  systemData: null,
  diskData: null,
  networkData: null,
  systemHistory: [],
  diskHistory: [],
  networkHistory: [],
  deviceMetricsMap: new Map(),
  deviceHistoryMap: new Map(),

  /**
   * 선택된 장비 ID 설정
   */
  setSelectedDeviceId: (deviceId: number | null) => {
    set({ selectedDeviceId: deviceId });

    if (deviceId !== null) {
      get().loadDeviceHistory(deviceId);
    } else {
      set({
        systemData: null,
        diskData: null,
        networkData: null,
        systemHistory: [],
        diskHistory: [],
        networkHistory: [],
      });
    }
  },

  /**
   * System 데이터 설정 및 히스토리 업데이트
   */
  setSystemData: (data) =>
    set((state) => {
      const selectedDeviceId = state.selectedDeviceId;
      if (!selectedDeviceId) return { systemData: data };

      const deviceHistory = state.deviceHistoryMap.get(selectedDeviceId) || {
        systemHistory: [],
        diskHistory: [],
        networkHistory: [],
      };

      const newSystemHistory = [...deviceHistory.systemHistory, data].slice(
        -MAX_HISTORY_LENGTH
      );

      const newDeviceHistoryMap = new Map(state.deviceHistoryMap);
      newDeviceHistoryMap.set(selectedDeviceId, {
        ...deviceHistory,
        systemHistory: newSystemHistory,
      });

      return {
        systemData: data,
        systemHistory: newSystemHistory,
        deviceHistoryMap: newDeviceHistoryMap,
      };
    }),

  /**
   * Disk 데이터 설정 및 히스토리 업데이트
   */
  setDiskData: (data) =>
    set((state) => {
      const selectedDeviceId = state.selectedDeviceId;
      if (!selectedDeviceId) return { diskData: data };

      const deviceHistory = state.deviceHistoryMap.get(selectedDeviceId) || {
        systemHistory: [],
        diskHistory: [],
        networkHistory: [],
      };

      const newDiskHistory = [...deviceHistory.diskHistory, data].slice(
        -MAX_HISTORY_LENGTH
      );

      const newDeviceHistoryMap = new Map(state.deviceHistoryMap);
      newDeviceHistoryMap.set(selectedDeviceId, {
        ...deviceHistory,
        diskHistory: newDiskHistory,
      });

      return {
        diskData: data,
        diskHistory: newDiskHistory,
        deviceHistoryMap: newDeviceHistoryMap,
      };
    }),

  /**
   * Network 데이터 설정 및 히스토리 업데이트
   */
  setNetworkData: (data) =>
    set((state) => {
      const selectedDeviceId = state.selectedDeviceId;

      const newNetworkHistory = [...state.networkHistory, data].slice(
        -MAX_HISTORY_LENGTH
      );

      if (selectedDeviceId) {
        const deviceHistory = state.deviceHistoryMap.get(selectedDeviceId) || {
          systemHistory: [],
          diskHistory: [],
          networkHistory: [],
        };

        const deviceNetworkHistory = [
          ...deviceHistory.networkHistory,
          data,
        ].slice(-MAX_HISTORY_LENGTH);

        const newDeviceHistoryMap = new Map(state.deviceHistoryMap);
        newDeviceHistoryMap.set(selectedDeviceId, {
          ...deviceHistory,
          networkHistory: deviceNetworkHistory,
        });

        return {
          networkData: data,
          networkHistory: newNetworkHistory,
          deviceHistoryMap: newDeviceHistoryMap,
        };
      }

      return {
        networkData: data,
        networkHistory: newNetworkHistory,
      };
    }),

  /**
   * 장비의 메트릭 설정 (백그라운드 모니터링용)
   */
  setDeviceMetrics: (deviceId: number, metrics: SimpleMetrics) =>
    set((state) => {
      const newMap = new Map(state.deviceMetricsMap);
      newMap.set(deviceId, metrics);
      return { deviceMetricsMap: newMap };
    }),

  /**
   * 장비 히스토리 로드 (선택된 장비가 바뀔 때 호출)
   */
  loadDeviceHistory: (deviceId: number) => {
    const state = get();
    const deviceHistory = state.deviceHistoryMap.get(deviceId);

    if (deviceHistory) {
      set({
        systemHistory: deviceHistory.systemHistory,
        diskHistory: deviceHistory.diskHistory,
        networkHistory: deviceHistory.networkHistory,
        systemData:
          deviceHistory.systemHistory.length > 0
            ? deviceHistory.systemHistory[
                deviceHistory.systemHistory.length - 1
              ]
            : null,
        diskData:
          deviceHistory.diskHistory.length > 0
            ? deviceHistory.diskHistory[deviceHistory.diskHistory.length - 1]
            : null,
        networkData:
          deviceHistory.networkHistory.length > 0
            ? deviceHistory.networkHistory[
                deviceHistory.networkHistory.length - 1
              ]
            : null,
      });
    } else {
      set({
        systemData: null,
        diskData: null,
        networkData: null,
        systemHistory: [],
        diskHistory: [],
        networkHistory: [],
      });
    }
  },

  /**
   * 모든 히스토리 초기화
   */
  clearHistory: () =>
    set({
      systemHistory: [],
      diskHistory: [],
      networkHistory: [],
      deviceHistoryMap: new Map(),
      selectedDeviceId: null,
    }),
}));
