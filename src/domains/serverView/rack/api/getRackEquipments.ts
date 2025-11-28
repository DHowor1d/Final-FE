/**
 * @author 구희원
 * @description 특정 랙의 장비 목록 조회 API
 */

import client from "@/api/client";
import type { EquipmentType, EquipmentStatus } from "../types";

/**
 * 랙 장비 조회 파라미터
 */
export interface GetRackEquipmentsParams {
  status?: EquipmentStatus;
  type?: EquipmentType;
  sortBy?: string;
}

/**
 * 특정 랙의 장비 목록 조회
 * @param {number} rackId - 조회할 랙 ID
 * @param {GetRackEquipmentsParams} params - 필터 옵션 (status, type, sortBy)
 * @returns 장비 목록
 */
export const getRackEquipments = async (
  rackId: number,
  params?: GetRackEquipmentsParams
) => {
  const response = await client.get(`/equipments/rack/${rackId}`, { params });
  return response.data;
};
