import client from "@/api/client";
import type { UpdateEquipmentRequest } from "../types";

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

export interface UpdateEquipmentResponse {
  status_code: number;
  status_message: string;
  result: EquipmentDetail;
}

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
