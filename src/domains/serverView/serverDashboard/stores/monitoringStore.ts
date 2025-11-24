import { create } from "zustand";
import type {
  SystemMonitoringData,
  DiskMonitoringData,
  NetworkMonitoringData,
} from "../types";

interface MonitoringState {
  systemData: SystemMonitoringData | null;
  diskData: DiskMonitoringData | null;
  networkData: NetworkMonitoringData[] | null;
  systemHistory: SystemMonitoringData[];
  diskHistory: DiskMonitoringData[];
  networkHistory: NetworkMonitoringData[][];

  setSystemData: (data: SystemMonitoringData) => void;
  setDiskData: (data: DiskMonitoringData) => void;
  setNetworkData: (data: NetworkMonitoringData[]) => void;
  clearHistory: () => void;
}

const MAX_HISTORY_LENGTH = 120;

export const useMonitoringStore = create<MonitoringState>((set) => ({
  systemData: null,
  diskData: null,
  networkData: null,
  systemHistory: [],
  diskHistory: [],
  networkHistory: [],

  setSystemData: (data) =>
    set((state) => ({
      systemData: data,
      systemHistory: [...state.systemHistory, data].slice(-MAX_HISTORY_LENGTH),
    })),

  setDiskData: (data) =>
    set((state) => ({
      diskData: data,
      diskHistory: [...state.diskHistory, data].slice(-MAX_HISTORY_LENGTH),
    })),

  setNetworkData: (data) =>
    set((state) => ({
      networkData: data,
      networkHistory: [...state.networkHistory, data].slice(
        -MAX_HISTORY_LENGTH
      ),
    })),

  clearHistory: () =>
    set({
      systemHistory: [],
      diskHistory: [],
      networkHistory: [],
    }),
}));
