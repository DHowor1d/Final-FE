/**
 * @author dhowor1d
 * @description 서버실 장비 데이터 조회 훅 - React Query를 사용한 서버실 장비 목록 관리
 * API로부터 서버실의 장비 배치 정보와 그리드 설정을 가져옴
 * React Query의 캐싱과 자동 재조회 기능으로 중복 API 호출 방지
 * 페이지 재진입 시 항상 최신 데이터를 가져오도록 설정 (staleTime: 0)
 * 장비 목록, 그리드 설정, 서버실 이름을 포함한 전체 정보 반환
 */

import { useQuery } from "@tanstack/react-query";
import { fetchServerRoomEquipment } from "../api/serverRoomEquipmentApi";

/**
 * @function useServerRoomEquipment
 * @description 서버실 장비 데이터를 가져오는 커스텀 훅
 * @param {string | undefined} serverRoomId - 조회할 서버실 ID
 * @returns {Object} 장비 목록, 그리드 설정, 로딩 상태, 에러, refetch 함수
 * @example
 * const { equipment, gridConfig, loading, error, refetch } = useServerRoomEquipment(serverRoomId);
 */
export function useServerRoomEquipment(serverRoomId: string | undefined) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["serverRoomEquipment", serverRoomId],
    queryFn: () => fetchServerRoomEquipment(serverRoomId!),
    enabled: !!serverRoomId, // serverRoomId가 있을 때만 실행
    staleTime: 0, // 데이터를 항상 stale로 간주하여 재진입 시 새로 fetch
    refetchOnMount: 'always', // 마운트될 때마다 항상 새로운 데이터 fetch
  });

  return {
    equipment: data?.equipment ?? [],
    gridConfig: data?.gridConfig ?? null,
    serverRoomName: data?.serverRoomName ?? null,
    loading: isLoading,
    isFetching,
    error: error as Error | null,
    refetch,
  };
}
