/**
 * @author 구희원
 * @description 단일 장비 SSE 연결 훅
 */

import { useEffect, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { getAccessToken, BASE_URL } from "@/api/client";
import type {
  DiskMonitoringData,
  NetworkMonitoringData,
  SystemMonitoringData,
} from "../types";

/**
 * SSE 콜백
 */
interface SSECallbacks {
  onSystemData?: (data: SystemMonitoringData) => void;
  onDiskData?: (data: DiskMonitoringData) => void;
  onNetworkData?: (data: NetworkMonitoringData[]) => void;
  onError?: (error: Event) => void;
}

/**
 * 단일 장비 SSE 연결 훅
 *
 * 선택된 장비의 실시간 모니터링 데이터(System, Disk, Network)를 수신합니다.
 * 대시보드가 열려있고 장비가 선택된 경우에만 연결됩니다.
 *
 * @param {number | null} equipmentId - 모니터링할 장비 ID
 * @param {SSECallbacks} callbacks - SSE 이벤트 콜백
 * @param {boolean} enabled - SSE 연결 활성화 여부 (기본값: true)
 */
export const useEquipmentSSE = (
  equipmentId: number | null,
  callbacks: SSECallbacks,
  enabled: boolean = true
) => {
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!enabled || !equipmentId) return;

    const token = getAccessToken();
    if (!token) return;

    const url = `${BASE_URL}/monitoring/subscribe/equipment/${equipmentId}`;

    try {
      const eventSource = new EventSourcePolyfill(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // System 데이터 수신
      eventSource.addEventListener("system", (event) => {
        try {
          const data: SystemMonitoringData = JSON.parse(event.data);
          callbacksRef.current.onSystemData?.(data);
        } catch (error) {
          console.error(
            `[Equipment ${equipmentId}] System data parse error:`,
            error
          );
        }
      });

      // Disk 데이터 수신
      eventSource.addEventListener("disk", (event) => {
        try {
          const data: DiskMonitoringData = JSON.parse(event.data);
          callbacksRef.current.onDiskData?.(data);
        } catch (error) {
          console.error(
            `[Equipment ${equipmentId}] Disk data parse error:`,
            error
          );
        }
      });

      // Network 데이터 수신
      eventSource.addEventListener("network", (event) => {
        try {
          const data: NetworkMonitoringData[] = JSON.parse(event.data);
          callbacksRef.current.onNetworkData?.(data);
        } catch (error) {
          console.error(
            `[Equipment ${equipmentId}] Network data parse error:`,
            error
          );
        }
      });

      // 에러 처리
      eventSource.onerror = (error) => {
        console.error(`[Equipment ${equipmentId}] SSE Error:`, error);
        eventSource.close();
      };

      // Cleanup
      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error(
        `[Equipment ${equipmentId}] Failed to create SSE connection:`,
        error
      );
    }
  }, [equipmentId, enabled]);
};
