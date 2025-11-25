import { Cpu } from "lucide-react";
import LineChart, { type LineChartSeries } from "./LineChart";

interface CpuUsageData {
  time: string;
  avgUsage: number;
  maxUsage: number;
  minUsage: number;
}

interface CpuUsageChartProps {
  data: CpuUsageData[];
  height?: string;
}

export default function CpuUsageChart({
  data,
  height = "300px",
}: CpuUsageChartProps) {
  // 시간 포맷팅 함수
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // X축 데이터 (시간)
  const xAxisData = data.map((item) => formatTime(item.time));

  // 시리즈 데이터
  const series: LineChartSeries[] = [
    {
      name: "최대 사용량",
      data: data.map((item) => (item.maxUsage ?? 0).toFixed(2)),
      showArea: true,
      color: "#eab308", // 노란색
    },
    {
      name: "평균 사용량",
      data: data.map((item) => (item.avgUsage ?? 0).toFixed(2)),
      showArea: true,
      color: "#22c55e", // 초록색
    },
    {
      name: "최소 사용량",
      data: data.map((item) => (item.minUsage ?? 0).toFixed(2)),
      showArea: true,
      color: "#0ea5e9", // 하늘색
    },
  ];

  return (
    <LineChart
      title="CPU 사용량 추이"
      icon={Cpu}
      iconColor="text-blue-400"
      series={series}
      xAxisData={xAxisData}
      height={height}
      unit="%"
      yAxisFormatter={(value) => `${value.toFixed(0)}%`}
    />
  );
}
