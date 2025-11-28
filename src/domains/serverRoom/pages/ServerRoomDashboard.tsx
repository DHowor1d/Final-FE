/**
 * @author 김대호
 * @description 서버실 관리 대시보드 - 데이터센터별 서버실 목록과 통계를 관리하는 페이지
 * 데이터센터 탭으로 구성되어 있으며, 각 데이터센터의 서버실을 생성/수정/삭제 가능
 * 전체 서버실 통계(총 개수, 활성/유지보수 상태) 표시 및 권한에 따른 기능 제한 적용
 */

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ServerRoomList from "../components/ServerRoomList";
import { DashboardStats } from "../components/DashboardStats";
import { DataCenterTabs } from "../components/DataCenterTabs";
import { DashboardModals } from "../components/DashboardModals";
import { useServerRooms } from "../hooks/useServerRoomQueries";
import { useServerRoomActions } from "../hooks/useServerRoomActions";
import { useDataCenterActions } from "../hooks/useDataCenterActions";
import { useAuthStore } from "@domains/login/store/useAuthStore";
import "../css/serverRoomDashboard.css";

/**
 * @function ServerRoomDashboard
 * @description 서버실 대시보드 컴포넌트 - 데이터센터와 서버실을 종합 관리
 * @returns {JSX.Element} 서버실 대시보드 UI
 */
const ServerRoomDashboard: React.FC = () => {
  const { datacenterId } = useParams<{ datacenterId: string }>();
  const navigate = useNavigate();
  const [selectedDataCenterId, setSelectedDataCenterId] = useState<number | null>(
    datacenterId ? parseInt(datacenterId, 10) : null
  );

  // 로그인한 사용자의 회사 ID 및 권한 가져오기
  const { user } = useAuthStore();
  const companyId = user?.companyId;
  const userRole = user?.role;

  // 데이터 조회
  const {
    data: dataCenters = [],
    isLoading,
    isError,
    error,
  } = useServerRooms(companyId!);

  // 액션 훅
  const serverRoomActions = useServerRoomActions();
  const dataCenterActions = useDataCenterActions();

  // 데이터센터 삭제 시 선택 해제 처리
  const handleDataCenterDelete = () => {
    dataCenterActions.confirmDelete((deletedId) => {
      if (selectedDataCenterId === deletedId) {
        setSelectedDataCenterId(null);
      }
    });
  };

  // 첫 번째 데이터센터를 기본으로 선택
  useEffect(() => {
    if (dataCenters.length > 0 && selectedDataCenterId === null) {
      setSelectedDataCenterId(dataCenters[0].dataCenterId);
    }
  }, [dataCenters, selectedDataCenterId]);

  // 선택된 데이터센터가 변경되면 URL 업데이트
  useEffect(() => {
    if (selectedDataCenterId !== null) {
      navigate(`/server-room-dashboard/${selectedDataCenterId}`, { replace: true });
    }
  }, [selectedDataCenterId, navigate]);

  // 선택된 데이터센터 필터링
  const filteredDataCenters = useMemo(() => {
    if (selectedDataCenterId === null) return dataCenters;
    return dataCenters.filter((dc) => dc.dataCenterId === selectedDataCenterId);
  }, [dataCenters, selectedDataCenterId]);

  // 전체 통계 (헤더용 - 모든 데이터센터 기준)
  const stats = useMemo(() => {
    const totalRooms = dataCenters.reduce(
      (sum, dc) => sum + dc.serverRooms.length,
      0
    );
    const totalDataCenters = dataCenters.length;
    const activeRooms = dataCenters.reduce(
      (sum, dc) =>
        sum + dc.serverRooms.filter((room) => room.status === "ACTIVE").length,
      0
    );
    const maintenanceRooms = dataCenters.reduce(
      (sum, dc) =>
        sum +
        dc.serverRooms.filter((room) => room.status === "MAINTENANCE").length,
      0
    );

    return { totalRooms, totalDataCenters, activeRooms, maintenanceRooms };
  }, [dataCenters]);

  // companyId 체크
  if (!companyId) {
    return (
      <div className="tab-layout">
        <div className="flex items-center justify-center h-full">
          <p className="text-body-primary text-red-400">
            회사 정보를 불러올 수 없습니다. 다시 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="tab-layout">
        <div className="flex items-center justify-center h-full">
          <p className="text-body-primary text-gray-400">
            서버실 목록을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (isError) {
    return (
      <div className="tab-layout">
        <div className="flex items-center justify-center h-full">
          <p className="text-body-primary text-red-400">
            서버실 목록을 불러오는데 실패했습니다:{" "}
            {error instanceof Error ? error.message : "알 수 없는 오류"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-layout">
      {/* Header */}
      <header className="tab-header flex items-center justify-between">
        <div className="flex">
          <div>
            <h1 className="tab-title text-main-title">서버실 관리</h1>
            <p className="tab-subtitle text-body-primary text-gray-400">
              데이터 센터 인프라를 모니터링하고 관리하세요
            </p>
          </div>
          <DashboardStats stats={stats} />
        </div>
        {userRole !== 'VIEWER' && (
          <button
            className="btn-create px-4 py-3"
            onClick={serverRoomActions.openCreateModal}
          >
            + 새 서버실 추가
          </button>
        )}
      </header>

      {/* Data Center Tabs */}
      <DataCenterTabs
        dataCenters={dataCenters}
        selectedDataCenterId={selectedDataCenterId}
        onSelectDataCenter={setSelectedDataCenterId}
        onEditDataCenter={dataCenterActions.openEditModal}
        onDeleteDataCenter={dataCenterActions.openDeleteModal}
        onCreateDataCenter={dataCenterActions.openCreateModal}
        userRole={userRole}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <ServerRoomList
          dataCenters={filteredDataCenters}
          onEditClick={serverRoomActions.openEditModal}
          onDeleteClick={serverRoomActions.openDeleteModal}
        />
      </main>

      {/* All Modals */}
      <DashboardModals
        serverRoom={{
          isCreateModalOpen: serverRoomActions.isCreateModalOpen,
          isEditModalOpen: serverRoomActions.isEditModalOpen,
          selectedServerRoom: serverRoomActions.selectedServerRoom,
          deleteModalState: serverRoomActions.deleteModalState,
          closeCreateModal: serverRoomActions.closeCreateModal,
          closeEditModal: serverRoomActions.closeEditModal,
          closeDeleteModal: serverRoomActions.closeDeleteModal,
          confirmDelete: serverRoomActions.confirmDelete,
        }}
        dataCenter={{
          isCreateModalOpen: dataCenterActions.isCreateModalOpen,
          isEditModalOpen: dataCenterActions.isEditModalOpen,
          selectedDataCenter: dataCenterActions.selectedDataCenter,
          deleteModalState: dataCenterActions.deleteModalState,
          closeCreateModal: dataCenterActions.closeCreateModal,
          closeEditModal: dataCenterActions.closeEditModal,
          closeDeleteModal: dataCenterActions.closeDeleteModal,
          confirmDelete: handleDataCenterDelete,
        }}
      />
    </div>
  );
};

export default ServerRoomDashboard;
