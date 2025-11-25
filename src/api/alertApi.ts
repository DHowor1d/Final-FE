import client from "./client";

export interface Alert {
  alertId: number;
  equipmentId: number;
  rackId: number;
  serverRoomId: number;
  dataCenterId: number;
  targetName: string;
  targetType: string;
  metricType: string;
  metricName: string;
  level: string;
  measuredValue: number;
  thresholdValue: number;
  triggeredAt: string;
  isRead: boolean;
  readAt: string | null;
  readBy: string | null;
  message: string;
  additionalInfo: string | null;
  createdAt: string;
}

export interface AlertsResponse {
  totalPages: number;
  pageSize: number;
  hasPrevious: boolean;
  hasNext: boolean;
  currentPage: number;
  content: Alert[];
  totalElements: number;
}

export interface AlertsParams {
  page?: number;
  size?: number;
  days?: number;
}

export const alertApi = {
  // 알림 목록 조회
  getAlerts: async (params: AlertsParams = {}): Promise<AlertsResponse> => {
    const { page = 0, size = 10, days = 7 } = params;
    const response = await client.get<AlertsResponse>("/alerts", {
      params: { page, size, days },
    });
    return response.data;
  },

  // 알림 읽음 처리
  markAsRead: async (alertId: number): Promise<void> => {
    await client.patch(`/alerts/${alertId}/read`);
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async (): Promise<void> => {
    await client.patch("/alerts/read-all");
  },

  // 알림 삭제
  deleteAlert: async (alertId: number): Promise<void> => {
    await client.delete(`/alerts/${alertId}`);
  },

  // 모든 알림 삭제
  deleteAllAlerts: async (): Promise<void> => {
    await client.delete("/alerts/delete-all");
  },
};
