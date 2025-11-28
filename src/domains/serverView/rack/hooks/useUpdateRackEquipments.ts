/**
 * @author 구희원
 * @description 랙 장비 수정 훅
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateRackEquipments,
  type UpdateRackEquipmentRequest,
} from "../api/updateRackEquipments";
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
 * 랙 장비 수정 훅
 * @returns {UseMutationResult} 장비 수정 mutation
 */
export const useUpdateRackEquipments = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateRackEquipmentRequest;
    }) => {
      return updateRackEquipments(id, data);
    },

    // Optimistic Update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: ["rackEquipments", data.rackId],
      });

      const previousData =
        queryClient.getQueryData<RackEquipmentResponse>([
          "rackEquipments",
          data.rackId,
        ]) || [];

      queryClient.setQueryData<RackEquipmentResponse>(
        ["rackEquipments", data.rackId],
        (old) => {
          if (!old?.result?.equipments) {
            console.warn("캐시 데이터 구조가 올바르지 않습니다:", old);
            return old;
          }

          return {
            ...old,
            result: {
              ...old.result,
              equipments: old.result.equipments.map((item) =>
                item.id === id ? { ...item, ...data } : item
              ),
            },
          };
        }
      );
      return { previousData, rackId: data.rackId };
    },

    retry: false,

    // 성공 시 쿼리 무효화
    onSuccess: (_, variables) => {
      if (variables.data?.rackId) {
        queryClient.invalidateQueries({
          queryKey: ["rackEquipments", variables.data.rackId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["rackEquipments"] });
      }
      console.log("장비 수정 성공");
    },

    // 에러 발생 시 롤백
    onError: (error, _, context) => {
      console.error("장비 수정 실패", error);
      if (context?.previousData) {
        queryClient.setQueryData(
          ["rackEquipments", context.rackId],
          context.previousData
        );
      }
    },
  });
  return mutation;
};
