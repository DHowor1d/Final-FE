/**
 * @author 최산하
 */
import { Cpu, MemoryStick, HardDrive, Network, Thermometer, Droplets, Server, Box } from 'lucide-react';
import { useServerRoomSSE } from '@shared/hooks';

interface ServerRoomStatsPanelProps {
  serverRoomId: number;
}

export default function ServerRoomStatsPanel({ serverRoomId }: ServerRoomStatsPanelProps) {
  const { metrics, isConnected, error } = useServerRoomSSE(serverRoomId, true);

  if (!metrics) {
    return (
      <div className="absolute top-4 left-4 bg-neutral-900/95 backdrop-blur-sm rounded-lg border border-neutral-700 p-4 min-w-[280px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-400">서버실 통계 로딩 중...</span>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: Cpu,
      label: 'CPU',
      value: `${metrics.avgCpuUsage?.toFixed(1) ?? 'N/A'}%`,
      color: 'text-blue-400',
    },
    {
      icon: MemoryStick,
      label: '메모리',
      value: `${metrics.avgMemoryUsage?.toFixed(1) ?? 'N/A'}%`,
      color: 'text-purple-400',
    },
    {
      icon: HardDrive,
      label: '디스크',
      value: `${metrics.avgDiskUsage?.toFixed(1) ?? 'N/A'}%`,
      color: 'text-yellow-400',
    },
    {
      icon: Network,
      label: '네트워크',
      value: metrics.avgRxUsage != null && metrics.avgTxUsage != null 
        ? `${((metrics.avgRxUsage + metrics.avgTxUsage) / 2).toFixed(1)}%`
        : 'N/A%',
      color: 'text-cyan-400',
    },
    {
      icon: Thermometer,
      label: '온도',
      value: `${metrics.avgTemperature?.toFixed(1) ?? 'N/A'}°C`,
      color: 'text-orange-400',
    },
    {
      icon: Droplets,
      label: '습도',
      value: `${metrics.avgHumidity?.toFixed(1) ?? 'N/A'}%`,
      color: 'text-sky-400',
    },
  ];

  const equipmentStats = [
    {
      icon: Server,
      label: '장비',
      value: `${metrics.activeEquipments ?? 0}/${metrics.totalEquipments ?? 0}`,
      color: 'text-green-400',
    },
    {
      icon: Box,
      label: '랙',
      value: `${metrics.activeRacks ?? 0}/${metrics.totalRacks ?? 0}`,
      color: 'text-indigo-400',
    },
  ];

  return (
    <div className="absolute top-4 left-4 bg-neutral-900/70 backdrop-blur-sm rounded-lg border border-neutral-700 shadow-xl min-w-[280px] z-10">
      {/* 헤더 */}
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-100">{metrics.serverRoomName}</h3>
          <div className={`flex items-center gap-1.5 text-xs ${error ? 'text-red-400' : isConnected ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500' : isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span>{error ? '연결 오류' : isConnected ? '실시간' : '연결 끊김'}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {new Date(metrics.timestamp).toLocaleString('ko-KR')}
        </p>
      </div>

      {/* 리소스 메트릭 */}
      <div className="p-3 space-y-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-neutral-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <Icon size={14} className={stat.color} />
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-100">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* 구분선 */}
      <div className="border-t border-neutral-700"></div>

      {/* 장비/랙 현황 */}
      <div className="p-3 space-y-2">
        {equipmentStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-neutral-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <Icon size={14} className={stat.color} />
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-100">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* 알림 */}
      {(metrics.totalAlerts ?? 0) > 0 && (
        <>
          <div className="border-t border-neutral-700"></div>
          <div className="p-3">
            <div className="flex items-center justify-between py-1.5 px-2 bg-red-900/20 rounded border border-red-800/50">
              <span className="text-xs text-red-400">알림</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-red-400">
                  위험 <span className="font-semibold">{metrics.criticalAlerts ?? 0}</span>
                </span>
                <span className="text-xs text-yellow-400">
                  경고 <span className="font-semibold">{metrics.warningAlerts ?? 0}</span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
