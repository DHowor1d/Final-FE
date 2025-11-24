import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { DataTable, DataTablePagination } from "@/shared/table";
import type { Rack } from "../types/dashboard.types";
import { equipmentColumns } from "./equipmentTable.config";
import { Layers, AlertTriangle } from "lucide-react";
import { CpuGauge, MemoryGauge, DiskGauge, NetworkGauge } from "./index";
import {
  NetworkTrafficChart,
  LoadAverageChart,
  DiskIOChart,
  ContextSwitchesSparkline,
  NetworkErrorChart,
  CpuUsageDetailChart,
} from "./index";
import {
  mockNetworkTrafficData,
  mockLoadAverageData,
  mockDiskIOData,
  mockContextSwitchesData,
  mockCpuUsageDetailData,
} from "../data/mockData";

interface RackDashboardProps {
  rack: Rack;
}

export default function RackDashboard({ rack }: RackDashboardProps) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  // 랙 메트릭 계산
  const totalEquipments = rack.equipments.length;
  const usedU = rack.equipments.reduce((sum, eq) => sum + eq.height_u, 0);
  const totalU = 42; // 기본 랙 높이
  const rackUsagePercent = Math.round((usedU / totalU) * 1000) / 10;

  const avgCpuUsage =
    rack.equipments.reduce(
      (sum, eq) => sum + (100 - (eq.systemMetric?.cpu_idle || 0)),
      0
    ) / totalEquipments || 0;

  const avgMemoryUsage =
    rack.equipments.reduce(
      (sum, eq) => sum + (eq.systemMetric?.used_memory_percentage || 0),
      0
    ) / totalEquipments || 0;

  const avgDiskUsage =
    rack.equipments.reduce(
      (sum, eq) => sum + (eq.storageMetric?.used_percentage || 0),
      0
    ) / totalEquipments || 0;

  const onlineCount = rack.equipments.filter(
    (eq) => eq.status === "online"
  ).length;
  const warningCount = rack.equipments.filter(
    (eq) => eq.status === "warning"
  ).length;
  const criticalCount = rack.equipments.filter(
    (eq) => eq.status === "critical"
  ).length;

  const table = useReactTable({
    data: rack.equipments,
    columns: equipmentColumns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* 랙 상태 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={20} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-300">랙 점유율</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-100">
              {rackUsagePercent}%
            </span>
            <span className="text-sm text-gray-400 mb-1">
              ({usedU}U / {totalU}U)
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${rackUsagePercent}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-4 border border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">정상</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {onlineCount}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">경고</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">
                {warningCount}
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
                {criticalCount}
              </p>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 게이지 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CpuGauge value={avgCpuUsage} />
        <MemoryGauge value={avgMemoryUsage} />
        <DiskGauge value={avgDiskUsage} />
        <NetworkGauge
          value={
            rack.equipments[0]?.networkMetrics?.[0]
              ? (rack.equipments[0].networkMetrics[0].rx_usage +
                  rack.equipments[0].networkMetrics[0].tx_usage) /
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

      {/* 네트워크 및 디스크 I/O */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetworkTrafficChart data={mockNetworkTrafficData} />
        <DiskIOChart data={mockDiskIOData} />
      </div>

      {/* Context Switches 및 네트워크 에러/드롭 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ContextSwitchesSparkline data={mockContextSwitchesData} />
        </div>
        <NetworkErrorChart data={[]} />
      </div>

      {/* 알람 */}
      {(warningCount > 0 || criticalCount > 0) && (
        <div className="bg-neutral-800 rounded-lg p-4 border border-yellow-700">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle size={20} />
            <span className="font-semibold">활성 알람</span>
          </div>
          <div className="mt-2 text-sm text-gray-300">
            {criticalCount > 0 && (
              <div className="text-red-400">
                • Critical: {criticalCount}개 장비
              </div>
            )}
            {warningCount > 0 && (
              <div className="text-yellow-400">
                • Warning: {warningCount}개 장비
              </div>
            )}
          </div>
        </div>
      )}

      {/* 장비 테이블 */}
      <div className="bg-neutral-800 rounded-lg border border-neutral-700">
        <DataTable
          table={table}
          columns={equipmentColumns}
          isLoading={false}
          isError={false}
        />
        <div className="p-4 border-t border-neutral-700">
          <DataTablePagination
            table={table}
            showSelectedCount={false}
            showPageSizeSelector={true}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      </div>
    </div>
  );
}
