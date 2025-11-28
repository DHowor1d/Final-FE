/**
 * @author 구희원
 * @description 랙 내 장비 충돌 감지 유틸리티
 */

import type { Equipments } from "../types";

/**
 * 두 장비의 U 범위가 겹치는지 확인
 * @param {Object} range1 - 첫 번째 장비 범위
 * @param {number} range1.bottom - 하단 U 위치
 * @param {number} range1.top - 상단 U 위치
 * @param {Object} range2 - 두 번째 장비 범위
 * @param {number} range2.bottom - 하단 U 위치
 * @param {number} range2.top - 상단 U 위치
 * @returns {boolean} 겹침 여부
 */
function Overlapping(
  range1: { bottom: number; top: number },
  range2: { bottom: number; top: number }
): boolean {
  return !(range1.top < range2.bottom || range1.bottom > range2.top);
}

/**
 * 새 장비가 기존 장비들과 충돌하는지 검사
 * @param {Object} newDevice - 새 장비 정보
 * @param {number} newDevice.position - 시작 U 위치
 * @param {number} newDevice.height - 장비 높이 (U)
 * @param {Equipments[]} existingDevices - 기존 장비 목록
 * @param {number} excludeDeviceId - 제외할 장비 ID (자기 자신 제외용)
 * @returns {boolean} 충돌 여부
 */
export function checkCollision(
  newDevice: {
    position: number;
    height: number;
  },
  existingDevices: Equipments[],
  excludeDeviceId?: number
): boolean {
  const newRange = {
    bottom: newDevice.position,
    top: newDevice.position + newDevice.height - 1,
  };

  return existingDevices.some((device) => {
    if (excludeDeviceId !== undefined && device.id === excludeDeviceId) {
      return false;
    }

    const existingRange = {
      bottom: device.startUnit,
      top: device.startUnit + device.unitSize - 1,
    };

    return Overlapping(newRange, existingRange);
  });
}

/**
 * 충돌하는 장비 찾기
 * @param {Object} newDevice - 새 장비 정보
 * @param {number} newDevice.position - 시작 U 위치
 * @param {number} newDevice.height - 장비 높이 (U)
 * @param {Equipments[]} existingDevices - 기존 장비 목록
 * @param {number} excludeDeviceId - 제외할 장비 ID (자기 자신 제외용)
 * @returns {Equipments | null} 충돌하는 장비 또는 null
 */
export function findCollidingDevice(
  newDevice: {
    position: number;
    height: number;
  },
  existingDevices: Equipments[],
  excludeDeviceId?: number
): Equipments | null {
  const newRange = {
    bottom: newDevice.position,
    top: newDevice.position + newDevice.height - 1,
  };
  const collidingDevice = existingDevices.find((device) => {
    if (excludeDeviceId !== undefined && device.id == excludeDeviceId) {
      return false;
    }
    const existingRange = {
      bottom: device.startUnit,
      top: device.startUnit + device.unitSize - 1,
    };
    return Overlapping(newRange, existingRange);
  });
  return collidingDevice || null;
}
