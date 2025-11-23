// 시스템 메트릭 타입
export interface SystemMetric {
  id: number;
  equipment_id: number;
  context_switches: number;
  cpu_idle: number;
  cpu_irq: number;
  cpu_nice: number;
  cpu_softirq: number;
  cpu_steal: number;
  cpu_system: number;
  cpu_user: number;
  cpu_wait: number;
  free_memory: number;
  generate_time: string;
  load_avg1: number;
  load_avg15: number;
  load_avg5: number;
  memory_active: number;
  memory_buffers: number;
  memory_cached: number;
  memory_inactive: number;
  total_memory: number;
  total_swap: number;
  used_memory: number;
  used_memory_percentage: number;
  used_swap: number;
  used_swap_percentage: number;
}

// 네트워크 메트릭 타입
export interface NetworkMetric {
  id: number;
  equipment_id: number;
  generate_time: string;
  in_bytes_per_sec: number;
  in_bytes_tot: number;
  in_discard_pkts_tot: number;
  in_error_pkts_tot: number;
  in_pkts_per_sec: number;
  in_pkts_tot: number;
  nic_name: string;
  oper_status: number;
  out_bytes_per_sec: number;
  out_bytes_tot: number;
  out_discard_pkts_tot: number;
  out_error_pkts_tot: number;
  out_pkts_per_sec: number;
  out_pkts_tot: number;
  rx_usage: number;
  tx_usage: number;
}

// 스토리지 메트릭 타입
export interface StorageMetric {
  id: number;
  equipment_id: number;
  free_bytes: number;
  free_inodes: number;
  generate_time: string;
  io_read_bps: number;
  io_read_count: number;
  io_time_percentage: number;
  io_write_bps: number;
  io_write_count: number;
  total_bytes: number;
  total_inodes: number;
  used_bytes: number;
  used_inode_percentage: number;
  used_inodes: number;
  used_percentage: number;
}

// 장비 타입
export interface Equipment {
  id: number;
  name: string;
  type: 'Server' | 'Switch' | 'Storage' | 'Router';
  rack_id: number;
  position_u: number;
  height_u: number;
  ip_address: string;
  status: 'online' | 'offline' | 'warning' | 'critical';
  systemMetric?: SystemMetric;
  networkMetrics?: NetworkMetric[];
  storageMetric?: StorageMetric;
}

// 랙 타입 (API 응답 기반)
export interface Rack {
  id: number;
  name: string;
  deviceId: number;
  deviceCode: string;
  gridY: number;
  gridX: number;
  gridZ: number;
  rotation: number;
  status: string;
  equipments: Equipment[];
}

// 서버실 타입 (API 응답 기반)
export interface ServerRoom {
  id: number;
  name: string;
  code: string;
  location: string | null;
  floor: number;
  rows: number;
  columns: number;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  racks: Rack[];
}

// 데이터센터 타입 (API 응답 기반)
export interface Datacenter {
  id: number;
  name: string;
  code: string;
  address: string;
  serverRooms: ServerRoom[];
}

// 계층 선택 타입
export type HierarchyLevel = 'datacenter' | 'serverRoom' | 'rack';

export interface SelectedNode {
  level: HierarchyLevel;
  datacenterId: number;
  serverRoomId?: number;
  rackId?: number;
}

// 집계된 메트릭 타입
export interface AggregatedMetrics {
  totalEquipments: number;
  onlineEquipments: number;
  offlineEquipments: number;
  warningEquipments: number;
  criticalEquipments: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  avgDiskUsage: number;
  totalNetworkInMbps: number;
  totalNetworkOutMbps: number;
  avgLoadAvg1: number;
}

// 네트워크 트래픽 시계열 데이터 타입
export interface NetworkUsageTrend {
  time: string;
  rxBytesPerSec: number;
  txBytesPerSec: number;
}

export interface NetworkTrafficData {
  currentRxBytesPerSec: number;
  currentTxBytesPerSec: number;
  networkUsageTrend: NetworkUsageTrend[];
}

// ==================== SSE 실시간 데이터 타입 ====================

// 서버실 요약 정보
export interface ServerRoomSummary {
  serverRoomId: number;
  serverRoomName: string;
  equipmentCount: number;
  avgCpuUsage: number | null;
  avgMemoryUsage: number | null;
  avgDiskUsage: number | null;
  avgTemperature: number | null;
  alertCount: number;
}

// 데이터센터 실시간 메트릭 (SSE)
export interface DatacenterMetrics {
  dataCenterId: number;
  dataCenterName: string;
  timestamp: string;
  
  // 서버실 및 랙 현황
  totalServerRooms: number;
  activeServerRooms: number;
  totalRacks: number;
  activeRacks: number;
  
