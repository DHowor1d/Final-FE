/**
 * @author 김대호
 * @description 랙 뷰 컴포넌트 - 랙 내부의 서버 장비를 시각화하고 관리하는 컴포넌트
 * 랙의 앞면/뒷면 전환, 장비 배치 편집 모드, 실시간 모니터링 대시보드 기능 제공
 * 서버와 스토리지 장비 클릭 시 상세 메트릭 정보를 SSE로 수신하여 표시
 * VIEWER 권한은 편집 모드 사용 불가
 */

import Rack from "../components/Rack";
import { useRackManager } from "../hooks/useRackManager";
import Sidebar from "./Sidebar";
import RackHeader from "./RackHeader";
import Button from "./Button";
import { useState, useEffect, useMemo, useCallback } from "react";
import ServerDashboard from "@domains/serverView/serverDashboard/components/ServerDashboard";
import { useMonitoringStore } from "../../serverDashboard/stores/monitoringStore";
import { useEquipmentSSE } from "../../serverDashboard/hooks/useEquipmentSSE";
import { useAllEquipmentBackgroundSSE } from "../../serverDashboard/hooks/useAllEquipmentBackgroundSSE";
import { useAuthStore } from "@/domains/login/store/useAuthStore";

/**
 * 랙 뷰 props
 */
interface RackViewProps {
  onClose?: () => void;
  rackName?: string;
  serverRoomId: number;
}

/**
 * @function RackView
 * @description 랙 내부 장비 뷰어 컴포넌트 - U 단위로 장비 배치 및 모니터링
 * @param {RackViewProps} props - 랙 이름, 서버실 ID, 닫기 콜백
 * @returns {JSX.Element} 랙뷰 UI
 */
