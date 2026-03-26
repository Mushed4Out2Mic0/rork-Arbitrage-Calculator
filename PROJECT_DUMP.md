# Crypto Arbitrage App - Full Project Dump

## Overview
React Native (Expo SDK 54) crypto arbitrage tracker app. Uses Hono + tRPC backend to proxy exchange API calls (avoiding CORS). Supports Kraken, Coinbase, Binance, Bybit. Features light/dark theme, API key storage, configurable crypto pairs, arbitrage opportunity detection. Also exposes a REST `/opportunities` endpoint for external bot consumption.

## Tech Stack
- **Frontend**: React Native + Expo Router (file-based routing), TypeScript, React Query, tRPC client
- **Backend**: Hono web server + tRPC, runs server-side on Rork platform
- **State**: `@nkzw/create-context-hook` for contexts, AsyncStorage for persistence, expo-secure-store for API keys
- **Styling**: React Native StyleSheet (no Tailwind/NativeWind)
- **Package Manager**: bun (not npm/yarn)

## File Structure
```
expo/
  app.json
  package.json
  tsconfig.json
  app/
    _layout.tsx          # Root layout (providers, QueryClient, tRPC)
    +not-found.tsx
    +native-intent.tsx
    (tabs)/
      _layout.tsx        # Tab navigator (Market + Settings)
      index.tsx          # Market screen
      settings.tsx       # Settings screen
  backend/
    hono.ts              # Hono server entry (CORS, tRPC mount, opportunities route)
    trpc/
      app-router.ts      # tRPC router composition
      create-context.ts  # tRPC context + initTRPC
      routes/
        example/hi/route.ts
        exchanges/ticker/route.ts   # Main ticker endpoint
    exchanges/
      adapters.ts        # Exchange fetcher adapters (kraken, coinbase, binance, bybit)
      safeFetch.ts       # Circuit breaker wrapper
    opportunities/
      opportunities.ts   # Compute arbitrage opportunities
    routes/
      opportunities.ts   # REST endpoint for bot consumption
  components/market/
    TickerCard.tsx
    ComparisonCard.tsx
    ExecutionCostCard.tsx
    ArbitrageOpportunitiesCard.tsx
  constants/
    colors.ts            # Light/dark theme colors
    exchanges.ts         # Exchange configs, crypto pairs, fee tables, symbol mappings
  contexts/
    ExchangeContext.tsx   # Exchange state (configs, mode, pairs, API keys)
    ThemeContext.tsx      # Light/dark theme toggle
  types/
    exchanges.ts         # TypeScript interfaces
  utils/
    arbitrage.ts         # Arbitrage calculation logic
    secureStorage.ts     # Unified secure storage (SecureStore native, localStorage web)
  lib/
    trpc.ts              # tRPC client setup
```

---

## FILE CONTENTS

### expo/package.json
```json
{
  "name": "expo-app",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "bunx rork start -p bwn3fartb604mz8hy0xww --tunnel",
    "start-web": "bunx rork start -p bwn3fartb604mz8hy0xww --web --tunnel",
    "start-web-dev": "DEBUG=expo* bunx rork start -p bwn3fartb604mz8hy0xww --web --tunnel",
    "lint": "expo lint"
  },
  "dependencies": {
    "@ai-sdk/react": "^2.0.86",
    "@expo/vector-icons": "^15.0.3",
    "@hono/trpc-server": "^0.4.0",
    "@nkzw/create-context-hook": "^1.1.0",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@stardazed/streams-text-encoding": "^1.0.2",
    "@tanstack/eslint-plugin-query": "^5.91.2",
    "@tanstack/react-query": "^5.90.6",
    "@trpc/client": "^11.7.1",
    "@trpc/react-query": "^11.7.1",
    "@trpc/server": "^11.7.1",
    "@ungap/structured-clone": "^1.3.0",
    "expo": "^54.0.20",
    "expo-blur": "~15.0.7",
    "expo-constants": "~18.0.10",
    "expo-font": "~14.0.9",
    "expo-haptics": "~15.0.7",
    "expo-image": "~3.0.10",
    "expo-image-picker": "~17.0.8",
    "expo-linear-gradient": "~15.0.7",
    "expo-linking": "~8.0.8",
    "expo-location": "~19.0.7",
    "expo-router": "~6.0.13",
    "expo-secure-store": "~15.0.7",
    "expo-splash-screen": "~31.0.10",
    "expo-status-bar": "~3.0.8",
    "expo-symbols": "~1.0.7",
    "expo-system-ui": "~6.0.8",
    "expo-web-browser": "^15.0.8",
    "hono": "^4.10.4",
    "lucide-react-native": "^0.475.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",
    "react-native-web": "^0.21.0",
    "superjson": "^2.2.5",
    "zod": "^4.1.12",
    "zustand": "^5.0.2",
    "@rork-ai/toolkit-sdk": "latest"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@expo/ngrok": "^4.1.0",
    "@types/react": "~19.1.10",
    "eslint": "9.31.0",
    "eslint-config-expo": "9.2.0",
    "typescript": "~5.9.2"
  },
  "private": true
}
```

