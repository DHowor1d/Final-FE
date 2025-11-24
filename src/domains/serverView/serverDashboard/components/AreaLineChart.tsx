import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

interface SeriesData {
  name: string;
  data: number[] | null;
  color?: string;
  showAverage?: boolean;
  showMaxMin?: boolean;
  lineType?: "solid" | "dashed" | "dotted";
}

interface AreaLineChartProps {
  xAxisData: string[];
  series: SeriesData[];
  yAxisUnit?: string;
  height?: string;
  showToolbox?: boolean;
}

interface TooltipParams {
  axisValue: string;
  marker: string;
  seriesName: string;
  value: number | string;
  color: string;
}

function AreaLineChart({
  xAxisData,
  series,
  yAxisUnit = "",
  height = "100%",
  showToolbox = false,
}: AreaLineChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#58D9F9",
      borderWidth: 1,
      textStyle: {
        color: "#fff",
      },
      formatter: (params: TooltipParams[]) => {
        let result = `<div style="padding: 5px;">`;
        result += `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;

        params.forEach((param: TooltipParams) => {
          const value =
            typeof param.value === "number"
              ? param.value.toFixed(2)
              : param.value;
          result += `
            <div style="display: flex; align-items: center; margin-top: 3px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
              <span>${param.seriesName}: ${value}${yAxisUnit}</span>
            </div>
          `;
        });

        result += `</div>`;
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
      left: "1%",
      right: "1%",
      bottom: "20%",
      top: "5%",
      containLabel: true,
    },
    toolbox: showToolbox
      ? {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: "none",
            },
            dataView: { readOnly: false },
            magicType: { type: ["line", "bar"] },
            restore: {},
            saveAsImage: {},
          },
          iconStyle: {
            borderColor: "#fff",
          },
        }
      : undefined,
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: "#fff",
        },
      },
      axisLabel: {
        color: "#fff",
        fontSize: 12,
        rotate: 45,
        margin: 15,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      scale: true,
      name: "",
      nameLocation: "middle",
      nameTextStyle: {
        color: "#fff",
        fontSize: 12,
      },
      axisLine: {
        show: false,
        color: "rgba(255, 255, 255, 0.05)",
      },
      axisLabel: {
        color: "#fff",
        fontSize: 12,
        formatter: `{value}${yAxisUnit}`,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.05)",
          type: "dashed",
        },
      },
    },
    series: series.map((s, index) => {
      const defaultColors = [
        "#58D9F9",
        "#4ADE80",
        "#A78BFA",
        "#F59E0B",
        "#EC4899",
      ];
      const color = s.color || defaultColors[index % defaultColors.length];

      if (!mounted) return null;

      return {
        name: s.name,
        type: "line",
        data: s.data,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
        itemStyle: {
          color: color,
        },
        lineStyle: {
          color: color,
          width: 2,
          type: s.lineType || "solid",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: `${color}40`,
              },
              {
                offset: 1,
                color: `${color}05`,
              },
            ],
          },
        },
        markLine: s.showAverage
          ? {
              silent: true,
              lineStyle: {
                color: color,
                type: "dashed",
                width: 1,
              },
              label: {
                color: "#fff",
                fontSize: 11,
              },
              data: [
                {
                  type: "average",
                  name: "평균",
                },
              ],
            }
          : undefined,
        markPoint: s.showMaxMin
          ? {
              data: [
                {
                  type: "max",
                  name: "최대",
                  itemStyle: {
                    color: color,
                  },
                  label: {
                    color: "#fff",
                    fontSize: 11,
                  },
                },
                {
                  type: "min",
                  name: "최소",
                  itemStyle: {
                    color: color,
                  },
                  label: {
                    color: "#fff",
                    fontSize: 11,
                  },
                },
              ],
            }
          : undefined,
      };
    }),
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: height, width: "100%" }}
      opts={{ renderer: "canvas" }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}

export default AreaLineChart;
