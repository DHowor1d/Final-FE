/**
 * @author 최산하
 */
export interface ServerRoom {
  id: number;
  name: string; // 서버실 이름
  code: string; // 서버실 코드
  location: string | null; // 위치 정보
  floor: number; // 층수
  rows: number; // 행 수
  columns: number; // 열 수
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE"; // 상태
}

// 데이터센터 정보
export interface DataCenterGroup {
  dataCenterId: number;
  dataCenterName: string;
  dataCenterCode: string;
  dataCenterAddress: string;
  serverRooms: ServerRoom[];
}

// API 응답 타입
export interface CompanyServerRoomsResponse {
  status_code: number;
  status_message: string;
  result: DataCenterGroup[];
}