function RackView({ rackName, serverRoomId, onClose }: RackViewProps) {
  const [frontView, setFrontView] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const {
    deviceMetricsMap,
    setSelectedDeviceId,
    setSystemData,
    setDiskData,
    setNetworkData,
    setDeviceMetrics,
  } = useMonitoringStore();
  const { user } = useAuthStore();
  const view = user?.role === "VIEWER";

  /**
   * 랙 이름에서 ID 추출
   */
  const rackId = useMemo(() => {
    if (!rackName) return undefined;
    const parts = rackName.split("-");
    const id = parseInt(parts[parts.length - 1], 10);
    return isNaN(id) ? undefined : id;
  }, [rackName]);

  const rackManager = useRackManager({
    rackId: rackId || 0,
    serverRoomId: serverRoomId,
    frontView,
  });

  /**
   * 선택된 장비 정보
   */
  const selectedEquipment = useMemo(
    () => rackManager.equipments?.find((eq) => eq.id === selectedDevice?.id),
    [rackManager.equipments, selectedDevice?.id]
  );

  /**
   * 모니터링 가능한 장비 ID 목록 (SERVER, STORAGE만)
   */
  const selectableEquipmentIds = useMemo(
    () =>
      rackManager.equipments
        ?.filter(
          (eq) =>
            eq.equipmentType === "SERVER" || eq.equipmentType === "STORAGE"
        )
        .map((eq) => eq.id) || [],
    [rackManager.equipments]
  );

  /**
   * 백그라운드 SSE 대상 장비 ID 목록
   */
  const backgroundSSEEquipmentIds = useMemo(() => {
    const shouldStart =
      !rackManager.isLoading && selectableEquipmentIds.length > 0;

    if (shouldStart) {
      return selectableEquipmentIds;
    }
    return [];
  }, [rackManager.isLoading, selectableEquipmentIds]);

  /**
   * 백그라운드 SSE 콜백
   */
  const backgroundCallbacks = useCallback(
    () => ({
      onMetricsUpdate: setDeviceMetrics,
      onConnectionError: (equipmentId: number, error: Event) => {
        console.error(
          `[Rack ${rackId}] Background SSE error for equipment ${equipmentId}:`,
          error
        );
      },
    }),
    [rackId, setDeviceMetrics]
  );

  /**
   * 선택된 장비 SSE 콜백
   */
  const equipmentCallbacks = useCallback(
    () => ({
      onSystemData: setSystemData,
      onDiskData: setDiskData,
      onNetworkData: setNetworkData,
      onError: (error: Event) => {
        console.error(
          `[Rack ${rackId}] Equipment SSE error for device ${selectedDevice?.id}:`,
          error
        );
      },
    }),
    [rackId, selectedDevice?.id, setSystemData, setDiskData, setNetworkData]
  );

  // 백그라운드 메트릭 수집 (모든 장비)
  useAllEquipmentBackgroundSSE(
    backgroundSSEEquipmentIds,
    backgroundCallbacks()
  );

  // 선택된 장비 상세 데이터 수집
  useEquipmentSSE(
    selectedDevice?.id || null,
    equipmentCallbacks(),
    dashboardOpen && selectedDevice?.id !== 0
  );

  useEffect(() => {
    setSelectedDeviceId(selectedDevice?.id || null);
  }, [selectedDevice?.id, setSelectedDeviceId]);

  useEffect(() => {
    if (editMode) {
      setDashboardOpen(false);
    }
  }, [editMode]);

  useEffect(() => {
    if (view && editMode) {
      setEditMode(false);
    }
  }, [view]);

  const displayRackName = rackManager.rack?.rackName || rackName || "N/A";

  /**
   * 장비 클릭 핸들러
   */
  const handleDeviceClick = (deviceId: number, deviceName: string) => {
    const equipment = rackManager.equipments?.find((eq) => eq.id === deviceId);
    if (
      equipment &&
      (equipment.equipmentType === "SERVER" ||
        equipment.equipmentType === "STORAGE")
    ) {
      setSelectedDevice({ id: deviceId, name: deviceName });
      setDashboardOpen(true);
    }
  };

  /**
   * 대시보드 닫기 핸들러
   */
  const handleDashboardClose = () => {
    setDashboardOpen(false);
  };

  /**
   * 사이드바 클릭 핸들러
   */
  const handleSidebarClick = () => {
    if (dashboardOpen) {
      handleDashboardClose();
    } else {
      onClose?.();
    }
  };

  if (rackManager.isLoading) {
    return (
      <div className="h-full flex justify-center items-center text-white">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (rackManager.error) {
    return (
      <div className="h-full flex justify-center items-center text-white">
        <div className="text-lg text-red-400">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex text-white gap-2 p-2">
      {/* 서버 대시보드 영역 */}
      <div
        className="flex-[2] overflow-hidden relative"
        onClick={handleSidebarClick}
      >
        <ServerDashboard
          deviceId={selectedDevice?.id || 0}
          deviceName={selectedDevice?.name || ""}
          onClose={handleDashboardClose}
          isOpen={dashboardOpen}
          rackId={rackId || 0}
          serverRoomId={serverRoomId}
          currentEquipment={selectedEquipment}
        />
      </div>

      {/* 랙 뷰 영역 */}
      <div className="flex-1 overflow-visible relative">
        <div className="h-full flex flex-col bg-[#404452]/70 backdrop-blur-md border border-slate-300/40 rounded-xl">
          {/* 헤더 */}
          <header className="flex justify-between items-center px-6 py-4 border-b border-slate-300/40 flex-shrink-0">
            <div className="flex-1">
              <RackHeader rackName={displayRackName} />
            </div>

            <div className="flex items-center gap-4 ml-4">
              {!view && (
                <Button
                  label={editMode ? "보기" : "편집"}
                  onClick={() => setEditMode(!editMode)}
                  active={editMode}
                />
              )}
              <Button
                label={frontView ? "뒷면" : "앞면"}
                onClick={() => setFrontView(!frontView)}
                active={frontView}
              />
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <div className="flex flex-1 min-h-0 overflow-visible">
            <Sidebar
              onCardClick={rackManager.handleCardClick}
              isOpen={editMode}
            />

            <div className="flex-1 flex justify-center items-start pt-4 pb-2 overflow-y-auto min-h-0">
              <div className="w-full h-full min-h-0">
                <Rack
                  key={rackManager.resetKey}
                  devices={rackManager.installedDevices}
                  floatingDevice={rackManager.floatingDevice}
                  onMouseMove={rackManager.handleMouseMove}
                  onRackClick={rackManager.handleRackClick}
                  onDeviceDragEnd={rackManager.handleDeviceDragEnd}
                  onDeviceDelete={rackManager.handleDeviceDelete}
                  onDeviceClick={handleDeviceClick}
                  frontView={frontView}
                  editMode={editMode}
                  editingDeviceId={rackManager.editingDeviceId}
                  getDeviceName={rackManager.getDeviceName}
                  onDeviceNameChange={rackManager.handleDeviceNameChange}
                  onDeviceNameConfirm={rackManager.handleDeviceNameConfirm}
                  onDeviceNameCancel={rackManager.handleDeviceNameCancel}
                  rackId={rackId || 0}
                  serverRoomId={serverRoomId}
                  allDeviceMetrics={deviceMetricsMap}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default RackView;
