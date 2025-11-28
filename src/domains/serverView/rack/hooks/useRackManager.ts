/**
 * @author 구희원
 * @description 랙 관리 훅 (장비 배치, 드래그, 삭제 등 전체 로직)
 */

import { useState, useCallback, useMemo } from "react";
import type { Equipments, FloatingDevice, EquipmentCard } from "../types";
import { checkCollision } from "../utils/rackCollisionDetection";
import { useGetRackEquipments } from "./useGetRackEquipments";
import { usePostEquipment } from "./usePostRackEquipments";
import { usePostPlaceEquipments } from "./usePostPlaceEquipments";
import { useDeleteEquipments } from "./useDeleteRackEquipments";
import { useUpdateRackEquipments } from "./useUpdateRackEquipments";
import type { GetRackEquipmentsParams } from "../api/getRackEquipments";
import type { PostEquipmentRequest } from "../api/postRackEquipments";

/**
 * 랙 매니저 props
 */
interface UseRackManagerProps {
  rackId: number;
  params?: GetRackEquipmentsParams;
  frontView?: boolean;
  serverRoomId: number;
}

/**
 * 랙 관리 훅
 * @param {UseRackManagerProps} props - 랙 매니저 속성
 * @param {number} props.rackId - 랙 ID
 * @param {GetRackEquipmentsParams} props.params - 장비 조회 파라미터
 * @param {boolean} props.frontView - 앞면/뒷면 뷰 상태
 * @param {number} props.serverRoomId - 서버룸 ID
 * @returns 랙 관리 상태 및 핸들러 함수들
 */
