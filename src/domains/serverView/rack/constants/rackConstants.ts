/**
 * @author 구희원
 * @description 랙 설정 상수
 */

/**
 * 랙의 총 U 수 (42U 표준 랙)
 */
export const UNIT_COUNT = 42;

/**
 * 랙 렌더링 설정
 * @property {number} width - 랙 너비 (px)
 * @property {number} height - 랙 높이 (px)
 * @property {number} frameThickness - 프레임 두께 (px)
 * @property {number} panelWidth - 패널 너비 (px)
 * @property {number} leftPanelOffset - 왼쪽 패널 오프셋 (px)
 * @property {number} unitHeight - 1U 높이 (px)
 */
export const RACK_CONFIG = {
  width: 350,
  height: 700,
  frameThickness: 10,
  panelWidth: 5,
  leftPanelOffset: -5,
  unitHeight: 40,
} as const;
