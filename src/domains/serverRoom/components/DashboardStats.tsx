interface DashboardStatsProps {
  stats: {
    totalDataCenters: number;
    totalRooms: number;
    activeRooms: number;
    maintenanceRooms: number;
  };
}

function StatItem({ value, label, colorClass }: { value: number; label: string; colorClass: string }) {
  return (
    <div className="flex flex-col items-center rounded-full">
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-10 bg-gray-50/50"></div>;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
  <div className="flex items-center gap-6 px-8 ml-6 border-l-4 border-gray-50/50">
    <StatItem value={stats.totalDataCenters} label="총 데이터센터" colorClass="text-gray-50" />
    <Divider />
    <StatItem value={stats.totalRooms} label="총 서버실" colorClass="text-gray-50" />
    <Divider />
    <StatItem value={stats.activeRooms} label="활성 상태" colorClass="text-green-400" />
    <Divider />
    <StatItem value={stats.maintenanceRooms} label="점검중" colorClass="text-yellow-400" />
  </div>
  );
}
