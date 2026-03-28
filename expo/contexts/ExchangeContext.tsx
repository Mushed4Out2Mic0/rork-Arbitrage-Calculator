import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExchangeConfig, ExchangeMode, CryptoPairConfig } from '@/types/exchanges';
import { DEFAULT_EXCHANGE_CONFIGS, DEFAULT_CRYPTO_PAIRS } from '@/constants/exchanges';
import { secureStorage } from '@/utils/secureStorage';

const KEY_MODE = 'global_exchange_mode';
const KEY_PAIRS = 'enabled_crypto_pairs';

export const [ExchangeProvider, useExchange] = createContextHook(() => {
  const [configs, setConfigs] = useState<ExchangeConfig[]>(DEFAULT_EXCHANGE_CONFIGS);
  const [globalMode, setGlobalMode] = useState<ExchangeMode>('live');
  const [cryptoPairs, setCryptoPairs] = useState<CryptoPairConfig[]>(DEFAULT_CRYPTO_PAIRS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [storedMode, storedPairs] = await Promise.all([
          AsyncStorage.getItem(KEY_MODE),
          AsyncStorage.getItem(KEY_PAIRS),
        ]);

        const mode = (storedMode as ExchangeMode) || 'live';
        setGlobalMode(mode);

        if (storedPairs) {
          setCryptoPairs(JSON.parse(storedPairs));
        }

        const loaded = await Promise.all(
          DEFAULT_EXCHANGE_CONFIGS.map(async (def) => {
            const [apiKey, apiSecret, enabled] = await Promise.all([
              secureStorage.getItem(`${def.name}_api_key`),
              secureStorage.getItem(`${def.name}_api_secret`),
              AsyncStorage.getItem(`${def.name}_enabled`),
            ]);
            return {
              ...def,
              apiKey: apiKey || '',
              apiSecret: apiSecret || '',
              enabled: enabled !== null ? enabled === 'true' : def.enabled,
              mode,
            };
          })
        );
        setConfigs(loaded);
        console.log('[Exchange] Configs loaded');
      } catch (e) {
        console.error('[Exchange] Load error:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const updateExchangeConfig = useCallback(async (name: string, updates: Partial<ExchangeConfig>) => {
    setConfigs((prev) => prev.map((c) => (c.name === name ? { ...c, ...updates } : c)));
    try {
      if (updates.apiKey !== undefined) await secureStorage.setItem(`${name}_api_key`, updates.apiKey);
      if (updates.apiSecret !== undefined) await secureStorage.setItem(`${name}_api_secret`, updates.apiSecret);
      if (updates.enabled !== undefined) await AsyncStorage.setItem(`${name}_enabled`, String(updates.enabled));
    } catch (e) {
      console.error(`[Exchange] Save ${name} error:`, e);
    }
  }, []);

  const setMode = useCallback(async (mode: ExchangeMode) => {
    setGlobalMode(mode);
    setConfigs((prev) => prev.map((c) => ({ ...c, mode })));
    await AsyncStorage.setItem(KEY_MODE, mode);
  }, []);

  const getEnabledConfigs = useCallback(() => configs.filter((c) => c.enabled), [configs]);

  const getEnabledCryptoPairs = useCallback(
    () => cryptoPairs.filter((p) => p.enabled).slice(0, 3),
    [cryptoPairs]
  );

  const updateCryptoPairConfig = useCallback(async (name: string, enabled: boolean) => {
    setCryptoPairs((prev) => {
      const next = prev.map((p) => (p.name === name ? { ...p, enabled } : p));
      void AsyncStorage.setItem(KEY_PAIRS, JSON.stringify(next));
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      configs,
      globalMode,
      isLoading,
      cryptoPairs,
      updateExchangeConfig,
      setMode,
      getEnabledConfigs,
      getEnabledCryptoPairs,
      updateCryptoPairConfig,
    }),
    [configs, globalMode, isLoading, cryptoPairs, updateExchangeConfig, setMode, getEnabledConfigs, getEnabledCryptoPairs, updateCryptoPairConfig]
  );
});
