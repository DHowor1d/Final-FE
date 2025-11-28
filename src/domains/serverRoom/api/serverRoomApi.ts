/**
 * @author 최산하
 */
import client from "@api/client";
import type { DataCenterGroup, ServerRoom, CompanyServerRoomsResponse } from "../types";

// 데이터센터 타입
export interface DataCenter {
  id: number;
  code: string;
  name: string;
}

export interface DataCentersResponse {
  status_code: number;
  status_message: string;
  result: DataCenter[];
}

/**
 * 데이터센터 목록 조회 (GET)
 */
export const getDataCenters = async (): Promise<DataCenter[]> => {
  const response = await client.get<DataCentersResponse>("/datacenters");
  return response.data.result;
};

/**
 * 데이터센터 생성 (POST)
 * @param dataCenterData 데이터센터 생성 정보
 */
export const createDataCenter = async (
  dataCenterData: CreateDataCenterRequest
): Promise<DataCenter> => {
  const response = await client.post<DataCenter>("/datacenters", dataCenterData);
  return response.data;
};

/**
 * 데이터센터 수정 (PUT)
 * @param dataCenterId 데이터센터 ID
 * @param dataCenterData 데이터센터 수정 정보
 */
export const updateDataCenter = async (
  dataCenterId: number,
  dataCenterData: UpdateDataCenterRequest
): Promise<DataCenter> => {
  const response = await client.put<DataCenter>(
    `/datacenters/${dataCenterId}`,
    dataCenterData
  );
  return response.data;
};

/**
 * 데이터센터 삭제 (DELETE)
 * @param dataCenterId 데이터센터 ID
 */
export const deleteDataCenter = async (dataCenterId: number): Promise<void> => {
  await client.delete(`/datacenters/${dataCenterId}`);
};

// 데이터센터 생성 요청 타입
export interface CreateDataCenterRequest {
  code: string;
  name: string;
  address: string;
  description?: string;
}

// 데이터센터 수정 요청 타입
export interface UpdateDataCenterRequest {
  name: string;
  address: string;
  description?: string;
}

/**
 * 회사의 서버실 매핑 조회 (GET) - 데이터센터별 그룹화
 * @param companyId 회사 ID
 */
export const getCompanyServerRooms = async (companyId: number): Promise<DataCenterGroup[]> => {
  const response = await client.get<CompanyServerRoomsResponse>(
    `/company-serverrooms/company/${companyId}`
  );
  
  // API 응답을 그대로 반환 (이미 DataCenterGroup[] 형태)
  return response.data.result;
};

/**
 * 서버실 생성 (POST)
 * @param serverRoomData 서버실 생성 정보
 */
export const createServerRoom = async (
  serverRoomData: CreateServerRoomRequest,
): Promise<ServerRoom> => {
  const response = await client.post<ServerRoom>(
    "/serverrooms",
    serverRoomData,
  );
  return response.data;
};

/**
 * 서버실 수정 (PUT)
 * @param serverRoomId 서버실 ID
 * @param serverRoomData 서버실 수정 정보
 */
export const updateServerRoom = async (
  serverRoomId: number,
  serverRoomData: UpdateServerRoomRequest,
): Promise<ServerRoom> => {
  const response = await client.put<ServerRoom>(
    `/serverrooms/${serverRoomId}`,
    serverRoomData,
  );
  return response.data;
};

/**
 * 서버실 삭제 (DELETE)
 * @param serverRoomId 서버실 ID
 */
export const deleteServerRoom = async (serverRoomId: number): Promise<void> => {
  await client.delete(`/serverrooms/${serverRoomId}`);
};

// 서버실 생성 요청 타입
export interface CreateServerRoomRequest {
  name: string;
  code: string;
  // location: string;
  dataCenterId: number;
  floor: number;
  rows: number;
  columns: number;
  description?: string;
  managerId?: number;
}

// 서버실 수정 요청 타입
export interface UpdateServerRoomRequest {
  name: string;
  code: string;
  description?: string;
  rows: number;
  columns: number;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
}
