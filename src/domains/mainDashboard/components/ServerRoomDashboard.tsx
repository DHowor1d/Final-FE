import {
  CpuGauge,
  MemoryGauge,
  DiskGauge,
  NetworkGauge,
  LoadAverageChart,
  DiskIOChart,
  ContextSwitchesSparkline,
  NetworkErrorChart,
  CpuUsageDetailChart,
  NetworkTrafficChart,
} from "./index";
import {
  mockNetworkTrafficData,
  mockLoadAverageData,
  mockDiskIOData,
  mockContextSwitchesData,
  mockCpuUsageDetailData,
} from "../data/mockData";
import type { AggregatedMetrics, ServerRoom } from "../types/dashboard.types";
import { Activity, TrendingUp } from "lucide-react";
import ReactECharts from "echarts-for-react";

interface ServerRoomDashboardProps {
  serverRoom: ServerRoom;
  metrics: AggregatedMetrics;
}

export default function ServerRoomDashboard({
  serverRoom,
  metrics,
}: ServerRoomDashboardProps) {
  // 랙별 CPU 사용률 데이터
  const rackCpuData = serverRoom.racks.map((rack) => {
    const rackEquipments = rack.equipments;
    const avgCpu =
      rackEquipments.reduce(
        (sum, eq) => sum + (100 - (eq.systemMetric?.cpu_idle || 0)),
        0
      ) / rackEquipments.length || 0;
    return {
      name: rack.name,
      value: Math.round(avgCpu * 10) / 10,
    };
  });

  // 랙별 메모리 사용률 데이터
  const rackMemoryData = serverRoom.racks.map((rack) => {
    const rackEquipments = rack.equipments;
    const avgMemory =
      rackEquipments.reduce(
        (sum, eq) => sum + (eq.systemMetric?.used_memory_percentage || 0),
        0
      ) / rackEquipments.length || 0;
    return {
      name: rack.name,
      value: Math.round(avgMemory * 10) / 10,
    };
  });

  const barChartOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["CPU 사용률", "메모리 사용률"],
      textStyle: {
        color: "#d1d5db",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: rackCpuData.map((d) => d.name),
      axisLabel: {
        color: "#9ca3af",
        rotate: 45,
      },
    },
    yAxis: {
      type: "value",
      name: "사용률 (%)",
      nameTextStyle: {
        color: "#9ca3af",
      },
      axisLabel: {
        color: "#9ca3af",
      },
      max: 100,
    },
    series: [
      {
        name: "CPU 사용률",
        type: "bar",
        data: rackCpuData.map((d) => d.value),
        itemStyle: {
          color: "#3b82f6",
        },
      },
      {
        name: "메모리 사용률",
        type: "bar",
        data: rackMemoryData.map((d) => d.value),
        itemStyle: {
          color: "#8b5cf6",
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* 장비 현황 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">총 장비 수</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">
                {metrics.totalEquipments}
              </p>
            </div>
            <Activity className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-4 border border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">정상</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {metrics.onlineEquipments}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-4 border border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">경고</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">
                {metrics.warningEquipments}
              </p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-4 border border-red-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">위험</p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {metrics.criticalEquipments}
              </p>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">오프라인</p>
              <p className="text-3xl font-bold text-gray-400 mt-1">
                {metrics.offlineEquipments}
              </p>
            </div>
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* 게이지 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CpuGauge value={metrics.avgCpuUsage} />
        <MemoryGauge value={metrics.avgMemoryUsage} />
        <DiskGauge value={metrics.avgDiskUsage} />
        <NetworkGauge
          value={
            serverRoom.racks[0]?.equipments[0]?.networkMetrics?.[0]
              ? (serverRoom.racks[0].equipments[0].networkMetrics[0].rx_usage +
                  serverRoom.racks[0].equipments[0].networkMetrics[0]
                    .tx_usage) /
                2
              : 0
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU 상세 사용률 */}
        <CpuUsageDetailChart data={mockCpuUsageDetailData} />

        {/* 시스템 부하 추세 */}
        <LoadAverageChart data={mockLoadAverageData} />
      </div>

      {/* 네트워크 & 디스크 I/O */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetworkTrafficChart data={mockNetworkTrafficData} />
        <DiskIOChart data={mockDiskIOData} />
      </div>

      {/* Context Switches & 네트워크 에러 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContextSwitchesSparkline data={mockContextSwitchesData} />
        <NetworkErrorChart data={[]} />
      </div>

      {/* 랙별 비교 차트 */}
      <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-cyan-400" />
          <h3 className="text-lg font-semibold text-gray-100">
            랙별 리소스 사용률 비교
          </h3>
        </div>
        <ReactECharts
          option={barChartOption}
          style={{ height: "400px" }}
          opts={{ renderer: "svg" }}
        />
      </div>
    </div>
  );
}
