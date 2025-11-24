import type { Datacenter, Equipment, SystemMetric, NetworkMetric, StorageMetric, NetworkTrafficData } from '../types/dashboard.types';

// 하드코딩 메트릭 데이터 생성 헬퍼
const generateSystemMetric = (equipmentId: number): SystemMetric => {
  const cpuIdle = Math.random() * 40 + 60; // 60-100%
  const memoryUsage = Math.random() * 50 + 30; // 30-80%
  
  return {
    id: equipmentId,
    equipment_id: equipmentId,
    context_switches: Math.floor(Math.random() * 10000 + 2000),
    cpu_idle: cpuIdle,
    cpu_irq: Math.random() * 2,
    cpu_nice: Math.random() * 1,
    cpu_softirq: Math.random() * 2,
    cpu_steal: Math.random() * 1,
    cpu_system: Math.random() * 8 + 2,
    cpu_user: Math.random() * 15 + 5,
    cpu_wait: Math.random() * 4,
    free_memory: Math.floor(Math.random() * 5000000000 + 5000000000),
    generate_time: new Date().toISOString(),
    load_avg1: Math.random() * 2 + 0.5,
    load_avg15: Math.random() * 1.5 + 0.5,
    load_avg5: Math.random() * 1.8 + 0.5,
    memory_active: Math.floor(Math.random() * 5000000000),
    memory_buffers: Math.floor(Math.random() * 1000000000),
    memory_cached: Math.floor(Math.random() * 2000000000),
    memory_inactive: Math.floor(Math.random() * 2500000000),
    total_memory: 17179869184,
    total_swap: 8589934592,
    used_memory: Math.floor(17179869184 * (memoryUsage / 100)),
    used_memory_percentage: memoryUsage,
    used_swap: Math.floor(Math.random() * 500000000),
    used_swap_percentage: Math.random() * 5,
  };
};

const generateNetworkMetric = (equipmentId: number, index: number): NetworkMetric => {
  const rxUsage = Math.random() * 20 + 5; // 5-25%
  const txUsage = Math.random() * 15 + 3; // 3-18%
  
  return {
    id: equipmentId * 10 + index,
    equipment_id: equipmentId,
    generate_time: new Date().toISOString(),
    in_bytes_per_sec: Math.random() * 20000000 + 5000000,
    in_bytes_tot: Math.floor(Math.random() * 300000000),
    in_discard_pkts_tot: Math.floor(Math.random() * 3),
    in_error_pkts_tot: Math.floor(Math.random() * 5),
    in_pkts_per_sec: Math.random() * 15000 + 3000,
    in_pkts_tot: Math.floor(Math.random() * 200000),
    nic_name: `eth${index}`,
    oper_status: 1,
    out_bytes_per_sec: Math.random() * 15000000 + 3000000,
    out_bytes_tot: Math.floor(Math.random() * 200000000),
    out_discard_pkts_tot: Math.floor(Math.random() * 2),
    out_error_pkts_tot: Math.floor(Math.random() * 4),
    out_pkts_per_sec: Math.random() * 10000 + 2000,
    out_pkts_tot: Math.floor(Math.random() * 150000),
    rx_usage: rxUsage,
    tx_usage: txUsage,
  };
};

const generateStorageMetric = (equipmentId: number): StorageMetric => {
  const usedPercentage = Math.random() * 50 + 30; // 30-80%
  const totalBytes = 536870912000; // 500GB
  const usedBytes = Math.floor(totalBytes * (usedPercentage / 100));
  
  return {
    id: equipmentId,
    equipment_id: equipmentId,
    free_bytes: totalBytes - usedBytes,
    free_inodes: Math.floor(Math.random() * 10000000 + 15000000),
    generate_time: new Date().toISOString(),
    io_read_bps: Math.random() * 15000000 + 3000000,
    io_read_count: Math.floor(Math.random() * 50000 + 10000),
    io_time_percentage: Math.random() * 30 + 5,
    io_write_bps: Math.random() * 12000000 + 2000000,
    io_write_count: Math.floor(Math.random() * 40000 + 8000),
    total_bytes: totalBytes,
    total_inodes: 32000000,
    used_bytes: usedBytes,
    used_inode_percentage: Math.random() * 40 + 15,
    used_inodes: Math.floor(Math.random() * 15000000 + 5000000),
    used_percentage: usedPercentage,
  };
};

const getEquipmentStatus = (cpuUsage: number, memoryUsage: number, diskUsage: number) => {
  if (cpuUsage > 90 || memoryUsage > 95 || diskUsage > 95) return 'critical';
  if (cpuUsage > 80 || memoryUsage > 85 || diskUsage > 85) return 'warning';
  return 'online';
};

