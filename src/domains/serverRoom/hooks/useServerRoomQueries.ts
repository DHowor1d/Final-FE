/**
 * @author 김대호
 * @description 서버실 및 데이터센터 관리를 위한 React Query hooks
 * 데이터센터와 서버실의 CRUD 작업을 처리하는 커스텀 훅 모음
 * React Query를 사용하여 자동 캠싱, 리페치, 냙관적 업데이트 처리
 * 생성/수정/삭제 성공/실패 시 토스트 메시지로 사용자 피드백 제공
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompanyServerRooms, createServerRoom, updateServerRoom, getDataCenters, deleteServerRoom, createDataCenter, updateDataCenter, deleteDataCenter } from "../api/serverRoomApi";
import type { CreateServerRoomRequest, UpdateServerRoomRequest, CreateDataCenterRequest, UpdateDataCenterRequest } from "../api/serverRoomApi";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

interface ErrorResponse {
  status_code: number;
  status_message: string;
}

/**
 * @function useDataCenters
 * @description 데이터센터 목록 조회 query hook
 * @returns {UseQueryResult} 데이터센터 목록 데이터
 */
export const useDataCenters = () => {
  return useQuery({
    queryKey: ["dataCenters"],
    queryFn: () => getDataCenters(),
  });
};

/**
 * 회사의 서버실 목록 조회 query
 * @param companyId 회사 ID
 */
export const useServerRooms = (companyId: number) => {
  return useQuery({
    queryKey: ["serverRooms", companyId],
    queryFn: () => getCompanyServerRooms(companyId),
  });
};

/**
 * 데이터센터 생성 mutation
 */
export const useCreateDataCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDataCenterRequest) => createDataCenter(data),
    onSuccess: () => {
      // 데이터센터 목록 쿼리 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: ["dataCenters"] });
      // 서버실 목록도 무효화 (데이터센터 정보 포함)
      queryClient.invalidateQueries({ queryKey: ["serverRooms"] });
      toast.success("데이터센터가 생성되었습니다.");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error?.response?.data?.status_message || "데이터센터 생성에 실패했습니다.";
      toast.error(message);
    },
  });
};

/**
 * 데이터센터 수정 mutation
 */
export const useUpdateDataCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDataCenterRequest }) =>
      updateDataCenter(id, data),
    onSuccess: () => {
      // 데이터센터 목록 쿼리 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: ["dataCenters"] });
      // 서버실 목록도 무효화 (데이터센터 정보 포함)
      queryClient.invalidateQueries({ queryKey: ["serverRooms"] });
      toast.success("데이터센터가 수정되었습니다.");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error?.response?.data?.status_message || "데이터센터 수정에 실패했습니다.";
      toast.error(message);
    },
  });
};

/**
 * 데이터센터 삭제 mutation
 */
export const useDeleteDataCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dataCenterId: number) => deleteDataCenter(dataCenterId),
    onSuccess: () => {
      // 데이터센터 목록 쿼리 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: ["dataCenters"] });
      // 서버실 목록도 무효화 (데이터센터 정보 포함)
      queryClient.invalidateQueries({ queryKey: ["serverRooms"] });
      toast.success("데이터센터가 삭제되었습니다.");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error?.response?.data?.status_message || "데이터센터 삭제에 실패했습니다.";
      toast.error(message);
    },
  });
};

/**
 * 서버실 생성 mutation
 */
export const useCreateServerRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServerRoomRequest) => createServerRoom(data),
    onSuccess: () => {
      // 서버실 목록 쿼리 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: ["serverRooms"] });
      toast.success("서버실이 생성되었습니다.");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error?.response?.data?.status_message || "서버실 생성에 실패했습니다.";
      toast.error(message);
    },
  });
};

/**
 * 서버실 수정 mutation
 */
export const useUpdateServerRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServerRoomRequest }) =>
      updateServerRoom(id, data),
    onSuccess: (_data, variables) => {
      // 서버실 목록 쿼리 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: ["serverRooms"] });
      // 수정된 서버실의 장비 데이터도 무효화 (3D 뷰와 FloorPlan에서 사용)
      queryClient.invalidateQueries({ queryKey: ["serverRoomEquipment", variables.id.toString()] });
      toast.success("서버실이 수정되었습니다.");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error?.response?.data?.status_message || "서버실 수정에 실패했습니다.";
      toast.error(message);
    },
  });
};

/**
 * 서버실 삭제 mutation
 */
export const useDeleteServerRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serverRoomId: number) => deleteServerRoom(serverRoomId),
    onSuccess: () => {
      // 서버실 목록 쿼리 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: ["serverRooms"] });
      toast.success("서버실이 삭제되었습니다.");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error?.response?.data?.status_message || "서버실 삭제에 실패했습니다.";
      toast.error(message);
    },
  });
};
