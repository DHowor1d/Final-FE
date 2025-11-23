import { useEffect } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { getAccessToken, BASE_URL } from "@/api/client";
import { useMonitoringStore } from "../stores/monitoringStore";
import type {
  DiskMonitoringData,
  NetworkMonitoringData,
  SystemMonitoringData,
} from "../types";

export const useEquipmentSSE = (
  equipmentId: number,
  enabled: boolean = true
) => {
  const { setSystemData, setDiskData, setNetworkData } = useMonitoringStore();

  useEffect(() => {
    if (!enabled || !equipmentId) return;

    const token = getAccessToken();
    if (!token) {
      return;
    }

    const url = `${BASE_URL}/monitoring/subscribe/equipment/${equipmentId}`;

    const eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    eventSource.addEventListener("system", (event) => {
      try {
        const data: SystemMonitoringData = JSON.parse(event.data);
        setSystemData(data);
      } catch (error) {
        console.error("System data parse error:", error);
      }
    });

    eventSource.addEventListener("disk", (event) => {
      try {
        const data: DiskMonitoringData = JSON.parse(event.data);
        setDiskData(data);
      } catch (error) {
        console.error("Disk data parse error:", error);
      }
    });

    eventSource.addEventListener("network", (event) => {
      try {
        const data: NetworkMonitoringData[] = JSON.parse(event.data);
        setNetworkData(data);
      } catch (error) {
        console.error("Network data parse error:", error);
      }
    });

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [equipmentId, enabled, setSystemData, setDiskData, setNetworkData]);
};