// 장비 생성
let equipmentIdCounter = 1;

const createEquipment = (rackId: number, positionU: number, type: Equipment['type']): Equipment => {
  const id = equipmentIdCounter++;
  const systemMetric = generateSystemMetric(id);
  const networkMetrics = [generateNetworkMetric(id, 0), generateNetworkMetric(id, 1)];
  const storageMetric = generateStorageMetric(id);
  
  const cpuUsage = 100 - systemMetric.cpu_idle;
  const memoryUsage = systemMetric.used_memory_percentage;
  const diskUsage = storageMetric.used_percentage;
  
  return {
    id,
    name: `${type}-${String(id).padStart(3, '0')}`,
    type,
    rack_id: rackId,
    position_u: positionU,
    height_u: type === 'Server' ? 2 : 1,
    ip_address: `192.168.${Math.floor(id / 254) + 1}.${id % 254 + 1}`,
    status: getEquipmentStatus(cpuUsage, memoryUsage, diskUsage),
    systemMetric,
    networkMetrics,
    storageMetric,
  };
};

// Mock 데이터 생성
export const mockDatacenters: Datacenter[] = [
  {
    id: 1,
    name: '서울 데이터센터',
    code: 'DC-SEOUL-01',
    address: '서울특별시 강남구',
    serverRooms: [
      {
        id: 1,
        name: '서버실 A',
        code: 'SR-A-01',
        location: '1층 동관',
        floor: 1,
        rows: 5,
        columns: 10,
        description: '주요 서버 라크',
        status: 'ACTIVE',
        racks: Array.from({ length: 5 }, (_, rackIdx) => {
          let currentU = 0;
          const equipments: Equipment[] = [];
          const numEquipments = Math.floor(Math.random() * 6) + 5; // 5-10개
          
          for (let i = 0; i < numEquipments; i++) {
            const types: Equipment['type'][] = ['Server', 'Switch', 'Storage', 'Router'];
            const type = types[Math.floor(Math.random() * types.length)];
            const equipment = createEquipment(rackIdx + 1, currentU, type);
            currentU += equipment.height_u;
            equipments.push(equipment);
            
            if (currentU >= 40) break; // 42U 랙 제한
          }
          
          return {
            id: rackIdx + 1,
            name: `Rack-A${String(rackIdx + 1).padStart(2, '0')}`,
            deviceId: rackIdx + 1,
            deviceCode: `RACK-A${String(rackIdx + 1).padStart(2, '0')}`,
            gridY: 0,
            gridX: rackIdx,
            gridZ: 0,
            rotation: 0,
            status: 'ACTIVE',
            equipments,
          };
        }),
      },
      {
        id: 2,
        name: '서버실 B',
        code: 'SR-B-01',
        location: '1층 서관',
        floor: 1,
        rows: 5,
        columns: 10,
        description: '보조 서버 라크',
        status: 'ACTIVE',
        racks: Array.from({ length: 5 }, (_, rackIdx) => {
          let currentU = 0;
          const equipments: Equipment[] = [];
          const numEquipments = Math.floor(Math.random() * 6) + 5;
          
          for (let i = 0; i < numEquipments; i++) {
            const types: Equipment['type'][] = ['Server', 'Switch', 'Storage', 'Router'];
            const type = types[Math.floor(Math.random() * types.length)];
            const equipment = createEquipment(rackIdx + 6, currentU, type);
            currentU += equipment.height_u;
            equipments.push(equipment);
            
            if (currentU >= 40) break;
          }
          
          return {
            id: rackIdx + 6,
            name: `Rack-B${String(rackIdx + 1).padStart(2, '0')}`,
            deviceId: rackIdx + 6,
            deviceCode: `RACK-B${String(rackIdx + 1).padStart(2, '0')}`,
            gridY: 0,
            gridX: rackIdx,
            gridZ: 1,
            rotation: 0,
            status: 'ACTIVE',
            equipments,
          };
        }),
      },
      {
        id: 3,
        name: '서버실 C',
        code: 'SR-C-01',
        location: '2층 동관',
        floor: 2,
        rows: 5,
        columns: 10,
        description: '스토리지 전용',
        status: 'ACTIVE',
        racks: Array.from({ length: 5 }, (_, rackIdx) => {
          let currentU = 0;
          const equipments: Equipment[] = [];
          const numEquipments = Math.floor(Math.random() * 6) + 5;
          
          for (let i = 0; i < numEquipments; i++) {
            const types: Equipment['type'][] = ['Server', 'Switch', 'Storage', 'Router'];
            const type = types[Math.floor(Math.random() * types.length)];
            const equipment = createEquipment(rackIdx + 11, currentU, type);
            currentU += equipment.height_u;
            equipments.push(equipment);
            
            if (currentU >= 40) break;
          }
          
          return {
            id: rackIdx + 11,
            name: `Rack-C${String(rackIdx + 1).padStart(2, '0')}`,
            deviceId: rackIdx + 11,
            deviceCode: `RACK-C${String(rackIdx + 1).padStart(2, '0')}`,
            gridY: 0,
            gridX: rackIdx,
            gridZ: 2,
            rotation: 0,
            status: 'ACTIVE',
            equipments,
          };
        }),
      },
    ],
  },
  {
    id: 2,
    name: '부산 데이터센터',
    code: 'DC-BUSAN-01',
    address: '부산광역시 해운대구',
    serverRooms: [
      {
        id: 4,
        name: '서버실 A',
        code: 'SR-BSN-A-01',
        location: '1층',
        floor: 1,
        rows: 7,
        columns: 12,
        description: '메인 서버룸',
        status: 'ACTIVE',
        racks: Array.from({ length: 7 }, (_, rackIdx) => {
          let currentU = 0;
          const equipments: Equipment[] = [];
          const numEquipments = Math.floor(Math.random() * 6) + 5;
          
          for (let i = 0; i < numEquipments; i++) {
            const types: Equipment['type'][] = ['Server', 'Switch', 'Storage', 'Router'];
            const type = types[Math.floor(Math.random() * types.length)];
            const equipment = createEquipment(rackIdx + 16, currentU, type);
            currentU += equipment.height_u;
            equipments.push(equipment);
            
            if (currentU >= 40) break;
          }
          
          return {
            id: rackIdx + 16,
            name: `Rack-A${String(rackIdx + 1).padStart(2, '0')}`,
            deviceId: rackIdx + 16,
            deviceCode: `RACK-BSN-A${String(rackIdx + 1).padStart(2, '0')}`,
            gridY: 0,
            gridX: rackIdx,
            gridZ: 0,
            rotation: 0,
            status: 'ACTIVE',
            equipments,
          };
        }),
      },
      {
        id: 5,
        name: '서버실 B',
        code: 'SR-BSN-B-01',
        location: '2층',
        floor: 2,
        rows: 6,
        columns: 11,
        description: '백업 서버룸',
        status: 'ACTIVE',
        racks: Array.from({ length: 6 }, (_, rackIdx) => {
          let currentU = 0;
          const equipments: Equipment[] = [];
          const numEquipments = Math.floor(Math.random() * 6) + 5;
          
          for (let i = 0; i < numEquipments; i++) {
            const types: Equipment['type'][] = ['Server', 'Switch', 'Storage', 'Router'];
            const type = types[Math.floor(Math.random() * types.length)];
            const equipment = createEquipment(rackIdx + 23, currentU, type);
            currentU += equipment.height_u;
            equipments.push(equipment);
            
            if (currentU >= 40) break;
          }
          
          return {
            id: rackIdx + 23,
            name: `Rack-B${String(rackIdx + 1).padStart(2, '0')}`,
            deviceId: rackIdx + 23,
            deviceCode: `RACK-BSN-B${String(rackIdx + 1).padStart(2, '0')}`,
            gridY: 0,
            gridX: rackIdx,
            gridZ: 1,
            rotation: 0,
            status: 'ACTIVE',
            equipments,
          };
        }),
      },
    ],
  },
];

