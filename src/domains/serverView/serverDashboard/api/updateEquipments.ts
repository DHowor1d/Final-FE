/**
 * @author 구희원
 * @description 장비 상세 정보 수정 API
 */

import client from "@/api/client";
import type { UpdateEquipmentRequest } from "../types";

/**
 * 장비 상세 정보
 */
export interface EquipmentDetail {
  id: number;
  equipmentName: string;
  equipmentCode: string | null;
  equipmentType: string;
  startUnit: number;
  unitSize: number;
  positionType: string;
  modelName: string | null;
  manufacturer: string | null;
  serialNumber: string | null;
  ipAddress: string | null;
  macAddress: string | null;
  os: string | null;
  cpuSpec: string | null;
  memorySpec: string | null;
  diskSpec: string | null;
  powerConsumption: number | null;
  weight: number | null;
  status: string;
  installationDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  rackId: number;
  rackName: string;
  serverRoomId: number;
  monitoringEnabled: boolean;
  cpuThresholdWarning: number;
  cpuThresholdCritical: number;
  memoryThresholdWarning: number;
  memoryThresholdCritical: number;
  diskThresholdWarning: number;
  diskThresholdCritical: number;
}

/**
 * 장비 수정 API 응답
 */
export interface UpdateEquipmentResponse {
  status_code: number;
  status_message: string;
  result: EquipmentDetail;
}

/**
 * 장비 상세 정보 수정
 * @param {number} id - 수정할 장비 ID
 * @param {UpdateEquipmentRequest} data - 수정할 장비 정보
 * @returns {Promise<UpdateEquipmentResponse>} 수정된 장비 정보
 */
export const updateEquipment = async (
  id: number,
  data: UpdateEquipmentRequest
): Promise<UpdateEquipmentResponse> => {
  const response = await client.put<UpdateEquipmentResponse>(
    `/equipments/${id}`,
    data
  );
  return response.data;
};