### expo/app.json
```json
{
  "expo": {
    "name": "Crypto Market Price Tracker",
    "slug": "crypto-market-price-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "app.rork.crypto-market-price-tracker",
      "infoPlist": {
        "NSFaceIDUsageDescription": "Allow $(PRODUCT_NAME) to access your Face ID biometric data."
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "app.rork.crypto_market_price_tracker"
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      ["expo-router", { "origin": "https://rork.com/" }],
      ["expo-secure-store", { "configureAndroidBackup": true, "faceIDPermission": "Allow $(PRODUCT_NAME) to access your Face ID biometric data." }]
    ],
    "experiments": { "typedRoutes": true }
  }
}
```

### expo/tsconfig.json
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

---

### expo/app/_layout.tsx
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ExchangeProvider } from "@/contexts/ExchangeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000,
      refetchOnWindowFocus: false,
      staleTime: 2_000,
      gcTime: 60_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ExchangeProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </ExchangeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### expo/app/(tabs)/_layout.tsx
```tsx
import { Tabs } from "expo-router";
import { TrendingUp, Settings } from "lucide-react-native";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.textTertiary,
        headerShown: true,
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Market",
          tabBarIcon: ({ color }) => <TrendingUp color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
```

### expo/app/(tabs)/index.tsx
```tsx
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useExchange } from '@/contexts/ExchangeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TickerData } from '@/types/exchanges';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { findTopArbitrageOpportunities } from '@/utils/arbitrage';
import { TickerCard } from '@/components/market/TickerCard';
import { ComparisonCard } from '@/components/market/ComparisonCard';
import { ExecutionCostCard } from '@/components/market/ExecutionCostCard';
import { ArbitrageOpportunitiesCard } from '@/components/market/ArbitrageOpportunitiesCard';

export default function MarketScreen() {
  const { getEnabledConfigs, globalMode, getEnabledCryptoPairs } = useExchange();
  const { theme } = useTheme();
  const enabledConfigs = getEnabledConfigs();
  const enabledPairs = getEnabledCryptoPairs();

  const enabledExchanges = useMemo(
    () => enabledConfigs.map((c) => c.name as "kraken" | "coinbase" | "binance" | "bybit"),
    [enabledConfigs]
  );
  
  const symbols = useMemo(
    () => enabledPairs.map((p) => p.symbol),
    [enabledPairs]
  );

  const { data, isFetching, isLoading, refetch } = trpc.exchanges.ticker.useQuery(
    { exchanges: enabledExchanges, symbols },
    { enabled: enabledExchanges.length > 0 && symbols.length > 0 }
  );

  const handleRefresh = () => { refetch(); };

  const tickers: TickerData[] = useMemo(() => {
    if (!data?.results) return [];
    return data.results
      .filter((r: any) => !r.error)
      .map((r: any) => ({
        exchange: r.exchange,
        symbol: r.symbol,
        bidPrice: String(r.bid),
        askPrice: String(r.ask),
        bidQty: '0',
        askQty: '0',
        timestamp: r.ts,
      }));
  }, [data]);

  const tickersByPair = useMemo(() => {
    const grouped: Record<string, TickerData[]> = {};
    tickers.forEach((ticker) => {
      if (!grouped[ticker.symbol]) grouped[ticker.symbol] = [];
      grouped[ticker.symbol].push(ticker);
    });
    return grouped;
  }, [tickers]);

  const topOpportunities = useMemo(
    () => findTopArbitrageOpportunities(tickersByPair, 5),
    [tickersByPair]
  );

  const errors = useMemo(() => {
    if (!data?.results) return [];
    return data.results
      .filter((r: any) => r.error)
      .map((r: any, idx: number) => ({
        key: `error-${r.exchange}-${r.symbol}-${idx}`,
        exchange: r.exchange,
        symbol: r.symbol,
        message: r.error,
      }));
  }, [data]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Market',
          headerRight: () => (
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.modeBadge,
                  {
                    backgroundColor: globalMode === 'live' ? theme.successLight : theme.warningLight,
                    borderColor: globalMode === 'live' ? theme.successDark : theme.warningDark,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeText,
                    { color: globalMode === 'live' ? theme.successDark : theme.warningDark },
                  ]}
                >
                  {globalMode.toUpperCase()}
                </Text>
              </View>
            </View>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <TrendingUp size={32} color={theme.success} strokeWidth={2.5} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Crypto Market</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Real-time bid/ask prices from multiple exchanges</Text>
          {enabledPairs.length > 0 && (
            <View style={styles.enabledPairsRow}>
              {enabledPairs.map((pair) => (
                <View key={pair.name} style={[styles.pairChip, { backgroundColor: theme.successDark }]}>
                  <Text style={styles.pairChipText}>{pair.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {isLoading && tickers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading market data...</Text>
          </View>
        ) : (
          <>
            {enabledPairs.map((pair) => {
              const pairTickers = tickersByPair[pair.symbol] || [];
              return (
                <View key={pair.symbol} style={styles.pairSection}>
                  <View style={styles.pairHeader}>
                    <Text style={[styles.pairTitle, { color: theme.text }]}>{pair.displayName}</Text>
                    <Text style={[styles.pairSymbol, { color: theme.successDark, backgroundColor: theme.successLight }]}>{pair.symbol}</Text>
                  </View>
                  {pairTickers.map((ticker) => (
                    <TickerCard key={`${ticker.exchange}-${ticker.symbol}`} ticker={ticker} />
                  ))}
                  {pairTickers.length > 1 && (
                    <>
                      <ComparisonCard tickers={pairTickers} />
                      <ExecutionCostCard tickers={pairTickers} />
                    </>
                  )}
                </View>
              );
            })}
            <ArbitrageOpportunitiesCard opportunities={topOpportunities} />
            {errors.length > 0 && errors.map((error) => (
              <View key={error.key} style={[styles.errorCard, { backgroundColor: theme.errorLight }]}>
                <AlertCircle size={20} color={theme.error} />
                <View style={styles.errorTextContainer}>
                  <Text style={[styles.errorExchange, { color: theme.errorDark }]}>
                    [{error.exchange}] {error.symbol}
                  </Text>
                  <Text style={[styles.errorText, { color: theme.errorDark }]}>{error.message}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {isFetching && !isLoading && (
          <View style={styles.refreshIndicator}>
            <RefreshCw size={16} color={theme.textSecondary} />
            <Text style={[styles.refreshText, { color: theme.textSecondary }]}>Updating...</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16 },
  headerRight: { marginRight: 8 },
  modeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  modeText: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.5 },
  header: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
  headerIcon: { marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700' as const, marginBottom: 4 },
  subtitle: { fontSize: 14, textAlign: 'center' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 16, fontSize: 14 },
  errorCard: { borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  errorTextContainer: { flex: 1, gap: 4 },
  errorExchange: { fontSize: 12, fontWeight: '700' as const, textTransform: 'uppercase', letterSpacing: 0.5 },
  errorText: { fontSize: 13, lineHeight: 18 },
  refreshIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  refreshText: { fontSize: 12 },
  enabledPairsRow: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' },
  pairChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  pairChipText: { fontSize: 12, fontWeight: '700' as const, color: '#FFFFFF', letterSpacing: 0.5 },
  pairSection: { marginBottom: 24 },
  pairHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 },
  pairTitle: { fontSize: 22, fontWeight: '700' as const },
  pairSymbol: { fontSize: 14, fontWeight: '600' as const, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
});
```

