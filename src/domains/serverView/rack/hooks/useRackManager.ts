/**
 * @author dhowor1d
 * @description 랙 관리 훅 - 랙 내부 장비의 배치, 이동, 삭제, 수정 등 전반적인 관리 기능 제공
 * 랙의 장비 목록을 조회하고, 장비 추가/삭제/이동/수정 API 호출 처리
 * 드래그&드롭으로 장비 배치, U 단위 차지 계산 및 충돌 검사
 * 임시 장비 상태 관리로 실시간 UI 업데이트 및 API 호출 분리
 * 장비 이름 편집 모드 관리 및 키보드 이벤트 처리 (Enter, Escape)
 * 러 상태 초기화로 랙 UI 재렌더링 트리거 기능
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

interface UseRackManagerProps {
  rackId: number;
  params?: GetRackEquipmentsParams;
  frontView?: boolean;
  serverRoomId: number;
}

/**
 * @function useRackManager
 * @description 랙 관리 훅 - 랙 내부 장비의 전반적인 상태와 동작 관리
 * @param {UseRackManagerProps} props - 랙 ID, 파라미터, 뷰 모드, 서버실 ID
 * @returns {Object} 장비 목록, 랙 정보, 이벤트 핸들러 함수들
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

  //GET
  const { equipments, rack, isLoading, error } = useGetRackEquipments(
    rackId || 0,
    params
  );

  //POST
  const { mutate: postEquipment } = usePostEquipment();
  const { mutate: postPlaceEquipments } = usePostPlaceEquipments();

  //DELETE
  const { mutate: deleteEquipment } = useDeleteEquipments();

  //UPDATE
  const { mutate: updateEquipment } = useUpdateRackEquipments();

  const installedDevices = useMemo(() => {
    const devices = [...(equipments || []), ...tempDevices];
    return devices;
  }, [equipments, tempDevices]);

  // 카드 클릭 핸들러
  const handleCardClick = useCallback((card: EquipmentCard) => {
    setFloatingDevice({
      card,
      mouseY: 0,
    });
  }, []);

  // 마우스 이동
  const handleMouseMove = useCallback((mouseY: number) => {
    setFloatingDevice((prev) => (prev ? { ...prev, mouseY } : null));
  }, []);

  // 드래그 종료 핸들러
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

  // 랙 클릭 핸들러
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

        //드롭다운에서 선택한 기존 장비인 경우
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

  // Enter 누름 → 이름 확정 & 배치 → 그 다음 서버 요청
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

  //장비 삭제 함수 추가
  const handleDeviceDelete = useCallback(
    (deviceId: number) => {
      deleteEquipment({ id: deviceId, rackId });
    },
    [deleteEquipment, rackId]
  );

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
