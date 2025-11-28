/**
 * @author 구희원
 * @description 장비 타입별 색상 매핑
 */

/**
 * 장비 타입별 색상 맵
 * @property {string} SERVER - 서버 색상 (하늘색)
 * @property {string} SWITCH - 스위치 색상 (빨강)
 * @property {string} ROUTER - 라우터 색상 (노랑)
 * @property {string} STORAGE - 스토리지 색상 (초록)
 * @property {string} FIREWALL - 방화벽 색상 (진한 빨강)
 * @property {string} LOAD_BALANCER - 로드밸런서 색상 (청록)
 * @property {string} KVM - KVM 색상 (분홍)
 */
export const typeColorMap: Record<string, string> = {
  SERVER: "#38bdf8",
  SWITCH: "#E80054",
  ROUTER: "#fbbf24",
  STORAGE: "#34d399",
  FIREWALL: "#8B0000",
  LOAD_BALANCER: "#06b6d4",
  KVM: "#ec4899",
};
