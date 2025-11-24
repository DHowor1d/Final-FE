// ============================================================================
// useEquipmentSSE.ts - 콜백 패턴 (안정적 버전)
// ============================================================================

import { useEffect, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { getAccessToken, BASE_URL } from "@/api/client";
import type {
  DiskMonitoringData,
  NetworkMonitoringData,
  SystemMonitoringData,
} from "../types";

interface SSECallbacks {
  onSystemData?: (data: SystemMonitoringData) => void;
  onDiskData?: (data: DiskMonitoringData) => void;
  onNetworkData?: (data: NetworkMonitoringData[]) => void;
  onError?: (error: Event) => void;
}

export const useEquipmentSSE = (
  equipmentId: number | null,
  callbacks: SSECallbacks,
  enabled: boolean = true
) => {
  // ✅ useRef로 콜백 참조 유지 (매번 새로 생성되어도 dependency에 영향 없음)
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

      eventSource.onerror = (error) => {
        console.error(`[Equipment ${equipmentId}] SSE Error:`, error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error(
        `[Equipment ${equipmentId}] Failed to create SSE connection:`,
        error
      );
    }
    // ✅ equipmentId와 enabled만 dependency에 포함 (callbacks는 제외)
  }, [equipmentId, enabled]);
};