### expo/app/(tabs)/settings.tsx
```tsx
import {
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { Settings as SettingsIcon, Key, Server, Eye, EyeOff, CheckCircle, Coins, Moon, Sun } from 'lucide-react-native';
import { useExchange } from '@/contexts/ExchangeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ExchangeConfig } from '@/types/exchanges';

export default function SettingsScreen() {
  const { configs, globalMode, setMode, updateExchangeConfig, cryptoPairs, updateCryptoPairConfig } = useExchange();
  const { theme, mode: themeMode, toggleTheme } = useTheme();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const handleToggleMode = (value: boolean) => {
    const mode = value ? 'live' : 'sandbox';
    setMode(mode);
  };

  const handleUpdateConfig = async (name: string, updates: Partial<ExchangeConfig>) => {
    await updateExchangeConfig(name, updates);
    Alert.alert('Success', `${name} configuration updated`);
  };

  const toggleShowApiKey = (exchangeName: string) => {
    setShowApiKeys((prev) => ({ ...prev, [exchangeName]: !prev[exchangeName] }));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <SettingsIcon size={32} color={theme.tint} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Configure exchanges and API keys</Text>
        </View>

        {/* Appearance section with light/dark toggle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {themeMode === 'light' ? <Sun size={20} color={theme.textSecondary} /> : <Moon size={20} color={theme.textSecondary} />}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          </View>
          <View style={[styles.modeContainer, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Light Mode</Text>
              <Text style={[styles.modeDescription, { color: theme.textSecondary }]}>Bright theme for daytime</Text>
            </View>
            <Switch value={themeMode === 'dark'} onValueChange={toggleTheme} trackColor={{ false: '#F59E0B', true: '#6366F1' }} thumbColor="#FFFFFF" />
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Dark Mode</Text>
              <Text style={[styles.modeDescription, { color: theme.textSecondary }]}>Easy on the eyes at night</Text>
            </View>
          </View>
        </View>

        {/* Environment Mode (sandbox/live) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Server size={20} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Environment Mode</Text>
          </View>
          <View style={[styles.modeContainer, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Sandbox Mode</Text>
            </View>
            <Switch value={globalMode === 'live'} onValueChange={handleToggleMode} trackColor={{ false: '#F59E0B', true: '#10B981' }} thumbColor="#FFFFFF" />
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Live Mode</Text>
            </View>
          </View>
        </View>

        {/* Crypto Pairs selector (max 3) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Coins size={20} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cryptocurrency Pairs</Text>
          </View>
          <View style={[styles.cryptoPairsContainer, { backgroundColor: theme.surface }]}>
            {cryptoPairs.map((pair) => {
              const enabledCount = cryptoPairs.filter(p => p.enabled).length;
              const canEnable = !pair.enabled && enabledCount < 3;
              return (
                <View key={pair.name} style={[styles.cryptoPairRow, { borderBottomColor: theme.borderLight }]}>
                  <View style={styles.cryptoPairInfo}>
                    <Text style={[styles.cryptoPairName, { color: theme.text }]}>{pair.displayName}</Text>
                    <Text style={[styles.cryptoPairSymbol, { color: theme.textSecondary }]}>{pair.symbol}</Text>
                  </View>
                  <Switch
                    value={pair.enabled}
                    onValueChange={(value) => {
                      if (value && !canEnable) {
                        Alert.alert('Limit Reached', 'You can only enable up to 3 cryptocurrency pairs at a time.');
                        return;
                      }
                      updateCryptoPairConfig(pair.name, value);
                    }}
                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Exchange API key config cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key size={20} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Exchange Configuration</Text>
          </View>
          {configs.map((config) => (
            <ExchangeConfigCard
              key={config.name}
              config={config}
              showApiKey={showApiKeys[config.name] || false}
              onToggleShowApiKey={() => toggleShowApiKey(config.name)}
              onUpdateConfig={handleUpdateConfig}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

// ExchangeConfigCard is defined inline in the same file with TextInput for apiKey/apiSecret, save/cancel buttons, enable/disable switch
// (Full styles omitted for brevity - uses standard React Native StyleSheet)
```

