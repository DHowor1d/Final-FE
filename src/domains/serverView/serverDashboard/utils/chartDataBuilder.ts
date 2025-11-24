import {
  generateTimeLabels,
  bytesToMbps,
  aggregateNetworkByTime,
} from "../utils/monitoring";
import { CHART_CONFIG } from "../constants";
import type { NetworkMonitoringData } from "../types";

interface ChartSeries {
  name: string;
  data: number[];
  color: string;
  showAverage?: boolean;
  averageLineStyle?: string;
  averageColor?: string;
}

interface SystemData {
  cpuIdle: number;
  usedMemoryPercentage: number;
  cpuUser?: number;
  cpuSystem?: number;
  cpuWait?: number;
  cpuIrq?: number;
  cpuSoftirq?: number;
  loadAvg1?: number;
  loadAvg5?: number;
  loadAvg15?: number;
  usedSwapPercentage?: number;
  cpuSteal?: number;
}

interface DiskData {
  usedPercentage: number;
  usedInodePercentage?: number;
}

export interface HistoryRecord {
  cpuUser?: number;
  cpuSystem?: number;
  cpuWait?: number;
  cpuIrq?: number;
  cpuSoftirq?: number;
  loadAvg1?: number;
  loadAvg5?: number;
  loadAvg15?: number;
  usedMemoryPercentage?: number;
  usedSwapPercentage?: number;
  cpuSteal?: number;
  usedPercentage?: number;
  usedInodePercentage?: number;
  ioReadBps?: number;
  ioWriteBps?: number;
  generateTime?: string;
  [key: string]: unknown;
}

interface AggregatedNetwork {
  rx: number[];
  tx: number[];
  timeLabels: string[];
}

interface ChartDataState {
  systemData: SystemData | null;
  diskData: DiskData | null;
  systemHistory: HistoryRecord[];
  diskHistory: HistoryRecord[];
  networkHistory: NetworkMonitoringData[][];
}

interface ChartDataResult {
  timeLabels: string[];
  networkTimeLabels: string[];
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  cpuModes: ChartSeries[];
  loadAverage: ChartSeries[];
  memorySwap: ChartSeries[];
  networkBandwidth: ChartSeries[];
  cpuOverhead: ChartSeries[];
  diskIO: ChartSeries[];
  inodeUsage: ChartSeries[];
}

const { MAX_POINTS, COLORS } = CHART_CONFIG;

// 공통 series 생성 헬퍼
interface CreateSeriesOptions {
  name: string;
  data: number[];
  color: string;
  showAverage?: boolean;
  averageLineStyle?: string;
  averageColor?: string;
}

const createSeries = ({
  name,
  data,
  color,
  showAverage,
  averageLineStyle,
  averageColor,
}: CreateSeriesOptions): ChartSeries => ({
  name,
  data: data,
  color,
  ...(showAverage && {
    showAverage,
    averageLineStyle: averageLineStyle || "solid",
    averageColor: averageColor || color,
  }),
});

// CPU 모드 series 생성
const buildCpuModes = (history: HistoryRecord[]): ChartSeries[] => [
  createSeries({
    name: "User",
    data: history.map((d) => d.cpuUser ?? 0),
    color: COLORS.cpuUser,
  }),
  createSeries({
    name: "System",
    data: history.map((d) => d.cpuSystem ?? 0),
    color: COLORS.cpuSystem,
  }),
  createSeries({
    name: "I/O Wait",
    data: history.map((d) => d.cpuWait ?? 0),
    color: COLORS.ioWait,
  }),
  createSeries({
    name: "IRQ",
    data: history.map((d) => d.cpuIrq ?? 0),
    color: COLORS.irq,
  }),
  createSeries({
    name: "Softirq",
    data: history.map((d) => d.cpuSoftirq ?? 0),
    color: COLORS.softirq,
  }),
];

// Load Average series 생성
const buildLoadAverage = (history: HistoryRecord[]): ChartSeries[] => [
  createSeries({
    name: "1분 평균",
    data: history.map((d) => d.loadAvg1 ?? 0),
    color: COLORS.cpuUser,
  }),
  createSeries({
    name: "5분 평균",
    data: history.map((d) => d.loadAvg5 ?? 0),
    color: COLORS.irq,
  }),
  createSeries({
    name: "15분 평균",
    data: history.map((d) => d.loadAvg15 ?? 0),
    color: COLORS.ioWait,
  }),
];

// Memory & Swap series 생성
const buildMemorySwap = (history: HistoryRecord[]): ChartSeries[] => [
  createSeries({
    name: "메모리",
    data: history.map((d) => d.usedMemoryPercentage ?? 0),
    color: COLORS.irq,
    showAverage: true,
  }),
  createSeries({
    name: "스왑",
    data: history.map((d) => d.usedSwapPercentage ?? 0),
    color: COLORS.swap,
    showAverage: true,
  }),
];