export function useRackManager({
  rackId,
  params,
  frontView = true,
}: UseRackManagerProps) {
  const [tempDevices, setTempDevices] = useState<Equipments[]>([]);
  const [floatingDevice, setFloatingDevice] = useState<FloatingDevice | null>(
    null
  );
  const [resetKey, setResetKey] = useState(0);
  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [tempDeviceName, setTempDeviceName] = useState<Map<number, string>>(
    new Map()
  );

  // GET - 장비 목록 조회
  const { equipments, rack, isLoading, error } = useGetRackEquipments(
    rackId || 0,
    params
  );

  // POST - 장비 생성 및 배치
  const { mutate: postEquipment } = usePostEquipment();
  const { mutate: postPlaceEquipments } = usePostPlaceEquipments();

  // DELETE - 장비 삭제
  const { mutate: deleteEquipment } = useDeleteEquipments();

  // UPDATE - 장비 수정
  const { mutate: updateEquipment } = useUpdateRackEquipments();

  /**
   * 설치된 장비 목록 (서버 데이터 + 임시 장비)
   */
  const installedDevices = useMemo(() => {
    const devices = [...(equipments || []), ...tempDevices];
    return devices;
  }, [equipments, tempDevices]);

  /**
   * 장비 카드 클릭 핸들러
   */
  const handleCardClick = useCallback((card: EquipmentCard) => {
    setFloatingDevice({
      card,
      mouseY: 0,
    });
  }, []);

  /**
   * 마우스 이동 핸들러
   */
  const handleMouseMove = useCallback((mouseY: number) => {
    setFloatingDevice((prev) => (prev ? { ...prev, mouseY } : null));
  }, []);

  /**
   * 장비 드래그 종료 핸들러
   */
  const handleDeviceDragEnd = useCallback(
    (deviceId: number, newPosition: number) => {
      const draggedDevice = installedDevices.find((d) => d.id === deviceId);
      if (!draggedDevice) return;

      if (draggedDevice.startUnit === newPosition) {
        return;
      }

      const hasCollision = checkCollision(
        {
          position: newPosition,
          height: draggedDevice.unitSize,
        },
        installedDevices,
        deviceId
      );
      if (hasCollision) {
        setResetKey((prev) => prev + 1);
        return;
      }

      updateEquipment({
        id: deviceId,
        data: {
          rackId,
          equipmentName: draggedDevice.equipmentName,
          equipmentType: draggedDevice.equipmentType,
          startUnit: newPosition,
          unitSize: draggedDevice.unitSize,
          status: draggedDevice.status,
        },
      });
    },
    [updateEquipment, rackId, installedDevices]
  );

  /**
   * 랙 클릭 핸들러 (장비 배치)
   */
  const handleRackClick = useCallback(
    (position: number) => {
      setFloatingDevice((prevFloating) => {
        if (!prevFloating) return null;

        const hasCollision = checkCollision(
          {
            position,
            height: prevFloating.card.height,
          },
          installedDevices
        );
        if (hasCollision) {
          return prevFloating;
        }

        // 드롭다운에서 선택한 기존 장비인 경우
        if (prevFloating.card.id) {
          postPlaceEquipments({
            rackId,
            id: prevFloating.card.id,
            data: {
              startUnit: position,
              unitSize: prevFloating.card.height,
            },
          });
          return null;
        }

        // 새 장비 생성 (임시)
        const tempId = Date.now();
        const newDevice: Equipments = {
          id: tempId,
          equipmentName: "",
          equipmentCode: `TEMP-${tempId}`,
          equipmentType: prevFloating.card.type,
          status: "NORMAL",
          startUnit: position,
          positionType: frontView ? "BACK" : "FRONT",
          unitSize: prevFloating.card.height,
          modelName: null,
          manufacturer: null,
          ipAddress: null,
          powerConsumption: null,
        };
        setTempDevices((prevDevices) => {
          const filteredDevices = editingDeviceId
            ? prevDevices.filter((d) => d.id !== editingDeviceId)
            : prevDevices;
          return [...filteredDevices, newDevice];
        });

        setTempDeviceName((prev) => {
          const newMap = new Map(prev);
          if (editingDeviceId) {
            newMap.delete(editingDeviceId);
          }
          newMap.set(tempId, "");
          return newMap;
        });

        // 편집 모드 활성화
        setEditingDeviceId(tempId);

        return null;
      });
    },
    [frontView, editingDeviceId, installedDevices, postPlaceEquipments, rackId]
  );

  /**
   * 장비명 변경 핸들러
   */
  const handleDeviceNameChange = useCallback(
    (deviceId: number, name: string) => {
      setTempDeviceName((prev) => {
        const newMap = new Map(prev);
        newMap.set(deviceId, name);
        return newMap;
      });
    },
    []
  );

  /**
   * 장비명 확정 핸들러 (Enter 또는 확인 버튼)
   */
  const handleDeviceNameConfirm = useCallback(
    (device: Equipments, inputName?: string) => {
      const name = inputName ?? tempDeviceName.get(device.id) ?? "";
      const finalName = name.trim() || device.equipmentType;

      if (!device.equipmentCode?.startsWith("TEMP-")) {
        console.log("임시 장비가 아닙니다");
        return;
      }

      setTempDevices((prev) =>
        prev.map((d) =>
          d.id === device.id ? { ...d, equipmentName: finalName } : d
        )
      );

      setEditingDeviceId(null);

      const requestData: PostEquipmentRequest = {
        equipmentName: finalName,
        equipmentType: device.equipmentType,
        startUnit: device.startUnit,
        unitSize: device.unitSize,
        status: device.status,
        rackId: rackId,
      };

      postEquipment(requestData, {
        onSuccess: () => {
          setTempDevices((prev) => prev.filter((d) => d.id !== device.id));
          setTempDeviceName((prev) => {
            const newMap = new Map(prev);
            newMap.delete(device.id);
            return newMap;
          });
        },
        onError: (error) => {
          console.error("장비 생성 실패:", error);
          setTempDevices((prev) => prev.filter((d) => d.id !== device.id));
          setTempDeviceName((prev) => {
            const newMap = new Map(prev);
            newMap.delete(device.id);
            return newMap;
          });
        },
      });
    },
    [rackId, postEquipment, tempDeviceName]
  );

  /**
   * 장비명 입력 취소 핸들러 (ESC 또는 취소 버튼)
   */
  const handleDeviceNameCancel = useCallback((deviceId: number) => {
    setTempDevices((prevDevices) =>
      prevDevices.filter((device) => device.id !== deviceId)
    );
    setTempDeviceName((prev) => {
      const newMap = new Map(prev);
      newMap.delete(deviceId);
      return newMap;
    });
    setEditingDeviceId(null);
  }, []);

  /**
   * 장비 삭제 핸들러
   */
  const handleDeviceDelete = useCallback(
    (deviceId: number) => {
      deleteEquipment({ id: deviceId, rackId });
    },
    [deleteEquipment, rackId]
  );

  /**
   * 임시 장비명 조회
   */
  const getDeviceName = useCallback(
    (deviceId: number) => {
      return tempDeviceName.get(deviceId) || "";
    },
    [tempDeviceName]
  );

  return {
    installedDevices,
    floatingDevice,
    resetKey,
    editingDeviceId,
    tempDeviceName,
    isLoading,
    error,
    rack,
    equipments,
    handleCardClick,
    handleMouseMove,
    handleDeviceDragEnd,
    handleRackClick,
    handleDeviceNameChange,
    handleDeviceNameConfirm,
    handleDeviceNameCancel,
    handleDeviceDelete,
    getDeviceName,
  };
}