---

### expo/types/exchanges.ts
```ts
export type ExchangeMode = 'sandbox' | 'live';
export type ExchangeName = 'binance' | 'kraken' | 'coinbase' | 'bybit';
export type CryptoPairName = 'BTC' | 'ETH' | 'XRP' | 'SOL' | 'BNB' | 'ADA';

export interface CryptoPairConfig {
  name: CryptoPairName;
  displayName: string;
  symbol: string;
  enabled: boolean;
}

export interface ExchangeConfig {
  name: ExchangeName;
  displayName: string;
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  mode: ExchangeMode;
}

export interface TickerData {
  exchange: ExchangeName;
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  timestamp: number;
}

export interface ExchangeStatus {
  exchange: ExchangeName;
  connected: boolean;
  lastUpdate: number;
  error?: string;
}
```

### expo/constants/exchanges.ts
```ts
import { ExchangeConfig, ExchangeName, CryptoPairConfig } from '@/types/exchanges';

export const EXCHANGE_ENDPOINTS = {
  binance: { live: 'https://api.binance.com', sandbox: 'https://testnet.binance.vision' },
  kraken: { live: 'https://api.kraken.com', sandbox: 'https://api.kraken.com' },
  coinbase: { live: 'https://api.exchange.coinbase.com', sandbox: 'https://api-public.sandbox.exchange.coinbase.com' },
  bybit: { live: 'https://api.bybit.com', sandbox: 'https://api-testnet.bybit.com' },
} as const;

export const DEFAULT_EXCHANGE_CONFIGS: ExchangeConfig[] = [
  { name: 'binance', displayName: 'Binance', enabled: false, apiKey: '', apiSecret: '', mode: 'live' },
  { name: 'bybit', displayName: 'Bybit', enabled: false, apiKey: '', apiSecret: '', mode: 'live' },
  { name: 'kraken', displayName: 'Kraken', enabled: true, apiKey: '', apiSecret: '', mode: 'live' },
  { name: 'coinbase', displayName: 'Coinbase', enabled: true, apiKey: '', apiSecret: '', mode: 'live' },
];

export const DEFAULT_CRYPTO_PAIRS: CryptoPairConfig[] = [
  { name: 'BTC', displayName: 'Bitcoin', symbol: 'BTC/USDT', enabled: true },
  { name: 'ETH', displayName: 'Ethereum', symbol: 'ETH/USDT', enabled: false },
  { name: 'XRP', displayName: 'Ripple', symbol: 'XRP/USDT', enabled: false },
  { name: 'SOL', displayName: 'Solana', symbol: 'SOL/USDT', enabled: false },
  { name: 'BNB', displayName: 'Binance Coin', symbol: 'BNB/USDT', enabled: false },
  { name: 'ADA', displayName: 'Cardano', symbol: 'ADA/USDT', enabled: false },
];

export const SYMBOL_MAPPING: Record<ExchangeName, Record<string, string>> = {
  binance: { 'BTC/USDT': 'BTCUSDT', 'ETH/USDT': 'ETHUSDT', 'XRP/USDT': 'XRPUSDT', 'SOL/USDT': 'SOLUSDT', 'BNB/USDT': 'BNBUSDT', 'ADA/USDT': 'ADAUSDT' },
  kraken: { 'BTC/USDT': 'XBTUSDT', 'ETH/USDT': 'ETHUSDT', 'XRP/USDT': 'XRPUSDT', 'SOL/USDT': 'SOLUSDT', 'BNB/USDT': 'BNBUSDT', 'ADA/USDT': 'ADAUSDT' },
  coinbase: { 'BTC/USDT': 'BTC-USDT', 'ETH/USDT': 'ETH-USDT', 'XRP/USDT': 'XRP-USDT', 'SOL/USDT': 'SOL-USDT', 'BNB/USDT': 'BNB-USDT', 'ADA/USDT': 'ADA-USDT' },
  bybit: { 'BTC/USDT': 'BTCUSDT', 'ETH/USDT': 'ETHUSDT', 'XRP/USDT': 'XRPUSDT', 'SOL/USDT': 'SOLUSDT', 'BNB/USDT': 'BNBUSDT', 'ADA/USDT': 'ADAUSDT' },
};

export const REFRESH_INTERVAL = 5000;
export const TRADE_AMOUNT = 0.1;

export const EXCHANGE_TRADING_FEES: Record<ExchangeName, { maker: number; taker: number }> = {
  binance: { maker: 0.001, taker: 0.001 },
  bybit: { maker: 0.001, taker: 0.001 },
  kraken: { maker: 0.0016, taker: 0.0026 },
  coinbase: { maker: 0.004, taker: 0.006 },
};
```

