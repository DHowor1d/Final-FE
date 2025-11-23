import ReactECharts from 'echarts-for-react';
import { Thermometer } from 'lucide-react';

interface TemperatureHumidityData {
  time: string;
  temperature: number;
  humidity: number;
}

interface TemperatureHumidityChartProps {
  data: TemperatureHumidityData[];
  currentTemp: number;
  currentHumidity: number;
  minTemp: number;
  maxTemp: number;
  minHumidity: number;
  maxHumidity: number;
  temperatureWarnings: number;
  humidityWarnings: number;
  height?: string;
}

export default function TemperatureHumidityChart({
  data,
  currentTemp,
  currentHumidity,
  minTemp,
  maxTemp,
  minHumidity,
  maxHumidity,
  temperatureWarnings,
  humidityWarnings,
  height = '300px',
}: TemperatureHumidityChartProps) {
  // 시간 포맷팅 함수
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const timeLabels = data.map((item) => formatTime(item.time));
  const temperatures = data.map((item) => item.temperature);
  const humidities = data.map((item) => item.humidity);

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
          const unit = param.seriesName.includes('온도') ? '°C' : '%';
          result += `
            <div style="display: flex; align-items: center; margin-top: 5px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px;"></span>
              <span>${param.seriesName}: <strong>${param.value.toFixed(1)}${unit}</strong></span>
            </div>
          `;
        });
        return result;
      },
    },
    legend: {
      data: ['온도', '습도'],
      textStyle: {
        color: '#d1d5db',
      },
      top: 0,
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: timeLabels,
      boundaryGap: false,
      axisLabel: {
        color: '#9ca3af',
      },
      axisLine: {
        lineStyle: {
          color: '#4b5563',
        },
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '온도 (°C)',
        position: 'left',
        nameTextStyle: {
          color: '#10b981',
        },
        axisLabel: {
          color: '#9ca3af',
          formatter: (value: number) => `${value.toFixed(0)}°C`,
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
      {
        type: 'value',
        name: '습도 (%)',
        position: 'right',
        nameTextStyle: {
          color: '#0ea5e9',
        },
        axisLabel: {
          color: '#9ca3af',
          formatter: (value: number) => `${value.toFixed(0)}%`,
        },
        axisLine: {
          lineStyle: {
            color: '#4b5563',
          },
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: '온도',
        type: 'line',
        data: temperatures,
        smooth: true,
        yAxisIndex: 0,
        lineStyle: {
          color: '#10b981',
          width: 2,
        },
        itemStyle: {
          color: '#10b981',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ],
          },
        },
      },
      {
        name: '습도',
        type: 'line',
        data: humidities,
        smooth: true,
        yAxisIndex: 1,
        lineStyle: {
          color: '#0ea5e9',
          width: 2,
        },
        itemStyle: {
          color: '#0ea5e9',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(14, 165, 233, 0.3)' },
              { offset: 1, color: 'rgba(14, 165, 233, 0.05)' },
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
          <Thermometer size={20} className="text-green-400" />
          <h3 className="text-lg font-semibold text-gray-100">온습도 추이</h3>
        </div>
        {/* 현재 값을 오른쪽에 작게 표시 */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">현재 온도</span>
            <span className="font-bold text-green-400">{currentTemp.toFixed(1)}°C</span>
            <span className="text-gray-500 text-xs">
              ({minTemp.toFixed(1)} ~ {maxTemp.toFixed(1)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">현재 습도</span>
            <span className="font-bold text-sky-400">{currentHumidity.toFixed(1)}%</span>
            <span className="text-gray-500 text-xs">
              ({minHumidity.toFixed(1)} ~ {maxHumidity.toFixed(1)})
            </span>
          </div>
        </div>
      </div>
      
      <ReactECharts option={option} style={{ height }} opts={{ renderer: 'svg' }} />

      {/* 경고 표시 */}
      {(temperatureWarnings > 0 || humidityWarnings > 0) && (
        <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700 rounded">
          <p className="text-yellow-400 text-xs text-center">
            ⚠️ 온도 경고: {temperatureWarnings}건 | 습도 경고: {humidityWarnings}건
          </p>
        </div>
      )}
    </div>
  );
}
