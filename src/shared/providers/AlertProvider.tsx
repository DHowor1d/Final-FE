import { type PropsWithChildren, useEffect, useRef } from 'react';
import { createAlertSSE } from '@/api/sseClient';
import type { Alert } from '@/api/alertApi';
import { useAlertStore } from '@/shared/store/useAlertStore';

const AlertProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const addAlert = useAlertStore((state) => state.addAlert);
  const connectionRef = useRef<ReturnType<typeof createAlertSSE> | null>(null);
  const addAlertRef = useRef(addAlert);

  useEffect(() => {
    addAlertRef.current = addAlert;
  }, [addAlert]);

  useEffect(() => {
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
  }, []);

  return <>{children}</>;
};

export default AlertProvider;