### expo/constants/colors.ts
```ts
export const lightTheme = {
  background: '#F9FAFB', surface: '#FFFFFF', surfaceSecondary: '#F3F4F6',
  text: '#111827', textSecondary: '#6B7280', textTertiary: '#9CA3AF',
  border: '#E5E7EB', borderLight: '#F3F4F6', tint: '#3B82F6',
  success: '#10B981', successLight: '#DCFCE7', successDark: '#059669',
  warning: '#F59E0B', warningLight: '#FEF3C7', warningDark: '#D97706',
  error: '#EF4444', errorLight: '#FEE2E2', errorDark: '#991B1B',
  info: '#3B82F6', infoLight: '#EFF6FF', infoDark: '#1E40AF',
  card: '#FFFFFF', cardShadow: 'rgba(0, 0, 0, 0.05)',
};

export const darkTheme = {
  background: '#0F172A', surface: '#1E293B', surfaceSecondary: '#334155',
  text: '#F1F5F9', textSecondary: '#94A3B8', textTertiary: '#64748B',
  border: '#334155', borderLight: '#475569', tint: '#60A5FA',
  success: '#34D399', successLight: '#064E3B', successDark: '#6EE7B7',
  warning: '#FBBF24', warningLight: '#78350F', warningDark: '#FCD34D',
  error: '#F87171', errorLight: '#7F1D1D', errorDark: '#FCA5A5',
  info: '#60A5FA', infoLight: '#1E3A8A', infoDark: '#93C5FD',
  card: '#1E293B', cardShadow: 'rgba(0, 0, 0, 0.3)',
};

export type Theme = typeof lightTheme;
```

---

### expo/contexts/ExchangeContext.tsx
```tsx
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

  // Loads configs from AsyncStorage + SecureStore on mount
  const loadConfigs = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedMode = await AsyncStorage.getItem(STORAGE_KEY_MODE);
      const mode = storedMode ? (storedMode as ExchangeMode) : 'live';
      setGlobalMode(mode);
      if (!storedMode) await AsyncStorage.setItem(STORAGE_KEY_MODE, 'live');

      const storedPairs = await AsyncStorage.getItem(STORAGE_KEY_CRYPTO_PAIRS);
      if (storedPairs) setCryptoPairs(JSON.parse(storedPairs));
      else await AsyncStorage.setItem(STORAGE_KEY_CRYPTO_PAIRS, JSON.stringify(DEFAULT_CRYPTO_PAIRS));

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
    } catch (error) {
      console.error('[ExchangeContext] Error loading configs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadConfigs(); }, [loadConfigs]);

  const updateExchangeConfig = useCallback(async (name: string, updates: Partial<ExchangeConfig>) => {
    setConfigs((prev) => prev.map((c) => c.name === name ? { ...c, ...updates } : c));
    try {
      if (updates.apiKey !== undefined) await secureStorage.setItem(`${name}_api_key`, updates.apiKey);
      if (updates.apiSecret !== undefined) await secureStorage.setItem(`${name}_api_secret`, updates.apiSecret);
      if (updates.enabled !== undefined) await AsyncStorage.setItem(`${name}_enabled`, String(updates.enabled));
    } catch (error) { console.error(`Error saving ${name} config:`, error); }
  }, []);

  const setMode = useCallback(async (mode: ExchangeMode) => {
    setGlobalMode(mode);
    setConfigs((prev) => prev.map((c) => ({ ...c, mode })));
    await AsyncStorage.setItem(STORAGE_KEY_MODE, mode);
  }, []);

  const getEnabledConfigs = useCallback(() => configs.filter((c) => c.enabled), [configs]);
  const getEnabledCryptoPairs = useCallback(() => cryptoPairs.filter((p) => p.enabled).slice(0, 3), [cryptoPairs]);

  const updateCryptoPairConfig = useCallback(async (name: string, enabled: boolean) => {
    const newPairs = cryptoPairs.map((p) => p.name === name ? { ...p, enabled } : p);
    setCryptoPairs(newPairs);
    await AsyncStorage.setItem(STORAGE_KEY_CRYPTO_PAIRS, JSON.stringify(newPairs));
  }, [cryptoPairs]);

  return useMemo(() => ({
    configs, globalMode, isLoading, cryptoPairs,
    updateExchangeConfig, setMode, getEnabledConfigs, getEnabledCryptoPairs, updateCryptoPairConfig,
  }), [configs, globalMode, isLoading, cryptoPairs, updateExchangeConfig, setMode, getEnabledConfigs, getEnabledCryptoPairs, updateCryptoPairConfig]);
});
```

