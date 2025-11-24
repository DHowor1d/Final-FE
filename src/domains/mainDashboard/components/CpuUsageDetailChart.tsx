import ReactECharts from 'echarts-for-react';
import { Cpu } from 'lucide-react';

interface CpuUsageDetail {
  time: string;
  cpuUser: number;
  cpuSystem: number;
  cpuWait: number;
  cpuNice: number;
  cpuIrq: number;
  cpuSoftirq: number;
  cpuSteal: number;
  cpuIdle: number;
}

interface CpuUsageDetailChartProps {
  data: CpuUsageDetail[];
  height?: string;
}

export default function CpuUsageDetailChart({ 
  data, 
  height = '300px' 
}: CpuUsageDetailChartProps) {
  // 시간 포맷팅 함수
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const xAxisData = data.map((item) => formatTime(item.time));

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#444',
      textStyle: {
        color: '#fff',
      },
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: Array<{ axisValue: string; seriesName: string; value: number; color: string }>) => {
        const time = params[0].axisValue;
        let result = `<div style="font-weight: bold; margin-bottom: 5px;">${time}</div>`;
        let total = 0;
        params.forEach((param) => {
          total += param.value;
          result += `
            <div style="display: flex; align-items: center; margin-top: 5px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background-color: ${param.color}; margin-right: 5px;"></span>
              <span>${param.seriesName}: <strong>${param.value.toFixed(2)}%</strong></span>
            </div>
          `;
        });
        result += `<div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid #555;">
          <span style="color: #fff;">Total: <strong>${total.toFixed(2)}%</strong></span>
        </div>`;
        return result;
      },
    },
    legend: {
      data: ['User', 'System', 'Wait', 'Nice', 'IRQ', 'Soft IRQ', 'Steal', 'Idle'],
      textStyle: {
        color: '#d1d5db',
      },
      top: 0,
      type: 'scroll',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        color: '#9ca3af',
        rotate: 45,
        fontSize: 10,
      },
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '%',
      max: 100,
      nameTextStyle: {
        color: '#9ca3af',
      },
      axisLabel: {
        color: '#9ca3af',
        formatter: '{value}%',
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
        name: 'User',
        type: 'bar',
        stack: 'cpu',
        data: data.map((item) => item.cpuUser.toFixed(2)),
        itemStyle: {
          color: '#ef4444', // 빨강
        },
      },
      {
        name: 'System',
        type: 'bar',
        stack: 'cpu',
        data: data.map((item) => item.cpuSystem.toFixed(2)),
        itemStyle: {
          color: '#f97316', // 오렌지
        },
      },
      {
        name: 'Wait',
        type: 'bar',
        stack: 'cpu',
        data: data.map((item) => item.cpuWait.toFixed(2)),
        itemStyle: {
          color: '#eab308', // 노랑
        },
      },
      {
        name: 'Nice',
        type: 'bar',
        stack: 'cpu',
        data: data.map((item) => item.cpuNice.toFixed(2)),
        itemStyle: {
          color: '#84cc16', // 라임
        },
      },
      {
        name: 'IRQ',
        type: 'bar',
        stack: 'cpu',
        data: data.map((item) => item.cpuIrq.toFixed(2)),
        itemStyle: {
          color: '#22c55e', // 초록
        },
      },
      {
        name: 'Soft IRQ',
        type: 'bar',
        stack: 'cpu',
        data: data.map((item) => item.cpuSoftirq.toFixed(2)),
        itemStyle: {
          color: '#06b6d4', // 시안
        },
      },
      {
        name: 'Steal',
        type: 'bar',
        stack: 'cpu',
        data: data.map((item) => item.cpuSteal.toFixed(2)),
        itemStyle: {
          color: '#3b82f6', // 파랑
        },
      },
      {
        name: 'Idle',
        type: 'bar',
        stack: 'cpu',
        data: data.map((item) => item.cpuIdle.toFixed(2)),
        itemStyle: {
          color: '#6b7280', // 회색
        },
      },
    ],
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu size={20} className="text-red-400" />
          <h3 className="text-lg font-semibold text-gray-100">CPU 상세 사용률</h3>
        </div>
      </div>
      <ReactECharts option={option} style={{ height }} opts={{ renderer: 'svg' }} />
    </div>
  );
}
