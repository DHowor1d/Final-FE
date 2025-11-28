/**
 * @author 구희원
 * @description 게이지 차트 컴포넌트 (ECharts)
 */

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

/**
 * 게이지 차트 props
 */
interface GaugeChartProps {
  value: number;
  max?: number;
  min?: number;
  color?: string;
  unit?: string;
}

/**
 * 게이지 차트
 * @param {GaugeChartProps} props - 차트 속성
 * @param {number} props.value - 현재 값
 * @param {number} props.max - 최대값 (기본값: 100)
 * @param {number} props.min - 최소값 (기본값: 0)
 * @param {string} props.color - 차트 색상 (기본값: "#58D9F9")
 * @param {string} props.unit - 단위 (기본값: "%")
 * @returns 게이지 차트 컴포넌트
 */
function GaugeChart({
  value,
  max = 100,
  min = 0,
  color = "#58D9F9",
  unit = "%",
}: GaugeChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const option = {
    series: [
      {
        type: "gauge",
        center: ["50%", "65%"],
        radius: "110%",
        startAngle: 180,
        endAngle: 0,
        min,
        max,
        splitNumber: 10,
        itemStyle: {
          color: color,
        },
        progress: {
          show: true,
          roundCap: true,
          width: 18,
        },
        pointer: {
          show: true,
          icon: "path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z",
          length: "60%",
          width: 16,
          offsetCenter: [0, "5%"],
          itemStyle: {
            color: color,
          },
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 18,
          },
        },
        axisTick: {
          splitNumber: 2,
          lineStyle: {
            width: 1,
            color: "#fff",
          },
        },
        splitLine: {
          length: 8,
          distance: 10,
          lineStyle: {
            width: 2,
            color: "#fff",
          },
        },
        axisLabel: {
          distance: 20,
          color: "#fff",
          fontSize: 13,
        },
        detail: {
          show: true,
          valueAnimation: true,
          formatter: `{value}${unit}`,
          fontSize: 24,
          fontWeight: "bold",
          offsetCenter: [0, "30%"],
          color: "#fff",
        },
        data: [
          {
            value,
          },
        ],
      },
    ],
  };

  if (!mounted) return null;

  return (
    <ReactECharts
      option={option}
      style={{ height: "100%", width: "100%" }}
      opts={{ renderer: "svg" }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}

export default GaugeChart;
