import { HardDrive } from 'lucide-react';
import LineChart, { type LineChartSeries } from './LineChart';

interface DiskUsageData {
  time: string;
  avgUsage: number;
  maxUsage: number;
  minUsage: number;
}

interface DiskUsageChartProps {
  data: DiskUsageData[];
  height?: string;
}

export default function DiskUsageChart({ data, height = '300px' }: DiskUsageChartProps) {
  // 시간 포맷팅 함수
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // X축 데이터 (시간)
  const xAxisData = data.map((item) => formatTime(item.time));

  // 시리즈 데이터
  const series: LineChartSeries[] = [
    {
      name: '평균 사용량',
      data: data.map((item) => item.avgUsage.toFixed(2)),
      showArea: true,
      color: '#22c55e', // 초록색
    },
    {
      name: '최대 사용량',
      data: data.map((item) => item.maxUsage.toFixed(2)),
      showArea: true,
      color: '#eab308', // 노란색
    },
    {
      name: '최소 사용량',
      data: data.map((item) => item.minUsage.toFixed(2)),
      showArea: true,
      color: '#0ea5e9', // 하늘색
    },
  ];

  return (
    <LineChart
      title="디스크 사용량 추이"
      icon={HardDrive}
      iconColor="text-purple-400"
      series={series}
      xAxisData={xAxisData}
      height={height}
      unit="%"
      yAxisFormatter={(value) => `${value.toFixed(0)}%`}
    />
  );
}
