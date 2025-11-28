/**
 * @author dhowor1d
 * @description 장비 액션 관리 훅 - 장비의 생성/삭제/회전/이동 등의 작업을 처리
 * API 호출을 통한 서버 데이터 동기화 및 로컬 스토어 업데이트
 * 장비 추가 시 자동으로 다음 번호를 부여하여 고유한 이름 생성
 * 위치 유효성 검사 및 충돌 감지로 잘못된 배치 방지
 * 다중 선택된 장비에 대한 일괄 작업 지원
 * 작업 성공/실패 시 토스트 메시지로 사용자 피드백 제공
 */

import { useCallback } from 'react';
import { useBabylonDatacenterStore } from '../stores/useBabylonDatacenterStore';
import { createDevice, deleteEquipment, updateEquipment } from '../api/serverRoomEquipmentApi';
import { getNextDeviceNumber, generateDeviceName } from '../utils/deviceNameGenerator';
import type { EquipmentType } from '../../types';
import type { ToastSeverity } from './useToast';

interface UseEquipmentActionsParams {
  serverRoomId?: string;
  showToast: (message: string, severity?: ToastSeverity) => void;
}

/**
 * @function useEquipmentActions
 * @description 장비 추가/삭제/회전 액션 관리 훅
 * @param {UseEquipmentActionsParams} params - 서버실 ID와 토스트 함수
 * @returns {Object} 장비 추가/삭제/회전 핸들러 함수들
 */
