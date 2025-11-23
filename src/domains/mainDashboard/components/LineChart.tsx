import ReactECharts from 'echarts-for-react';
import type { LucideIcon } from 'lucide-react';

// 기본 색상 팔레트 (초록, 노랑, 그 외)
const DEFAULT_COLORS = [
  '#22c55e', // 초록 (green-500)
  '#eab308', // 노랑 (yellow-500)
  '#06b6d4', // 시안 (cyan-500)
  '#3b82f6', // 파랑 (blue-500)
  '#a855f7', // 보라 (purple-500)
  '#ec4899', // 핑크 (pink-500)
  '#f97316', // 오렌지 (orange-500)
  '#14b8a6', // 틸 (teal-500)
];

export interface LineChartSeries {
  name: string;
  data: (number | string)[];
  color?: string;
  showArea?: boolean; // 영역 표시 여부
}

interface LineChartProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  series: LineChartSeries[];
  xAxisData: string[];
  height?: string;
  unit?: string; // Y축 단위 (예: Mbps, %, 개)
  yAxisFormatter?: (value: number) => string; // Y축 포맷터
  tooltipFormatter?: (params: Array<{ axisValue: string; seriesName: string; value: string | number; color: string; dataIndex: number }>) => string; // 툴팁 커스텀 포맷터
  showLegend?: boolean;
  smooth?: boolean; // 부드러운 곡선 여부
}

export default function LineChart({
  title,
  icon: Icon,
  iconColor = 'text-blue-400',
  series,
  xAxisData,
  height = '250px',
  unit = '',
  yAxisFormatter,
  tooltipFormatter,
  showLegend = true,
  smooth = true,
}: LineChartProps) {
  // 시리즈 데이터에 색상 자동 할당
  const seriesWithColors = series.map((s, index) => ({
    ...s,
    color: s.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  // 기본 툴팁 포맷터
  const defaultTooltipFormatter = (params: Array<{
    axisValue: string;
    seriesName: string;
    value: string | number;
    color: string;
  }>) => {
    const time = params[0].axisValue;
    let result = `<div style="font-weight: bold; margin-bottom: 5px;">${time}</div>`;
    params.forEach((param) => {
      const value = typeof param.value === 'number' 
        ? param.value.toFixed(2) 
        : param.value;
      result += `
        <div style="display: flex; align-items: center; margin-top: 5px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px;"></span>
          <span>${param.seriesName}: <strong>${value}${unit ? ' ' + unit : ''}</strong></span>
        </div>
      `;
    });
    return result;
  };

  // 기본 Y축 포맷터
  const defaultYAxisFormatter = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#444',
      textStyle: {
        color: '#fff',
      },
      formatter: tooltipFormatter || defaultTooltipFormatter,
    },
    legend: showLegend
      ? {
          data: seriesWithColors.map((s) => s.name),
          textStyle: {
            color: '#d1d5db',
          },
          top: 0,
        }
      : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: showLegend ? '15%' : '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
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
      name: unit,
      nameTextStyle: {
        color: '#9ca3af',
      },
      axisLabel: {
        color: '#9ca3af',
        formatter: yAxisFormatter || defaultYAxisFormatter,
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
    series: seriesWithColors.map((s) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: s.color,
      },
      lineStyle: {
        width: 2,
        color: s.color,
      },
      areaStyle: s.showArea
        ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: `${s.color}4D`, // 30% 투명도
                },
                {
                  offset: 1,
                  color: `${s.color}0D`, // 5% 투명도
                },
              ],
            },
          }
        : undefined,
    })),
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={20} className={iconColor} />}
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        </div>
      </div>
      <ReactECharts option={option} style={{ height }} opts={{ renderer: 'svg' }} />
    </div>
  );
}