### expo/contexts/ThemeContext.tsx
```tsx
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { lightTheme, darkTheme, Theme } from '@/constants/colors';

type ThemeMode = 'light' | 'dark';
const THEME_STORAGE_KEY = 'app_theme_mode';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') setMode(stored);
      } catch (error) { console.error('Failed to load theme:', error); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const setThemeMode = async (newMode: ThemeMode) => {
    setMode(newMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const toggleTheme = () => setThemeMode(mode === 'light' ? 'dark' : 'light');
  const theme: Theme = mode === 'light' ? lightTheme : darkTheme;

  return { mode, theme, setThemeMode, toggleTheme, isLoading };
});
```

---

### expo/utils/secureStorage.ts
```ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const WEB_STORAGE_PREFIX = 'crypto_exchange_';
const isWeb = Platform.OS === 'web';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (!value) return;
    if (isWeb) localStorage.setItem(WEB_STORAGE_PREFIX + key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  async getItem(key: string): Promise<string | null> {
    if (isWeb) return localStorage.getItem(WEB_STORAGE_PREFIX + key);
    return await SecureStore.getItemAsync(key);
  },
  async deleteItem(key: string): Promise<void> {
    if (isWeb) localStorage.removeItem(WEB_STORAGE_PREFIX + key);
    else await SecureStore.deleteItemAsync(key);
  },
};
```

### expo/utils/arbitrage.ts
```ts
import { TickerData, ExchangeName } from '@/types/exchanges';
import { EXCHANGE_TRADING_FEES, TRADE_AMOUNT } from '@/constants/exchanges';

export interface ArbitrageOpportunity {
  timestamp: number;
  buyExchange: ExchangeName;
  sellExchange: ExchangeName;
  buyPrice: number;
  sellPrice: number;
  deviation: number;
  percentDeviation: number;
  tradeAmount: number;
  buyFee: number;
  sellFee: number;
  totalCost: number;
  costPercentage: number;
  grossProfit: number;
  netProfit: number;
  isProfitable: boolean;
  symbol: string;
}

export function calculateArbitrageOpportunity(buyTicker: TickerData, sellTicker: TickerData, tradeAmount: number = TRADE_AMOUNT): ArbitrageOpportunity {
  const buyPrice = parseFloat(buyTicker.askPrice);
  const sellPrice = parseFloat(sellTicker.bidPrice);
  const deviation = sellPrice - buyPrice;
  const percentDeviation = (deviation / buyPrice) * 100;
  const buyFees = EXCHANGE_TRADING_FEES[buyTicker.exchange];
  const sellFees = EXCHANGE_TRADING_FEES[sellTicker.exchange];
  const buyFee = buyPrice * tradeAmount * buyFees.taker;
  const sellFee = sellPrice * tradeAmount * sellFees.taker;
  const totalCost = buyFee + sellFee;
  const costPercentage = (totalCost / (buyPrice * tradeAmount)) * 100;
  const grossProfit = deviation * tradeAmount;
  const netProfit = grossProfit - totalCost;
  return { timestamp: Date.now(), buyExchange: buyTicker.exchange, sellExchange: sellTicker.exchange, buyPrice, sellPrice, deviation, percentDeviation, tradeAmount, buyFee, sellFee, totalCost, costPercentage, grossProfit, netProfit, isProfitable: netProfit > 0, symbol: buyTicker.symbol };
}

export function findTopArbitrageOpportunities(tickersByPair: Record<string, TickerData[]>, limit: number = 5): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  Object.entries(tickersByPair).forEach(([_, pairTickers]) => {
    if (pairTickers.length < 2) return;
    for (let i = 0; i < pairTickers.length; i++) {
      for (let j = 0; j < pairTickers.length; j++) {
        if (i === j) continue;
        const opp = calculateArbitrageOpportunity(pairTickers[i], pairTickers[j]);
        if (opp.deviation > 0 && opp.isProfitable) opportunities.push(opp);
      }
    }
  });
  return opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, limit);
}

export function getCryptoSymbol(symbol: string): string { return symbol.split('/')[0]; }
export function calculateSpread(bidPrice: string, askPrice: string): number { return parseFloat(askPrice) - parseFloat(bidPrice); }
export function calculateSpreadPercentage(bidPrice: string, askPrice: string): number { const bid = parseFloat(bidPrice); return ((parseFloat(askPrice) - bid) / bid) * 100; }

export interface PriceComparison { exchange: ExchangeName; bid: number; ask: number; }
export function getPriceComparisons(tickers: TickerData[]): PriceComparison[] { return tickers.map((t) => ({ exchange: t.exchange, bid: parseFloat(t.bidPrice), ask: parseFloat(t.askPrice) })); }

export function getBestArbitragePath(tickers: TickerData[]) {
  if (tickers.length < 2) return null;
  const prices = getPriceComparisons(tickers);
  const highestBid = Math.max(...prices.map((p) => p.bid));
  const lowestAsk = Math.min(...prices.map((p) => p.ask));
  const highestBidExchange = prices.find(p => p.bid === highestBid)?.exchange!;
  const lowestAskExchange = prices.find(p => p.ask === lowestAsk)?.exchange!;
  const priceDifference = highestBid - lowestAsk;
  const priceDifferencePercent = (priceDifference / lowestAsk) * 100;
  return { lowestAskExchange, lowestAsk, highestBidExchange, highestBid, priceDifference, priceDifferencePercent };
}
```

