import { CpuGauge, MemoryGauge, DiskGauge, NetworkGauge } from "./index";
import {
  NetworkTrafficChart,
  LoadAverageChart,
  DiskUsageChart,
  CpuUsageChart,
  NetworkErrorChart,
  TemperatureHumidityChart,
} from "./index";
import { Activity } from "lucide-react";
import { useDatacenterSSE } from "@shared/hooks";

interface DatacenterDashboardProps {
  datacenterId: number;
}

export default function DatacenterDashboard({
  datacenterId,
}: DatacenterDashboardProps) {
  const {
    metrics,
    loadAverageHistory,
    diskUsageHistory,
    cpuUsageHistory,
    networkErrorHistory,
    networkTrafficHistory,
    temperatureHumidityHistory,
    // isConnected,
    error,
    // reconnect,
  } = useDatacenterSSE(datacenterId, true);

  // 로딩 상태
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">실시간 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 연결 상태 표시 */}
      {/* <div className="flex items-center justify-between bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <Wifi className="text-green-400" size={20} />
              <span className="text-green-400 text-sm font-medium">
                실시간 연결됨
              </span>
              <span className="text-gray-500 text-xs">
                마지막 업데이트: {new Date(metrics.timestamp).toLocaleTimeString('ko-KR')}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="text-red-400" size={20} />
              <span className="text-red-400 text-sm font-medium">
                연결 끊김
              </span>
            </>
          )}
        </div>
        <button
          onClick={reconnect}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
        >
          <RefreshCw size={16} />
          재연결
        </button>
      </div> */}

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

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
                {metrics.activeEquipments}
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
                {metrics.warningAlerts}
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
                {metrics.criticalAlerts}
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
                {metrics.inactiveEquipments}
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
        <NetworkGauge value={(metrics.avgRxUsage + metrics.avgTxUsage) / 2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 온습도 추이 차트 */}
        <TemperatureHumidityChart
          data={temperatureHumidityHistory}
          currentTemp={metrics.avgTemperature}
          currentHumidity={metrics.avgHumidity}
          minTemp={metrics.minTemperature}
          maxTemp={metrics.maxTemperature}
          minHumidity={metrics.minHumidity}
          maxHumidity={metrics.maxHumidity}
          temperatureWarnings={metrics.temperatureWarnings}
          humidityWarnings={metrics.humidityWarnings}
        />

        {/* 시스템 부하 추세 */}
        <LoadAverageChart data={loadAverageHistory} />
      </div>

      {/* 네트워크 및 디스크 사용량 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetworkTrafficChart 
          data={{
            currentRxBytesPerSec: metrics.totalInBps,
            currentTxBytesPerSec: metrics.totalOutBps,
            networkUsageTrend: networkTrafficHistory,
          }} 
        />
        <DiskUsageChart data={diskUsageHistory} />
      </div>

      {/* 온습도 및 네트워크 에러 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU 사용량 추이 */}
        <CpuUsageChart data={cpuUsageHistory} />
        
        {/* 네트워크 에러 */}
        <NetworkErrorChart data={networkErrorHistory} />
      </div>
    </div>
  );
}
