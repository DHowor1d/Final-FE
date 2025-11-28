/**
 * @author 구희원
 * @description 랙에 장비 배치 API
 */

import client from "@/api/client";

/**
 * 장비 배치 요청 파라미터
 */
interface postPlaceEquipmentsRequest {
  startUnit: number;
  unitSize: number;
}

/**
 * 랙에 장비 배치
 * @param {number} rackId - 배치할 랙 ID
 * @param {number} id - 배치할 장비 ID
 * @param {postPlaceEquipmentsRequest} data - 배치 정보 (startUnit, unitSize)
 * @returns 배치 결과
 */
export const postPlaceEquipments = async (
  rackId: number,
  id: number,
  data: postPlaceEquipmentsRequest
) => {
  const response = await client.post(
    `/racks/${rackId}/equipment/${id}/place`,
    data
  );
  return response.data;
};
