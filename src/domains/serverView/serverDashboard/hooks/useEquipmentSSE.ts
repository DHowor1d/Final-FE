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

const createEventHandler = <T>(
  typeGuard: (data: unknown) => data is T,
  setter: (data: T) => void,
  eventName: string
) => {
  return (event: Event) => {
    try {
      const sseEvent = event as SSEEvent;
      const parsedData: unknown = JSON.parse(sseEvent.data);

      if (typeGuard(parsedData)) {
        setter(parsedData);
      } else {
        console.warn(
          `Invalid ${eventName} monitoring data format:`,
          parsedData
        );
      }
    } catch (error) {
      console.error(`${eventName} data parse error:`, error);
    }
  };
};

export const useEquipmentSSE = (
  equipmentId: number,
  enabled: boolean = true
) => {
  const setSystemData = useMonitoringStore((state) => state.setSystemData);
  const setDiskData = useMonitoringStore((state) => state.setDiskData);
  const setNetworkData = useMonitoringStore((state) => state.setNetworkData);

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

      eventSource.addEventListener(
        "system",
        createEventHandler(isSystemMonitoringData, setSystemData, "system")
      );

      eventSource.addEventListener(
        "disk",
        createEventHandler(isDiskMonitoringData, setDiskData, "disk")
      );

      eventSource.addEventListener(
        "network",
        createEventHandler(
          isNetworkMonitoringDataArray,
          setNetworkData,
          "network"
        )
      );

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