### expo/lib/trpc.ts
```ts
import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  throw new Error("No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL");
};

export const trpcClient = trpc.createClient({
  links: [httpLink({ url: `${getBaseUrl()}/api/trpc`, transformer: superjson })],
});
```

---

### expo/backend/hono.ts
```ts
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { oppRouter } from "./routes/opportunities";

const app = new Hono();
app.use("*", cors({ origin: "*", allowHeaders: ["*"], allowMethods: ["GET", "POST", "OPTIONS"] }));
app.use("/trpc/*", trpcServer({ endpoint: "/api/trpc", router: appRouter, createContext }));
app.route("/opportunities", oppRouter);
app.get("/", (c) => c.json({ status: "ok", message: "API is running" }));
export default app;
```

### expo/backend/trpc/app-router.ts
```ts
import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import tickerRoute from "./routes/exchanges/ticker/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({ hi: hiRoute }),
  exchanges: createTRPCRouter({ ticker: tickerRoute }),
});
export type AppRouter = typeof appRouter;
```

### expo/backend/trpc/create-context.ts
```ts
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createContext = async (opts: FetchCreateContextFnOptions) => ({ req: opts.req });
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({ transformer: superjson });
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
```

### expo/backend/trpc/routes/exchanges/ticker/route.ts
```ts
import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { adapters } from "../../../../exchanges/adapters";

const inputSchema = z.object({
  exchanges: z.array(z.enum(["kraken", "coinbase", "binance", "bybit"])).nonempty(),
  symbols: z.array(z.string().regex(/^[A-Z]{2,10}\/[A-Z]{2,10}$/i)).nonempty(),
});

export default publicProcedure.input(inputSchema).query(async ({ input }) => {
  const tasks: Promise<any>[] = [];
  for (const ex of input.exchanges) {
    for (const sym of input.symbols) {
      const fetcher = adapters[ex];
      if (!fetcher) continue;
      tasks.push(fetcher(sym).catch((err) => ({ error: String(err), exchange: ex, symbol: sym, ts: Date.now() })));
    }
  }
  const results = await Promise.all(tasks);
  return { results };
});
```

### expo/backend/exchanges/adapters.ts
```ts
import { withBreaker } from "./safeFetch";

export type Ticker = { exchange: "kraken" | "coinbase" | "binance" | "bybit"; symbol: string; bid: number; ask: number; ts: number; };
type Fetcher = (symbol: string) => Promise<Ticker>;

const parseSymbol = (symbol: string) => { const [base, quote] = symbol.split("/"); return { base, quote }; };
const toKrakenPair = (symbol: string) => { const { base, quote } = parseSymbol(symbol); const m = (s: string) => (s === "BTC" ? "XBT" : s); return `${m(base)}${m(quote)}`.toUpperCase(); };

export const krakenFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`kraken_${symbol}`, async () => {
    const pair = toKrakenPair(symbol);
    const res = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pair}`, { signal: AbortSignal.timeout(15000) });
    if (res.status === 520 || res.status === 503) throw new Error("kraken_service_unavailable");
    if (!res.ok) throw new Error(`kraken_http_${res.status}`);
    const json = await res.json();
    if (json.error?.length) throw new Error(`kraken_api_${json.error[0]}`);
    const data = json.result[Object.keys(json.result)[0]];
    return { exchange: "kraken", symbol, bid: parseFloat(data.b[0]), ask: parseFloat(data.a[0]), ts: Date.now() };
  });
};

export const coinbaseFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`coinbase_${symbol}`, async () => {
    const { base, quote } = parseSymbol(symbol);
    const res = await fetch(`https://api.exchange.coinbase.com/products/${base}-${quote}/ticker`, { headers: { "User-Agent": "arb-app/1.0" }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`coinbase_http_${res.status}`);
    const j = await res.json();
    return { exchange: "coinbase", symbol, bid: parseFloat(j.bid), ask: parseFloat(j.ask), ts: Date.now() };
  });
};

export const binanceFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`binance_${symbol}`, async () => {
    const { base, quote } = parseSymbol(symbol);
    const s = `${base}${quote}`.toUpperCase();
    const res = await fetch(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${s}`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`binance_http_${res.status}`);
    const j = await res.json();
    return { exchange: "binance", symbol, bid: parseFloat(j.bidPrice), ask: parseFloat(j.askPrice), ts: Date.now() };
  });
};

export const bybitFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`bybit_${symbol}`, async () => {
    const { base, quote } = parseSymbol(symbol);
    const s = `${base}${quote}`.toUpperCase();
    const res = await fetch(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${s}`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`bybit_http_${res.status}`);
    const j = await res.json();
    const d = j.result?.list?.[0];
    return { exchange: "bybit", symbol, bid: parseFloat(d?.bid1Price ?? "0"), ask: parseFloat(d?.ask1Price ?? "0"), ts: Date.now() };
  });
};

