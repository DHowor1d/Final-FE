/**
 * @author 김대호
 * @description 3D 서버룸 장비 타입 정의
 */

/**
 * 장비 타입
 */
export type EquipmentType =
  | "server"
  | "door"
  | "climatic_chamber"
  | "fire_extinguisher"
  | "thermometer"
  | "aircon";

/**
 * 3D 장비 정보
 */
export interface Equipment3D {
  id: string; // 프론트엔드에서 사용하는 로컬 ID (equipmentId로부터 생성)
  type: EquipmentType;
  gridX: number; // 격자 좌표 X
  gridY: number; // 격자 좌표 Y
  gridZ: number; // 격자 좌표 Z (높이)
  rotation: number; // Y축 회전 (라디안)
  equipmentId?: string; // 백엔드 DB의 실제 장비 ID (UUID)
  rackId?: string; // 랙 ID (서버 타입인 경우)
  doorDirection?: "FRONT" | "BACK"; // 랙의 문 방향 (server 타입인 경우)
  metadata?: EquipmentMetadata; // 추가 정보
}

/**
 * 장비 메타데이터
 */
export interface EquipmentMetadata {
  name?: string;
  code?: string;
  status?: string;
  temperature?: number;
  rackName?: string;
  modelName?: string;
  manufacturer?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  notes?: string;
  [key: string]: unknown; // 기타 메타데이터
}

/**
 * 서버룸 장비 API 응답
 */
export interface ServerRoomEquipmentResponse {
  status_code: number;
  status_message: string;
  result: {
    serverRoom: {
      id: number;
      name: string;
      rows: number;
      columns: number;
    };
    devices: BackendDevice[];
  };
}

/**
 * 백엔드 장비 데이터
 */
export interface BackendDevice {
  id: number; // DB의 장비 ID
  deviceName: string;
  deviceCode: string;
  deviceType: EquipmentType;
  deviceTypeId: number;
  gridY: number | null;
  gridX: number;
  gridZ: number;
  rotation: number; // 각도 (degree)
  status: string;
  rackName: string | null;
  rackId: number | null;
  doorDirection?: "FRONT" | "BACK"; // 랙의 문 방향 (server 타입인 경우)
}

/**
 * 장비 생성 요청
 */
export interface CreateDeviceRequest {
  deviceName: string;
  deviceCode: string;
  gridY: number;
  gridX: number;
  gridZ: number;
  rotation: number; // 각도 (degree)
  status: string;
  modelName?: string;
  manufacturer?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  notes?: string;
  deviceTypeId: number;
  rackId?: number | null;
  serverRoomId: number;
}

/**
 * 장비 생성 응답
 */
export interface CreateDeviceResponse {
  status_code: number;
  status_message: string;
  result: BackendDevice;
}

/**
 * 장비 수정 요청
 */
export interface UpdateDeviceRequest {
  gridY: number;
  gridX: number;
  gridZ?: number;
  rotation: number; // 각도 (degree)
  deviceName?: string;
  status?: string;
  modelName?: string;
  manufacturer?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  notes?: string;
}

/**
 * 장비 수정 응답
 */
export interface UpdateDeviceResponse {
  status_code: number;
  status_message: string;
  result: BackendDevice;
}

/**
 * 랙 생성 요청
 */
export interface CreateRackRequest {
  rackName: string;
  gridX: number;
  gridY: number;
  totalUnits: number;
  doorDirection: "FRONT" | "BACK";
  zoneDirection: "NORTH" | "SOUTH" | "EAST" | "WEST";
  maxPowerCapacity: number;
  manufacturer?: string;
  serialNumber?: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  rackType: "STANDARD" | "BLADE" | "OPEN_FRAME";
  notes?: string;
  serverRoomId: number;
}

/**
 * 랙 생성 응답
 */
export interface CreateRackResponse {
  status_code: number;
  status_message: string;
  result: {
    id: number;
    rackName: string;
    gridX: number;
    gridY: number;
    totalUnits: number;
    doorDirection: string;
    zoneDirection: string;
    maxPowerCapacity: number;
    manufacturer?: string;
    serialNumber?: string;
    status: string;
    rackType: string;
    notes?: string;
    serverRoomId: number;
  };
}

/**
 * 백엔드 장비 (이전 구조 - deprecated)
 */
export interface BackendEquipment {
  equipmentId: string; // DB의 UUID
  equipmentType: EquipmentType;
  rackId?: string;
  gridPosition: {
    x: number;
    y: number;
    z: number;
  };
  rotation: number;
  metadata?: EquipmentMetadata;
}

/**
 * 격자 설정
 */
export interface GridConfig {
  rows: number; // 격자 행 개수
  columns: number; // 격자 열 개수
  cellSize: number; // 한 격자 크기
}

/**
 * 장비 팔레트 아이템
 */
export interface EquipmentPaletteItem {
  type: EquipmentType;
  name: string;
  icon: string;
  modelPath: string;
}
