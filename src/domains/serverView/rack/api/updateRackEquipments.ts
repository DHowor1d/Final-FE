/**
 * @author 구희원
 * @description 랙 장비 수정 API
 */

import client from "@/api/client";
import type { Equipments } from "../types";

/**
 * 장비 수정 요청 파라미터
 */
export type UpdateRackEquipmentRequest = Pick<
  Equipments,
  "equipmentName" | "equipmentType" | "startUnit" | "unitSize" | "status"
> & {
  rackId: number;
};

/**
 * 랙 장비 수정
 * @param {number} id - 수정할 장비 ID
 * @param {UpdateRackEquipmentRequest} data - 수정할 장비 정보
 * @returns 수정된 장비 정보
 */
export const updateRackEquipments = async (
  id: number,
  data: UpdateRackEquipmentRequest
) => {
  const response = await client.put(`/equipments/${id}`, data);
  return response.data;
};
