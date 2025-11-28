/**
 * @author dhowor1d
 * @description 서버실 장비 관리 API - 서버실 장비의 CRUD 작업을 처리하는 API 함수 모음
 * 백엔드 API와 통신하여 장비 목록 조회, 생성, 수정, 삭제 수행
 * 백엔드 데이터 구조를 프론트엔드 Equipment3D 타입으로 변환
 * 장비 생성 시 자동으로 고유 코드 생성 및 그리드 위치 검증
 * 랙 생성 및 장비 업데이트를 위한 요청 빌더 사용
 * 에러 발생 시 적절한 에러 메시지와 함께 throw
 */

import client from "@api/client";
import type {
  Equipment3D,
  ServerRoomEquipmentResponse,
  CreateDeviceResponse,
  CreateRackResponse,
  UpdateDeviceResponse,
} from "../../types";
import { DEFAULT_GRID_CONFIG } from "../../constants/config";
import { getNextDeviceNumber, generateDeviceCode } from "../utils/deviceNameGenerator";
import {
  transformBackendDevicesToEquipment,
  transformBackendDeviceToEquipment,
} from "../transformers/equipmentTransformer";
import {
  buildCreateDeviceRequest,
  buildCreateRackRequest,
  buildUpdateDeviceRequest,
} from "../transformers/requestBuilder";

// 공통 API 클라이언트 사용
const apiClient = client;

/**
 * @function fetchServerRoomEquipment
 * @description 서버실의 장비 목록 조회
 * @param {string} serverRoomId - 서버실 ID
 * @returns {Promise} 장비 목록, 그리드 설정 정보, 서버실 이름
 */
export async function fetchServerRoomEquipment(
  serverRoomId: string,
): Promise<{ equipment: Equipment3D[]; gridConfig: { rows: number; columns: number; cellSize: number }; serverRoomName: string }> {
  try {
    const response = await apiClient.get<ServerRoomEquipmentResponse>(
      `/devices/serverroom/${serverRoomId}`,
    );

    // 새로운 API 구조에서 데이터 추출
    const { serverRoom, devices } = response.data.result;

    // 백엔드 디바이스 데이터를 프론트엔드 형식으로 변환
    const equipment = transformBackendDevicesToEquipment(devices);

    // 서버실 그리드 설정 반환 
    const gridConfig = {
      rows: serverRoom.rows,
      columns: serverRoom.columns,
      cellSize: DEFAULT_GRID_CONFIG.cellSize, 
    };

    return { equipment, gridConfig, serverRoomName: serverRoom.name };
  } catch (error) {
    console.error("Failed to fetch server room equipment:", error);
    throw error;
  }
}

/**
 * 서버실 장비 배치 저장 (레거시 API - deprecated)
 * @deprecated 개별 장비 업데이트 API 사용 권장
 */
export async function saveServerRoomEquipment(
  serverRoomId: string,
  equipment: Equipment3D[],
): Promise<void> {
  try {
    // 레거시 변환 로직 유지 (추후 제거 예정)
    const backendEquipment = equipment.map((item) => ({
      equipmentType: item.type,
      rackId: item.rackId,
      gridPosition: {
        x: item.gridX,
        y: item.gridY,
        z: item.gridZ,
      },
      rotation: item.rotation,
      metadata: item.metadata,
    }));

    await apiClient.post(
      `/server-rooms/${serverRoomId}/equipment`,
      backendEquipment,
    );
  } catch (error) {
    console.error("Failed to save server room equipment:", error);
    throw error;
  }
}

/**
 * 특정 장비 업데이트 (위치, 회전, 메타데이터)
 * PUT /api/devices/{deviceId}
 * 
 * @param equipment 업데이트할 장비 정보 (equipmentId와 변경할 필드 포함)
 * @returns 업데이트된 장비 정보
 */
export async function updateEquipment(
  equipment: Equipment3D,
): Promise<Equipment3D> {
  try {
    const requestData = buildUpdateDeviceRequest(equipment);

    const response = await apiClient.put<UpdateDeviceResponse>(
      `/devices/${equipment.equipmentId}`,
      requestData,
    );

    const updatedDevice = response.data.result;

    // 백엔드 응답을 프론트엔드 형식으로 변환
    return transformBackendDeviceToEquipment(updatedDevice);
  } catch (error) {
    console.error("Failed to update equipment:", error);
    throw error;
  }
}

