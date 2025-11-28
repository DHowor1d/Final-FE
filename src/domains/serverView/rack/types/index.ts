/**
 * @author 구희원
 * @description 랙 뷰 타입 정의
 */

/**
 * 장비 타입
 */
export type EquipmentType =
  | "SERVER"
  | "SWITCH"
  | "ROUTER"
  | "STORAGE"
  | "FIREWALL"
  | "LOAD_BALANCER"
  | "KVM";

/**
 * 장비 상태
 */
export type EquipmentStatus =
  | "NORMAL"
  | "WARNING"
  | "ERROR"
  | "MAINTENANCE"
  | "POWERED_OFF"
  | "DECOMMISSIONED";

/**
 * 장비 위치 (앞면/뒷면)
 */
export type EquipmentPosition = "FRONT" | "BACK";

/**
 * 장비 정보
 */
export interface Equipments {
  id: number;
  equipmentName: string;
  equipmentCode: string | null;
  equipmentType: EquipmentType;
  status: EquipmentStatus;
  startUnit: number;
  unitSize: number;
  modelName: string | null;
  manufacturer: string | null;
  ipAddress: string | null;
  positionType: string;
  powerConsumption: number | null;
  cpuThresholdWarning?: number;
  cpuThresholdCritical?: number;
  memoryThresholdWarning?: number;
  memoryThresholdCritical?: number;
  diskThresholdWarning?: number;
  diskThresholdCritical?: number;
}

/**
 * 랙 정보
 */
export interface Rack {
  rackName: string;
  rackId: number;
  serverRoomId: number;
}

/**
 * 랙 장비 목록 결과
 */
export interface RackEquipmentsResult {
  rack: Rack;
  equipments: Equipments[];
  totalEquipmentCount: number;
}

/**
 * 장비 카드 정보
 */
export interface EquipmentCard {
  key: string;
  label: string;
  size: string;
  img: string;
  height: number;
  type: EquipmentType;
  id?: number;
}

/**
 * 플로팅 장비 (드래그 중인 장비)
 */
export interface FloatingDevice {
  card: EquipmentCard;
  mouseY: number;
}

/**
 * 미할당 장비
 */
export interface UnassignedEquipment extends Equipments {
  rackId: number | null;
  rackName: string | null;
}

/**
 * 장비 수정 요청
 */
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
