/**
 * @author 구희원
 * @description 서버 랙 시각화 컴포넌트 (Konva)
 */

import { Stage, Layer, Rect, Line, Text } from "react-konva";
import { useMemo, Fragment, useCallback } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Equipments, FloatingDevice } from "../types";
import Device from "./Device";
import { RACK_CONFIG, UNIT_COUNT } from "../constants/rackConstants";
import {
  getFloatingDeviceInfo,
  calculateDraggedPosition,
  calculateDeviceY,
} from "../utils/rackCalculation";
import { rackLayout } from "../utils/rackLayout";

/**
 * 간단한 메트릭 정보
 */
interface SimpleMetrics {
  cpu: number;
  memory: number;
  disk: number;
}

/**
 * 알림 상태 타입
 */
type AlertStatus = "normal" | "warning" | "critical";

/**
 * 랙 컴포넌트 props
 */
interface RackProps {
  devices: Equipments[];
  floatingDevice: FloatingDevice | null;
  onMouseMove: (mouseY: number) => void;
  onRackClick: (position: number) => void;
  onDeviceDragEnd: (deviceId: number, newPosition: number) => void;
  onDeviceDelete: (deviceId: number) => void;
  frontView: boolean;
  editMode: boolean;
  editingDeviceId: number | null;
  getDeviceName: (deviceId: number) => string;
  onDeviceNameChange: (deviceId: number, name: string) => void;
  onDeviceNameConfirm: (device: Equipments) => void;
  onDeviceNameCancel: (deviceId: number) => void;
  onDeviceClick: (deviceId: number, deviceName: string) => void;
  rackId: number;
  serverRoomId: number;
  allDeviceMetrics: Map<number, SimpleMetrics>;
}

/**
 * 플로팅 장비 임시 ID
 */
const FLOATING_DEVICE_ID = -1;

/**
 * 서버 랙 시각화
 * @param {RackProps} props - 랙 속성
 * @returns 랙 컴포넌트
 */