export const adapters: Record<string, Fetcher> = { kraken: krakenFetcher, coinbase: coinbaseFetcher, binance: binanceFetcher, bybit: bybitFetcher };
```

### expo/backend/exchanges/safeFetch.ts
```ts
type State = { failures: number; until?: number };
const state: Record<string, State> = {};

export async function withBreaker<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const s = state[id] ?? (state[id] = { failures: 0 });
  if (s.until && now < s.until) throw new Error(`breaker_open_${id}`);
  try {
    const r = await fn();
    s.failures = 0; s.until = undefined;
    return r;
  } catch (e) {
    s.failures += 1;
    if (s.failures >= 3) s.until = now + 15_000;
    throw e;
  }
}
```

### expo/backend/opportunities/opportunities.ts
```ts
import type { Ticker } from "../exchanges/adapters";

export type Opportunity = { symbol: string; buyOn: string; sellOn: string; spreadPct: number; gross: number; fees: number; net: number; ts: number; };

export function computeOpportunities(tickers: Ticker[], feeTable: Record<string, number>): Opportunity[] {
  const bySymbol: Record<string, Ticker[]> = {};
  for (const t of tickers) { if (!bySymbol[t.symbol]) bySymbol[t.symbol] = []; bySymbol[t.symbol].push(t); }
  const out: Opportunity[] = [];
  for (const [symbol, arr] of Object.entries(bySymbol)) {
    for (const a of arr) for (const b of arr) {
      if (a.exchange === b.exchange) continue;
      const spread = (b.bid - a.ask) / a.ask;
      if (spread <= 0) continue;
      const gross = b.bid - a.ask;
      const fees = (feeTable[a.exchange] ?? 0) + (feeTable[b.exchange] ?? 0);
      const net = gross - fees;
      if (net > 0) out.push({ symbol, buyOn: a.exchange, sellOn: b.exchange, spreadPct: spread * 100, gross, fees, net, ts: Date.now() });
    }
  }
  return out.sort((x, y) => y.net - x.net);
}
```

### expo/backend/routes/opportunities.ts
```ts
import { Hono } from "hono";
import { adapters } from "../exchanges/adapters";
import { computeOpportunities } from "../opportunities/opportunities";

export const oppRouter = new Hono();

oppRouter.get("/", async (c) => {
  const exchanges = (c.req.query("ex") ?? "kraken,coinbase").split(",").filter(Boolean);
  const symbols = (c.req.query("sym") ?? "BTC/USDT").split(",").filter(Boolean);
  const fee = {
    kraken: Number(c.req.query("fee_kraken") ?? "0.0016"),
    coinbase: Number(c.req.query("fee_coinbase") ?? "0.0025"),
    binance: Number(c.req.query("fee_binance") ?? "0.001"),
    bybit: Number(c.req.query("fee_bybit") ?? "0.001"),
  };
  const tasks: Promise<any>[] = [];
  for (const ex of exchanges) for (const sym of symbols) { const f = adapters[ex]; if (!f) continue; tasks.push(f(sym).catch(() => null)); }
  const tickers = (await Promise.all(tasks)).filter(Boolean);
  const opps = computeOpportunities(tickers, fee);
  return c.json({ tickers, opportunities: opps });
});
```

---

### expo/components/market/TickerCard.tsx
(Displays single exchange ticker: bid/ask prices, spread, spread %. Hardcoded light theme colors.)

### expo/components/market/ComparisonCard.tsx
(Cross-exchange price comparison. Shows best arbitrage path: buy on lowest ask exchange, sell on highest bid. Hardcoded light theme colors.)

### expo/components/market/ExecutionCostCard.tsx
(Execution cost analysis for cross-exchange trades. Shows buy/sell fees, gross/net profit. Hardcoded light theme colors.)

### expo/components/market/ArbitrageOpportunitiesCard.tsx
(Top 5 profitable arbitrage opportunities sorted by net profit. Hardcoded light theme colors.)

---

## Known Issues
1. Market card components (TickerCard, ComparisonCard, ExecutionCostCard, ArbitrageOpportunitiesCard) use **hardcoded light theme colors** - they don't respect the dark/light theme from ThemeContext
2. Backend API base URL comes from `EXPO_PUBLIC_RORK_API_BASE_URL` env var
3. REST opportunities endpoint available at `GET /api/opportunities?ex=kraken,coinbase&sym=BTC/USDT`
4. tRPC ticker endpoint at `/api/trpc/exchanges.ticker`
5. Circuit breaker opens after 3 failures, 15s cooldown

## Platform Notes
- Hosted on Rork (rork.app) - backend runs server-side, frontend runs as Expo web + native
- Uses `bun` as package manager (not npm/yarn)
- Project ID: `bwn3fartb604mz8hy0xww`
