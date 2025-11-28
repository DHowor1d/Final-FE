/**
 * @author 구희원
 * @description 랙 장비 삭제 훅
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRackEquipments } from "../api/deleteRackEquipments";
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
 * 장비 삭제 파라미터
 */
interface DeleteEquipmentParams {
  id: number;
  rackId: number;
}

/**
 * 랙 장비 삭제 훅
 * @returns {UseMutationResult} 장비 삭제 mutation
 */
export const useDeleteEquipments = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (params: DeleteEquipmentParams) =>
      deleteRackEquipments(params.id),

    // Optimistic Update
    onMutate: async (params: DeleteEquipmentParams) => {
      await queryClient.cancelQueries({
        queryKey: ["rackEquipments", params.rackId],
      });

      const previousData = queryClient.getQueryData<RackEquipmentResponse>([
        "rackEquipments",
        params.rackId,
      ]);

      queryClient.setQueryData<RackEquipmentResponse>(
        ["rackEquipments", params.rackId],
        (old) => {
          if (!old?.result?.equipments) {
            return old;
          }

          return {
            ...old,
            result: {
              ...old.result,
              equipments: old.result.equipments.filter(
                (d) => d.id !== params.id
              ),
            },
          };
        }
      );

      return { previousData, rackId: params.rackId };
    },
    retry: false,

    // 에러 발생 시 롤백
    onError: (_, __, context) => {
      if (context?.previousData && context?.rackId) {
        queryClient.setQueryData(
          ["rackEquipments", context.rackId],
          context.previousData
        );
      }
    },

    // 완료 후 쿼리 무효화
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rackEquipments", variables.rackId],
      });
    },
  });
  return mutation;
};
