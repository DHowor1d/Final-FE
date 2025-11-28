/**
 * @author 최산하
 */
import { useState } from "react";
import { useDeleteServerRoom } from "./useServerRoomQueries";
import type { ServerRoom } from "../types";

export function useServerRoomActions() {
  const [selectedServerRoom, setSelectedServerRoom] = useState<ServerRoom | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    serverRoom?: ServerRoom;
  }>({ isOpen: false });

  const deleteMutation = useDeleteServerRoom();

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const openEditModal = (serverRoom: ServerRoom) => {
    setSelectedServerRoom(serverRoom);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedServerRoom(null);
  };

  const openDeleteModal = (serverRoom: ServerRoom) => {
    setDeleteModalState({ isOpen: true, serverRoom });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false });
  };

  const confirmDelete = async () => {
    if (deleteModalState.serverRoom) {
      try {
        await deleteMutation.mutateAsync(deleteModalState.serverRoom.id);
        closeDeleteModal();
      } catch (error) {
        console.error("서버실 삭제 실패:", error);
      }
    }
  };

  return {
    selectedServerRoom,
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
