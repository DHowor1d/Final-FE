import { useEffect } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { getAccessToken, BASE_URL } from "@/api/client";
import { useMonitoringStore } from "../stores/monitoringStore";
import type {
  DiskMonitoringData,
  NetworkMonitoringData,
  SystemMonitoringData,
} from "../types";

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

const isNetworkMonitoringDataArray = (
  data: unknown
): data is NetworkMonitoringData[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" && item !== null && "generateTime" in item
    )
  );
};

export const useEquipmentSSE = (
  equipmentId: number,
  enabled: boolean = true
) => {
  const { setSystemData, setDiskData, setNetworkData } = useMonitoringStore();

  useEffect(() => {
    if (!enabled || !equipmentId) return;

    const token = getAccessToken();
    if (!token) {
      console.warn("No access token available for SSE connection");
      return;
    }

    const url = `${BASE_URL}/monitoring/subscribe/equipment/${equipmentId}`;

    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSourcePolyfill(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }) as EventSource;

      eventSource.addEventListener("system", (event: Event) => {
        try {
          const sseEvent = event as SSEEvent;
          const parsedData: unknown = JSON.parse(sseEvent.data);

          if (isSystemMonitoringData(parsedData)) {
            setSystemData(parsedData);
          } else {
            console.warn("Invalid system monitoring data format:", parsedData);
          }
        } catch (error) {
          console.error("System data parse error:", error);
        }
      });

      eventSource.addEventListener("disk", (event: Event) => {
        try {
          const sseEvent = event as SSEEvent;
          const parsedData: unknown = JSON.parse(sseEvent.data);

          if (isDiskMonitoringData(parsedData)) {
            setDiskData(parsedData);
          } else {
            console.warn("Invalid disk monitoring data format:", parsedData);
          }
        } catch (error) {
          console.error("Disk data parse error:", error);
        }
      });

      eventSource.addEventListener("network", (event: Event) => {
        try {
          const sseEvent = event as SSEEvent;
          const parsedData: unknown = JSON.parse(sseEvent.data);

          if (isNetworkMonitoringDataArray(parsedData)) {
            setNetworkData(parsedData);
          } else {
            console.warn("Invalid network monitoring data format:", parsedData);
          }
        } catch (error) {
          console.error("Network data parse error:", error);
        }
      });

      eventSource.onerror = (error: Event) => {
        console.error("SSE Error:", error);
        if (eventSource) {
          eventSource.close();
        }
      };
    } catch (error) {
      console.error("Failed to create SSE connection:", error);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [equipmentId, enabled, setSystemData, setDiskData, setNetworkData]);
};
