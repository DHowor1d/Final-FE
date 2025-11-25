import { useEffect, useState, useRef, useCallback } from 'react';
import { createAlertSSE } from '@/api/sseClient';
import { alertApi, type Alert } from '@/api/alertApi';

export interface RackAlert {
  rackId: number;
  level: 'CRITICAL' | 'WARNING';
  latestAlert: Alert;
}

/**
 * 서버실 알림을 실시간으로 수신하고 랙별 알림 상태를 관리하는 Hook
 * @param serverRoomId 서버실 ID (없으면 전체 알림 수신)
 */
export const useServerRoomAlerts = (serverRoomId?: number) => {
  const [rackAlerts, setRackAlerts] = useState<Map<number, RackAlert>>(new Map());
  const sseConnectionRef = useRef<ReturnType<typeof createAlertSSE> | null>(null);
  const clearTimersRef = useRef<number[]>([]);

  const shouldProcessAlert = useCallback(
    (alert: Alert) => {
      if (!alert.rackId) return false;
      if (serverRoomId && alert.serverRoomId !== serverRoomId) return false;
      return alert.targetType === 'RACK' || alert.targetType === 'EQUIPMENT';
    },
    [serverRoomId],
  );

  const upsertAlert = useCallback((map: Map<number, RackAlert>, alert: Alert) => {
    const rackId = alert.rackId!;
    const level = (alert.level === 'CRITICAL' ? 'CRITICAL' : 'WARNING') as 'CRITICAL' | 'WARNING';
    const existing = map.get(rackId);

    // CRITICAL 우선 순위, WARNING은 동일 레벨만 갱신
    if (!existing || level === 'CRITICAL' || existing.level === 'WARNING') {
      map.set(rackId, {
        rackId,
        level,
        latestAlert: alert,
      });
    }

    return map;
  }, []);

  const scheduleAlertCleanup = useCallback((alert: Alert) => {
    const timeoutId = window.setTimeout(() => {
      setRackAlerts((prev) => {
        const newMap = new Map(prev);
        if (alert.rackId) {
          const existing = newMap.get(alert.rackId);
          if (existing && existing.latestAlert.alertId === alert.alertId) {
            newMap.delete(alert.rackId);
          }
        }
        return newMap;
      });
    }, 300000);

    clearTimersRef.current.push(timeoutId);
  }, []);

  const processAlert = useCallback(
    (alert: Alert) => {
      if (!shouldProcessAlert(alert)) return;

      setRackAlerts((prev) => {
        const newMap = new Map(prev);
        return upsertAlert(newMap, alert);
      });

      scheduleAlertCleanup(alert);
    },
    [shouldProcessAlert, scheduleAlertCleanup, upsertAlert],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchInitialAlerts = async () => {
      try {
        const response = await alertApi.getAlerts({ page: 0, size: 200, days: 1 });
        if (!isMounted) return;

        const relevantAlerts = response.content.filter(shouldProcessAlert);

        setRackAlerts((prev) => {
          let newMap = new Map(prev);
          relevantAlerts.forEach((alert) => {
            newMap = upsertAlert(newMap, alert);
            scheduleAlertCleanup(alert);
          });
          return newMap;
        });
      } catch (error) {
        console.error('Failed to fetch initial alerts:', error);
      }
    };

    fetchInitialAlerts();

    // SSE 연결 생성
    const connection = createAlertSSE<Alert>({
      onMessage: (alert) => {
        processAlert(alert);
      },
      onError: (error) => {
        console.error('Alert SSE error in useServerRoomAlerts:', error);
      },
      onOpen: () => {
        console.log('Alert SSE connection established in useServerRoomAlerts');
      },
    });

    sseConnectionRef.current = connection;

    // 클린업
    return () => {
      isMounted = false;
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
        sseConnectionRef.current = null;
      }

      clearTimersRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      clearTimersRef.current = [];
    };
  }, [processAlert, scheduleAlertCleanup, shouldProcessAlert, upsertAlert]);

  return { rackAlerts };
};
