/**
 * @author 최산하
 */
import type { TableMeta } from "@tanstack/react-table";

// NOTE(user): 3단계 폼 기준 자원 상태 타입
export type ResourceStatus =
  | "NORMAL" // 운영중
  | "MAINTENANCE" // 점검중
  | "WARNING"
  | "ERROR"
  | "POWERED_OFF"
  | "DECOMMISSIONED";

// NOTE(user): 3단계 폼 기준 장비 유형 타입
export type EquipmentType = "SERVER" | "SWITCH" | "ROUTER" | "PDU" | "UPS" | "STORAGE" | "FIREWALL" | "LOAD_BALANCE" | "KVM";

// NOTE(user): 3단계 폼 기준 설치 방향 타입
export type PositionType = "FRONT" | "REAR" | "NORMAL";

export interface ServerRoomGroup {
  dataCenterId: number;
  dataCenterName: string;
  dataCenterCode: string;
  dataCenterAddress: string;
  serverRooms: ServerRoom[];
}

// NOTE(user): 자원(Equipment) 핵심 인터페이스 (3단계 폼 기준)
export interface Resource {
  // 1단계: 기본 식별 정보
  id: number; // (NOT NULL - PK)    Corresponds to equipmentId
  equipmentName: string; // (NOT NULL)
  equipmentType: EquipmentType; // (NOT NULL)
  manufacturer?: string | null;
  modelName?: string | null;
  serialNumber?: string | null;
  equipmentCode?: string | null;
  // imageUrlFront?: string | null; // 앞면 이미지 URL
  // imageUrlRear?: string | null; // 뒷면 이미지 URL

  // 2단계: 위치 및 사양
  // 2-1. 물리적 위치 (Nullable)
  serverRoomId?: number | null; // User defined (for form logic)
  rackId?: number | null;
  startUnit?: number | null;
  unitSize: number; // (NOT NULL)
  positionType?: PositionType | null;

  // 2-2. 하드웨어 및 네트워크 사양 (Nullable)
  os?: string | null;
  cpuSpec?: string | null;
  memorySpec?: string | null;
  diskSpec?: string | null;
  ipAddress?: string | null;
  macAddress?: string | null;
  powerConsumption?: number | null; // (API 9.2 참고)
  weight?: number | null; // (API 9.2 참고)

  // 3단계: 관리 및 모니터링
  // 3-1. 관리 정보
  managerId?: number | null;
  status: ResourceStatus; // (NOT NULL)
  installationDate?: string | null; // (YYYY-MM-DD)
  notes?: string | null;

  // 3-2. 모니터링 설정 (Nullable)
  monitoringEnabled?: boolean | null;
  cpuThresholdWarning?: number | null;
  cpuThresholdCritical?: number | null;
  memoryThresholdWarning?: number | null;
  memoryThresholdCritical?: number | null;
  diskThresholdWarning?: number | null;
  diskThresholdCritical?: number | null;

  // API 9.2 Read-only/Additional fields
  rackName?: string | null;
  serverRoomName?: string | null; // 전산실명 (백엔드에서 제공)
  createdAt?: string | null;
  updatedAt?: string | null;
  position?: number | null; // (API 9.2, startUnit과 유사)
  height?: number | null; // (API 9.2, unitSize와 유사)

  // 기존 타입 호환 (임시)
  location?: string; // (기존 테이블 표시용, rackId 등으로 대체 필요)
}

// NOTE(user): TanStack Table meta 타입 (핸들러 전달용)
export interface ResourceTableMeta extends TableMeta<Resource> {
  editResourceHandler: (resource: Resource) => void;
  deleteResourceHandler: (resourceId: number) => void;
  openDeleteModal: (resource: Resource) => void;
}

// NOTE(user): API 응답 타입 (페이지네이션)
export interface PaginatedResourceResponse {
  content: Resource[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number; // 현재 페이지 번호 (0-based)
}

// NOTE(user): 검색/필터링을 위한 필터 타입
export interface ResourceListFilters {
  keyword?: string;
  status?: string;
  type?: string;
  // location?: string; // TODO(user): 삭제
  serverRoomId?: string; //  "위치" 필터용으로 추가
}

//  3.1 접근 가능한 전산실 목록 조회 (GET /datacenters) - 전체 필드
export interface ServerRoom {
  id: number; // Sticking with string based on mocks
  name: string;
  code: string;
  location: string;
  status: string; // "ACTIVE" etc.
  rackCount: number;
  managerName: string;
  floor?: number;
}

//  5.1 전산실별 랙 목록 조회 (GET /racks/datacenter/{dataCenterId}) - 전체 필드
export interface Rack {
  id: number; // Sticking with string
  rackName: string;
  groupNumber: string | null;
  rackLocation: string | null;
  totalUnits: number;
  usedUnits: number;
  availableUnits: number;
  status: string;
  usageRate: number;
  powerUsageRate: number;
  currentPowerUsage: number;
  maxPowerCapacity: number;
  department: string | null;
  managerId: number | null; // Sticking with string for mocks
  serverRoomId?: number; // For MSW convenience
}
