import client from "@api/client";

// ==================== 타입 정의 ====================

// Device (장비) 타입
export interface Device {
  id: number;
  deviceName: string;
  deviceCode: string;
  deviceType: string;
  deviceTypeId: number;
  gridY: number;
  gridX: number;
  gridZ: number;
  rotation: number;
  status: string;
  rackName: string | null;
  rackId: number | null;
}

// 서버실 정보
export interface ServerRoomInfo {
  id: number;
  name: string;
  rows: number;
  columns: number;
}

// 서버실 장비 응답
export interface ServerRoomDevicesResponse {
  status_code: number;
  status_message: string;
  result: {
    serverRoom: ServerRoomInfo;
    devices: Device[];
  };
}

// Rack 타입 (server 타입인 Device로부터 추출)
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
  equipments: []; // 빈 배열로 초기화 (필요시 추가 API로 장비 정보 로드)
}

// 서버실 타입
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
  racks?: Rack[]; // 동적으로 로드됨
}

// 데이터센터 그룹
export interface DataCenterGroup {
  dataCenterId: number;
  dataCenterName: string;
  dataCenterCode: string;
  dataCenterAddress: string;
  serverRooms: ServerRoom[];
}

// 회사 서버실 매핑 응답
export interface CompanyServerRoomsResponse {
  status_code: number;
  status_message: string;
  result: DataCenterGroup[];
}

// ==================== API 함수 ====================

/**
 * 회사의 서버실 매핑 조회 (데이터센터별 그룹화)
 * @param companyId 회사 ID
 * @returns 데이터센터별 서버실 목록
 */
export const getCompanyServerRooms = async (
  companyId: number
): Promise<DataCenterGroup[]> => {
  const response = await client.get<CompanyServerRoomsResponse>(
    `/company-serverrooms/company/${companyId}`
  );
  return response.data.result;
};

/**
 * 특정 서버실의 장비(Device) 목록 조회
 * @param serverRoomId 서버실 ID
 * @returns 서버실 정보 및 장비 목록
 */
export const getServerRoomDevices = async (
  serverRoomId: number
): Promise<{ serverRoom: ServerRoomInfo; devices: Device[] }> => {
  const response = await client.get<ServerRoomDevicesResponse>(
    `/devices/serverroom/${serverRoomId}`
  );
  return response.data.result;
};

/**
 * 서버실의 랙(server 타입 장비) 목록만 추출
 * @param serverRoomId 서버실 ID
 * @returns Rack 타입 배열
 */
export const getServerRoomRacks = async (
  serverRoomId: number
): Promise<Rack[]> => {
  const { devices } = await getServerRoomDevices(serverRoomId);
  
  // deviceType이 "server"인 것만 필터링하여 Rack으로 변환
  return devices
    .filter((device) => device.deviceType === "server")
    .map((device) => ({
      id: device.rackId!,
      name: device.rackName || device.deviceName,
      deviceId: device.id,
      deviceCode: device.deviceCode,
      gridY: device.gridY,
      gridX: device.gridX,
      gridZ: device.gridZ,
      rotation: device.rotation,
      status: device.status,
      equipments: [], // 빈 배열로 초기화
    }));
};
