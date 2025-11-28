/**
 * @author 구희원
 * @description 랙 장비 삭제 API
 */

import client from "@/api/client";

/**
 * 장비 삭제 API 응답
 */
interface DeleteEquipmentsResponse {
  statusCode: number;
  message: string;
  data: null;
}

/**
 * 랙 장비 삭제
 * @param {number} id - 삭제할 장비 ID
 * @returns {Promise<DeleteEquipmentsResponse>} 삭제 결과
 */
export const deleteRackEquipments = async (
  id: number
): Promise<DeleteEquipmentsResponse> => {
  const response = await client.delete<DeleteEquipmentsResponse>(
    `/equipments/${id}`
  );
  return response.data;
};
