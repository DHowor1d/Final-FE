import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  getCompanyServerRooms,
  getServerRoomRacks,
  type DataCenterGroup,
} from "../api/mainDashboardApi";
import type { Datacenter, Rack } from "../types/dashboard.types";

/**
 * 메인 대시보드 데이터 관리 훅
 * - 회사의 데이터센터 및 서버실 목록 조회
 * - 서버실 선택 시 해당 서버실의 랙 정보를 lazy loading
 */
export const useDashboardData = (companyId: number) => {
  // 서버실별 랙 정보 캐시
  const [racksByServerRoom, setRacksByServerRoom] = useState<
    Record<number, Rack[]>
  >({});

  // 1. 회사의 데이터센터 및 서버실 목록 조회
  const {
    data: dataCenterGroups,
    isLoading,
    error,
  } = useQuery<DataCenterGroup[]>({
    queryKey: ["companyServerRooms", companyId],
    queryFn: () => getCompanyServerRooms(companyId),
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });

  // 2. API 데이터를 Datacenter 타입으로 변환
  const datacenters: Datacenter[] =
    dataCenterGroups?.map((group) => ({
      id: group.dataCenterId,
      name: group.dataCenterName,
      code: group.dataCenterCode,
      address: group.dataCenterAddress,
      serverRooms: group.serverRooms.map((sr) => ({
        ...sr,
        racks: racksByServerRoom[sr.id] || [], // 캐시된 랙 정보 사용
      })),
    })) || [];

  // 3. 특정 서버실의 랙 정보 로드
  const loadServerRoomRacks = async (serverRoomId: number) => {
    // 이미 로드된 경우 스킵
    if (racksByServerRoom[serverRoomId]) {
      return;
    }

    try {
      const racks = await getServerRoomRacks(serverRoomId);
      setRacksByServerRoom((prev) => ({
        ...prev,
        [serverRoomId]: racks,
      }));
    } catch (error) {
      console.error(
        `Failed to load racks for server room ${serverRoomId}:`,
        error
      );
    }
  };

  // 4. 데이터센터의 모든 서버실 랙 정보를 한 번에 로드 (프리페치)
  const prefetchDatacenterRacks = async (datacenterId: number) => {
    const datacenter = dataCenterGroups?.find(
      (dc) => dc.dataCenterId === datacenterId
    );
    
    if (!datacenter) return;

    // 해당 데이터센터의 모든 서버실 ID 추출
    const serverRoomIds = datacenter.serverRooms.map((sr) => sr.id);
    
    // 아직 로드되지 않은 서버실만 필터링
    const unloadedServerRoomIds = serverRoomIds.filter(
      (id) => !racksByServerRoom[id]
    );

    if (unloadedServerRoomIds.length === 0) return;

    try {
      // 모든 서버실의 랙 정보를 병렬로 로드
      const racksPromises = unloadedServerRoomIds.map((id) =>
        getServerRoomRacks(id).then((racks) => ({ serverRoomId: id, racks }))
      );

      const results = await Promise.all(racksPromises);

      // 결과를 한 번에 state에 반영
      setRacksByServerRoom((prev) => {
        const newRacks = { ...prev };
        results.forEach(({ serverRoomId, racks }) => {
          newRacks[serverRoomId] = racks;
        });
        return newRacks;
      });
    } catch (error) {
      console.error(
        `Failed to prefetch racks for datacenter ${datacenterId}:`,
        error
      );
    }
  };

  return {
    datacenters,
    isLoading,
    error,
    loadServerRoomRacks,
    prefetchDatacenterRacks,
  };
};
