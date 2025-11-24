import Rack from "../components/Rack";
import { useRackManager } from "../hooks/useRackManager";
import Sidebar from "./Sidebar";
import RackHeader from "./RackHeader";
import Button from "./Button";
import { useState, useEffect, useMemo } from "react";
import ServerDashboard from "@domains/serverView/serverDashboard/components/ServerDashboard";
import { useMonitoringStore } from "../../serverDashboard/stores/monitoringStore";
import { useEquipmentSSE } from "../../serverDashboard/hooks/useEquipmentSSE";
import { useAllEquipmentBackgroundSSE } from "../../serverDashboard/hooks/useAllEquipmentBackgroundSSE";
import { useAuthStore } from "@/domains/login/store/useAuthStore";

interface RackViewProps {
  onClose?: () => void;
  rackName?: string;
  serverRoomId: number;
}

function RackView({ rackName, serverRoomId, onClose }: RackViewProps) {
  const [frontView, setFrontView] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { deviceMetricsMap, setSelectedDeviceId } = useMonitoringStore();
  const { user } = useAuthStore();
  const view = user?.role === "VIEWER";

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

  const selectedEquipment = useMemo(
    () => rackManager.equipments?.find((eq) => eq.id === selectedDevice?.id),
    [rackManager.equipments, selectedDevice?.id]
  );

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

  const backgroundSSEEquipmentIds = useMemo(() => {
    const shouldStart =
      !rackManager.isLoading && selectableEquipmentIds.length > 0;

    if (shouldStart) {
      return selectableEquipmentIds;
    }
    return [];
  }, [rackManager.isLoading, selectableEquipmentIds]);

  useAllEquipmentBackgroundSSE(backgroundSSEEquipmentIds);

  useEquipmentSSE(
    selectedDevice?.id || 0,
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

  const handleDashboardClose = () => {
    setDashboardOpen(false);
  };

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

      <div className="flex-1 overflow-visible relative">
        <div className="h-full flex flex-col bg-[#404452]/70 backdrop-blur-md border border-slate-300/40 rounded-xl">
          <header className="flex justify-between items-center px-6 py-4 border-b border-slate-300/40 flex-shrink-0">
            <div className="flex-1">
              <RackHeader rackName={displayRackName} />
            </div>

            {!view && (
              <div className="flex items-center gap-4 ml-4">
                <Button
                  label={editMode ? "보기" : "편집"}
                  onClick={() => setEditMode(!editMode)}
                  active={editMode}
                />
                <Button
                  label={frontView ? "뒷면" : "앞면"}
                  onClick={() => setFrontView(!frontView)}
                  active={frontView}
                />
              </div>
            )}
          </header>

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
