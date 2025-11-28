/**
 * @author 구희원
 * @description 랙 장비 생성 API
 */

import client from "@/api/client";
import type { Equipments } from "../types";

/**
 * 장비 생성 요청 파라미터
 */
export type PostEquipmentRequest = Pick<
  Equipments,
  "equipmentName" | "equipmentType" | "startUnit" | "unitSize" | "status"
> & {
  rackId: number;
};

/**
 * 장비 생성 API 응답
 */
export interface PostEquipmentResponse {
  statusCode: number;
  message: string;
  data: Equipments;
}

/**
 * 랙 장비 생성
 * @param {PostEquipmentRequest} equipment - 생성할 장비 정보
 * @returns {Promise<PostEquipmentResponse>} 생성된 장비 정보
 */
export const postRackEquipment = async (
  equipment: PostEquipmentRequest
): Promise<PostEquipmentResponse> => {
  const response = await client.post<PostEquipmentResponse>(
    "/equipments",
    equipment
  );
  return response.data;
};
