/**
 * @author 최산하
 */
import ServerRoomCreateModal from "./ServerRoomCreateModal";
import ServerRoomEditModal from "./ServerRoomEditModal";
import DataCenterCreateModal from "./DataCenterCreateModal";
import DataCenterEditModal from "./DataCenterEditModal";
import { ConfirmationModal } from "@/shared/ConfirmationModal";
import type { ServerRoom, DataCenterGroup } from "../types";

interface ServerRoomModalState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedServerRoom: ServerRoom | null;
  deleteModalState: {
    isOpen: boolean;
    serverRoom?: ServerRoom;
  };
  closeCreateModal: () => void;
  closeEditModal: () => void;
  closeDeleteModal: () => void;
  confirmDelete: () => void;
}

interface DataCenterModalState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedDataCenter: DataCenterGroup | null;
  deleteModalState: {
    isOpen: boolean;
    dataCenter?: DataCenterGroup;
  };
  closeCreateModal: () => void;
  closeEditModal: () => void;
  closeDeleteModal: () => void;
  confirmDelete: () => void;
}

interface DashboardModalsProps {
  serverRoom: ServerRoomModalState;
  dataCenter: DataCenterModalState;
}

export function DashboardModals({ 
  serverRoom, 
  dataCenter 
}: DashboardModalsProps) {
  return (
  <>
    {/* 서버실 모달들 */}
    <ServerRoomCreateModal
      isOpen={serverRoom.isCreateModalOpen}
      onClose={serverRoom.closeCreateModal}
    />

    <ServerRoomEditModal
      isOpen={serverRoom.isEditModalOpen}
      onClose={serverRoom.closeEditModal}
      serverRoom={serverRoom.selectedServerRoom}
    />

    <ConfirmationModal
      isOpen={serverRoom.deleteModalState.isOpen}
      onClose={serverRoom.closeDeleteModal}
      onConfirm={serverRoom.confirmDelete}
      title="서버실 삭제"
      confirmText="삭제"
      isDestructive={true}
    >
      <p>{serverRoom.deleteModalState.serverRoom?.name}서버실을 삭제하시겠습니까?</p>
    </ConfirmationModal>

    {/* 데이터센터 모달들 */}
    <DataCenterCreateModal
      isOpen={dataCenter.isCreateModalOpen}
      onClose={dataCenter.closeCreateModal}
    />

    <DataCenterEditModal
      isOpen={dataCenter.isEditModalOpen}
      onClose={dataCenter.closeEditModal}
      dataCenter={dataCenter.selectedDataCenter}
    />

    <ConfirmationModal
      isOpen={dataCenter.deleteModalState.isOpen}
      onClose={dataCenter.closeDeleteModal}
      onConfirm={dataCenter.confirmDelete}
      title="데이터센터 삭제"
      confirmText="삭제"
      isDestructive={true}
    >
      <p>
        {dataCenter.deleteModalState.dataCenter?.dataCenterName} 데이터센터를 삭제하시겠습니까?
      </p>
      <p className="text-sm text-gray-400 mt-2">
        데이터센터에 속한 모든 서버실도 함께 삭제될 수 있습니다.
      </p>
    </ConfirmationModal>
  </>
  );
}
