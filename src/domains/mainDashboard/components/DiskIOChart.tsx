import { HardDrive } from 'lucide-react';
import LineChart, { type LineChartSeries } from './LineChart';

interface DiskIOTrend {
  time: string;
  ioReadBps: number;
  ioWriteBps: number;
  ioTimePercentage: number;
}

interface DiskIOChartProps {
  data: DiskIOTrend[];
  height?: string;
}

export default function DiskIOChart({ data, height = '300px' }: DiskIOChartProps) {
  // 시간 포맷팅 함수
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // 바이트를 MB/s로 변환
  const bytesToMBps = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  // X축 데이터 (시간)
  const xAxisData = data.map((item) => formatTime(item.time));

  // 시리즈 데이터
  const series: LineChartSeries[] = [
    {
      name: 'Read',
      data: data.map((item) => bytesToMBps(item.ioReadBps)),
      showArea: true,
    },
    {
      name: 'Write',
      data: data.map((item) => bytesToMBps(item.ioWriteBps)),
      showArea: true,
    },
  ];

  // 커스텀 툴팁 포맷터 (I/O Time Percentage 추가)
  const tooltipFormatter = (params: Array<{
    axisValue: string;
    seriesName: string;
    value: string | number;
    color: string;
    dataIndex: number;
  }>) => {
    const time = params[0].axisValue;
    const dataIndex = params[0].dataIndex;
    const ioTimePercentage = data[dataIndex]?.ioTimePercentage.toFixed(2) || '0';

    let result = `<div style="font-weight: bold; margin-bottom: 5px;">${time}</div>`;
    
    params.forEach((param) => {
      result += `
        <div style="display: flex; align-items: center; margin-top: 5px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px;"></span>
          <span>${param.seriesName}: <strong>${param.value} MB/s</strong></span>
        </div>
      `;
    });

    result += `
      <div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid #555;">
        <span style="color: #a78bfa;">I/O 대기 시간: <strong>${ioTimePercentage}%</strong></span>
      </div>
    `;

    return result;
  };

  return (
    <LineChart
      title="디스크 I/O 성능"
      icon={HardDrive}
      iconColor="text-orange-400"
      series={series}
      xAxisData={xAxisData}
      height={height}
      unit="MB/s"
      tooltipFormatter={tooltipFormatter}
    />
  );
}
