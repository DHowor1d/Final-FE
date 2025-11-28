/**
 * @author 구희원
 * @description 장비 정보 수정 훅
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEquipment } from "../api/updateEquipments";
import type { UpdateEquipmentRequest } from "../types";

/**
 * 장비 수정 파라미터
 */
interface UpdateEquipmentParams {
  id: number;
  data: UpdateEquipmentRequest;
}

/**
 * 장비 정보 수정 훅
 *
 * 장비의 상세 정보 및 임계값을 수정합니다.
 * 수정 성공 시 관련 쿼리를 무효화하여 최신 데이터를 반영합니다.
 *
 * @returns {UseMutationResult} 장비 수정 mutation
 */
export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UpdateEquipmentParams) =>
      updateEquipment(id, data),
    onSuccess: (response, variables) => {
      // 장비 상세 정보 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["equipment", variables.id],
      });

      // 랙 장비 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["rackEquipments", variables.data.rackId],
      });

      console.log("장비 수정 성공:", response.status_message);
    },
    onError: (error) => {
      console.error("장비 수정 실패:", error);
    },
  });

  return mutation;
};
