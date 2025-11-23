import ReactECharts from 'echarts-for-react';
import { AlertTriangle } from 'lucide-react';

interface NetworkErrorData {
  time: string;
  inErrors: number;
  outErrors: number;
}

interface NetworkErrorChartProps {
  data: NetworkErrorData[];
  height?: string;
}

export default function NetworkErrorChart({ data, height = '300px' }: NetworkErrorChartProps) {
  // 시간 포맷팅 함수
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const timeLabels = data.map((item) => formatTime(item.time));
  const inErrors = data.map((item) => item.inErrors);
  const outErrors = data.map((item) => item.outErrors);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#444',
      textStyle: {
        color: '#fff',
      },
      axisPointer: {
        type: 'cross',
      },
      formatter: (params: Array<{ axisValue: string; seriesName: string; value: number; color: string }>) => {
        const time = params[0].axisValue;
        let result = `<div style="font-weight: bold; margin-bottom: 5px;">${time}</div>`;
        params.forEach((param) => {
          result += `
            <div style="display: flex; align-items: center; margin-top: 5px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px;"></span>
              <span>${param.seriesName}: <strong>${param.value.toLocaleString()}</strong></span>
            </div>
          `;
        });
        return result;
      },
    },
    legend: {
      data: ['인바운드 에러', '아웃바운드 에러'],
      textStyle: {
        color: '#d1d5db',
      },
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: timeLabels,
      boundaryGap: false,
      axisLabel: {
        color: '#9ca3af',
        rotate: 45,
      },
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '에러 수',
      nameTextStyle: {
        color: '#9ca3af',
      },
      axisLabel: {
        color: '#9ca3af',
        formatter: (value: number) => value.toLocaleString(),
      },
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#374151',
        },
      },
    },
    series: [
      {
        name: '인바운드 에러',
        type: 'line',
        data: inErrors,
        smooth: true,
        lineStyle: {
          color: '#ef4444',
          width: 2,
        },
        itemStyle: {
          color: '#ef4444',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.05)' },
            ],
          },
        },
      },
      {
        name: '아웃바운드 에러',
        type: 'line',
        data: outErrors,
        smooth: true,
        lineStyle: {
          color: '#f97316',
          width: 2,
        },
        itemStyle: {
          color: '#f97316',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(249, 115, 22, 0.3)' },
              { offset: 1, color: 'rgba(249, 115, 22, 0.05)' },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-400" />
          <h3 className="text-lg font-semibold text-gray-100">네트워크 에러 추이</h3>
        </div>
      </div>
      <ReactECharts option={option} style={{ height }} opts={{ renderer: 'svg' }} />
    </div>
  );
}
