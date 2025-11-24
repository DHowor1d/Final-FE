import type { Equipments } from "../../rack/types/index";

export interface UpdateEquipmentRequest
  extends Pick<
    Equipments,
    "equipmentName" | "equipmentType" | "startUnit" | "unitSize" | "status"
  > {
  serverRoomId: number;
  rackId: number;
  cpuThresholdWarning: number;
  cpuThresholdCritical: number;
  memoryThresholdWarning: number;
  memoryThresholdCritical: number;
  diskThresholdWarning: number;
  diskThresholdCritical: number;
}

export interface SystemMonitoringData {
  id: number;
  equipmentId: number;
  generateTime: string;
  cpuIdle: number;
  cpuUser: number;
  cpuSystem: number;
  cpuWait: number;
  cpuNice: number;
  cpuIrq: number;
  cpuSoftirq: number;
  cpuSteal: number;
  loadAvg1: number;
  loadAvg5: number;
  loadAvg15: number;
  contextSwitches: number;
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  usedMemoryPercentage: number;
  memoryBuffers: number;
  memoryCached: number;
  memoryActive: number;
  memoryInactive: number;
  totalSwap: number;
  usedSwap: number;
  usedSwapPercentage: number;
}

export interface DiskMonitoringData {
  id: number;
  equipmentId: number;
  generateTime: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usedPercentage: number;
  ioReadBps: number;
  ioWriteBps: number;
  ioTimePercentage: number | null;
  ioReadCount: number;
  ioWriteCount: number;
  totalInodes: number;
  usedInodes: number;
  freeInodes: number;
  usedInodePercentage: number;
}

export interface NetworkMonitoringData {
  id: number;
  equipmentId: number;
  nicName: string;
  generateTime: string;
  rxUsage: number | null;
  txUsage: number | null;
  inPktsTot: number;
  outPktsTot: number;
  inBytesTot: number;
  outBytesTot: number;
  inBytesPerSec: number;
  outBytesPerSec: number;
  inPktsPerSec: number;
  outPktsPerSec: number;
  inErrorPktsTot: number;
  outErrorPktsTot: number;
  inDiscardPktsTot: number;
  outDiscardPktsTot: number;
  operStatus: number;
}