/**
 * 장비 삭제
 * - server 타입: rack 삭제 API 호출 (백엔드에서 자동으로 server 장치 삭제됨)
 * - 기타 타입: device 삭제 API 호출
 * 
 * @param equipment 삭제할 장비 정보 (타입 및 rackId 확인용)
 */
export async function deleteEquipment(
  equipment: Equipment3D,
): Promise<void> {
  try {
    // server 타입인 경우 rack 삭제 (cascade로 device도 삭제됨)
    if (equipment.type === "server" && equipment.rackId) {
      await apiClient.delete(`/racks/${equipment.rackId}`);
    } else {
      // 기타 장비는 device 삭제
      await apiClient.delete(`/devices/${equipment.equipmentId}`);
    }
  } catch (error) {
    console.error("Failed to delete equipment:", error);
    throw error;
  }
}

/**
 * 새 장비 추가 (레거시 API - deprecated)
 * @deprecated createDevice 함수 사용 권장
 */
export async function addEquipment(
  serverRoomId: string,
  equipment: Omit<Equipment3D, "id" | "equipmentId">,
): Promise<Equipment3D> {
  try {
    // 레거시 변환 로직 유지
    const response = await apiClient.post<{
      equipmentId: string;
      equipmentType: string;
      rackId?: string;
      gridPosition: { x: number; y: number; z: number };
      rotation: number;
      metadata?: Record<string, unknown>;
    }>(
      `/server-rooms/${serverRoomId}/equipment/add`,
      {
        equipmentType: equipment.type,
        rackId: equipment.rackId,
        gridPosition: {
          x: equipment.gridX,
          y: equipment.gridY,
          z: equipment.gridZ,
        },
        rotation: equipment.rotation,
        metadata: equipment.metadata,
      },
    );

    // 생성된 장비를 프론트엔드 형식으로 변환
    return {
      id: response.data.equipmentId,
      type: response.data.equipmentType as Equipment3D["type"],
      gridX: response.data.gridPosition.x,
      gridY: response.data.gridPosition.y,
      gridZ: response.data.gridPosition.z,
      rotation: response.data.rotation,
      equipmentId: response.data.equipmentId,
      rackId: response.data.rackId,
      metadata: response.data.metadata as Equipment3D["metadata"],
    };
  } catch (error) {
    console.error("Failed to add equipment:", error);
    throw error;
  }
}

/**
 * 새 랙 생성
 * server 타입 장비를 추가할 때 먼저 호출하여 Rack 테이블에 레코드 생성
 * @param equipment 랙으로 생성할 장비 정보
 * @param serverRoomId 서버실 ID
 * @returns 생성된 랙 ID
 */
async function createRack(
  equipment: Omit<Equipment3D, "id" | "equipmentId">,
  serverRoomId: number,
): Promise<number> {
  const rackRequest = buildCreateRackRequest(equipment, serverRoomId);

  const response = await apiClient.post<CreateRackResponse>(
    `/racks`,
    rackRequest,
  );

  return response.data.result.id;
}

/**
 * 새 장비 생성 (실제 POST /api/devices 사용)
 * - server 타입: 먼저 Rack 생성 후 Device 생성 (rackId 자동 할당)
 * - 기타 타입: Device만 생성
 * 
 * @param equipment 추가할 장비 정보
 * @param serverRoomId 서버실 ID
 * @param existingEquipment 기존 장비 목록 (카운터 기반 코드 생성용)
 * @returns 생성된 장비 정보
 */
export async function createDevice(
  equipment: Omit<Equipment3D, "id" | "equipmentId">,
  serverRoomId: number,
  existingEquipment: Equipment3D[] = [],
): Promise<Equipment3D> {
  try {
    // server 타입인 경우 먼저 랙 생성
    let rackId: number | null = null;
    if (equipment.type === "server") {
      rackId = await createRack(equipment, serverRoomId);
    }

    // 장비 코드 생성 (최대 번호 + 1 방식)
    const nextNumber = getNextDeviceNumber(existingEquipment, equipment.type, serverRoomId);
    const deviceCode = generateDeviceCode(equipment.type, serverRoomId, nextNumber);

    const requestData = buildCreateDeviceRequest(
      equipment,
      deviceCode,
      serverRoomId,
      rackId ?? undefined
    );

    const response = await apiClient.post<CreateDeviceResponse>(
      `/devices`,
      requestData,
    );

    const createdDevice = response.data.result;

    // 백엔드 응답을 프론트엔드 형식으로 변환
    return transformBackendDeviceToEquipment(createdDevice);
  } catch (error) {
    console.error("Failed to create device:", error);
    throw error;
  }
}