  // 장비 현황
  totalEquipments: number;
  activeEquipments: number;
  inactiveEquipments: number;
  
  // CPU 메트릭
  avgCpuUsage: number;
  maxCpuUsage: number;
  minCpuUsage: number;
  avgLoadAvg1: number;
  
  // 메모리 메트릭
  avgMemoryUsage: number;
  maxMemoryUsage: number;
  minMemoryUsage: number;
  totalMemoryBytes: number;
  usedMemoryBytes: number;
  avgSwapUsage: number;
  
  // 디스크 메트릭
  avgDiskUsage: number;
  maxDiskUsage: number;
  minDiskUsage: number;
  totalDiskBytes: number;
  usedDiskBytes: number;
  avgDiskIoUsage: number;
  
  // 네트워크 메트릭
  totalInBps: number;
  totalOutBps: number;
  avgRxUsage: number;
  avgTxUsage: number;
  totalInErrors: number;
  totalOutErrors: number;
  
  // 온습도 메트릭
  avgTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  avgHumidity: number;
  maxHumidity: number;
  minHumidity: number;
  temperatureWarnings: number;
  humidityWarnings: number;
  
  // 알림 및 전력
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  totalPowerUsage: number;
  avgPowerUsagePerRack: number;
  
  // 서버실 요약 (추후 사용)
  serverRoomSummaries: ServerRoomSummary[];
}

// 시계열 데이터 포인트
export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
}

// CPU 사용률 상세 (시계열) - 차트 컴포넌트와 호환
export interface CpuUsageDetail {
  time: string;
  cpuUser: number;
  cpuSystem: number;
  cpuWait: number;
  cpuNice: number;
  cpuIrq: number;
  cpuSoftirq: number;
  cpuSteal: number;
  cpuIdle: number;
}

// Load Average 시계열 - 차트 컴포넌트와 호환
export interface LoadAverageData {
  time: string;
  loadAvg1: number;
  loadAvg5: number;
  loadAvg15: number;
}

// 디스크 I/O 시계열 - 차트 컴포넌트와 호환
export interface DiskIOData {
  time: string;
  ioReadBps: number;
  ioWriteBps: number;
  ioTimePercentage: number;
}

// 디스크 사용량 시계열 - 차트 컴포넌트와 호환
export interface DiskUsageData {
  time: string;
  avgUsage: number;
  maxUsage: number;
  minUsage: number;
}

// CPU 사용량 시계열 - 차트 컴포넌트와 호환
export interface CpuUsageData {
  time: string;
  avgUsage: number;
  maxUsage: number;
  minUsage: number;
}

// 네트워크 에러 시계열 - 차트 컴포넌트와 호환
export interface NetworkErrorData {
  time: string;
  inErrors: number;
  outErrors: number;
}

// Context Switches 시계열 - 차트 컴포넌트와 호환
export interface ContextSwitchesData {
  time: string;
  contextSwitches: number;
}

// 온습도 시계열 데이터
export interface TemperatureHumidityData {
  time: string;
  temperature: number;
  humidity: number;
}

// 서버룸 실시간 메트릭 (SSE)
export interface ServerRoomMetrics {
  serverRoomId: number;
  serverRoomName: string;
  timestamp: string;
  
  // 랙 현황
  totalRacks: number;
  activeRacks: number;
  
  // 장비 현황
  totalEquipments: number;
  activeEquipments: number;
  inactiveEquipments: number;
  
  // CPU 메트릭
  avgCpuUsage: number;
  maxCpuUsage: number;
  minCpuUsage: number;
  avgLoadAvg1: number;
  
  // 메모리 메트릭
  avgMemoryUsage: number;
  maxMemoryUsage: number;
  minMemoryUsage: number;
  totalMemoryBytes: number;
  usedMemoryBytes: number;
  avgSwapUsage: number;
  
  // 디스크 메트릭
  avgDiskUsage: number;
  maxDiskUsage: number;
  minDiskUsage: number;
  totalDiskBytes: number;
  usedDiskBytes: number;
  avgDiskIoUsage: number;
  
  // 네트워크 메트릭
  totalInBps: number;
  totalOutBps: number;
  avgRxUsage: number;
  avgTxUsage: number;
  totalInErrors: number;
  totalOutErrors: number;
  
  // 온습도 메트릭
  avgTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  avgHumidity: number;
  maxHumidity: number;
  minHumidity: number;
  temperatureWarnings: number;
  humidityWarnings: number;
  
  // 알림 및 전력
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  totalPowerUsage: number;
  avgPowerUsagePerRack: number;
}
