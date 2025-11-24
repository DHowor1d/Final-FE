import { useEffect } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { getAccessToken, BASE_URL } from "@/api/client";
import type { DiskMonitoringData, SystemMonitoringData } from "../types";
import {
  useMonitoringStore,
  type SimpleMetrics,
} from "../stores/monitoringStore";

interface SSEEvent extends Event {
  data: string;
}

const isSystemMonitoringData = (
  data: unknown
): data is SystemMonitoringData => {
  return typeof data === "object" && data !== null && "cpuIdle" in data;
};

const isDiskMonitoringData = (data: unknown): data is DiskMonitoringData => {
  return typeof data === "object" && data !== null && "usedPercentage" in data;
};

// 메트릭 추출 함수
const extractMetricsFromSystemData = (
  systemData: SystemMonitoringData | null,
  diskData: DiskMonitoringData | null
): SimpleMetrics | null => {
  if (!systemData) return null;

  const cpu = Math.max(0, 100 - systemData.cpuIdle);
  const memory = systemData.usedMemoryPercentage || 0;
  const disk = diskData?.usedPercentage || 0;

  return {
    cpu: Number(cpu.toFixed(1)),
    memory: Number(memory.toFixed(1)),
    disk: Number(disk.toFixed(1)),
  };
};

// 여러 장비의 백그라운드 메트릭을 동시에 수집합니다

export const useAllEquipmentBackgroundSSE = (equipmentIds: number[]) => {
  const setDeviceMetrics = useMonitoringStore(
    (state) => state.setDeviceMetrics
  );

  useEffect(() => {
    // equipmentIds가 없으면 리턴
    if (!equipmentIds || equipmentIds.length === 0) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      return;
    }

    // 각 장비별 SSE 연결 저장
    const eventSourceMap = new Map<number, EventSource>();

    const connectToEquipment = (equipmentId: number) => {
      try {
        const url = `${BASE_URL}/monitoring/subscribe/equipment/${equipmentId}`;

        let latestSystemData: SystemMonitoringData | null = null;

        const eventSource = new EventSourcePolyfill(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }) as EventSource;

        // System 데이터 수신
        eventSource.addEventListener("system", (event: Event) => {
          try {
            const sseEvent = event as SSEEvent;
            const parsedData = JSON.parse(sseEvent.data);

            if (isSystemMonitoringData(parsedData)) {
              latestSystemData = parsedData;
            }
          } catch (error) {
            console.error(error);
          }
        });

        // Disk 데이터 수신 → 메트릭 업데이트
        eventSource.addEventListener("disk", (event: Event) => {
          try {
            const sseEvent = event as SSEEvent;
            const parsedData = JSON.parse(sseEvent.data);

            if (isDiskMonitoringData(parsedData)) {
              const metrics = extractMetricsFromSystemData(
                latestSystemData,
                parsedData
              );
              if (metrics) {
                setDeviceMetrics(equipmentId, metrics);
              }
            } else {
              console.warn(
                `[Equipment ${equipmentId}] Invalid disk data:`,
                parsedData
              );
            }
          } catch (error) {
            console.error(
              `[Equipment ${equipmentId}] Disk data parse error:`,
              error
            );
          }
        });

        eventSource.onerror = (error) => {
          console.error(
            `[Equipment ${equipmentId}] SSE connection error:`,
            error
          );
          eventSource.close();
          eventSourceMap.delete(equipmentId);

          setTimeout(() => {
            if (equipmentIds.includes(equipmentId)) {
              connectToEquipment(equipmentId);
            }
          }, 3000);
        };

        eventSourceMap.set(equipmentId, eventSource);
      } catch (error) {
        console.error(
          `[Equipment ${equipmentId}] Failed to create SSE connection:`,
          error
        );
      }
    };

    // 모든 장비에 동시 연결
    equipmentIds.forEach((equipmentId) => {
      connectToEquipment(equipmentId);
    });

    // Cleanup
    return () => {
      eventSourceMap.forEach((eventSource, equipmentId) => {
        console.log(`[Equipment ${equipmentId}] Closing SSE connection`);
        eventSource.close();
      });
      eventSourceMap.clear();
    };
  }, [equipmentIds, setDeviceMetrics]);
};