function Rack({
  devices,
  floatingDevice,
  onMouseMove,
  onRackClick,
  onDeviceDragEnd,
  onDeviceDelete,
  frontView,
  editMode,
  editingDeviceId,
  getDeviceName,
  onDeviceNameChange,
  onDeviceNameConfirm,
  onDeviceNameCancel,
  onDeviceClick,
  allDeviceMetrics,
}: RackProps) {
  const { width: rackWidth, unitHeight } = RACK_CONFIG;

  const layout = useMemo(() => rackLayout(RACK_CONFIG), []);
  const { rackHeight, baseY, fullWidth, fullHeight, rackX } = layout;

  const floatingInfo = useMemo(
    () =>
      getFloatingDeviceInfo(floatingDevice, {
        rackHeight,
        baseY,
        unitHeight,
      }),
    [floatingDevice, rackHeight, baseY, unitHeight]
  );

  /**
   * 장비 드래그 종료 처리
   */
  const handleDeviceDragEnd = useCallback(
    (deviceId: number, newY: number) => {
      const draggedDevice = devices.find((d) => d.id === deviceId);
      if (!draggedDevice) return;

      const newPosition = calculateDraggedPosition(
        newY,
        draggedDevice.unitSize,
        baseY,
        unitHeight
      );
      onDeviceDragEnd(deviceId, newPosition);
    },
    [devices, onDeviceDragEnd, baseY, unitHeight]
  );

  /**
   * 마우스 이동 처리
   */
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (pos) onMouseMove(pos.y);
  };

  /**
   * 랙 클릭 처리
   */
  const handleRackClick = () => {
    if (floatingDevice && floatingInfo) {
      onRackClick(floatingInfo.position);
    }
  };

  /**
   * 장비의 알림 상태 계산
   */
  const getDeviceAlertStatus = (equipment: Equipments): AlertStatus => {
    const metrics = allDeviceMetrics.get(equipment.id);
    if (!metrics) return "normal";

    const cpuThresholdCritical = equipment.cpuThresholdCritical ?? 0;
    const memoryThresholdCritical = equipment.memoryThresholdCritical ?? 0;
    const diskThresholdCritical = equipment.diskThresholdCritical ?? 0;

    const cpuThresholdWarning = equipment.cpuThresholdWarning ?? 0;
    const memoryThresholdWarning = equipment.memoryThresholdWarning ?? 0;
    const diskThresholdWarning = equipment.diskThresholdWarning ?? 0;

    const isCritical =
      (cpuThresholdCritical > 0 && metrics.cpu >= cpuThresholdCritical) ||
      (memoryThresholdCritical > 0 &&
        metrics.memory >= memoryThresholdCritical) ||
      (diskThresholdCritical > 0 && metrics.disk >= diskThresholdCritical);

    if (isCritical) return "critical";

    const isWarning =
      (cpuThresholdWarning > 0 && metrics.cpu >= cpuThresholdWarning) ||
      (memoryThresholdWarning > 0 &&
        metrics.memory >= memoryThresholdWarning) ||
      (diskThresholdWarning > 0 && metrics.disk >= diskThresholdWarning);

    if (isWarning) return "warning";

    return "normal";
  };

  return (
    <div
      className="flex justify-center items-start overflow-y-auto overflow-x-hidden h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden mx-auto"
      style={{ width: `${fullWidth}px` }}
    >
      <Stage
        width={fullWidth}
        height={fullHeight}
        className="block m-0 p-0"
        onMouseMove={handleMouseMove}
        onClick={handleRackClick}
      >
        <Layer>
          {/* 랙 본체 */}
          <Rect
            x={rackX}
            y={baseY}
            width={rackWidth}
            height={rackHeight}
            fill="#000000"
            stroke="#374151"
            strokeWidth={1}
          />

          {/* U 단위 그리드 및 라벨 */}
          {Array.from({ length: UNIT_COUNT + 1 }).map((_, i) => {
            const unitNumber = UNIT_COUNT - i;
            const yPos = baseY + i * unitHeight;

            return (
              <Fragment key={i}>
                <Line
                  points={[rackX, yPos, rackX + rackWidth, yPos]}
                  stroke="#4b5563"
                  strokeWidth={0.5}
                />
                {i < UNIT_COUNT && (
                  <Text
                    x={rackX + 8}
                    y={yPos + 12}
                    text={`${unitNumber}U`}
                    fontSize={12}
                    fill="#6b7280"
                  />
                )}
              </Fragment>
            );
          })}

          {/* 배치된 장비들 */}
          {devices.map((device) => {
            const y = calculateDeviceY(
              device.startUnit,
              device.unitSize,
              rackHeight,
              baseY,
              unitHeight
            );
            const height = unitHeight * device.unitSize;
            const alertStatus = getDeviceAlertStatus(device);
            const deviceMetrics = allDeviceMetrics.get(device.id);

            return (
              <Device
                key={device.id}
                device={device}
                y={y}
                height={height}
                rackWidth={rackWidth}
                x={rackX}
                onDragEnd={handleDeviceDragEnd}
                onDelete={onDeviceDelete}
                onClick={onDeviceClick}
                frontView={frontView}
                editMode={editMode}
                isEditing={editingDeviceId === device.id}
                tempDeviceName={getDeviceName(device.id)}
                onDeviceNameChange={onDeviceNameChange}
                onDeviceNameConfirm={onDeviceNameConfirm}
                onDeviceNameCancel={onDeviceNameCancel}
                alertStatus={alertStatus}
                currentSystemData={
                  deviceMetrics
                    ? {
                        cpu: deviceMetrics.cpu,
                        memory: deviceMetrics.memory,
                        disk: deviceMetrics.disk,
                      }
                    : null
                }
              />
            );
          })}

          {/* 플로팅 장비 (드래그 중인 장비 미리보기) */}
          {floatingDevice && floatingInfo && (
            <Device
              device={{
                id: FLOATING_DEVICE_ID,
                equipmentName: floatingDevice.card.label,
                equipmentCode: `TEMP-${Date.now()}`,
                equipmentType: floatingDevice.card.type,
                startUnit: floatingInfo.position,
                unitSize: floatingDevice.card.height,
                positionType: "FRONT",
                status: "NORMAL",
                manufacturer: "Unknown",
                modelName: "Unknown",
                ipAddress: "0.0.0.0",
                powerConsumption: 500.0,
              }}
              y={floatingInfo.y}
              height={floatingInfo.height}
              rackWidth={rackWidth}
              x={rackX}
              isFloating={true}
              opacity={0.2}
              frontView={frontView}
              editMode={editMode}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default Rack;
