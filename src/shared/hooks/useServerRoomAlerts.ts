import { useEffect, useState, useRef, useCallback } from 'react';
import type { Alert } from '@/api/alertApi';
import { useAlertStore } from '@/shared/store/useAlertStore';

export interface RackAlert {
  rackId: number;
  level: 'CRITICAL' | 'WARNING';
  latestAlert: Alert;
}

const ALERT_TTL_MS = 5 * 60 * 1000;

/**
 * 서버실 알림을 실시간으로 수신하고 랙별 알림 상태를 관리하는 Hook
 * @param serverRoomId 서버실 ID (없으면 전체 알림 수신)
 */
export const useServerRoomAlerts = (serverRoomId?: number) => {
  const [rackAlerts, setRackAlerts] = useState<Map<number, RackAlert>>(new Map());
  const clearTimersRef = useRef<Map<number, number>>(new Map());
  const processedAlertsRef = useRef<Set<number>>(new Set());
  const alerts = useAlertStore((state) => state.alerts);

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
    const elapsed = Date.now() - new Date(alert.triggeredAt).getTime();
    const remaining = Math.max(0, ALERT_TTL_MS - elapsed);

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
      clearTimersRef.current.delete(alert.alertId);
      processedAlertsRef.current.delete(alert.alertId);
    }, remaining);

    const previousTimer = clearTimersRef.current.get(alert.alertId);
    if (previousTimer) {
      clearTimeout(previousTimer);
    }
    clearTimersRef.current.set(alert.alertId, timeoutId);
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
    clearTimersRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    clearTimersRef.current.clear();
    processedAlertsRef.current.clear();
    setRackAlerts(new Map());
  }, [serverRoomId]);

  useEffect(() => {
    alerts.forEach((alert) => {
      if (!processedAlertsRef.current.has(alert.alertId) && shouldProcessAlert(alert)) {
        processedAlertsRef.current.add(alert.alertId);
        processAlert(alert);
      }
    });
  }, [alerts, processAlert, serverRoomId, shouldProcessAlert]);

  useEffect(() => {
    const timers = clearTimersRef.current;
    const processed = processedAlertsRef.current;

    return () => {
      timers.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timers.clear();
      processed.clear();
    };
  }, []);

  return { rackAlerts };
};
