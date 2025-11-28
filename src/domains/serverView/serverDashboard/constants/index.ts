/**
 * @author 구희원
 * @description 서버 대시보드 차트 설정 상수
 */

/**
 * 차트 설정
 * @property {number} MAX_POINTS - 차트에 표시할 최대 데이터 포인트 수
 * @property {Object} COLORS - 차트 색상 맵
 */
export const CHART_CONFIG = {
  MAX_POINTS: 12,
  COLORS: {
    cpuUser: "#5B8FF9",
    cpuSystem: "#9270CA",
    ioWait: "#F6BD16",
    irq: "#5AD8A6",
    softirq: "#f472b6",
    swap: "#F6BD16",
    steal: "#5AD8A6",
    rx: "#5AD8A6",
    tx: "#F6BD16",
    diskRead: "#5AD8A6",
    diskWrite: "#F6BD16",
    inode: "#5AD8A6",
  },
} as const;

/**
 * 임계값 기본값
 * @property {Object} cpu - CPU 임계값 (warning: 경고, critical: 위험)
 * @property {Object} memory - 메모리 임계값
 * @property {Object} disk - 디스크 임계값
 */
export const DEFAULT_THRESHOLD_VALUES = {
  cpu: { warning: 0, critical: 0 },
  memory: { warning: 0, critical: 0 },
  disk: { warning: 0, critical: 0 },
} as const;