// 네트워크 트래픽 시계열 목 데이터 (최근 5분간, 15초 간격)
const generateNetworkTrafficData = (): NetworkTrafficData => {
  const now = new Date();
  const trend: NetworkTrafficData['networkUsageTrend'] = [];
  
  // 5분 = 300초, 15초 간격 = 20개 데이터 포인트
  for (let i = 19; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 15 * 1000);
    
    // 실제 API 응답처럼 변동성 있는 데이터 생성
    // 기본 베이스 값에 랜덤 변동 추가
    const baseRx = 3.6e10; // 약 36 Gbps
    const baseTx = 6.8e10; // 약 68 Gbps
    
    // 주기적인 패턴과 노이즈 추가
    const variation = Math.sin(i * 0.5) * 0.1 + (Math.random() - 0.5) * 0.05;
    
    trend.push({
      time: timestamp.toISOString(),
      rxBytesPerSec: baseRx * (1 + variation),
      txBytesPerSec: baseTx * (1 + variation),
    });
  }
  
  // 현재 값은 마지막 트렌드 데이터
  const lastTrend = trend[trend.length - 1];
  
  return {
    currentRxBytesPerSec: lastTrend.rxBytesPerSec,
    currentTxBytesPerSec: lastTrend.txBytesPerSec,
    networkUsageTrend: trend,
  };
};

