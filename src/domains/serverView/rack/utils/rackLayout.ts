/**
 * @author 구희원
 * @description 랙 레이아웃 계산 유틸리티
 */

import { RACK_CONFIG, UNIT_COUNT } from "../constants/rackConstants";

/**
 * 랙 레이아웃 계산
 * @param {typeof RACK_CONFIG} config - 랙 설정
 * @returns {Object} 계산된 랙 레이아웃
 * @returns {number} rackHeight - 랙 높이
 * @returns {number} baseY - 랙 시작 Y 좌표
 * @returns {number} fullWidth - 전체 너비 (프레임 포함)
 * @returns {number} fullHeight - 전체 높이 (프레임 포함)
 * @returns {number} rackX - 랙 X 좌표 (중앙 정렬)
 */
export function rackLayout(config: typeof RACK_CONFIG) {
  const rackHeight = UNIT_COUNT * config.unitHeight;
  const baseY = config.frameThickness;

  const fullWidth =
    config.width + config.frameThickness * 2 + config.panelWidth * 2;
  const fullHeight = rackHeight + config.frameThickness * 2;

  const rackX = (fullWidth - config.width) / 2;

  return { rackHeight, baseY, fullWidth, fullHeight, rackX };
}
