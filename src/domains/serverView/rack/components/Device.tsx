import { Group, Rect, Text, Line, Image } from "react-konva";
import { useState, memo, useRef, useEffect } from "react";
import { Html } from "react-konva-utils";
import type { Equipments } from "../types";
import { deviceImageMap } from "../utils/deviceImageMap";
import { useImageLoad } from "../hooks/useImageLoad";
import { dragBound } from "../utils/dragBound";
import { UNIT_COUNT, RACK_CONFIG } from "../constants/rackConstants";
import deleteIcon from "../assets/delete.svg";
import checkIcon from "../assets/check.svg";
import ClickableIcon from "./ClickableIcon";

interface SystemData {
  cpu: number;
  memory: number;
  disk: number;
}

type AlertStatus = "normal" | "warning" | "critical";

interface DeviceProps {
  device: Equipments;
  y: number;
  x: number;
  height: number;
  rackWidth: number;
  opacity?: number;
  isFloating?: boolean;
  frontView: boolean;
  editMode: boolean;
  onDragEnd?: (deviceId: number, newY: number) => void;
  onDelete?: (deviceId: number) => void;
  onClick?: (deviceId: number, deviceName: string) => void;
  isEditing?: boolean;
  tempDeviceName?: string;
  onDeviceNameChange?: (deviceId: number, name: string) => void;
  onDeviceNameConfirm?: (device: Equipments, inputName?: string) => void;
  onDeviceNameCancel?: (deviceId: number) => void;
  alertStatus?: AlertStatus;
  currentSystemData?: SystemData | null;
}

function Device({
  device,
  y,
  x,
  height,
  rackWidth,
  opacity = 1,
  isFloating = false,
  onDragEnd,
  frontView,
  editMode,
  onDelete,
  onClick,
  isEditing = false,
  tempDeviceName = "",
  onDeviceNameChange,
  onDeviceNameCancel,
  onDeviceNameConfirm,
  alertStatus = "normal",
  currentSystemData,
}: DeviceProps) {
  const [dragging, setIsDragging] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const hasConfirmedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { unitHeight, frameThickness: baseY } = RACK_CONFIG;
  const rackHeight = UNIT_COUNT * unitHeight;

  const imageUrls =
    deviceImageMap[device.equipmentType] || deviceImageMap.SERVER;
  const imageUrl = frontView ? imageUrls.front : imageUrls.back;

  const image = useImageLoad(imageUrl);

  const deleteImage = useImageLoad(deleteIcon);
  const checkImage = useImageLoad(checkIcon);

  // 임계치 상태에 따른 색상 결정
  const getAlertColor = () => {
    switch (alertStatus) {
      case "critical":
        return "#ef4444"; // red-500
      case "warning":
        return "#f59e0b"; // amber-500
      default:
        return "transparent";
    }
  };

  const getAlertOpacity = () => {
    switch (alertStatus) {
      case "critical":
      case "warning":
        return 0.25;
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.value = tempDeviceName;
    }
  }, [isEditing, tempDeviceName]);

  const handleDragBound = (pos: { x: number; y: number }) => {
    return dragBound(pos, {
      baseY,
      rackHeight,
      deviceHeight: height,
      unitHeight,
    });
  };

  const handleConfirm = () => {
    if (hasConfirmedRef.current) return;
    hasConfirmedRef.current = true;
    const inputValue = inputRef.current?.value || "";
    onDeviceNameConfirm?.(device, inputValue);
  };

  const handleClick = () => {
    if (!editMode && !isFloating && !isEditing && onClick) {
      onClick(device.id, device.equipmentName || device.equipmentType);
    }
  };

  const alertColor = getAlertColor();
  const alertOpacity = getAlertOpacity();

  return (
    <Group
      y={y}
      opacity={dragging ? 0.5 : opacity}
      draggable={!isFloating && editMode}
      dragBoundFunc={!isFloating && editMode ? handleDragBound : undefined}
      onClick={handleClick}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e) => {
        setIsDragging(false);
        if (onDragEnd && !isFloating && editMode) {
          onDragEnd(device.id, e.target.y());
        }
      }}
      onDragMove={(e) => {
        e.target.x(0);
      }}
    >
      {image && (
        <Image image={image} x={x} y={0} width={rackWidth} height={height} />
      )}

      {/* 임계치 경고 배경 (반투명 오버레이) */}
      {alertStatus !== "normal" && (
        <Rect
          x={x}
          y={0}
          width={rackWidth}
          height={height}
          fill={alertColor}
          opacity={alertOpacity}
        />
      )}

      {/* 장비 본체 */}
      <Rect
        x={x}
        y={0}
        width={rackWidth}
        height={height}
        fill="transparent"
        stroke={alertColor}
        strokeWidth={alertStatus !== "normal" ? 2 : 1}
      />

      {/* 상단 테두리 */}
      <Line points={[x, 0, x + rackWidth, 0]} strokeWidth={1} />

      {/* 하단 테두리 */}
      <Line points={[x, height, x + rackWidth, height]} strokeWidth={2} />

      {/* 메트릭 정보 표시 (선택적) */}
      {currentSystemData && alertStatus !== "normal" && !isEditing && (
        <Text
          x={x + 10}
          y={height / 2 + 8}
          text={`CPU:${currentSystemData.cpu}% MEM:${currentSystemData.memory}%`}
          fontSize={9}
          fill={alertColor}
        />
      )}

      {/* 장비 이름 또는 입력 필드 */}
      {isEditing ? (
        <>
          {/* 입력 필드만 HTML */}
          <Html
            divProps={{
              style: {
                position: "absolute",
                top: `${height / 2 - 15}px`,
                left: `${x + 10}px`,
                width: `${rackWidth - 55}px`,
                pointerEvents: "auto",
              },
            }}
          >
            <input
              ref={inputRef}
              type="text"
              defaultValue={tempDeviceName} // value 대신 defaultValue
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isComposing) {
                  e.preventDefault();
                  if (inputRef.current) {
                    onDeviceNameChange?.(device.id, inputRef.current.value);
                  }
                  handleConfirm();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onDeviceNameCancel?.(device.id);
                }
              }}
              onBlur={handleConfirm}
              placeholder="장비명 입력"
              className="w-full px-2 py-1 text-xs bg-slate-700 text-black border border-slate-500 rounded focus:outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </Html>

          <ClickableIcon
            image={checkImage}
            x={x + rackWidth - 55}
            y={5}
            width={20}
            height={20}
            onClick={handleConfirm}
          />
          <ClickableIcon
            image={deleteImage}
            x={x + rackWidth - 30}
            y={5}
            width={20}
            height={20}
            onClick={() => onDeviceNameCancel?.(device.id)}
          />
        </>
      ) : (
        <Text
          x={x + 10}
          y={height / 2 - 6}
          text={device.equipmentName || device.equipmentType}
          fontSize={12}
          fill="#fff"
        />
      )}
      {editMode && !isFloating && !isEditing && (
        <ClickableIcon
          image={deleteImage}
          x={x + rackWidth - 30}
          y={5}
          width={20}
          height={20}
          onClick={() => onDelete?.(device.id)}
        />
      )}
    </Group>
  );
}

export default memo(Device);