// Load Average 시계열 목 데이터
const generateLoadAverageData = () => {
  const now = new Date();
  const data = [];
  
  // 최근 10분간 데이터 (30초 간격, 20개 포인트)
  for (let i = 19; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 30 * 1000);
    const variation = Math.sin(i * 0.3) * 0.3 + (Math.random() - 0.5) * 0.2;
    
    data.push({
      time: timestamp.toISOString(),
      loadAvg1: Math.max(0.1, 1.5 + variation),
      loadAvg5: Math.max(0.1, 1.4 + variation * 0.8),
      loadAvg15: Math.max(0.1, 1.3 + variation * 0.6),
    });
  }
  
  return data;
};

// Disk I/O 시계열 목 데이터
const generateDiskIOData = () => {
  const now = new Date();
  const data = [];
  
  // 최근 5분간 데이터 (15초 간격, 20개 포인트)
  for (let i = 19; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 15 * 1000);
    const variation = Math.sin(i * 0.4) * 0.3 + (Math.random() - 0.5) * 0.2;
    
    const baseRead = 5 * 1024 * 1024; // 5 MB/s
    const baseWrite = 3 * 1024 * 1024; // 3 MB/s
    
    data.push({
      time: timestamp.toISOString(),
      ioReadBps: Math.max(0, baseRead * (1 + variation)),
      ioWriteBps: Math.max(0, baseWrite * (1 + variation * 0.8)),
      ioTimePercentage: Math.max(5, Math.min(50, 20 + variation * 15)),
    });
  }
  
  return data;
};

// Context Switches 시계열 목 데이터
const generateContextSwitchesData = () => {
  const now = new Date();
  const data = [];
  
  // 최근 10분간 데이터 (30초 간격, 20개 포인트)
  for (let i = 19; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 30 * 1000);
    const variation = Math.sin(i * 0.3) * 0.2 + (Math.random() - 0.5) * 0.1;
    
    const base = 8500; // 평균 8500 context switches
    
    data.push({
      time: timestamp.toISOString(),
      contextSwitches: Math.max(5000, Math.floor(base * (1 + variation))),
    });
  }
  
  return data;
};

// 네트워크 에러/드롭 통계 목 데이터
const generateNetworkErrorData = () => {
  return [
    {
      nicName: 'eth0',
      errorRate: 0.0052, // 0.0052%
      dropRate: 0.0148,  // 0.0148%
    },
    {
      nicName: 'eth1',
      errorRate: 0.0054,
      dropRate: 0.0152,
    },
  ];
};

// CPU 상세 사용률 시계열 목 데이터
const generateCpuUsageDetailData = () => {
  const now = new Date();
  const data = [];
  
  // 최근 5분간 데이터 (15초 간격, 20개 포인트)
  for (let i = 19; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 15 * 1000);
    const variation = Math.sin(i * 0.5) * 0.1 + (Math.random() - 0.5) * 0.05;
    
    const cpuIdle = Math.max(60, Math.min(80, 70 + variation * 10));
    const cpuUser = Math.max(10, Math.min(25, 18 + variation * 5));
    const cpuSystem = Math.max(5, Math.min(12, 7.5 + variation * 3));
    const cpuWait = Math.max(1, Math.min(5, 2.4 + variation * 2));
    const cpuNice = Math.random() * 1;
    const cpuIrq = Math.random() * 0.7;
    const cpuSoftirq = Math.random() * 0.5;
    const cpuSteal = Math.random() * 0.2;
    
    data.push({
      time: timestamp.toISOString(),
      cpuUser,
      cpuSystem,
      cpuWait,
      cpuNice,
      cpuIrq,
      cpuSoftirq,
      cpuSteal,
      cpuIdle,
    });
  }
  
  return data;
};

export const mockNetworkTrafficData = generateNetworkTrafficData();
export const mockLoadAverageData = generateLoadAverageData();
export const mockDiskIOData = generateDiskIOData();
export const mockContextSwitchesData = generateContextSwitchesData();
export const mockNetworkErrorData = generateNetworkErrorData();
export const mockCpuUsageDetailData = generateCpuUsageDetailData();
