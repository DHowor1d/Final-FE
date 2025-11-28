/**
 * @author 구희원
 * @description 미할당 장비 목록 조회 API
 */

import client from "@/api/client";
import type { UnassignedEquipment } from "../types";

/**
 * 미할당 장비 조회 파라미터
 */
export interface GetUnassignedEquipmentsParams {
  page?: number;
  onlyUnassigned?: boolean;
}

/**
 * 페이지네이션 응답
 */
interface PaginatedResponse {
  content: UnassignedEquipment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
}

/**
 * 미할당 장비 조회 API 응답
 */
interface GetUnassignedEquipmentsResponse {
  status_code: number;
  status_message: string;
  result: PaginatedResponse;
}

/**
 * 미할당 장비 목록 조회
 * @param {GetUnassignedEquipmentsParams} params - 조회 옵션 (page, onlyUnassigned)
 * @returns {Promise<GetUnassignedEquipmentsResponse>} 미할당 장비 목록 (페이지당 5개)
 */
export const getUnassignedEquipments = async (
  params: GetUnassignedEquipmentsParams = {}
) => {
  const response = await client.get<GetUnassignedEquipmentsResponse>(
    "/equipments",
    {
      params: {
        size: 5,
        onlyUnassigned: true,
        ...params,
      },
    }
  );
  return response.data;
};
