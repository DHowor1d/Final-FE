import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

interface SeriesData {
  name: string;
  data: (number | null)[];
  color: string;
}

interface BarChartProps {
  xAxisData: string[];
  series: SeriesData[];
  yAxisUnit?: string;
  height?: string;
  stacked?: boolean;
}

interface TooltipParams {
  axisValue: string;
  marker: string;
  seriesName: string;
  value: number | string;
}

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
