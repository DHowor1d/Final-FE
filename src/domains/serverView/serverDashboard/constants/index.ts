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

// 임계값 기본값
export const DEFAULT_THRESHOLD_VALUES = {
  cpu: { warning: 0, critical: 0 },
  memory: { warning: 0, critical: 0 },
  disk: { warning: 0, critical: 0 },
} as const;
