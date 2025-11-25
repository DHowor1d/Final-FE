import { create } from 'zustand';
import type { Alert } from '@/api/alertApi';

interface AlertStoreState {
  alerts: Alert[];
  maxAlerts: number;
  addAlert: (alert: Alert) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertStoreState>((set) => ({
  alerts: [],
  maxAlerts: 200,
  addAlert: (alert) =>
    set((state) => {
      const deduped = state.alerts.filter((existing) => existing.alertId !== alert.alertId);
      const next = [alert, ...deduped];
      return {
        alerts: next.slice(0, state.maxAlerts),
        maxAlerts: state.maxAlerts,
      };
    }),
  clearAlerts: () => set((state) => ({ alerts: [], maxAlerts: state.maxAlerts })),
}));
