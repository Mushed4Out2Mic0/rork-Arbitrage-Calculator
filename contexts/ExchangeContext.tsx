import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExchangeConfig, ExchangeMode, CryptoPairConfig } from '@/types/exchanges';
import { DEFAULT_EXCHANGE_CONFIGS, DEFAULT_CRYPTO_PAIRS } from '@/constants/exchanges';
import { secureStorage } from '@/utils/secureStorage';

const STORAGE_KEY_MODE = 'global_exchange_mode';
const STORAGE_KEY_CRYPTO_PAIRS = 'enabled_crypto_pairs';

export const [ExchangeProvider, useExchange] = createContextHook(() => {
  const [configs, setConfigs] = useState<ExchangeConfig[]>(DEFAULT_EXCHANGE_CONFIGS);
  const [globalMode, setGlobalMode] = useState<ExchangeMode>('live');
  const [cryptoPairs, setCryptoPairs] = useState<CryptoPairConfig[]>(DEFAULT_CRYPTO_PAIRS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadConfigs = useCallback(async () => {
    console.log('[ExchangeContext] Loading configs');
    try {
      setIsLoading(true);

      const storedMode = await AsyncStorage.getItem(STORAGE_KEY_MODE);
      const mode = storedMode ? (storedMode as ExchangeMode) : 'live';
      setGlobalMode(mode);
      console.log('[ExchangeContext] Set mode to:', mode);
      
      if (!storedMode) {
        await AsyncStorage.setItem(STORAGE_KEY_MODE, 'live');
        console.log('[ExchangeContext] Saved default live mode');
      }

      const storedPairs = await AsyncStorage.getItem(STORAGE_KEY_CRYPTO_PAIRS);
      if (storedPairs) {
        const pairs = JSON.parse(storedPairs) as CryptoPairConfig[];
        setCryptoPairs(pairs);
        console.log('[ExchangeContext] Loaded crypto pairs:', pairs);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_CRYPTO_PAIRS, JSON.stringify(DEFAULT_CRYPTO_PAIRS));
        console.log('[ExchangeContext] Saved default crypto pairs');
      }

      const loadedConfigs = await Promise.all(
        DEFAULT_EXCHANGE_CONFIGS.map(async (defaultConfig) => {
          const apiKey = await secureStorage.getItem(`${defaultConfig.name}_api_key`);
          const apiSecret = await secureStorage.getItem(`${defaultConfig.name}_api_secret`);
          const enabled = await AsyncStorage.getItem(`${defaultConfig.name}_enabled`);
          
          return {
            ...defaultConfig,
            apiKey: apiKey || '',
            apiSecret: apiSecret || '',
            enabled: enabled !== null ? enabled === 'true' : defaultConfig.enabled,
            mode: mode,
          };
        })
      );

      setConfigs(loadedConfigs);
      console.log('[ExchangeContext] Loaded configs:', loadedConfigs);
    } catch (error) {
      console.error('[ExchangeContext] Error loading configs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const updateExchangeConfig = useCallback(
    async (name: string, updates: Partial<ExchangeConfig>) => {
      console.log(`[ExchangeContext] Updating ${name}:`, updates);
      
      setConfigs((prevConfigs) => {
        const newConfigs = prevConfigs.map((config) =>
          config.name === name ? { ...config, ...updates } : config
        );
        return newConfigs;
      });

      try {
        if (updates.apiKey !== undefined) {
          await secureStorage.setItem(`${name}_api_key`, updates.apiKey);
        }
        if (updates.apiSecret !== undefined) {
          await secureStorage.setItem(`${name}_api_secret`, updates.apiSecret);
        }
        if (updates.enabled !== undefined) {
          await AsyncStorage.setItem(`${name}_enabled`, String(updates.enabled));
        }

        console.log(`[ExchangeContext] Saved ${name} config`);
      } catch (error) {
        console.error(`[ExchangeContext] Error saving ${name} config:`, error);
      }
    },
    []
  );

  const setMode = useCallback(async (mode: ExchangeMode) => {
    console.log('[ExchangeContext] Setting mode:', mode);
    setGlobalMode(mode);

    setConfigs((prevConfigs) => {
      const newConfigs = prevConfigs.map((config) => ({
        ...config,
        mode,
      }));
      return newConfigs;
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY_MODE, mode);
      console.log('[ExchangeContext] Saved mode:', mode);
    } catch (error) {
      console.error('[ExchangeContext] Error saving mode:', error);
    }
  }, []);

  const getEnabledConfigs = useCallback(() => {
    return configs.filter((config) => config.enabled);
  }, [configs]);

  const getEnabledCryptoPairs = useCallback(() => {
    return cryptoPairs.filter((pair) => pair.enabled).slice(0, 3);
  }, [cryptoPairs]);

  const updateCryptoPairConfig = useCallback(
    async (name: string, enabled: boolean) => {
      console.log(`[ExchangeContext] Updating crypto pair ${name}:`, enabled);
      
      const newPairs = cryptoPairs.map((pair) =>
        pair.name === name ? { ...pair, enabled } : pair
      );
      setCryptoPairs(newPairs);

      try {
        await AsyncStorage.setItem(STORAGE_KEY_CRYPTO_PAIRS, JSON.stringify(newPairs));
        console.log(`[ExchangeContext] Saved crypto pair ${name} config`);
      } catch (error) {
        console.error(`[ExchangeContext] Error saving crypto pair ${name} config:`, error);
      }
    },
    [cryptoPairs]
  );

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
