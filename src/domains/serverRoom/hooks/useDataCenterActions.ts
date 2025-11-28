/**
 * @author 최산하
 */
import { useState } from "react";
import { useDeleteDataCenter } from "./useServerRoomQueries";
import type { DataCenterGroup } from "../types";

export function useDataCenterActions() {
  const [selectedDataCenter, setSelectedDataCenter] = useState<DataCenterGroup | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    dataCenter?: DataCenterGroup;
  }>({ isOpen: false });

  const deleteDataCenterMutation = useDeleteDataCenter();

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const openEditModal = (dataCenter: DataCenterGroup) => {
    setSelectedDataCenter(dataCenter);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDataCenter(null);
  };

  const openDeleteModal = (dataCenter: DataCenterGroup) => {
    setDeleteModalState({ isOpen: true, dataCenter });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false });
  };

  const confirmDelete = async (onDeleteComplete?: (dataCenterId: number) => void) => {
    if (deleteModalState.dataCenter) {
      try {
        await deleteDataCenterMutation.mutateAsync(deleteModalState.dataCenter.dataCenterId);
        if (onDeleteComplete) {
          onDeleteComplete(deleteModalState.dataCenter.dataCenterId);
        }
        closeDeleteModal();
      } catch (error) {
        console.error("데이터센터 삭제 실패:", error);
      }
    }
  };

  return {
    selectedDataCenter,
    isCreateModalOpen,
    isEditModalOpen,
    deleteModalState,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
}
