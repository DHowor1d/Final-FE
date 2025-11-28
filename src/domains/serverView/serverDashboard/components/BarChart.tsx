/**
 * @author 구희원
 * @description 막대 차트 컴포넌트 (ECharts)
 */

import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

/**
 * 시리즈 데이터
 */
interface SeriesData {
  name: string;
  data: (number | null)[];
  color: string;
}

/**
 * 막대 차트 props
 */
interface BarChartProps {
  xAxisData: string[];
  series: SeriesData[];
  yAxisUnit?: string;
  height?: string;
  stacked?: boolean;
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
 * 막대 차트
 * @param {BarChartProps} props - 차트 속성
 * @param {string[]} props.xAxisData - X축 데이터
 * @param {SeriesData[]} props.series - 시리즈 데이터
 * @param {string} props.yAxisUnit - Y축 단위 (기본값: "%")
 * @param {string} props.height - 차트 높이 (기본값: "100%")
 * @param {boolean} props.stacked - 스택형 차트 여부 (기본값: true)
 * @returns 막대 차트 컴포넌트
 */
function BarChart({
  xAxisData,
  series,
  yAxisUnit = "%",
  height = "100%",
  stacked = true,
}: BarChartProps) {
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
      axisPointer: {
        type: "none",
      },
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
      bottom: 15,
    },
    grid: {
      left: "0.5%",
      right: "0.5%",
      bottom: "15%",
      top: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        color: "#fff",
        rotate: 45,
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: "#fff",
        },
      },
    },
    yAxis: {
      type: "value",
      name: "",
      scale: true,
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 30,
      nameTextStyle: {
        color: "#fff",
        fontSize: 12,
      },
      axisLabel: {
        color: "#fff",
        fontSize: 12,
        formatter: `{value}${yAxisUnit}`,
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
    series: series.map((s) => ({
      name: s.name,
      type: "bar",
      stack: stacked ? "total" : undefined,
      data: s.data,
      itemStyle: {
        color: s.color,
      },
      emphasis: {
        disabled: true,
      },
    })),
  };

  if (!mounted) return null;

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      notMerge={true}
      lazyUpdate={true}
      opts={{ renderer: "canvas" }}
    />
  );
}

export default BarChart;