// Network Bandwidth series 생성
const buildNetworkBandwidth = (
  aggregated: AggregatedNetwork
): ChartSeries[] => [
  createSeries({
    name: "수신 (RX)",
    data: aggregated.rx.map((bytes: number) => bytesToMbps(bytes)),
    color: COLORS.rx,
  }),
  createSeries({
    name: "송신 (TX)",
    data: aggregated.tx.map((bytes: number) => bytesToMbps(bytes)),
    color: COLORS.tx,
  }),
];

// CPU Overhead series 생성
const buildCpuOverhead = (history: HistoryRecord[]): ChartSeries[] => [
  createSeries({
    name: "I/O Wait (%)",
    data: history.map((d) => d.cpuWait ?? 0),
    color: COLORS.ioWait,
    showAverage: true,
    averageLineStyle: "dashed",
    averageColor: COLORS.ioWait,
  }),
  createSeries({
    name: "Steal (%)",
    data: history.map((d) => d.cpuSteal ?? 0),
    color: COLORS.steal,
    showAverage: true,
    averageLineStyle: "dashed",
    averageColor: COLORS.steal,
  }),
];

// Disk I/O series 생성
const buildDiskIO = (history: HistoryRecord[]): ChartSeries[] => [
  createSeries({
    name: "읽기",
    data: history.map((d) => bytesToMbps(d.ioReadBps ?? 0)),
    color: COLORS.diskRead,
  }),
  createSeries({
    name: "쓰기",
    data: history.map((d) => bytesToMbps(d.ioWriteBps ?? 0)),
    color: COLORS.diskWrite,
  }),
];

// Inode Usage series 생성
const buildInodeUsage = (history: HistoryRecord[]): ChartSeries[] => [
  createSeries({
    name: "Disk 사용률",
    data: history.map((d) => d.usedPercentage ?? 0),
    color: COLORS.ioWait,
    showAverage: true,
    averageLineStyle: "dashed",
    averageColor: COLORS.ioWait,
  }),
  createSeries({
    name: "Inode 사용률",
    data: history.map((d) => d.usedInodePercentage ?? 0),
    color: COLORS.irq,
    showAverage: true,
    averageLineStyle: "dashed",
    averageColor: COLORS.irq,
  }),
];

// 메인: 차트 데이터 빌드
export const buildChartData = ({
  systemData,
  diskData,
  systemHistory,
  diskHistory,
  networkHistory,
}: ChartDataState): ChartDataResult => {
  if (systemHistory.length === 0) {
    return {
      timeLabels: [],
      networkTimeLabels: [],
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      cpuModes: [],
      loadAverage: [],
      memorySwap: [],
      networkBandwidth: [],
      cpuOverhead: [],
      diskIO: [],
      inodeUsage: [],
    };
  }

  // 최근 MAX_POINTS개 데이터만 사용
  const recentSystemHistory = systemHistory.slice(-MAX_POINTS);
  const recentDiskHistory = diskHistory.slice(-MAX_POINTS);

  // 시간 레이블 생성 - generateTime이 있는 데이터만 필터링
  const historyWithTime = recentSystemHistory.filter(
    (item): item is HistoryRecord & { generateTime: string } =>
      item.generateTime !== undefined
  );

  const timeLabels = generateTimeLabels(
    historyWithTime.length > 0 ? historyWithTime : [],
    MAX_POINTS
  );

  // 네트워크 데이터 집계
  const flatNetworkHistory = networkHistory.flat();
  const aggregatedNetwork = aggregateNetworkByTime(
    flatNetworkHistory,
    MAX_POINTS
  );
  const networkTimeLabels = aggregatedNetwork.timeLabels;

  return {
    timeLabels,
    networkTimeLabels,
    cpuUsage: systemData ? Math.round(100 - systemData.cpuIdle) : 0,
    memoryUsage: systemData ? Math.round(systemData.usedMemoryPercentage) : 0,
    diskUsage: diskData ? Math.round(diskData.usedPercentage) : 0,
    cpuModes: buildCpuModes(recentSystemHistory),
    loadAverage: buildLoadAverage(recentSystemHistory),
    memorySwap: buildMemorySwap(recentSystemHistory),
    networkBandwidth: buildNetworkBandwidth(
      aggregatedNetwork as AggregatedNetwork
    ),
    cpuOverhead: buildCpuOverhead(recentSystemHistory),
    diskIO: buildDiskIO(recentDiskHistory),
    inodeUsage: buildInodeUsage(recentDiskHistory),
  };
};
