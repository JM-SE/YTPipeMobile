import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ActiveConfig, clearStoredConfig, persistConfig, readStoredConfig } from './configStorage';

export type ConfigStatus = 'loading' | 'missing' | 'present' | 'error';

type ConfigStatusContextValue = {
  status: ConfigStatus;
  config: ActiveConfig | null;
  activateConfig: (config: ActiveConfig) => Promise<void>;
  clearConfig: () => Promise<void>;
  reloadConfig: () => Promise<void>;
};

const ConfigStatusContext = createContext<ConfigStatusContextValue | null>(null);

export function ConfigStatusProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<ConfigStatus>('loading');
  const [config, setConfig] = useState<ActiveConfig | null>(null);

  const reloadConfig = useCallback(async () => {
    setStatus('loading');
    try {
      const stored = await readStoredConfig();
      if (stored) {
        setConfig(stored);
        setStatus('present');
      } else {
        setConfig(null);
        setStatus('missing');
      }
    } catch {
      setConfig(null);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void reloadConfig();
  }, [reloadConfig]);

  const activateConfig = useCallback(async (nextConfig: ActiveConfig) => {
    await persistConfig(nextConfig);
    setConfig(nextConfig);
    setStatus('present');
  }, []);

  const clearConfig = useCallback(async () => {
    await clearStoredConfig();
    setConfig(null);
    setStatus('missing');
  }, []);

  const value = useMemo(
    () => ({
      status,
      config,
      activateConfig,
      clearConfig,
      reloadConfig,
    }),
    [activateConfig, clearConfig, config, reloadConfig, status],
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
