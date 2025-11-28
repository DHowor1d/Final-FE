/**
 * @author 구희원
 * @description 부드러운 라인 차트 컴포넌트 (ECharts)
 */

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

/**
 * 시리즈 데이터
 */
interface SeriesData {
  name: string;
  data: (number | null)[];
  color: string;
  smooth?: boolean;
  showAverage?: boolean;
  averageColor?: string;
  lineType?: "solid" | "dashed" | "dotted";
}

/**
 * 부드러운 라인 차트 props
 */
interface SmoothLineChartProps {
  xAxisData: string[];
  series: SeriesData[];
  yAxisUnit?: string;
  height?: string;
}

/**
 * 툴팁 파라미터
 */
interface TooltipParams {
  axisValue: string;
  marker: string;
  seriesName: string;
  value: number | string;
}

/**
 * 부드러운 라인 차트
 * @param {SmoothLineChartProps} props - 차트 속성
 * @param {string[]} props.xAxisData - X축 데이터
 * @param {SeriesData[]} props.series - 시리즈 데이터
 * @param {string} props.yAxisUnit - Y축 단위
 * @param {string} props.height - 차트 높이 (기본값: "100%")
 * @returns 부드러운 라인 차트 컴포넌트
 */
function SmoothLineChart({
  xAxisData,
  series,
  yAxisUnit = "",
  height = "100%",
}: SmoothLineChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const option = {
    backgroundColor: "transparent",
    textStyle: {
      color: "#999",
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(50, 50, 50, 0.9)",
      borderColor: "#777",
      textStyle: {
        color: "#fff",
      },
      formatter: (params: TooltipParams[]) => {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((item: TooltipParams) => {
          const value =
            typeof item.value === "number" ? item.value.toFixed(2) : item.value;
          result += `${item.marker} ${item.seriesName}: ${value}${yAxisUnit}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: series.map((s) => s.name),
      textStyle: {
        color: "#fff",
      },
      bottom: "3%",
    },

    grid: {
      left: "3%",
      right: "3%",
      bottom: "30%",
      top: "5%",
      containLabel: false,
    },

    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        color: "#fff",
        fontSize: 12,
        rotate: 45,
      },
      axisLine: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
    },
    yAxis: {
      type: "value",
      scale: true,
      name: "",
      nameLocation: "middle",
      nameRotate: 90,
      nameTextStyle: {
        color: "#fff",
        fontSize: 12,
      },
      axisLabel: {
        color: "#fff",
        formatter: (value: number) => {
          if (value >= 10 || value === 0) {
            return `${Math.round(value)}${yAxisUnit}`;
          } else {
            return `${value.toFixed(1)}${yAxisUnit}`;
          }
        },
        margin: 8,
      },
      axisLine: {
        lineStyle: {
          color: "#fff",
        },
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
    },
    series: series.map((s) => {
      return {
        name: s.name,
        type: "line",
        data: s.data,
        smooth: s.smooth !== undefined ? s.smooth : true,
        itemStyle: {
          color: s.color,
        },
        lineStyle: {
          color: s.color,
          width: 2,
          type: s.lineType || "solid",
        },
        symbol: "circle",
        symbolSize: 6,
        markLine: s.showAverage
          ? {
              silent: true,
              symbol: ["none", "arrow"],
              symbolSize: 10,
              lineStyle: {
                color: s.averageColor || s.color,
                type: "dashed",
                width: 2,
              },
              label: {
                show: false,
              },
              data: [
                {
                  type: "average",
                  name: "평균",
                },
              ],
            }
          : undefined,
      };
    }),
  };

  if (!mounted) return null;

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}

export default SmoothLineChart;
