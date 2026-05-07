import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type ConnectivityStatus = {
  isOffline: boolean;
  isInternetReachable: boolean | null;
  type: string;
};

const ConnectivityContext = createContext<ConnectivityStatus | null>(null);

function deriveConnectivityStatus(state: NetInfoState): ConnectivityStatus {
  const isInternetReachable = state.isInternetReachable ?? null;
  const isOffline = state.isConnected === false || isInternetReachable === false;

  return {
    isOffline,
    isInternetReachable,
    type: state.type,
  };
}

export function ConnectivityProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<ConnectivityStatus>({
    isOffline: false,
    isInternetReachable: null,
    type: 'none',
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus(deriveConnectivityStatus(state));
    });

    void NetInfo.fetch().then((state) => setStatus(deriveConnectivityStatus(state)));

    return unsubscribe;
  }, []);

  const value = useMemo(() => status, [status]);

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivityStatus() {
  const context = useContext(ConnectivityContext);

  if (!context) {
    return {
      isOffline: false,
      isInternetReachable: null,
      type: 'none',
    };
  }

  return context;
}
