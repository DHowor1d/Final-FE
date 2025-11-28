/**
 * @author 구희원
 * @description 장비 드래그 경계 제한 유틸리티
 */

/**
 * 장비 드래그 시 경계 제한 및 그리드 스냅
 * @param {Object} pos - 현재 마우스 위치
 * @param {number} pos.x - X 좌표
 * @param {number} pos.y - Y 좌표
 * @param {Object} config - 랙 설정
 * @param {number} config.baseY - 랙 시작 Y 좌표
 * @param {number} config.rackHeight - 랙 높이
 * @param {number} config.deviceHeight - 장비 높이
 * @param {number} config.unitHeight - 1U 높이
 * @returns {Object} 제한된 위치 좌표 { x, y }
 */
export function dragBound(
  pos: { x: number; y: number },
  config: {
    baseY: number;
    rackHeight: number;
    deviceHeight: number;
    unitHeight: number;
  }
) {
  const minY = config.baseY;
  const maxY = config.baseY + config.rackHeight - config.deviceHeight;

  const relativeY = pos.y - config.baseY;
  const snappedRelativeY =
    Math.round(relativeY / config.unitHeight) * config.unitHeight;
  const snappedY = snappedRelativeY + config.baseY;

  const clampedY = Math.max(minY, Math.min(maxY, snappedY));

  return {
    x: 0,
    y: clampedY,
  };
}
