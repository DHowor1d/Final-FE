import type { NetworkMonitoringData } from "../types";

export const generateTimeLabels = <T extends { generateTime: string }>(
  history: T[],
  maxPoints: number = 12
): string[] => {
  // 최근 maxPoints개만 선택
  const recentHistory = history.slice(-maxPoints);

  return recentHistory.map((item) => {
    const time = new Date(item.generateTime);
    return `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}:${time.getSeconds().toString().padStart(2, "0")}`;
  });
};

export const bytesToGB = (bytes: number): number => {
  return bytes / 1024 ** 3;
};

export const bytesToMB = (bytes: number): number => {
  return bytes / 1024 ** 2;
};

export const kbToMB = (kb: number): number => {
  return kb / 1024;
};

export const bytesToMbps = (bytes: number): number => {
  return (bytes * 8) / (1024 * 1024);
};

export const aggregateNetworkByTime = (
  networkHistory: NetworkMonitoringData[],
  maxPoints: number = 12
): { rx: number[]; tx: number[]; timeLabels: string[] } => {
  // generateTime별로 그룹화
  const grouped = networkHistory.reduce(
    (acc, net) => {
      if (!acc[net.generateTime]) {
        acc[net.generateTime] = [];
      }
      acc[net.generateTime].push(net);
      return acc;
    },
    {} as Record<string, NetworkMonitoringData[]>
  );

  // 시간순 정렬
  const times = Object.keys(grouped).sort();

  // 최근 maxPoints개만 선택
  const recentTimes = times.slice(-maxPoints);

  const rx: number[] = [];
  const tx: number[] = [];
  const timeLabels: string[] = [];

  // 각 시간대별로 모든 인터페이스(eth0, eth1 등) 합산
  recentTimes.forEach((time) => {
    const nets = grouped[time];
    const totalRx = nets.reduce(
      (sum, net) => sum + (net.inBytesPerSec || 0),
      0
    );
    const totalTx = nets.reduce(
      (sum, net) => sum + (net.outBytesPerSec || 0),
      0
    );

    // 시간 레이블 생성 (초 포함)
    const date = new Date(time);
    const label = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

    rx.push(totalRx);
    tx.push(totalTx);
    timeLabels.push(label);
  });

  return { rx, tx, timeLabels };
};
