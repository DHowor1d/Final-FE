// useEquipmentSSE.ts - 타입 수정
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
  const callbacksRef = useRef(callbacks);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!enabled || !equipmentId) {
      reconnectAttemptsRef.current = 0;
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const url = `${BASE_URL}/monitoring/subscribe/equipment/${equipmentId}`;
    let eventSource: EventSource | null = null;
    let reconnectTimeout: number | null = null; // 🔥 여기 수정

    const connect = () => {
      try {
        console.log(
          `[Equipment ${equipmentId}] Establishing SSE connection...`
        );

        eventSource = new EventSourcePolyfill(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          heartbeatTimeout: 120000,
        }) as EventSource;

        eventSource.addEventListener("system", (event) => {
          try {
            const data: SystemMonitoringData = JSON.parse(event.data);
            reconnectAttemptsRef.current = 0;
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

          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          callbacksRef.current.onError?.(error);

          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            const delay =
              RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1);

            console.log(
              `[Equipment ${equipmentId}] Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`
            );

            reconnectTimeout = window.setTimeout(() => {
              // 🔥 window.setTimeout으로 명시
              if (enabled) {
                connect();
              }
            }, delay);
          } else {
            console.error(
              `[Equipment ${equipmentId}] Max reconnection attempts reached`
            );
          }
        };

        eventSource.onopen = () => {
          console.log(`[Equipment ${equipmentId}] SSE connection established`);
          reconnectAttemptsRef.current = 0;
        };
      } catch (error) {
        console.error(
          `[Equipment ${equipmentId}] Failed to create SSE connection:`,
          error
        );
      }
    };

    connect();

    return () => {
      console.log(`[Equipment ${equipmentId}] Closing SSE connection`);

      if (reconnectTimeout !== null) {
        window.clearTimeout(reconnectTimeout); // 🔥 window.clearTimeout으로 명시
      }

      if (eventSource) {
        eventSource.close();
      }

      reconnectAttemptsRef.current = 0;
    };
  }, [equipmentId, enabled]);
};
