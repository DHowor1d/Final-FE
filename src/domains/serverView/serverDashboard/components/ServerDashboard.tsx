import { useMemo } from "react";
import "../css/serverDashboard.css";
import ServerDashboardHeader from "./ServerDashboardHeader";
import GaugeChart from "./GaugeChart";
import BarChart from "./BarChart";
import CpuIcon from "../assets/cpu.svg";
import MemoryIcon from "../assets/memory.svg";
import DiskIcon from "../assets/disk.svg";
import SmoothLineChart from "./SmoothLineChart";
import AreaLineChart from "./AreaLineChart";
import ChartCard from "./ChartCard";
import ThresholdHeader from "./ThresholdHeader";
import { useUpdateEquipment } from "../hooks/useUpdateEquipment";
import { useMonitoringStore } from "../stores/monitoringStore";
import { buildChartData, type HistoryRecord } from "../utils/chartDataBuilder";
import { DEFAULT_THRESHOLD_VALUES } from "../constants";
import type { Equipments } from "../../rack/types";

interface ServerDashboardProps {
  deviceId: number;
  deviceName: string;
  onClose: () => void;
  isOpen: boolean;
  rackId: number;
  serverRoomId: number;
  currentEquipment?: Equipments;
}

interface ThresholdValues {
  cpu: { warning: number; critical: number };
  memory: { warning: number; critical: number };
  disk: { warning: number; critical: number };
}

function ServerDashboard({
  deviceName,
  isOpen,
  onClose,
  deviceId,
  rackId,
  serverRoomId,
  currentEquipment,
}: ServerDashboardProps) {
  const { mutate: updateEquipment, isPending } = useUpdateEquipment();

  const { systemData, diskData, systemHistory, diskHistory, networkHistory } =
    useMonitoringStore();

  // 임계값 초기화
  const initialThresholds = useMemo<ThresholdValues>(() => {
    if (!currentEquipment) {
      return DEFAULT_THRESHOLD_VALUES;
    }

    return {
      cpu: {
        warning: currentEquipment.cpuThresholdWarning || 0,
        critical: currentEquipment.cpuThresholdCritical || 0,
      },
      memory: {
        warning: currentEquipment.memoryThresholdWarning || 0,
        critical: currentEquipment.memoryThresholdCritical || 0,
      },
      disk: {
        warning: currentEquipment.diskThresholdWarning || 0,
        critical: currentEquipment.diskThresholdCritical || 0,
      },
    };
  }, [currentEquipment]);

  // 임계값 저장
  const handleSaveThresholds = (values: ThresholdValues) => {
    if (!currentEquipment) {
      console.error("장비 정보를 찾을 수 없습니다.");
      return;
    }

    updateEquipment(
      {
        id: deviceId,
        data: {
          equipmentName: currentEquipment.equipmentName,
          equipmentType: currentEquipment.equipmentType,
          startUnit: currentEquipment.startUnit,
          unitSize: currentEquipment.unitSize,
          status: currentEquipment.status,
          serverRoomId: serverRoomId,
          rackId: rackId,
          cpuThresholdWarning: values.cpu.warning,
          cpuThresholdCritical: values.cpu.critical,
          memoryThresholdWarning: values.memory.warning,
          memoryThresholdCritical: values.memory.critical,
          diskThresholdWarning: values.disk.warning,
          diskThresholdCritical: values.disk.critical,
        },
      },
      {
        onSuccess: (response) => {
          console.log("임계치 저장 성공:", response);
        },
        onError: (error) => {
          console.error("임계치 저장 실패:", error);
        },
      }
    );
  };

  const chartData = useMemo(() => {
    return buildChartData({
      systemData,
      diskData,
      systemHistory: systemHistory as unknown as HistoryRecord[],
      diskHistory: diskHistory as unknown as HistoryRecord[],
      networkHistory,
    });
  }, [systemData, diskData, systemHistory, diskHistory, networkHistory]);

  // 로딩 상태
  if (!systemData || systemHistory.length === 0) {
    return (
      <div className={`dashboard-container ${isOpen ? "open" : "closed"}`}>
        <ServerDashboardHeader deviceName={deviceName} onClose={onClose} />
        <div className="flex items-center justify-center h-full">
          <p>데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dashboard-container ${isOpen ? "open" : "closed"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <ServerDashboardHeader deviceName={deviceName} onClose={onClose} />
      <ThresholdHeader
        key={deviceId}
        initialValues={initialThresholds}
        onSave={handleSaveThresholds}
        isOpen={isOpen}
        isLoading={isPending}
      />

      <div className="dashboard-content scrollbar-none">
        <div className="chart-grid">
          <div className="chart-row-small">
            <ChartCard title="CPU 사용률" icon={CpuIcon} size="small">
              <GaugeChart
                value={chartData.cpuUsage}
                max={100}
                min={0}
                color="#5B8FF9"
              />
            </ChartCard>

            <ChartCard title="MEMORY 사용률" icon={MemoryIcon} size="small">
              <GaugeChart
                value={chartData.memoryUsage}
                max={100}
                min={0}
                color="#5AD8A6"
              />
            </ChartCard>

            <ChartCard title="DISK 사용률" icon={DiskIcon} size="small">
              <GaugeChart
                value={chartData.diskUsage}
                max={100}
                min={0}
                color="#F6BD16"
              />
            </ChartCard>
          </div>

          <div className="chart-row-medium">
            <ChartCard title="CPU 사용 모드별 분포" size="medium">
              <BarChart
                xAxisData={chartData.timeLabels}
                series={chartData.cpuModes}
                yAxisUnit="%"
              />
            </ChartCard>

            <ChartCard title="시스템 부하 (Load Average)" size="medium">
              <SmoothLineChart
                xAxisData={chartData.timeLabels}
                series={chartData.loadAverage}
                yAxisUnit=""
              />
            </ChartCard>
          </div>

          <div className="chart-row-large">
            <ChartCard title="메모리 & 스왑 사용률" size="large">
              <SmoothLineChart
                xAxisData={chartData.timeLabels}
                series={chartData.memorySwap}
                yAxisUnit="%"
              />
            </ChartCard>
          </div>

          <div className="chart-row-medium">
            <ChartCard title="네트워크 대역폭" size="medium">
              <AreaLineChart
                xAxisData={chartData.networkTimeLabels}
                series={chartData.networkBandwidth}
                yAxisUnit="Mbps"
              />
            </ChartCard>

            <ChartCard title="CPU Wait & Steal" size="medium">
              <SmoothLineChart
                xAxisData={chartData.timeLabels}
                series={chartData.cpuOverhead}
                yAxisUnit="%"
              />
            </ChartCard>
          </div>

          <div className="chart-row-medium">
            <ChartCard title="디스크 읽기/쓰기 속도" size="medium">
              <AreaLineChart
                xAxisData={chartData.timeLabels}
                series={chartData.diskIO}
                yAxisUnit="MB/s"
              />
            </ChartCard>

            <ChartCard title="Disk & Inode 사용률" size="medium">
              <SmoothLineChart
                xAxisData={chartData.timeLabels}
                series={chartData.inodeUsage}
                yAxisUnit="%"
              />
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServerDashboard;
