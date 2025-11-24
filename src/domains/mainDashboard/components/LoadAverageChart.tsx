import { Activity } from 'lucide-react';
import LineChart, { type LineChartSeries } from './LineChart';

interface LoadAverageTrend {
  time: string;
  loadAvg1: number;
  loadAvg5: number;
  loadAvg15: number;
}

interface LoadAverageChartProps {
  data: LoadAverageTrend[];
  height?: string;
}

export default function LoadAverageChart({ data, height = '300px' }: LoadAverageChartProps) {
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
      name: '1분 평균',
      data: data.map((item) => item.loadAvg1.toFixed(2)),
      showArea: true,
    },
    {
      name: '5분 평균',
      data: data.map((item) => item.loadAvg5.toFixed(2)),
      showArea: true,
    },
    {
      name: '15분 평균',
      data: data.map((item) => item.loadAvg15.toFixed(2)),
      showArea: true,
    },
  ];

  return (
    <LineChart
      title="시스템 부하 (Load Average)"
      icon={Activity}
      iconColor="text-purple-400"
      series={series}
      xAxisData={xAxisData}
      height={height}
      unit=""
      yAxisFormatter={(value) => value.toFixed(1)}
    />
  );
}
