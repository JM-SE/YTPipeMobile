import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

export type ConfigStatus = 'missing' | 'present';

type ConfigStatusContextValue = {
  status: ConfigStatus;
  markPresent: () => void;
  markMissing: () => void;
};

const ConfigStatusContext = createContext<ConfigStatusContextValue | null>(null);

export function ConfigStatusProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<ConfigStatus>('missing');

  const value = useMemo(
    () => ({
      status,
      markPresent: () => setStatus('present'),
      markMissing: () => setStatus('missing'),
    }),
    [status],
  );

  return <ConfigStatusContext.Provider value={value}>{children}</ConfigStatusContext.Provider>;
}

export function useConfigStatus() {
  const context = useContext(ConfigStatusContext);

  if (!context) {
    throw new Error('useConfigStatus must be used inside ConfigStatusProvider');
  }

  return context;
}
