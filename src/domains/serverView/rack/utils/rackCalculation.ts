/**
 * @author 구희원
 * @description 랙 내 장비 위치 계산 유틸리티
 */

import { UNIT_COUNT } from "../constants/rackConstants";
import type { FloatingDevice } from "../types";

/**
 * 장비의 Y좌표를 랙 U위치로 변환
 * @param {number} mouseY - 마우스 Y 좌표
 * @param {number} baseY - 랙 시작 Y 좌표
 * @param {number} unitHeight - 1U 높이
 * @returns {number} U 위치 (1-42)
 */
export function calculationPosition(
  mouseY: number,
  baseY: number,
  unitHeight: number
): number {
  const relativeY = mouseY - baseY;
  const unit = Math.floor(relativeY / unitHeight);
  const position = UNIT_COUNT - unit;
  return Math.max(1, Math.min(UNIT_COUNT, position));
}

/**
 * U 위치를 Y좌표로 변환
 * @param {number} position - U 위치
 * @param {number} deviceHeight - 장비 높이 (U)
 * @param {number} rackHeight - 랙 전체 높이
 * @param {number} baseY - 랙 시작 Y 좌표
 * @param {number} unitHeight - 1U 높이
 * @returns {number} Y 좌표
 */
export function calculateDeviceY(
  position: number,
  deviceHeight: number,
  rackHeight: number,
  baseY: number,
  unitHeight: number
): number {
  return (
    rackHeight - (position - 1) * unitHeight - deviceHeight * unitHeight + baseY
  );
}

/**
 * 플로팅 장비의 렌더링 정보 계산
 * @param {FloatingDevice | null} floatingDevice - 플로팅 장비 정보
 * @param {Object} rackConfig - 랙 설정
 * @param {number} rackConfig.rackHeight - 랙 높이
 * @param {number} rackConfig.baseY - 랙 시작 Y 좌표
 * @param {number} rackConfig.unitHeight - 1U 높이
 * @returns {Object | null} 플로팅 장비 위치 정보 { position, y, height }
 */
export function getFloatingDeviceInfo(
  floatingDevice: FloatingDevice | null,
  rackConfig: {
    rackHeight: number;
    baseY: number;
    unitHeight: number;
  }
) {
  if (!floatingDevice) return null;
  let position = calculationPosition(
    floatingDevice.mouseY,
    rackConfig.baseY,
    rackConfig.unitHeight
  );

  const minPosition = 1;
  const maxPosition = UNIT_COUNT - floatingDevice.card.height + 1;
  position = Math.max(minPosition, Math.min(maxPosition, position));

  const y = calculateDeviceY(
    position,
    floatingDevice.card.height,
    rackConfig.rackHeight,
    rackConfig.baseY,
    rackConfig.unitHeight
  );
  const height = rackConfig.unitHeight * floatingDevice.card.height;
  return { position, y, height };
}

/**
 * 드래그된 장비의 새 위치 계산
 * @param {number} newY - 새 Y 좌표
 * @param {number} deviceHeight - 장비 높이 (U)
 * @param {number} baseY - 랙 시작 Y 좌표
 * @param {number} unitHeight - 1U 높이
 * @returns {number} 새 U 위치
 */
export function calculateDraggedPosition(
  newY: number,
  deviceHeight: number,
  baseY: number,
  unitHeight: number
): number {
  // 1. 상단의 상대 Y 좌표
  const relativeY = newY - baseY;

  // 2. 상단이 몇 번째 유닛인지 계산
  const topUnit = Math.round(relativeY / unitHeight);

  // 3. 상단의 U 위치
  const topPosition = UNIT_COUNT - topUnit;

  // 4. 하단의 U 위치 계산 (position은 하단!)
  const bottomPosition = topPosition - deviceHeight + 1;

  // 5. 범위 제한
  const minPosition = 1;
  const maxPosition = UNIT_COUNT;

  return Math.max(minPosition, Math.min(maxPosition, bottomPosition));
}
