/**
 * @author 구희원
 * @description 랙 장비 목록 조회 훅
 */

import { useQuery } from "@tanstack/react-query";
import {
  getRackEquipments,
  type GetRackEquipmentsParams,
} from "../api/getRackEquipments";
import type { RackEquipmentsResult } from "../types";

/**
 * 랙 장비 API 응답
 */
interface RackEquipmentResponse {
  status_code: number;
  status_message: string;
  result: RackEquipmentsResult;
}

/**
 * 랙 장비 목록 조회 훅
 * @param {number} rackId - 조회할 랙 ID
 * @param {GetRackEquipmentsParams} params - 조회 파라미터 (status, type, sortBy)
 * @returns 랙 장비 목록 및 상태
 */
export const useGetRackEquipments = (
  rackId: number,
  params?: GetRackEquipmentsParams
) => {
  const query = useQuery<RackEquipmentResponse>({
    queryKey: ["rackEquipments", rackId, params],
    queryFn: () => getRackEquipments(rackId, params),
    enabled: !!rackId,
  });

  return {
    data: query.data,
    equipments: query.data?.result?.equipments || [],
    rack: query.data?.result?.rack,
    totalCount: query.data?.result?.totalEquipmentCount,
    isLoading: query.isLoading,
    error: query.error,
  };
};
