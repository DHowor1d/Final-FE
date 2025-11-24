import ReactECharts from 'echarts-for-react';
import { Activity } from 'lucide-react';

interface ContextSwitchesTrend {
  time: string;
  contextSwitches: number;
}

interface ContextSwitchesSparklineProps {
  data: ContextSwitchesTrend[];
  height?: string;
}

export default function ContextSwitchesSparkline({ 
  data, 
  height = '300px' 
}: ContextSwitchesSparklineProps) {
  // 시간 포맷팅 함수
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const xAxisData = data.map((item) => formatTime(item.time));
  const yData = data.map((item) => item.contextSwitches);

  // 평균값 계산
  const average = yData.reduce((a, b) => a + b, 0) / yData.length;

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#444',
      textStyle: {
        color: '#fff',
      },
      formatter: (params: Array<{ axisValue: string; value: number; color: string }>) => {
        const param = params[0];
        return `
          <div style="font-weight: bold; margin-bottom: 5px;">${param.axisValue}</div>
          <div style="display: flex; align-items: center; margin-top: 5px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px;"></span>
            <span>Context Switches: <strong>${param.value.toLocaleString()}</strong></span>
          </div>
        `;
      },
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '15%',
      top: '10%',
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      show: true,
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10,
        interval: Math.floor(xAxisData.length / 4), // 4개만 표시
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      show: true,
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10,
        formatter: (value: number) => {
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toFixed(0);
        },
      },
      splitLine: {
        lineStyle: {
          color: '#374151',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        type: 'line',
        data: yData,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#a78bfa', // 보라색
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(167, 139, 250, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(167, 139, 250, 0.05)',
              },
            ],
          },
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: '#fbbf24',
            type: 'dashed',
            width: 1,
          },
          data: [
            {
              yAxis: average,
              label: {
                show: true,
                position: 'end',
                formatter: `평균: ${average.toFixed(0)}`,
                color: '#fbbf24',
                fontSize: 10,
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
      <div className="flex items-center gap-2 mb-2">
        <Activity size={18} className="text-purple-400" />
        <h3 className="text-sm font-semibold text-gray-100">Context Switches</h3>
      </div>
      <ReactECharts option={option} style={{ height }} opts={{ renderer: 'svg' }} />
    </div>
  );
}
