import {
  Layers,
  AlertTriangle,
  Thermometer,
  Droplets,
  Cpu,
  HardDrive,
  Network,
} from "lucide-react";
import { CpuGauge, MemoryGauge, DiskGauge, NetworkGauge } from "./index";
import {
  NetworkTrafficChart,
  CpuUsageChart,
  TemperatureHumidityChart,
  EquipmentTypeChart,
  TopEquipmentsTable,
} from "./index";
import { useRackSSE } from "@shared/hooks";

interface RackDashboardProps {
  rackId: number;
}

// 장비 타입별 U 높이 매핑 (SERVER, STORAGE는 2U, 나머지는 1U)
const EQUIPMENT_U_HEIGHT: Record<string, number> = {
  SERVER: 2,
  STORAGE: 2,
  SWITCH: 1,
  ROUTER: 1,
  LOAD_BALANCER: 1,
  FIREWALL: 1,
  KVM: 1,
  PDU: 1,
};

export default function RackDashboard({ rackId }: RackDashboardProps) {
  const {
    metrics,
    cpuUsageHistory,
    networkTrafficHistory,
    temperatureHumidityHistory,
    error,
  } = useRackSSE(rackId, true);

  // 에러 발생 시 throw하여 ErrorBoundary가 처리하도록 함
  if (error) {
    throw new Error(error);
  }

  // 로딩 상태
  if (!metrics || !metrics.rackSummary) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">실시간 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 랙 점유율 계산 (장비 타입별 U 높이 기반)
  const usedU = metrics.rackSummary.activeEquipmentTypes.reduce(
    (sum, eq) => sum + (EQUIPMENT_U_HEIGHT[eq.type] || 1) * eq.count,
    0
  );
  const totalU = 42; // 기본 랙 높이
  const rackUsagePercent = Math.round((usedU / totalU) * 1000) / 10;

  return (
    <div className="space-y-6">
      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* 랙 상태 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 랙 점유율 */}
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

        {/* 정상 */}
        <div className="bg-neutral-800 rounded-lg p-4 border border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">정상</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {metrics.rackSummary.normalCount}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* 경고 */}
        <div className="bg-gray-800 rounded-lg p-4 border border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">경고</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">
                {metrics.rackSummary.warningCount}
              </p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* 위험 */}
        <div className="bg-neutral-800 rounded-lg p-4 border border-red-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">위험</p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {metrics.rackSummary.errorCount}
              </p>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 환경 정보 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 온도 */}
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer size={20} className="text-orange-400" />
            <h3 className="text-sm font-semibold text-gray-300">온도</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">
              {metrics.environment.temperature.toFixed(1)}°C
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            범위: {metrics.environment.minTemperature.toFixed(1)}°C ~{" "}
            {metrics.environment.maxTemperature.toFixed(1)}°C
          </div>
          {metrics.environment.temperatureWarning && (
            <div className="text-xs text-yellow-400 mt-1">
              ⚠️ {metrics.environment.temperatureWarning}
            </div>
          )}
        </div>

        {/* 습도 */}
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <Droplets size={20} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-gray-300">습도</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">
              {metrics.environment.humidity.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            범위: {metrics.environment.minHumidity.toFixed(1)}% ~{" "}
            {metrics.environment.maxHumidity.toFixed(1)}%
          </div>
          {metrics.environment.humidityWarning && (
            <div className="text-xs text-yellow-400 mt-1">
              ⚠️ {metrics.environment.humidityWarning}
            </div>
          )}
        </div>

        {/* 총 메모리 */}
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={20} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-gray-300">총 메모리</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">
              {metrics.memoryStats.totalMemoryGB}
            </span>
            <span className="text-sm text-gray-400">GB</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            사용 중: {metrics.memoryStats.usedMemoryGB}GB
          </div>
        </div>

        {/* 총 디스크 */}
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={20} className="text-green-400" />
            <h3 className="text-sm font-semibold text-gray-300">총 디스크</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">
              {metrics.diskStats.totalCapacityTB.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400">TB</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            사용 중: {metrics.diskStats.usedCapacityTB.toFixed(2)}TB
          </div>
        </div>
      </div>

      {/* 게이지 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CpuGauge value={metrics.cpuStats.avgUsage} />
        <MemoryGauge value={metrics.memoryStats.avgUsage} />
        <DiskGauge value={metrics.diskStats.avgUsage} />
        <NetworkGauge
          value={
            (metrics.networkStats.avgRxUsage +
              metrics.networkStats.avgTxUsage) /
            2
          }
        />
      </div>

      {/* 온습도 추이 & CPU 사용률 추이 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 장비 타입별 구성 */}
        <EquipmentTypeChart data={metrics.rackSummary.activeEquipmentTypes} />
        <div className="col-span-2">
          <TemperatureHumidityChart
            data={temperatureHumidityHistory}
            currentTemp={metrics.environment.temperature}
            currentHumidity={metrics.environment.humidity}
            minTemp={metrics.environment.minTemperature}
            maxTemp={metrics.environment.maxTemperature}
            minHumidity={metrics.environment.minHumidity}
            maxHumidity={metrics.environment.maxHumidity}
            temperatureWarnings={metrics.environment.temperatureWarning ? 1 : 0}
            humidityWarnings={metrics.environment.humidityWarning ? 1 : 0}
          />
        </div>
        <div className="col-span-2">
          <CpuUsageChart data={cpuUsageHistory} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 네트워크 트래픽 추이 */}
        <NetworkTrafficChart
          data={{
            currentRxBytesPerSec:
              (metrics.networkStats.totalRxMbps * 1000000) / 8,
            currentTxBytesPerSec:
              (metrics.networkStats.totalTxMbps * 1000000) / 8,
            networkUsageTrend: networkTrafficHistory,
          }}
        />

        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center gap-2 mb-4">
            <Network size={20} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-300">
              네트워크 품질 지표
            </h3>
          </div>

          <div className="space-y-4">
            {/* 총 트래픽 */}
            <div className="p-3 bg-neutral-900 rounded border border-neutral-700">
              <p className="text-xs text-gray-400 mb-1">총 네트워크 트래픽</p>
              <div className="flex items-baseline gap-4">
                <div>
                  <span className="text-sm text-blue-400">RX: </span>
                  <span className="text-lg font-bold text-gray-100">
                    {metrics.networkStats.totalRxMbps.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">Mbps</span>
                </div>
                <div>
                  <span className="text-sm text-green-400">TX: </span>
                  <span className="text-lg font-bold text-gray-100">
                    {metrics.networkStats.totalTxMbps.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">Mbps</span>
                </div>
              </div>
            </div>

            {/* 에러 패킷 비율 */}
            <div className="p-3 bg-neutral-900 rounded border border-neutral-700">
              <p className="text-xs text-gray-400 mb-1">에러 패킷 비율</p>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold ${
                    metrics.networkStats.errorPacketRate > 0.001
                      ? "text-red-400"
                      : "text-gray-100"
                  }`}
                >
                  {(metrics.networkStats.errorPacketRate * 100).toFixed(4)}%
                </span>
              </div>
            </div>

            {/* 드롭 패킷 비율 */}
            <div className="p-3 bg-neutral-900 rounded border border-neutral-700">
              <p className="text-xs text-gray-400 mb-1">드롭 패킷 비율</p>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold ${
                    metrics.networkStats.dropPacketRate > 0.001
                      ? "text-yellow-400"
                      : "text-gray-100"
                  }`}
                >
                  {(metrics.networkStats.dropPacketRate * 100).toFixed(4)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Top 장비 순위 테이블 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU Top 5 */}
        <TopEquipmentsTable
          title="CPU 사용률 Top 5"
          data={metrics.cpuStats.topEquipments}
          unit="%"
          icon={<Cpu size={20} className="text-blue-400" />}
        />

        {/* Memory Top 5 */}
        <TopEquipmentsTable
          title="메모리 사용률 Top 5"
          data={metrics.memoryStats.topEquipments}
          unit="%"
          icon={<Cpu size={20} className="text-purple-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Disk Top 5 */}
        <TopEquipmentsTable
          title="디스크 사용률 Top 5"
          data={metrics.diskStats.topEquipments}
          unit="%"
          icon={<HardDrive size={20} className="text-green-400" />}
        />

        {/* Network RX Top 5 */}
        <TopEquipmentsTable
          title="네트워크 수신(RX) Top 5"
          data={metrics.networkStats.topRxEquipments}
          unit=" Mbps"
          icon={<Network size={20} className="text-blue-400" />}
          valueFormatter={(value) => `${value.toFixed(2)} Mbps`}
        />
      </div>

      {/* Network TX Top 5 */}
      <TopEquipmentsTable
        title="네트워크 송신(TX) Top 5"
        data={metrics.networkStats.topTxEquipments}
        unit=" Mbps"
        icon={<Network size={20} className="text-green-400" />}
        valueFormatter={(value) => `${value.toFixed(2)} Mbps`}
      />

      {/* 알람 */}
      {(metrics.rackSummary.warningCount > 0 ||
        metrics.rackSummary.errorCount > 0) && (
        <div className="bg-neutral-800 rounded-lg p-4 border border-yellow-700">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle size={20} />
            <span className="font-semibold">활성 알람</span>
          </div>
          <div className="mt-2 text-sm text-gray-300">
            {metrics.rackSummary.errorCount > 0 && (
              <div className="text-red-400">
                • Critical: {metrics.rackSummary.errorCount}개 장비
              </div>
            )}
            {metrics.rackSummary.warningCount > 0 && (
              <div className="text-yellow-400">
                • Warning: {metrics.rackSummary.warningCount}개 장비
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
