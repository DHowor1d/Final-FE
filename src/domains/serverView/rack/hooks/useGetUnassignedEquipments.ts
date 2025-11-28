/**
 * @author 구희원
 * @description 미할당 장비 목록 조회 훅 (무한 스크롤)
 */

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getUnassignedEquipments,
  type GetUnassignedEquipmentsParams,
} from "../api/getUnassignedEquipments";

/**
 * 미할당 장비 조회 옵션
 */
interface UseUnassignedEquipmentsOptions {
  params?: GetUnassignedEquipmentsParams;
  enabled?: boolean;
}

/**
 * 미할당 장비 목록 조회 훅 (무한 스크롤)
 * @param {UseUnassignedEquipmentsOptions} options - 조회 옵션
 * @param {GetUnassignedEquipmentsParams} options.params - 조회 파라미터
 * @param {boolean} options.enabled - 쿼리 활성화 여부
 * @returns 미할당 장비 목록 및 페이지네이션 상태
 */
export const useUnassignedEquipments = (
  options: UseUnassignedEquipmentsOptions = {}
) => {
  const { params = {}, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: ["equipments", "unassigned", params],
    queryFn: ({ pageParam = 0 }) =>
      getUnassignedEquipments({ ...params, page: pageParam }),
    enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.result.last ? undefined : lastPage.result.number + 1;
    },
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      allEquipments: data.pages.flatMap((page) => page.result.content),
    }),
  });
};
