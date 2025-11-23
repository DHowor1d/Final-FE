import { Network } from 'lucide-react';
import LineChart, { type LineChartSeries } from './LineChart';
import type { NetworkTrafficData } from '../types/dashboard.types';

interface NetworkTrafficChartProps {
  data: NetworkTrafficData;
  height?: string;
}

export default function NetworkTrafficChart({ data, height = '300px' }: NetworkTrafficChartProps) {
  // 바이트를 Mbps로 변환하는 함수
  const bytesToMbps = (bytes: number): string => {
    return ((bytes * 8) / (1024 * 1024)).toFixed(2);
  };

  // 시간 포맷팅 함수
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // X축 데이터 (시간)
  const xAxisData = data.networkUsageTrend.map((item) => formatTime(item.time));

  // 시리즈 데이터
  const series: LineChartSeries[] = [
    {
      name: '인바운드 (Rx)',
      data: data.networkUsageTrend.map((item) => bytesToMbps(item.rxBytesPerSec)),
      showArea: true,
      color: '#22c55e', // 초록색 (공통 색상)
    },
    {
      name: '아웃바운드 (Tx)',
      data: data.networkUsageTrend.map((item) => bytesToMbps(item.txBytesPerSec)),
      showArea: true,
      color: '#eab308', // 노란색 (공통 색상)
    },
  ];

  return (
    <LineChart
      title="네트워크 트래픽"
      icon={Network}
      iconColor="text-cyan-400"
      series={series}
      xAxisData={xAxisData}
      height={height}
      unit="Mbps"
    />
  );
}