export function useEquipmentActions({
  serverRoomId,
  showToast,
}: UseEquipmentActionsParams) {
  const {
    gridConfig,
    equipment,
    selectedEquipmentId,
    rotateEquipment90,
    rotateMultipleEquipments90,
    removeEquipment,
    clearSelection,
    isValidPosition,
    isPositionOccupied,
    updateEquipmentPosition,
    updateMultipleEquipmentPositions,
  } = useBabylonDatacenterStore();

  // 장비 추가
  const handleAddEquipment = useCallback(
    async (type: EquipmentType) => {
      if (!serverRoomId) {
        showToast('서버실 ID가 없습니다', 'error');
        return;
      }

      try {
        const centerX = Math.floor(gridConfig.columns / 2);
        const centerY = Math.floor(gridConfig.rows / 2);

        const nextNumber = getNextDeviceNumber(equipment, type, serverRoomId);
        const deviceName = generateDeviceName(type, serverRoomId, nextNumber);

        const createdEquipment = await createDevice(
          {
            type,
            gridX: centerX,
            gridY: centerY,
            gridZ: 0,
            rotation: 0,
            metadata: {
              name: deviceName,
              status: 'NORMAL',
            },
          },
          Number(serverRoomId),
          equipment
        );

        useBabylonDatacenterStore.setState((state) => ({
          equipment: [...state.equipment, createdEquipment],
        }));

        showToast('장치가 추가되었습니다', 'success');
      } catch (error) {
        console.error('Failed to add equipment:', error);
        showToast('장치 추가에 실패했습니다', 'error');
      }
    },
    [serverRoomId, gridConfig.columns, gridConfig.rows, equipment, showToast]
  );

  // 장비 회전 (단일 또는 다중)
  const handleRotateEquipment = useCallback(
    async (clockwise: boolean, equipmentIds?: string[]) => {
      // equipmentIds가 제공되지 않으면 selectedEquipmentId 사용
      const idsToRotate = equipmentIds || (selectedEquipmentId ? [selectedEquipmentId] : []);
      
      if (idsToRotate.length === 0) return;

      const equipmentsToRotate = equipment.filter((eq) => idsToRotate.includes(eq.id));
      if (equipmentsToRotate.length === 0) return;

      // Store 업데이트 (단일 또는 다중)
      if (idsToRotate.length === 1) {
        rotateEquipment90(idsToRotate[0], clockwise);
      } else {
        rotateMultipleEquipments90(idsToRotate, clockwise);
      }

      // API 호출
      const rotation90 = Math.PI / 2;
      try {
        await Promise.all(
          equipmentsToRotate.map(async (equipmentToRotate) => {
            const newRotation = clockwise
              ? equipmentToRotate.rotation + rotation90
              : equipmentToRotate.rotation - rotation90;
            const normalizedRotation = ((newRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

            return updateEquipment({
              ...equipmentToRotate,
              rotation: normalizedRotation,
            });
          })
        );
        
        if (idsToRotate.length > 1) {
          showToast(`${idsToRotate.length}개 장치가 회전되었습니다`, 'success');
        }
      } catch (error) {
        console.error('Failed to rotate equipment:', error);
        showToast('장비 회전에 실패했습니다', 'error');
      }
    },
    [selectedEquipmentId, equipment, rotateEquipment90, rotateMultipleEquipments90, showToast]
  );

  // 장비 삭제
  const handleDeleteEquipment = useCallback(
    async (equipmentIds: string[]) => {
      try {
        await Promise.all(
          equipmentIds.map(async (id) => {
            const equipmentToDelete = equipment.find((eq) => eq.id === id);
            if (equipmentToDelete) {
              await deleteEquipment(equipmentToDelete);
              removeEquipment(id);
            }
          })
        );
        clearSelection();
        showToast(`${equipmentIds.length}개 장치가 삭제되었습니다`, 'success');
      } catch (error) {
        console.error('Failed to delete equipment:', error);
        showToast('장치 삭제에 실패했습니다', 'error');
      }
    },
    [equipment, removeEquipment, clearSelection, showToast]
  );

  // 장비 위치 업데이트 (유효성 검사 포함)
  const handleEquipmentPositionChange = useCallback(
    (id: string, gridX: number, gridY: number): boolean => {
      const result = updateEquipmentPosition(id, gridX, gridY);

      if (!result) {
        if (!isValidPosition(gridX, gridY)) {
          showToast('격자 범위를 벗어났습니다', 'error');
        } else if (isPositionOccupied(gridX, gridY, id)) {
          showToast('이미 장비가 배치되어 있습니다', 'error');
        }
        return false;
      }

      const equipmentToUpdate = equipment.find((eq) => eq.id === id);
      if (equipmentToUpdate) {
        updateEquipment({
          ...equipmentToUpdate,
          gridX,
          gridY,
        }).catch((error) => {
          console.error('Failed to update equipment position:', error);
          showToast('장비 위치 업데이트에 실패했습니다', 'error');
        });
      }

      return true;
    },
    [updateEquipmentPosition, isValidPosition, isPositionOccupied, equipment, showToast]
  );

  // 다중 장비 위치 업데이트
  const handleMultipleEquipmentPositionsChange = useCallback(
    async (
      updates: {
        id: string;
        gridX: number;
        gridY: number;
        originalGridX: number;
        originalGridY: number;
      }[]
    ): Promise<boolean> => {
      const result = updateMultipleEquipmentPositions(updates);

      if (!result) {
        showToast('선택된 장치들을 이동할 수 없습니다 (격자 범위 벗어남 또는 위치 중복)', 'error');
        return false;
      }

      // Store 업데이트가 성공하면 API 호출
      try {
        await Promise.all(
          updates.map(async (update) => {
            const equipmentToUpdate = equipment.find((eq) => eq.id === update.id);
            if (equipmentToUpdate) {
              await updateEquipment({
                ...equipmentToUpdate,
                gridX: update.gridX,
                gridY: update.gridY,
              });
            }
          })
        );
        
        console.log(`✅ ${updates.length}개 장비 위치 API 업데이트 성공`);
        showToast(`${updates.length}개 장치가 이동되었습니다`, 'success');
        return true;
      } catch (error) {
        console.error('Failed to update multiple equipment positions:', error);
        showToast('장비 위치 업데이트에 실패했습니다', 'error');
        return false;
      }
    },
    [updateMultipleEquipmentPositions, equipment, showToast]
  );

  return {
    handleAddEquipment,
    handleRotateEquipment,
    handleDeleteEquipment,
    handleEquipmentPositionChange,
    handleMultipleEquipmentPositionsChange,
  };
}
