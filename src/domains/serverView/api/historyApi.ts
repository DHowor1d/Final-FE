import client from "@/api/client";

export interface HistoryRecord {
  id: number;
  serverRoomId: number;
  entityType: "EQUIPMENT" | "RACK" | "DEVICE";
  entityId: number;
  entityName: string;
  entityCode: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  changedBy: number;
  changedByName: string;
  changedByRole: string;
  changedAt: string;
  changedFields: string[];
  beforeValue: Record<string, unknown> | null;
  afterValue: Record<string, unknown> | null;
  description: string | null;
}

export interface HistoryResponse {
  status_code: number;
  status_message: string;
  result: {
    content: HistoryRecord[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
    size: number;
    number: number;
    empty: boolean;
  };
}

export interface HistoryParams {
  page?: number;
  size?: number;
  entityType?: string;
  action?: string;
}

export const historyApi = {
  // 서버실 히스토리 조회
  getServerRoomHistory: async (
    serverRoomId: number,
    params: HistoryParams = {}
  ): Promise<HistoryResponse> => {
    const { page = 0, size = 20, entityType, action } = params;
    const response = await client.get<HistoryResponse>(
      `/history/serverroom/${serverRoomId}`,
      {
        params: { page, size, entityType, action },
      }
    );
    return response.data;
  },
};
