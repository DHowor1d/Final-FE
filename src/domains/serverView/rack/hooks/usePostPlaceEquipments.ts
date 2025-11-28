/**
 * @author 구희원
 * @description 랙에 장비 배치 훅
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postPlaceEquipments } from "../api/postPlaceEquipments";

/**
 * 장비 배치 파라미터
 */
interface PostPlaceEquipmentParams {
  rackId: number;
  id: number;
  data: {
    startUnit: number;
    unitSize: number;
  };
}

/**
 * 랙에 장비 배치 훅
 * @returns {UseMutationResult} 장비 배치 mutation
 */
export const usePostPlaceEquipments = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ rackId, id, data }: PostPlaceEquipmentParams) =>
      postPlaceEquipments(rackId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rackEquipments", variables.rackId],
      });
    },
    onError: (error) => {
      console.error("장비 배치 실패:", error);
    },
  });

  return mutation;
};
