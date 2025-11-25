import { type PropsWithChildren, useEffect, useRef } from 'react';
import { createAlertSSE } from '@/api/sseClient';
import type { Alert } from '@/api/alertApi';
import { useAlertStore } from '@/shared/store/useAlertStore';
import { useAuthStore } from '@/domains/login/store/useAuthStore';

const AlertProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const addAlert = useAlertStore((state) => state.addAlert);
  const connectionRef = useRef<ReturnType<typeof createAlertSSE> | null>(null);
  const addAlertRef = useRef(addAlert);
  const accessToken = useAuthStore((state) => state.accessToken);
  const authenticated = useAuthStore((state) => state.authenticated);

  useEffect(() => {
    addAlertRef.current = addAlert;
  }, [addAlert]);

  useEffect(() => {
    // 토큰이 없거나 인증되지 않은 상태에서는 SSE를 유지하지 않음
    if (!authenticated || !accessToken) {
      if (connectionRef.current) {
        connectionRef.current.close();
        connectionRef.current = null;
      }
      return;
    }

    const connection = createAlertSSE<Alert>({
      onMessage: (alert) => {
        addAlertRef.current(alert);
      },
      onError: (error) => {
        console.error('Global Alert SSE error:', error);
      },
      onOpen: () => {
        console.log('Global Alert SSE connection established');
      },
    });

    connectionRef.current = connection;

    return () => {
      connection.close();
      connectionRef.current = null;
    };
  }, [accessToken, authenticated]);

  return <>{children}</>;
};

export default AlertProvider;
