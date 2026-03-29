# Full Project Dump — Crypto Market Price Tracker

## Project Structure

```
expo/
├── app/
│   ├── _layout.tsx
│   ├── +native-intent.tsx
│   ├── +not-found.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx          (Market screen)
│       ├── trading.tsx
│       ├── portfolio.tsx
│       └── settings.tsx
├── backend/
│   ├── hono.ts
│   ├── exchanges/
│   │   ├── adapters.ts
│   │   └── safeFetch.ts
│   ├── opportunities/
│   │   └── opportunities.ts
│   ├── routes/
│   │   └── opportunities.ts
│   └── trpc/
│       ├── app-router.ts
│       ├── create-context.ts
│       └── routes/
│           ├── example/hi/route.ts
│           └── exchanges/
│               ├── ticker/route.ts
│               ├── balance/route.ts
│               └── execute/route.ts
├── components/
│   ├── market/
│   │   ├── ArbitrageOpportunitiesCard.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── ComparisonCard.tsx
│   │   ├── ExecutionCostCard.tsx
│   │   └── TickerCard.tsx
│   └── trading/
│       ├── LivePriceTicker.tsx
│       └── PaperExecutionSimulator.tsx
├── constants/
│   ├── colors.ts
│   └── exchanges.ts
├── contexts/
│   ├── ExchangeContext.tsx
│   ├── ThemeContext.tsx
│   └── TradingContext.tsx
├── hooks/
│   └── useTickerData.ts
├── lib/
│   └── trpc.ts
├── types/
│   ├── exchanges.ts
│   └── trading.ts
├── utils/
│   ├── arbitrage.ts
│   └── secureStorage.ts
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── eslint.config.js
```

---

## package.json

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

---

## app.json

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
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

---

## tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

---

## app/_layout.tsx

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ExchangeProvider } from '@/contexts/ExchangeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TradingProvider } from '@/contexts/TradingContext';
import { trpc, trpcClient } from '@/lib/trpc';

void SplashScreen.preventAutoHideAsync();

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
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ExchangeProvider>
            <TradingProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </TradingProvider>
          </ExchangeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

---

## app/(tabs)/_layout.tsx

```tsx
import { Tabs } from 'expo-router';
import { TrendingUp, Settings, Wallet, Zap } from 'lucide-react-native';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

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
        headerShadowVisible: false,
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
          title: 'Market',
          tabBarIcon: ({ color }) => <TrendingUp color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="trading"
        options={{
          title: 'Trading',
          tabBarIcon: ({ color }) => <Zap color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => <Wallet color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
```

---

## app/(tabs)/index.tsx (Market Screen)

```tsx
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useExchange } from '@/contexts/ExchangeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';
import { useTickerData } from '@/hooks/useTickerData';
import { TickerCard } from '@/components/market/TickerCard';
import { ComparisonCard } from '@/components/market/ComparisonCard';
import { ExecutionCostCard } from '@/components/market/ExecutionCostCard';
import { ArbitrageOpportunitiesCard } from '@/components/market/ArbitrageOpportunitiesCard';

export default function MarketScreen() {
  const { globalMode, getEnabledCryptoPairs } = useExchange();
  const { theme } = useTheme();
  const enabledPairs = getEnabledCryptoPairs();
  const { tickers, tickersByPair, topOpportunities, errors, queryError, isFetching, isLoading, isEnabled, refetch } = useTickerData(5);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Market',
          headerRight: () => (
            <View style={[
              styles.modeBadge,
              {
                backgroundColor: globalMode === 'live' ? theme.successLight : theme.warningLight,
                borderColor: globalMode === 'live' ? theme.success : theme.warning,
              },
            ]}>
              <Text style={[styles.modeText, { color: globalMode === 'live' ? theme.successDark : theme.warningDark }]}>
                {globalMode.toUpperCase()}
              </Text>
            </View>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
        testID="market-scroll"
      >
        <View style={styles.header}>
          <TrendingUp size={28} color={theme.success} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Crypto Market</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Real-time prices across exchanges
          </Text>
          {enabledPairs.length > 0 && (
            <View style={styles.chipRow}>
              {enabledPairs.map((p) => (
                <View key={p.name} style={[styles.chip, { backgroundColor: theme.tint }]}>
                  <Text style={styles.chipText}>{p.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {!isEnabled ? (
          <View style={styles.loadingBox}>
            <AlertCircle size={32} color={theme.warning} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Data Sources</Text>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Enable exchanges and crypto pairs in Settings to see live market data.
            </Text>
          </View>
        ) : queryError && tickers.length === 0 ? (
          <View style={styles.loadingBox}>
            <AlertCircle size={32} color={theme.error} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Connection Error</Text>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{queryError}</Text>
          </View>
        ) : isLoading && tickers.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading market data...</Text>
          </View>
        ) : tickers.length === 0 && !isFetching ? (
          <View style={styles.loadingBox}>
            <AlertCircle size={32} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Market Data</Text>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Pull down to refresh, or check your exchange settings.
            </Text>
          </View>
        ) : (
          <>
            {enabledPairs.map((pair) => {
              const pairTickers = tickersByPair[pair.symbol] || [];
              return (
                <View key={pair.symbol} style={styles.pairSection}>
                  <View style={styles.pairHeader}>
                    <Text style={[styles.pairTitle, { color: theme.text }]}>{pair.displayName}</Text>
                    <View style={[styles.pairBadge, { backgroundColor: theme.infoLight }]}>
                      <Text style={[styles.pairBadgeText, { color: theme.infoDark }]}>{pair.symbol}</Text>
                    </View>
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

            {errors.length > 0 && (
              <View style={styles.errorsSection}>
                {errors.map((err) => (
                  <View key={err.key} style={[styles.errorRow, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
                    <AlertCircle size={16} color={theme.error} />
                    <View style={styles.errorContent}>
                      <Text style={[styles.errorLabel, { color: theme.errorDark }]}>[{err.exchange}] {err.symbol}</Text>
                      <Text style={[styles.errorMsg, { color: theme.errorDark }]}>{err.message}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {isFetching && !isLoading && (
          <View style={styles.refreshRow}>
            <RefreshCw size={14} color={theme.textTertiary} />
            <Text style={[styles.refreshText, { color: theme.textTertiary }]}>Updating...</Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 4,
  },
  modeText: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  header: { alignItems: 'center', marginBottom: 20, paddingTop: 4 },
  title: { fontSize: 24, fontWeight: '700' as const, marginTop: 8, marginBottom: 2 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  chipRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipText: { fontSize: 11, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  loadingBox: { alignItems: 'center', paddingVertical: 50 },
  loadingText: { marginTop: 14, fontSize: 13, textAlign: 'center' as const, lineHeight: 19, paddingHorizontal: 20 },
  emptyTitle: { marginTop: 12, fontSize: 17, fontWeight: '700' as const },
  pairSection: { marginBottom: 20 },
  pairHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 2 },
  pairTitle: { fontSize: 20, fontWeight: '700' as const },
  pairBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pairBadgeText: { fontSize: 12, fontWeight: '600' as const },
  errorsSection: { gap: 8, marginTop: 8 },
  errorRow: { borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1 },
  errorContent: { flex: 1, gap: 2 },
  errorLabel: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.3 },
  errorMsg: { fontSize: 12, lineHeight: 17 },
  refreshRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  refreshText: { fontSize: 11 },
  bottomPad: { height: 20 },
});
```

---

## app/(tabs)/trading.tsx

```tsx
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Switch, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { Zap, RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTrading } from '@/contexts/TradingContext';
import { useExchange } from '@/contexts/ExchangeContext';
import { useTickerData } from '@/hooks/useTickerData';
import { trpc } from '@/lib/trpc';
import { useMemo, useCallback } from 'react';
import { ExchangeName } from '@/types/exchanges';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LivePriceTicker } from '@/components/trading/LivePriceTicker';
import { PaperExecutionSimulator } from '@/components/trading/PaperExecutionSimulator';

export default function TradingScreen() {
  const { theme } = useTheme();
  const { tradeMode, switchMode, paperState, executePaperArbitrage, resetPaperTrading } = useTrading();
  const { configs } = useExchange();
  const { tickers, topOpportunities, isFetching, isLoading, queryError, isEnabled, refetch } = useTickerData(5);

  const executeTradeEndpoint = trpc.exchanges.execute.useMutation();

  const executeLiveMutation = useMutation({
    mutationFn: async (params: { buyExchange: ExchangeName; sellExchange: ExchangeName; symbol: string; amount: number }) => {
      const buyConfig = configs.find((c) => c.name === params.buyExchange);
      const sellConfig = configs.find((c) => c.name === params.sellExchange);
      if (!buyConfig?.apiKey || !sellConfig?.apiKey) throw new Error('API keys not configured');

      const buyResult = await executeTradeEndpoint.mutateAsync({
        exchange: params.buyExchange, apiKey: buyConfig.apiKey, apiSecret: buyConfig.apiSecret,
        symbol: params.symbol, side: 'buy', amount: params.amount,
      });
      if (!buyResult.success) throw new Error(`Buy failed: ${buyResult.error}`);

      const sellResult = await executeTradeEndpoint.mutateAsync({
        exchange: params.sellExchange, apiKey: sellConfig.apiKey, apiSecret: sellConfig.apiSecret,
        symbol: params.symbol, side: 'sell', amount: params.amount,
      });
      return { buyResult, sellResult };
    },
  });

  const handleExecute = useCallback((opp: (typeof topOpportunities)[0]) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (tradeMode === 'paper') {
      const result = executePaperArbitrage(opp.buyExchange, opp.sellExchange, opp.symbol, opp.tradeAmount, opp.buyPrice, opp.sellPrice);
      if (result.status === 'complete') {
        Alert.alert(
          'Paper Trade Executed',
          `${opp.symbol} • ${opp.tradeAmount} units\n` +
          `Buy ${opp.buyExchange.toUpperCase()} @ ${opp.buyPrice.toFixed(2)}\n` +
          `Sell ${opp.sellExchange.toUpperCase()} @ ${opp.sellPrice.toFixed(2)}\n` +
          `Gross: ${result.grossProfit.toFixed(4)}\n` +
          `Fees: ${result.totalFees.toFixed(4)}\n` +
          `Net P&L: ${result.netProfit.toFixed(4)}\n` +
          `Executed at live prices`
        );
      } else {
        Alert.alert('Trade Failed', result.buyOrder.errorMessage || result.sellOrder.errorMessage || 'Unknown error');
      }
    } else {
      Alert.alert(
        'Execute Live Trade?',
        `REAL orders:\nBuy ${opp.tradeAmount} ${opp.symbol} on ${opp.buyExchange.toUpperCase()}\nSell on ${opp.sellExchange.toUpperCase()}\nEst. profit: $${opp.netProfit.toFixed(2)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Execute', style: 'destructive',
            onPress: () => executeLiveMutation.mutate({ buyExchange: opp.buyExchange, sellExchange: opp.sellExchange, symbol: opp.symbol, amount: opp.tradeAmount }),
          },
        ]
      );
    }
  }, [tradeMode, executePaperArbitrage, executeLiveMutation]);

  const handleReset = useCallback(() => {
    Alert.alert('Reset Paper Trading?', 'All paper balances and history will be reset.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetPaperTrading() },
    ]);
  }, [resetPaperTrading]);

  const recentExecutions = useMemo(() => paperState.executions.slice(0, 10), [paperState.executions]);
  const recentTrades = useMemo(() => paperState.trades.slice(0, 20), [paperState.trades]);

  return (
    <>
      <Stack.Screen options={{ title: 'Trading' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
      >
        <View style={styles.header}>
          <Zap size={28} color={theme.warning} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Trading</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Execute arbitrage opportunities</Text>
        </View>

        <LivePriceTicker tickers={tickers} isFetching={isFetching} />

        <View style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.modeRow}>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Paper</Text>
              <Text style={[styles.modeDesc, { color: theme.textTertiary }]}>Simulated</Text>
            </View>
            <Switch
              value={tradeMode === 'live'}
              onValueChange={(val) => {
                if (val) {
                  Alert.alert('Switch to Live?', 'Live mode executes REAL trades with REAL money.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Go Live', style: 'destructive', onPress: () => switchMode('live') },
                  ]);
                } else {
                  void switchMode('paper');
                }
              }}
              trackColor={{ false: theme.warning, true: theme.error }}
              thumbColor="#FFFFFF"
            />
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Live</Text>
              <Text style={[styles.modeDesc, { color: theme.textTertiary }]}>Real money</Text>
            </View>
          </View>
          <View style={[styles.modeIndicator, { backgroundColor: tradeMode === 'paper' ? theme.warningLight : theme.errorLight, borderColor: tradeMode === 'paper' ? theme.warning : theme.error }]}>
            {tradeMode === 'paper' ? <AlertTriangle size={14} color={theme.warningDark} /> : <Zap size={14} color={theme.errorDark} />}
            <Text style={[styles.modeIndicatorText, { color: tradeMode === 'paper' ? theme.warningDark : theme.errorDark }]}>
              {tradeMode === 'paper' ? 'PAPER — No real money' : 'LIVE — Real money trades'}
            </Text>
          </View>
        </View>

        {tradeMode === 'paper' && topOpportunities.length > 0 && (
          <PaperExecutionSimulator opportunities={topOpportunities} isFetching={isFetching} />
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Opportunities</Text>
          {isFetching && (
            <View style={styles.fetchingIndicator}>
              <Activity size={12} color={theme.tint} />
              <Text style={[styles.fetchingText, { color: theme.tint }]}>Live</Text>
            </View>
          )}
        </View>

        {queryError && tickers.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
            <AlertTriangle size={18} color={theme.error} />
            <Text style={[styles.emptyText, { color: theme.errorDark, marginTop: 6 }]}>{queryError}</Text>
          </View>
        )}

        {!isEnabled && (
          <View style={[styles.emptyCard, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
            <AlertTriangle size={18} color={theme.warning} />
            <Text style={[styles.emptyText, { color: theme.warningDark, marginTop: 6 }]}>Enable exchanges and pairs in Settings to see opportunities.</Text>
          </View>
        )}

        {isEnabled && !queryError && topOpportunities.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>{isLoading ? 'Loading market data...' : 'No profitable opportunities right now.'}</Text>
          </View>
        ) : (
          topOpportunities.map((opp, i) => (
            <View key={`${opp.buyExchange}-${opp.sellExchange}-${opp.symbol}-${i}`} style={[styles.oppCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.oppHeader}>
                <View style={styles.oppFlow}>
                  <View style={[styles.sideBadge, { backgroundColor: theme.success }]}><Text style={styles.sideText}>BUY</Text></View>
                  <Text style={[styles.oppEx, { color: theme.text }]}>{opp.buyExchange.toUpperCase()}</Text>
                  <Text style={[styles.oppArrow, { color: theme.textTertiary }]}>→</Text>
                  <View style={[styles.sideBadge, { backgroundColor: theme.error }]}><Text style={styles.sideText}>SELL</Text></View>
                  <Text style={[styles.oppEx, { color: theme.text }]}>{opp.sellExchange.toUpperCase()}</Text>
                </View>
                <View style={[styles.symbolTag, { backgroundColor: theme.infoLight }]}>
                  <Text style={[styles.symbolText, { color: theme.infoDark }]}>{opp.symbol}</Text>
                </View>
              </View>

              <View style={styles.oppMetrics}>
                <View style={styles.metricRow}><Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Buy at</Text><Text style={[styles.metricVal, { color: theme.text }]}>${opp.buyPrice.toFixed(2)}</Text></View>
                <View style={styles.metricRow}><Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Sell at</Text><Text style={[styles.metricVal, { color: theme.text }]}>${opp.sellPrice.toFixed(2)}</Text></View>
                <View style={styles.metricRow}><Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Spread</Text><Text style={[styles.metricVal, { color: theme.tint }]}>{opp.percentDeviation.toFixed(3)}%</Text></View>
                <View style={styles.metricRow}><Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Fees</Text><Text style={[styles.metricVal, { color: theme.error }]}>${opp.totalCost.toFixed(4)}</Text></View>
                <View style={styles.metricRow}><Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Net Profit</Text><Text style={[styles.metricVal, { color: theme.successDark, fontWeight: '700' as const }]}>${opp.netProfit.toFixed(4)}</Text></View>
                <View style={[styles.liveTag, { backgroundColor: theme.success + '15' }]}>
                  <View style={[styles.liveDotSmall, { backgroundColor: theme.success }]} />
                  <Text style={[styles.liveTagText, { color: theme.success }]}>Live price @ {new Date().toLocaleTimeString()}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.execBtn, { backgroundColor: tradeMode === 'paper' ? theme.warning : theme.success }]}
                onPress={() => handleExecute(opp)}
                activeOpacity={0.7}
                testID={`execute-btn-${i}`}
              >
                <Zap size={14} color="#FFF" />
                <Text style={styles.execBtnText}>{tradeMode === 'paper' ? 'Paper Trade' : 'Execute Live'}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {tradeMode === 'paper' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Executions</Text>
              {paperState.executions.length > 0 && (
                <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                  <RotateCcw size={12} color={theme.error} />
                  <Text style={[styles.resetText, { color: theme.error }]}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentExecutions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No trades yet. Execute an opportunity above.</Text>
              </View>
            ) : (
              recentExecutions.map((exec) => (
                <View key={exec.id} style={[styles.execCard, { backgroundColor: theme.surface, borderLeftColor: exec.status === 'complete' ? theme.success : theme.error, borderColor: theme.border }]}>
                  <View style={styles.execHeader}>
                    <View style={styles.execStatus}>
                      {exec.status === 'complete' ? <CheckCircle size={14} color={theme.success} /> : <XCircle size={14} color={theme.error} />}
                      <Text style={[styles.execStatusText, { color: exec.status === 'complete' ? theme.successDark : theme.errorDark }]}>{exec.status.toUpperCase()}</Text>
                    </View>
                    <View style={styles.execTime}>
                      <Clock size={10} color={theme.textTertiary} />
                      <Text style={[styles.execTimeText, { color: theme.textTertiary }]}>{new Date(exec.timestamp).toLocaleTimeString()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.execDesc, { color: theme.textSecondary }]}>
                    {exec.buyOrder.exchange.toUpperCase()} → {exec.sellOrder.exchange.toUpperCase()} • {exec.symbol}
                  </Text>
                  <View style={[styles.execPriceRow, { borderColor: theme.borderLight }]}>
                    <View style={styles.execPriceCol}>
                      <Text style={[styles.execPriceLabel, { color: theme.textTertiary }]}>Buy</Text>
                      <Text style={[styles.execPriceVal, { color: theme.success }]}>${exec.buyOrder.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.execPriceCol}>
                      <Text style={[styles.execPriceLabel, { color: theme.textTertiary }]}>Sell</Text>
                      <Text style={[styles.execPriceVal, { color: theme.error }]}>${exec.sellOrder.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.execPriceCol}>
                      <Text style={[styles.execPriceLabel, { color: theme.textTertiary }]}>Gross</Text>
                      <Text style={[styles.execPriceVal, { color: theme.text }]}>${exec.grossProfit.toFixed(4)}</Text>
                    </View>
                  </View>
                  <View style={styles.execBottom}>
                    <Text style={[styles.execPnl, { color: exec.netProfit >= 0 ? theme.successDark : theme.errorDark }]}>{exec.netProfit >= 0 ? '+' : ''}${exec.netProfit.toFixed(4)}</Text>
                    <Text style={[styles.execFees, { color: theme.textTertiary }]}>Fees: ${exec.totalFees.toFixed(4)}</Text>
                  </View>
                  <View style={[styles.liveTag, { backgroundColor: theme.tint + '10' }]}>
                    <View style={[styles.liveDotSmall, { backgroundColor: theme.tint }]} />
                    <Text style={[styles.liveTagText, { color: theme.tint }]}>Executed at live market prices</Text>
                  </View>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 8 }]}>Trade Log</Text>
            {recentTrades.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No trades logged yet.</Text>
              </View>
            ) : (
              recentTrades.map((trade) => (
                <View key={trade.id} style={[styles.tradeRow, { backgroundColor: theme.surface, borderLeftColor: trade.side === 'buy' ? theme.success : theme.error, borderColor: theme.border }]}>
                  <View style={styles.tradeHeader}>
                    <View style={[styles.tradeSide, { backgroundColor: trade.side === 'buy' ? theme.success : theme.error }]}>
                      <Text style={styles.tradeSideText}>{trade.side.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.tradeEx, { color: theme.text }]}>{trade.exchange.toUpperCase()}</Text>
                    <Text style={[styles.tradeSym, { color: theme.textSecondary }]}>{trade.symbol}</Text>
                  </View>
                  <View style={styles.tradeDetails}>
                    <Text style={[styles.tradeDetail, { color: theme.text }]}>{trade.amount} @ ${trade.price.toFixed(2)}</Text>
                    <View style={styles.tradeStatusRow}>
                      {trade.status === 'filled' ? <CheckCircle size={10} color={theme.success} /> : <XCircle size={10} color={theme.error} />}
                      <Text style={[styles.tradeStatusText, { color: trade.status === 'filled' ? theme.success : theme.error }]}>{trade.status}</Text>
                    </View>
                  </View>
                  {trade.errorMessage && <Text style={[styles.tradeError, { color: theme.errorDark }]}>{trade.errorMessage}</Text>}
                </View>
              ))
            )}
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 20, paddingTop: 4 },
  title: { fontSize: 24, fontWeight: '700' as const, marginTop: 8, marginBottom: 2 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  modeCard: { borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1 },
  modeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  modeInfo: { flex: 1 },
  modeLabel: { fontSize: 13, fontWeight: '600' as const, marginBottom: 1 },
  modeDesc: { fontSize: 10 },
  modeIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8, borderWidth: 1 },
  modeIndicatorText: { fontSize: 11, fontWeight: '700' as const },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 10, paddingHorizontal: 2 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 2 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resetText: { fontSize: 12, fontWeight: '600' as const },
  emptyCard: { borderRadius: 14, padding: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  oppCard: { borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  oppHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  oppFlow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sideBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  sideText: { fontSize: 9, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  oppEx: { fontSize: 12, fontWeight: '700' as const },
  oppArrow: { fontSize: 13, fontWeight: '700' as const },
  symbolTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  symbolText: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.3 },
  oppMetrics: { gap: 5, marginBottom: 12 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 12 },
  metricVal: { fontSize: 13, fontWeight: '600' as const },
  execBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  execBtnText: { fontSize: 13, fontWeight: '700' as const, color: '#FFF' },
  fetchingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fetchingText: { fontSize: 10, fontWeight: '600' as const },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 6 },
  liveDotSmall: { width: 5, height: 5, borderRadius: 3 },
  liveTagText: { fontSize: 9, fontWeight: '600' as const },
  execCard: { borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderWidth: 1 },
  execHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  execStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  execStatusText: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.5 },
  execTime: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  execTimeText: { fontSize: 10 },
  execDesc: { fontSize: 12, marginBottom: 4 },
  execBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  execPnl: { fontSize: 15, fontWeight: '700' as const },
  execFees: { fontSize: 10 },
  execPriceRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6, marginBottom: 6, borderTopWidth: 1, borderBottomWidth: 1 },
  execPriceCol: { alignItems: 'center' },
  execPriceLabel: { fontSize: 9, fontWeight: '600' as const, letterSpacing: 0.3, marginBottom: 2 },
  execPriceVal: { fontSize: 12, fontWeight: '700' as const },
  tradeRow: { borderRadius: 10, padding: 10, marginBottom: 6, borderLeftWidth: 3, borderWidth: 1 },
  tradeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  tradeSide: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  tradeSideText: { fontSize: 9, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  tradeEx: { fontSize: 12, fontWeight: '700' as const },
  tradeSym: { fontSize: 11 },
  tradeDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tradeDetail: { fontSize: 12, fontWeight: '500' as const },
  tradeStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tradeStatusText: { fontSize: 10, fontWeight: '600' as const },
  tradeError: { fontSize: 10, marginTop: 4, lineHeight: 15 },
  bottomPad: { height: 24 },
});
```

---

## app/(tabs)/portfolio.tsx

```tsx
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { Wallet, RefreshCw, AlertTriangle, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useExchange } from '@/contexts/ExchangeContext';
import { useTrading } from '@/contexts/TradingContext';
import { trpc } from '@/lib/trpc';
import { BalanceCard } from '@/components/market/BalanceCard';
import { useMemo, useCallback } from 'react';

export default function PortfolioScreen() {
  const { theme } = useTheme();
  const { getEnabledConfigs } = useExchange();
  const { tradeMode, paperState } = useTrading();
  const enabledConfigs = getEnabledConfigs();

  const configsWithKeys = useMemo(
    () => enabledConfigs.filter((c) => c.apiKey && c.apiSecret),
    [enabledConfigs]
  );

  const balanceQueries = configsWithKeys.map((config) =>
    trpc.exchanges.balance.useQuery(
      { exchange: config.name, apiKey: config.apiKey, apiSecret: config.apiSecret },
      { enabled: tradeMode === 'live' && !!config.apiKey && !!config.apiSecret, refetchInterval: 30000, staleTime: 15000 }
    )
  );

  const isAnyFetching = balanceQueries.some((q) => q.isFetching);
  const isAnyLoading = balanceQueries.some((q) => q.isLoading);

  const handleRefresh = useCallback(() => {
    balanceQueries.forEach((q) => q.refetch());
  }, [balanceQueries]);

  const paperBalances = useMemo(
    () => Object.entries(paperState.balances).map(([asset, b]) => ({ asset, free: b.amount, total: b.amount })),
    [paperState.balances]
  );

  const totalPaperValue = useMemo(
    () => paperBalances.reduce((sum, b) => (b.asset === 'USDT' || b.asset === 'USD' ? sum + b.total : sum), 0),
    [paperBalances]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Portfolio' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isAnyFetching && !isAnyLoading} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Wallet size={28} color={theme.tint} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Portfolio</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {tradeMode === 'paper' ? 'Paper Trading Balances' : 'Live Exchange Balances'}
          </Text>
        </View>

        <View style={[styles.modeBanner, { backgroundColor: tradeMode === 'paper' ? theme.warningLight : theme.successLight, borderColor: tradeMode === 'paper' ? theme.warning : theme.success }]}>
          {tradeMode === 'paper' ? <AlertTriangle size={14} color={theme.warningDark} /> : <DollarSign size={14} color={theme.successDark} />}
          <Text style={[styles.modeBannerText, { color: tradeMode === 'paper' ? theme.warningDark : theme.successDark }]}>
            {tradeMode === 'paper' ? 'PAPER MODE' : 'LIVE MODE'}
          </Text>
        </View>

        {tradeMode === 'paper' ? (
          <>
            <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Paper Portfolio Value</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                ${totalPaperValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryItemLabel, { color: theme.textTertiary }]}>P&L</Text>
                  <Text style={[styles.summaryItemValue, { color: paperState.totalPnl >= 0 ? theme.success : theme.error }]}>
                    {paperState.totalPnl >= 0 ? '+' : ''}${paperState.totalPnl.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryItemLabel, { color: theme.textTertiary }]}>Trades</Text>
                  <Text style={[styles.summaryItemValue, { color: theme.text }]}>{paperState.tradeCount}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryItemLabel, { color: theme.textTertiary }]}>Initial</Text>
                  <Text style={[styles.summaryItemValue, { color: theme.text }]}>${paperState.initialCapital.toLocaleString()}</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Paper Balances</Text>
            <View style={[styles.balanceList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {paperBalances.map((b) => (
                <View key={b.asset} style={[styles.balanceRow, { borderBottomColor: theme.borderLight }]}>
                  <View style={[styles.assetTag, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.assetText, { color: theme.text }]}>{b.asset}</Text>
                  </View>
                  <Text style={[styles.balanceAmt, { color: theme.text }]}>
                    {b.total < 1 ? b.total.toFixed(8) : b.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </Text>
                </View>
              ))}
              {paperBalances.length === 0 && (
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No paper balances</Text>
              )}
            </View>
          </>
        ) : (
          <>
            {configsWithKeys.length === 0 ? (
              <View style={[styles.noKeysCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <AlertTriangle size={28} color={theme.warning} />
                <Text style={[styles.noKeysTitle, { color: theme.text }]}>No API Keys Configured</Text>
                <Text style={[styles.noKeysDesc, { color: theme.textSecondary }]}>
                  Add API keys in Settings to view live balances.
                </Text>
              </View>
            ) : (
              configsWithKeys.map((config, i) => {
                const q = balanceQueries[i];
                return (
                  <BalanceCard
                    key={config.name}
                    exchange={config.name}
                    balances={q?.data?.balances ?? []}
                    error={q?.data?.error ?? null}
                    isLoading={q?.isLoading ?? false}
                  />
                );
              })
            )}
          </>
        )}

        {isAnyFetching && !isAnyLoading && (
          <View style={styles.refreshRow}>
            <RefreshCw size={14} color={theme.textTertiary} />
            <Text style={[styles.refreshText, { color: theme.textTertiary }]}>Updating...</Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 16, paddingTop: 4 },
  title: { fontSize: 24, fontWeight: '700' as const, marginTop: 8, marginBottom: 2 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  modeBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  modeBannerText: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.8 },
  summaryCard: { borderRadius: 14, padding: 18, marginBottom: 18, borderWidth: 1 },
  summaryLabel: { fontSize: 12, fontWeight: '500' as const, marginBottom: 4 },
  summaryValue: { fontSize: 30, fontWeight: '700' as const, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { alignItems: 'center' },
  summaryItemLabel: { fontSize: 10, fontWeight: '500' as const, marginBottom: 3 },
  summaryItemValue: { fontSize: 15, fontWeight: '700' as const },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 10, paddingHorizontal: 2 },
  balanceList: { borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  assetTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, minWidth: 45, alignItems: 'center' },
  assetText: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.5 },
  balanceAmt: { fontSize: 14, fontWeight: '600' as const },
  emptyText: { fontSize: 12, textAlign: 'center', paddingVertical: 14 },
  noKeysCard: { borderRadius: 14, padding: 28, alignItems: 'center', gap: 10, borderWidth: 1 },
  noKeysTitle: { fontSize: 16, fontWeight: '700' as const },
  noKeysDesc: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  refreshRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  refreshText: { fontSize: 11 },
  bottomPad: { height: 20 },
});
```

---

## app/(tabs)/settings.tsx

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

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <SettingsIcon size={28} color={theme.tint} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Configure exchanges and preferences</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {themeMode === 'light' ? <Sun size={18} color={theme.textSecondary} /> : <Moon size={18} color={theme.textSecondary} />}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          </View>
          <View style={[styles.toggleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.toggleInfo}><Text style={[styles.toggleLabel, { color: theme.text }]}>Light</Text></View>
            <Switch value={themeMode === 'dark'} onValueChange={toggleTheme} trackColor={{ false: theme.warning, true: theme.tint }} thumbColor="#FFFFFF" />
            <View style={styles.toggleInfo}><Text style={[styles.toggleLabel, { color: theme.text }]}>Dark</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Server size={18} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Environment</Text>
          </View>
          <View style={[styles.toggleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleLabel, { color: theme.text }]}>Sandbox</Text>
              <Text style={[styles.toggleDesc, { color: theme.textTertiary }]}>Test APIs</Text>
            </View>
            <Switch value={globalMode === 'live'} onValueChange={(v) => setMode(v ? 'live' : 'sandbox')} trackColor={{ false: theme.warning, true: theme.success }} thumbColor="#FFFFFF" />
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleLabel, { color: theme.text }]}>Live</Text>
              <Text style={[styles.toggleDesc, { color: theme.textTertiary }]}>Real data</Text>
            </View>
          </View>
          <View style={[styles.indicator, { backgroundColor: globalMode === 'live' ? theme.successLight : theme.warningLight, borderColor: globalMode === 'live' ? theme.success : theme.warning }]}>
            <CheckCircle size={14} color={globalMode === 'live' ? theme.successDark : theme.warningDark} />
            <Text style={[styles.indicatorText, { color: globalMode === 'live' ? theme.successDark : theme.warningDark }]}>
              {globalMode.toUpperCase()} mode
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Coins size={18} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Crypto Pairs</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>Enable up to 3 pairs to monitor.</Text>

          <View style={[styles.pairsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {cryptoPairs.map((pair) => {
              const enabledCount = cryptoPairs.filter((p) => p.enabled).length;
              const canEnable = !pair.enabled && enabledCount < 3;
              return (
                <View key={pair.name} style={[styles.pairRow, { borderBottomColor: theme.borderLight }]}>
                  <View style={styles.pairInfo}>
                    <Text style={[styles.pairName, { color: theme.text }]}>{pair.displayName}</Text>
                    <Text style={[styles.pairSymbol, { color: theme.textSecondary }]}>{pair.symbol}</Text>
                  </View>
                  <Switch
                    value={pair.enabled}
                    onValueChange={(v) => {
                      if (v && !canEnable) { Alert.alert('Limit Reached', 'Max 3 pairs.'); return; }
                      void updateCryptoPairConfig(pair.name, v);
                    }}
                    trackColor={{ false: theme.border, true: theme.success }}
                    thumbColor="#FFFFFF"
                    disabled={!canEnable && !pair.enabled}
                  />
                </View>
              );
            })}
          </View>
          <View style={[styles.indicator, { backgroundColor: theme.infoLight, borderColor: theme.info }]}>
            <Text style={[styles.indicatorText, { color: theme.infoDark }]}>
              {cryptoPairs.filter((p) => p.enabled).length} / 3 pairs enabled
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key size={18} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Exchange API Keys</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>Keys are stored securely on your device.</Text>

          {configs.map((config) => (
            <ExchangeConfigCard
              key={config.name}
              config={config}
              showApiKey={showApiKeys[config.name] || false}
              onToggleShow={() => setShowApiKeys((p) => ({ ...p, [config.name]: !p[config.name] }))}
              onUpdate={async (name, updates) => { await updateExchangeConfig(name, updates); Alert.alert('Saved', `${name} updated`); }}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>API keys are encrypted and stored locally</Text>
        </View>
      </ScrollView>
    </>
  );
}

interface CardProps {
  config: ExchangeConfig;
  showApiKey: boolean;
  onToggleShow: () => void;
  onUpdate: (name: string, updates: Partial<ExchangeConfig>) => void;
}

function ExchangeConfigCard({ config, showApiKey, onToggleShow, onUpdate }: CardProps) {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [apiSecret, setApiSecret] = useState(config.apiSecret);
  const [editing, setEditing] = useState(false);

  useEffect(() => { setApiKey(config.apiKey); setApiSecret(config.apiSecret); }, [config.apiKey, config.apiSecret]);

  const save = () => { onUpdate(config.name, { apiKey, apiSecret }); setEditing(false); };
  const cancel = () => { setApiKey(config.apiKey); setApiSecret(config.apiSecret); setEditing(false); };

  return (
    <View style={[styles.exCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.exHeader, { borderBottomColor: theme.borderLight }]}>
        <View style={styles.exHeaderLeft}>
          <Text style={[styles.exName, { color: theme.text }]}>{config.displayName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: config.enabled ? theme.successLight : theme.surfaceSecondary, borderColor: config.enabled ? theme.success : theme.border }]}>
            <Text style={[styles.statusText, { color: config.enabled ? theme.successDark : theme.textSecondary }]}>
              {config.enabled ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>
        <Switch value={config.enabled} onValueChange={(v) => onUpdate(config.name, { enabled: v })} trackColor={{ false: theme.border, true: theme.success }} thumbColor="#FFFFFF" />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>API Key</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={apiKey}
            onChangeText={(t) => { setApiKey(t); setEditing(true); }}
            placeholder="Enter API key"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={onToggleShow}>
            {showApiKey ? <EyeOff size={18} color={theme.textSecondary} /> : <Eye size={18} color={theme.textSecondary} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>API Secret</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={apiSecret}
            onChangeText={(t) => { setApiSecret(t); setEditing(true); }}
            placeholder="Enter API secret"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {editing && (
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, borderWidth: 1 }]} onPress={cancel}>
            <Text style={[styles.btnSecText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.tint }]} onPress={save}>
            <Text style={styles.btnPrimText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 24, paddingTop: 4 },
  title: { fontSize: 24, fontWeight: '700' as const, marginTop: 8, marginBottom: 2 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const },
  sectionDesc: { fontSize: 13, marginBottom: 12, lineHeight: 19 },
  toggleCard: { borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1 },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: 13, fontWeight: '600' as const, marginBottom: 1 },
  toggleDesc: { fontSize: 10 },
  indicator: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 8, borderWidth: 1 },
  indicatorText: { fontSize: 12, fontWeight: '600' as const },
  pairsCard: { borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  pairRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  pairInfo: { flex: 1 },
  pairName: { fontSize: 14, fontWeight: '600' as const, marginBottom: 1 },
  pairSymbol: { fontSize: 12 },
  exCard: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1 },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1 },
  exHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exName: { fontSize: 16, fontWeight: '700' as const },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, borderWidth: 1 },
  statusText: { fontSize: 9, fontWeight: '700' as const, letterSpacing: 0.5 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600' as const, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 13 },
  eyeBtn: { position: 'absolute', right: 10, padding: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnPrimText: { fontSize: 13, fontWeight: '600' as const, color: '#FFF' },
  btnSecText: { fontSize: 13, fontWeight: '600' as const },
  footer: { paddingVertical: 20, alignItems: 'center' },
  footerText: { fontSize: 11, textAlign: 'center' },
});
```

---

## app/+not-found.tsx

```tsx
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "404" }} />
      <View style={styles.container}>
        <AlertCircle size={64} color="#EF4444" strokeWidth={2} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.description}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Market</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "#F9FAFB", gap: 12 },
  title: { fontSize: 24, fontWeight: "700" as const, color: "#111827" },
  description: { fontSize: 16, color: "#6B7280", marginBottom: 8 },
  link: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: "#3B82F6", borderRadius: 8 },
  linkText: { fontSize: 16, fontWeight: "600" as const, color: "#FFFFFF" },
});
```

---

## app/+native-intent.tsx

```tsx
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  return '/';
}
```

---

## lib/trpc.ts

```ts
import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  throw new Error("No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL");
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
```

---

## hooks/useTickerData.ts

```ts
import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { TickerData, ExchangeName } from '@/types/exchanges';
import { useExchange } from '@/contexts/ExchangeContext';
import { findTopArbitrageOpportunities, ArbitrageOpportunity } from '@/utils/arbitrage';

interface TickerError {
  key: string;
  exchange: string;
  symbol: string;
  message: string;
}

interface UseTickerDataResult {
  tickers: TickerData[];
  tickersByPair: Record<string, TickerData[]>;
  topOpportunities: ArbitrageOpportunity[];
  errors: TickerError[];
  queryError: string | null;
  isFetching: boolean;
  isLoading: boolean;
  isEnabled: boolean;
  refetch: () => void;
}

export function useTickerData(opportunityLimit: number = 5): UseTickerDataResult {
  const { getEnabledConfigs, getEnabledCryptoPairs } = useExchange();
  const enabledConfigs = getEnabledConfigs();
  const enabledPairs = getEnabledCryptoPairs();

  const enabledExchanges = useMemo(
    () => enabledConfigs.map((c) => c.name as ExchangeName),
    [enabledConfigs]
  );

  const symbols = useMemo(
    () => enabledPairs.map((p) => p.symbol),
    [enabledPairs]
  );

  const isEnabled = enabledExchanges.length > 0 && symbols.length > 0;

  const { data, isFetching, isLoading, refetch, error: rawQueryError } = trpc.exchanges.ticker.useQuery(
    { exchanges: enabledExchanges, symbols },
    { enabled: isEnabled }
  );

  const queryError = useMemo(() => {
    if (!isEnabled) return 'No exchanges or pairs enabled. Enable them in Settings.';
    if (rawQueryError) {
      const msg = rawQueryError instanceof Error ? rawQueryError.message : JSON.stringify(rawQueryError);
      console.error('[useTickerData] Query error:', msg);
      return `Failed to fetch market data: ${msg}`;
    }
    return null;
  }, [isEnabled, rawQueryError]);

  const tickers: TickerData[] = useMemo(() => {
    if (!data?.results) return [];
    return data.results
      .filter((r: Record<string, unknown>) => !r.error)
      .map((r: Record<string, unknown>) => ({
        exchange: r.exchange as ExchangeName,
        symbol: r.symbol as string,
        bidPrice: String(r.bid),
        askPrice: String(r.ask),
        bidQty: '0',
        askQty: '0',
        timestamp: r.ts as number,
      }));
  }, [data]);

  const tickersByPair = useMemo(() => {
    const grouped: Record<string, TickerData[]> = {};
    for (const ticker of tickers) {
      if (!grouped[ticker.symbol]) grouped[ticker.symbol] = [];
      grouped[ticker.symbol].push(ticker);
    }
    return grouped;
  }, [tickers]);

  const topOpportunities = useMemo(
    () => findTopArbitrageOpportunities(tickersByPair, opportunityLimit),
    [tickersByPair, opportunityLimit]
  );

  const errors: TickerError[] = useMemo(() => {
    if (!data?.results) return [];
    return data.results
      .filter((r: Record<string, unknown>) => r.error)
      .map((r: Record<string, unknown>, idx: number) => ({
        key: `error-${String(r.exchange)}-${String(r.symbol)}-${idx}`,
        exchange: r.exchange as string,
        symbol: r.symbol as string,
        message: r.error as string,
      }));
  }, [data]);

  return { tickers, tickersByPair, topOpportunities, errors, queryError, isFetching, isLoading, isEnabled, refetch };
}
```

---

## contexts/ExchangeContext.tsx

```tsx
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
      configs, globalMode, isLoading, cryptoPairs,
      updateExchangeConfig, setMode, getEnabledConfigs, getEnabledCryptoPairs, updateCryptoPairConfig,
    }),
    [configs, globalMode, isLoading, cryptoPairs, updateExchangeConfig, setMode, getEnabledConfigs, getEnabledCryptoPairs, updateCryptoPairConfig]
  );
});
```

---

## contexts/ThemeContext.tsx

```tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { lightTheme, darkTheme, Theme } from '@/constants/colors';

type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'app_theme_mode';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored === 'light' || stored === 'dark') setMode(stored);
      } catch (e) {
        console.error('[Theme] Load error:', e);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      void AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    void AsyncStorage.setItem(THEME_KEY, newMode);
  }, []);

  const theme: Theme = mode === 'light' ? lightTheme : darkTheme;

  return useMemo(() => ({ mode, theme, toggleTheme, setThemeMode }), [mode, theme, toggleTheme, setThemeMode]);
});
```

---

## contexts/TradingContext.tsx

```tsx
import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TradeMode, TradeOrder, ArbitrageExecution, PaperTradingState, TradeSide } from '@/types/trading';
import { ExchangeName } from '@/types/exchanges';
import { EXCHANGE_TRADING_FEES } from '@/constants/exchanges';

const PAPER_KEY = 'paper_trading_state';
const MODE_KEY = 'trade_mode';

const DEFAULT_PAPER: PaperTradingState = {
  enabled: false,
  initialCapital: 10000,
  balances: { USDT: { asset: 'USDT', amount: 10000 } },
  trades: [],
  executions: [],
  totalPnl: 0,
  tradeCount: 0,
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const [TradingProvider, useTrading] = createContextHook(() => {
  const [tradeMode, setTradeMode] = useState<TradeMode>('paper');
  const [paperState, setPaperState] = useState<PaperTradingState>(DEFAULT_PAPER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [storedMode, storedPaper] = await Promise.all([
          AsyncStorage.getItem(MODE_KEY),
          AsyncStorage.getItem(PAPER_KEY),
        ]);
        if (storedMode === 'live' || storedMode === 'paper') setTradeMode(storedMode);
        if (storedPaper) setPaperState(JSON.parse(storedPaper));
      } catch (e) {
        console.error('[Trading] Load error:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (state: PaperTradingState) => {
    try { await AsyncStorage.setItem(PAPER_KEY, JSON.stringify(state)); } catch (e) { console.error('[Trading] Save error:', e); }
  }, []);

  const switchMode = useCallback(async (mode: TradeMode) => {
    setTradeMode(mode);
    await AsyncStorage.setItem(MODE_KEY, mode);
  }, []);

  const executePaperTrade = useCallback(
    (exchange: ExchangeName, symbol: string, side: TradeSide, amount: number, price: number): TradeOrder => {
      const fees = EXCHANGE_TRADING_FEES[exchange];
      const fee = price * amount * fees.taker;
      const total = side === 'buy' ? price * amount + fee : price * amount - fee;
      const [base, quote] = symbol.split('/');

      const order: TradeOrder = {
        id: uid(), mode: 'paper', exchange, symbol, side, amount, price, status: 'filled', fee, total, timestamp: Date.now(),
      };

      setPaperState((prev) => {
        const bal = { ...prev.balances };

        if (side === 'buy') {
          const qBal = bal[quote]?.amount ?? 0;
          if (qBal < total) {
            order.status = 'failed';
            order.errorMessage = `Insufficient ${quote}: need $${total.toFixed(2)}, have $${qBal.toFixed(2)}`;
            return { ...prev, trades: [order, ...prev.trades].slice(0, 100) };
          }
          bal[quote] = { asset: quote, amount: qBal - total };
          bal[base] = { asset: base, amount: (bal[base]?.amount ?? 0) + amount };
        } else {
          const bBal = bal[base]?.amount ?? 0;
          if (bBal < amount) {
            order.status = 'failed';
            order.errorMessage = `Insufficient ${base}: need ${amount}, have ${bBal.toFixed(6)}`;
            return { ...prev, trades: [order, ...prev.trades].slice(0, 100) };
          }
          bal[base] = { asset: base, amount: bBal - amount };
          bal[quote] = { asset: quote, amount: (bal[quote]?.amount ?? 0) + total };
        }

        const next: PaperTradingState = {
          ...prev, balances: bal, trades: [order, ...prev.trades].slice(0, 100), tradeCount: prev.tradeCount + 1,
        };
        void persist(next);
        return next;
      });

      return order;
    },
    [persist]
  );

  const executePaperArbitrage = useCallback(
    (buyEx: ExchangeName, sellEx: ExchangeName, symbol: string, amount: number, buyPrice: number, sellPrice: number): ArbitrageExecution => {
      const buyOrder = executePaperTrade(buyEx, symbol, 'buy', amount, buyPrice);
      const sellOrder = executePaperTrade(sellEx, symbol, 'sell', amount, sellPrice);

      const grossProfit = (sellPrice - buyPrice) * amount;
      const totalFees = buyOrder.fee + sellOrder.fee;
      const netProfit = grossProfit - totalFees;

      const execution: ArbitrageExecution = {
        id: uid(), mode: 'paper', buyOrder, sellOrder, symbol, grossProfit, totalFees, netProfit,
        status: buyOrder.status === 'filled' && sellOrder.status === 'filled' ? 'complete' : 'failed',
        timestamp: Date.now(),
      };

      setPaperState((prev) => {
        const next: PaperTradingState = {
          ...prev,
          executions: [execution, ...prev.executions].slice(0, 50),
          totalPnl: prev.totalPnl + (execution.status === 'complete' ? netProfit : 0),
        };
        void persist(next);
        return next;
      });

      return execution;
    },
    [executePaperTrade, persist]
  );

  const resetPaperTrading = useCallback(async () => {
    setPaperState(DEFAULT_PAPER);
    await persist(DEFAULT_PAPER);
  }, [persist]);

  const getPaperBalance = useCallback((asset: string) => paperState.balances[asset]?.amount ?? 0, [paperState.balances]);

  const canAffordTrade = useCallback(
    (symbol: string, side: TradeSide, amount: number, price: number, exchange: ExchangeName): boolean => {
      const [base, quote] = symbol.split('/');
      const fee = price * amount * EXCHANGE_TRADING_FEES[exchange].taker;
      return side === 'buy' ? getPaperBalance(quote) >= price * amount + fee : getPaperBalance(base) >= amount;
    },
    [getPaperBalance]
  );

  return useMemo(
    () => ({ tradeMode, paperState, isLoading, switchMode, executePaperTrade, executePaperArbitrage, resetPaperTrading, getPaperBalance, canAffordTrade }),
    [tradeMode, paperState, isLoading, switchMode, executePaperTrade, executePaperArbitrage, resetPaperTrading, getPaperBalance, canAffordTrade]
  );
});
```

---

## types/exchanges.ts

```ts
export type ExchangeName = 'binance' | 'kraken' | 'coinbase' | 'bybit';
export type ExchangeMode = 'sandbox' | 'live';
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
  askPrice: string;
  bidQty: string;
  askQty: string;
  timestamp: number;
}

export interface TickerResult {
  exchange: ExchangeName;
  symbol: string;
  bid: number;
  ask: number;
  ts: number;
  error?: string;
}
```

---

## types/trading.ts

```ts
import { ExchangeName } from './exchanges';

export type TradeMode = 'live' | 'paper';
export type TradeSide = 'buy' | 'sell';
export type TradeStatus = 'pending' | 'filled' | 'failed' | 'cancelled';

export interface TradeOrder {
  id: string;
  mode: TradeMode;
  exchange: ExchangeName;
  symbol: string;
  side: TradeSide;
  amount: number;
  price: number;
  status: TradeStatus;
  fee: number;
  total: number;
  timestamp: number;
  errorMessage?: string;
}

export interface ArbitrageExecution {
  id: string;
  mode: TradeMode;
  buyOrder: TradeOrder;
  sellOrder: TradeOrder;
  symbol: string;
  grossProfit: number;
  totalFees: number;
  netProfit: number;
  status: 'pending' | 'partial' | 'complete' | 'failed';
  timestamp: number;
}

export interface PaperBalance {
  asset: string;
  amount: number;
}

export interface PaperTradingState {
  enabled: boolean;
  initialCapital: number;
  balances: Record<string, PaperBalance>;
  trades: TradeOrder[];
  executions: ArbitrageExecution[];
  totalPnl: number;
  tradeCount: number;
}
```

---

## constants/colors.ts

```ts
export type Theme = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  tint: string;
  success: string;
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  error: string;
  errorLight: string;
  errorDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
  card: string;
  cardShadow: string;
  statusBar: 'dark' | 'light';
};

export const lightTheme: Theme = {
  background: '#F8F9FB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F3F5',
  text: '#1A1D23',
  textSecondary: '#5F6B7A',
  textTertiary: '#9AA5B4',
  border: '#E2E6EB',
  borderLight: '#F1F3F5',
  tint: '#2563EB',
  success: '#059669',
  successLight: '#ECFDF5',
  successDark: '#047857',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  warningDark: '#B45309',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorDark: '#991B1B',
  info: '#2563EB',
  infoLight: '#EFF6FF',
  infoDark: '#1D4ED8',
  card: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
  statusBar: 'dark',
};

export const darkTheme: Theme = {
  background: '#0B0E14',
  surface: '#141820',
  surfaceSecondary: '#1C2230',
  text: '#E8ECF1',
  textSecondary: '#8B95A5',
  textTertiary: '#555F70',
  border: '#1E2636',
  borderLight: '#232B3A',
  tint: '#3B82F6',
  success: '#10B981',
  successLight: '#0D2E23',
  successDark: '#34D399',
  warning: '#F59E0B',
  warningLight: '#2E2108',
  warningDark: '#FCD34D',
  error: '#EF4444',
  errorLight: '#2E0D0D',
  errorDark: '#FCA5A5',
  info: '#3B82F6',
  infoLight: '#0D1B3E',
  infoDark: '#93C5FD',
  card: '#141820',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
  statusBar: 'light',
};
```

---

## constants/exchanges.ts

```ts
import { ExchangeConfig, ExchangeName, CryptoPairConfig } from '@/types/exchanges';

export const DEFAULT_EXCHANGE_CONFIGS: ExchangeConfig[] = [
  { name: 'kraken', displayName: 'Kraken', enabled: true, apiKey: '', apiSecret: '', mode: 'live' },
  { name: 'coinbase', displayName: 'Coinbase', enabled: true, apiKey: '', apiSecret: '', mode: 'live' },
  { name: 'binance', displayName: 'Binance', enabled: false, apiKey: '', apiSecret: '', mode: 'live' },
  { name: 'bybit', displayName: 'Bybit', enabled: false, apiKey: '', apiSecret: '', mode: 'live' },
];

export const DEFAULT_CRYPTO_PAIRS: CryptoPairConfig[] = [
  { name: 'BTC', displayName: 'Bitcoin', symbol: 'BTC/USDT', enabled: true },
  { name: 'ETH', displayName: 'Ethereum', symbol: 'ETH/USDT', enabled: false },
  { name: 'XRP', displayName: 'Ripple', symbol: 'XRP/USDT', enabled: false },
  { name: 'SOL', displayName: 'Solana', symbol: 'SOL/USDT', enabled: false },
  { name: 'BNB', displayName: 'Binance Coin', symbol: 'BNB/USDT', enabled: false },
  { name: 'ADA', displayName: 'Cardano', symbol: 'ADA/USDT', enabled: false },
];

export const EXCHANGE_TRADING_FEES: Record<ExchangeName, { maker: number; taker: number }> = {
  binance: { maker: 0.001, taker: 0.001 },
  bybit: { maker: 0.001, taker: 0.001 },
  kraken: { maker: 0.0016, taker: 0.0026 },
  coinbase: { maker: 0.004, taker: 0.006 },
};

export const TRADE_AMOUNT = 0.1;
export const REFRESH_INTERVAL = 5000;
```

---

## utils/arbitrage.ts

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

export function calculateArbitrageOpportunity(
  buyTicker: TickerData,
  sellTicker: TickerData,
  tradeAmount: number = TRADE_AMOUNT
): ArbitrageOpportunity {
  const buyPrice = parseFloat(buyTicker.askPrice);
  const sellPrice = parseFloat(sellTicker.bidPrice);
  const deviation = sellPrice - buyPrice;
  const percentDeviation = buyPrice > 0 ? (deviation / buyPrice) * 100 : 0;

  const buyFees = EXCHANGE_TRADING_FEES[buyTicker.exchange];
  const sellFees = EXCHANGE_TRADING_FEES[sellTicker.exchange];
  const buyFee = buyPrice * tradeAmount * buyFees.taker;
  const sellFee = sellPrice * tradeAmount * sellFees.taker;
  const totalCost = buyFee + sellFee;
  const costPercentage = buyPrice > 0 ? (totalCost / (buyPrice * tradeAmount)) * 100 : 0;

  const grossProfit = deviation * tradeAmount;
  const netProfit = grossProfit - totalCost;

  return {
    timestamp: Date.now(),
    buyExchange: buyTicker.exchange,
    sellExchange: sellTicker.exchange,
    buyPrice, sellPrice, deviation, percentDeviation, tradeAmount,
    buyFee, sellFee, totalCost, costPercentage, grossProfit, netProfit,
    isProfitable: netProfit > 0,
    symbol: buyTicker.symbol,
  };
}

export function findTopArbitrageOpportunities(
  tickersByPair: Record<string, TickerData[]>,
  limit: number = 5
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  for (const pairTickers of Object.values(tickersByPair)) {
    if (pairTickers.length < 2) continue;
    for (let i = 0; i < pairTickers.length; i++) {
      for (let j = 0; j < pairTickers.length; j++) {
        if (i === j) continue;
        const opp = calculateArbitrageOpportunity(pairTickers[i], pairTickers[j]);
        if (opp.deviation > 0 && opp.isProfitable) {
          opportunities.push(opp);
        }
      }
    }
  }
  return opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, limit);
}

export function getBestArbitragePath(tickers: TickerData[]) {
  if (tickers.length < 2) return null;
  let lowestAsk = Infinity;
  let highestBid = -Infinity;
  let lowestAskExchange: ExchangeName = tickers[0].exchange;
  let highestBidExchange: ExchangeName = tickers[0].exchange;

  for (const t of tickers) {
    const ask = parseFloat(t.askPrice);
    const bid = parseFloat(t.bidPrice);
    if (ask < lowestAsk) { lowestAsk = ask; lowestAskExchange = t.exchange; }
    if (bid > highestBid) { highestBid = bid; highestBidExchange = t.exchange; }
  }

  const priceDifference = highestBid - lowestAsk;
  const priceDifferencePercent = lowestAsk > 0 ? (priceDifference / lowestAsk) * 100 : 0;
  return { lowestAskExchange, lowestAsk, highestBidExchange, highestBid, priceDifference, priceDifferencePercent };
}

export function formatPrice(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPriceStr(value: string, decimals: number = 2): string {
  return formatPrice(parseFloat(value), decimals);
}
```

---

## utils/secureStorage.ts

```ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (!value) return;
    console.log(`[SecureStorage] Setting ${key}`);
    await SecureStore.setItemAsync(key, value);
  },
  async getItem(key: string): Promise<string | null> {
    console.log(`[SecureStorage] Getting ${key}`);
    return await SecureStore.getItemAsync(key);
  },
  async deleteItem(key: string): Promise<void> {
    console.log(`[SecureStorage] Deleting ${key}`);
    await SecureStore.deleteItemAsync(key);
  },
};
```

---

## components/market/TickerCard.tsx

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TickerData } from '@/types/exchanges';
import { useTheme } from '@/contexts/ThemeContext';
import { formatPriceStr } from '@/utils/arbitrage';

interface TickerCardProps {
  ticker: TickerData;
}

export const TickerCard = React.memo(function TickerCard({ ticker }: TickerCardProps) {
  const { theme } = useTheme();
  const bid = parseFloat(ticker.bidPrice);
  const ask = parseFloat(ticker.askPrice);
  const spread = ask - bid;
  const spreadPct = bid > 0 ? (spread / bid) * 100 : 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]} testID="ticker-card">
      <View style={styles.header}>
        <View style={[styles.exchangeBadge, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.exchangeName, { color: theme.text }]}>{ticker.exchange.toUpperCase()}</Text>
        </View>
        <Text style={[styles.timestamp, { color: theme.textTertiary }]}>
          {new Date(ticker.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <View style={styles.priceRow}>
        <View style={styles.priceBlock}>
          <Text style={[styles.priceLabel, { color: theme.success }]}>BID</Text>
          <Text style={[styles.price, { color: theme.success }]}>${formatPriceStr(ticker.bidPrice)}</Text>
        </View>
        <View style={[styles.spreadBlock, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
          <Text style={[styles.spreadLabel, { color: theme.textTertiary }]}>SPREAD</Text>
          <Text style={[styles.spreadValue, { color: theme.tint }]}>${spread.toFixed(2)}</Text>
          <Text style={[styles.spreadPct, { color: theme.textSecondary }]}>{spreadPct.toFixed(3)}%</Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={[styles.priceLabel, { color: theme.error }]}>ASK</Text>
          <Text style={[styles.price, { color: theme.error }]}>${formatPriceStr(ticker.askPrice)}</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  exchangeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  exchangeName: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 0.5 },
  timestamp: { fontSize: 11 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceBlock: { flex: 1, alignItems: 'center' },
  priceLabel: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1, marginBottom: 6 },
  price: { fontSize: 18, fontWeight: '700' as const },
  spreadBlock: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, marginHorizontal: 8 },
  spreadLabel: { fontSize: 9, fontWeight: '600' as const, letterSpacing: 0.5, marginBottom: 4 },
  spreadValue: { fontSize: 14, fontWeight: '700' as const, marginBottom: 2 },
  spreadPct: { fontSize: 10 },
});
```

---

## components/market/ComparisonCard.tsx

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TickerData } from '@/types/exchanges';
import { getBestArbitragePath } from '@/utils/arbitrage';
import { useTheme } from '@/contexts/ThemeContext';

interface ComparisonCardProps {
  tickers: TickerData[];
}

export const ComparisonCard = React.memo(function ComparisonCard({ tickers }: ComparisonCardProps) {
  const { theme } = useTheme();
  if (tickers.length < 2) return null;

  const path = getBestArbitragePath(tickers);
  if (!path) return null;

  const prices = tickers.map((t) => ({
    exchange: t.exchange,
    bid: parseFloat(t.bidPrice),
    ask: parseFloat(t.askPrice),
  }));

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Price Comparison</Text>
      {prices.map((p) => (
        <View key={p.exchange} style={[styles.row, { borderBottomColor: theme.borderLight }]}>
          <Text style={[styles.exchange, { color: theme.text }]}>{p.exchange.toUpperCase()}</Text>
          <View style={styles.priceGroup}>
            <Text style={[styles.bid, { color: theme.success }, p.bid === path.highestBid && styles.highlight]}>${p.bid.toFixed(2)}</Text>
            <Text style={[styles.sep, { color: theme.textTertiary }]}>|</Text>
            <Text style={[styles.ask, { color: theme.error }, p.ask === path.lowestAsk && styles.highlight]}>${p.ask.toFixed(2)}</Text>
          </View>
        </View>
      ))}
      <View style={[styles.pathBox, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
        <View style={styles.pathRow}>
          <View style={styles.pathStep}>
            <Text style={[styles.pathLabel, { color: theme.textSecondary }]}>BUY</Text>
            <Text style={[styles.pathExchange, { color: theme.text }]}>{path.lowestAskExchange.toUpperCase()}</Text>
            <Text style={[styles.pathPrice, { color: theme.successDark }]}>${path.lowestAsk.toFixed(2)}</Text>
          </View>
          <Text style={[styles.arrow, { color: theme.success }]}>→</Text>
          <View style={styles.pathStep}>
            <Text style={[styles.pathLabel, { color: theme.textSecondary }]}>SELL</Text>
            <Text style={[styles.pathExchange, { color: theme.text }]}>{path.highestBidExchange.toUpperCase()}</Text>
            <Text style={[styles.pathPrice, { color: theme.successDark }]}>${path.highestBid.toFixed(2)}</Text>
          </View>
        </View>
        {path.priceDifference > 0 && (
          <View style={[styles.diffRow, { borderTopColor: theme.success }]}>
            <Text style={[styles.diffLabel, { color: theme.successDark }]}>Difference</Text>
            <Text style={[styles.diffValue, { color: theme.successDark }]}>${path.priceDifference.toFixed(2)} ({path.priceDifferencePercent.toFixed(3)}%)</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  title: { fontSize: 16, fontWeight: '700' as const, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  exchange: { fontSize: 13, fontWeight: '600' as const },
  priceGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bid: { fontSize: 13, fontWeight: '600' as const },
  ask: { fontSize: 13, fontWeight: '600' as const },
  sep: { fontSize: 11 },
  highlight: { fontWeight: '700' as const, textDecorationLine: 'underline' as const },
  pathBox: { padding: 14, borderRadius: 10, marginTop: 12, borderWidth: 1 },
  pathRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 10 },
  pathStep: { alignItems: 'center', gap: 3 },
  pathLabel: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.5 },
  pathExchange: { fontSize: 15, fontWeight: '700' as const },
  pathPrice: { fontSize: 13, fontWeight: '600' as const },
  arrow: { fontSize: 22, fontWeight: '700' as const },
  diffRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1 },
  diffLabel: { fontSize: 12, fontWeight: '600' as const },
  diffValue: { fontSize: 13, fontWeight: '700' as const },
});
```

---

## components/market/ExecutionCostCard.tsx

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TickerData } from '@/types/exchanges';
import { calculateArbitrageOpportunity } from '@/utils/arbitrage';
import { TRADE_AMOUNT } from '@/constants/exchanges';
import { useTheme } from '@/contexts/ThemeContext';

interface ExecutionCostCardProps {
  tickers: TickerData[];
}

export const ExecutionCostCard = React.memo(function ExecutionCostCard({ tickers }: ExecutionCostCardProps) {
  const { theme } = useTheme();
  if (tickers.length < 2) return null;

  const symbol = tickers[0].symbol.split('/')[0];
  const opportunities = [];
  for (let i = 0; i < tickers.length; i++) {
    for (let j = 0; j < tickers.length; j++) {
      if (i === j) continue;
      opportunities.push(calculateArbitrageOpportunity(tickers[i], tickers[j], TRADE_AMOUNT));
    }
  }
  const top = opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, 3);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Execution Costs</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>For {TRADE_AMOUNT} {symbol}</Text>
      {top.map((opp, i) => (
        <View
          key={`${opp.buyExchange}-${opp.sellExchange}-${i}`}
          style={[
            styles.row,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            opp.isProfitable && { backgroundColor: theme.successLight, borderColor: theme.success },
          ]}
        >
          <View style={styles.flowRow}>
            <View style={[styles.sideBadge, { backgroundColor: theme.success }]}><Text style={styles.sideText}>BUY</Text></View>
            <Text style={[styles.exName, { color: theme.text }]}>{opp.buyExchange.toUpperCase()}</Text>
            <Text style={[styles.flowArrow, { color: theme.textSecondary }]}>→</Text>
            <View style={[styles.sideBadge, { backgroundColor: theme.error }]}><Text style={styles.sideText}>SELL</Text></View>
            <Text style={[styles.exName, { color: theme.text }]}>{opp.sellExchange.toUpperCase()}</Text>
            {opp.isProfitable && i === 0 && (
              <View style={[styles.bestTag, { backgroundColor: theme.success }]}><Text style={styles.bestText}>BEST</Text></View>
            )}
          </View>
          <View style={styles.metrics}>
            <MetricRow label="Gross" value={`$${opp.grossProfit.toFixed(2)}`} valueColor={opp.grossProfit > 0 ? theme.success : theme.error} theme={theme} />
            <MetricRow label="Fees" value={`$${opp.totalCost.toFixed(2)} (${opp.costPercentage.toFixed(3)}%)`} valueColor={theme.error} theme={theme} />
            <MetricRow label="Net" value={`$${opp.netProfit.toFixed(2)}`} valueColor={opp.isProfitable ? theme.successDark : theme.error} theme={theme} />
          </View>
        </View>
      ))}
    </View>
  );
});

function MetricRow({ label, value, valueColor, theme }: { label: string; value: string; valueColor: string; theme: { textSecondary: string } }) {
  return (
    <View style={styles.metricRow}>
      <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  title: { fontSize: 16, fontWeight: '700' as const, marginBottom: 4 },
  subtitle: { fontSize: 12, marginBottom: 12 },
  row: { padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  flowRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10, flexWrap: 'wrap' },
  sideBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  sideText: { fontSize: 9, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  exName: { fontSize: 12, fontWeight: '700' as const },
  flowArrow: { fontSize: 13, fontWeight: '700' as const },
  bestTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 'auto' },
  bestText: { fontSize: 9, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  metrics: { gap: 6 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 12 },
  metricValue: { fontSize: 13, fontWeight: '600' as const },
});
```

---

## components/market/ArbitrageOpportunitiesCard.tsx

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArbitrageOpportunity } from '@/utils/arbitrage';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  opportunities: ArbitrageOpportunity[];
}

export const ArbitrageOpportunitiesCard = React.memo(function ArbitrageOpportunitiesCard({ opportunities }: Props) {
  const { theme } = useTheme();
  if (opportunities.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Profitable Opportunities</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sorted by net profit after fees</Text>
      {opportunities.map((opp, idx) => {
        const sym = opp.symbol.split('/')[0];
        return (
          <View key={`${opp.buyExchange}-${opp.sellExchange}-${idx}`} style={[styles.row, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
            <View style={styles.header}>
              <View style={styles.exchangeFlow}>
                <View style={[styles.badge, { backgroundColor: theme.success }]}><Text style={styles.badgeText}>BUY</Text></View>
                <Text style={[styles.exName, { color: theme.text }]}>{opp.buyExchange.toUpperCase()}</Text>
                <Text style={[styles.arrow, { color: theme.textSecondary }]}>→</Text>
                <View style={[styles.badge, { backgroundColor: theme.error }]}><Text style={styles.badgeText}>SELL</Text></View>
                <Text style={[styles.exName, { color: theme.text }]}>{opp.sellExchange.toUpperCase()}</Text>
              </View>
              <View style={[styles.pairTag, { backgroundColor: theme.infoLight }]}>
                <Text style={[styles.pairText, { color: theme.infoDark }]}>{opp.symbol}</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Buy: ${opp.buyPrice.toFixed(2)}</Text>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Sell: ${opp.sellPrice.toFixed(2)}</Text>
            </View>
            <View style={[styles.metricSection, { borderTopColor: theme.success }]}>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Deviation</Text>
                <Text style={[styles.metricVal, { color: theme.success }]}>${opp.deviation.toFixed(2)} ({opp.percentDeviation.toFixed(3)}%)</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Fees</Text>
                <Text style={[styles.metricVal, { color: theme.error }]}>${opp.totalCost.toFixed(2)} ({opp.costPercentage.toFixed(3)}%)</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Net ({opp.tradeAmount} {sym})</Text>
                <Text style={[styles.netValue, { color: theme.successDark }]}>${opp.netProfit.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  title: { fontSize: 16, fontWeight: '700' as const, marginBottom: 2 },
  subtitle: { fontSize: 12, marginBottom: 14 },
  row: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  exchangeFlow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  badgeText: { fontSize: 9, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  exName: { fontSize: 12, fontWeight: '700' as const },
  arrow: { fontSize: 13, fontWeight: '700' as const },
  pairTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  pairText: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 12 },
  metricSection: { gap: 6, paddingTop: 10, borderTopWidth: 1 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 11, fontWeight: '500' as const },
  metricVal: { fontSize: 12, fontWeight: '700' as const },
  netValue: { fontSize: 14, fontWeight: '700' as const },
});
```

---

## components/market/BalanceCard.tsx

```tsx
import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Wallet } from 'lucide-react-native';

interface BalanceItem {
  asset: string;
  free: number;
  total: number;
}

interface BalanceCardProps {
  exchange: string;
  balances: BalanceItem[];
  error: string | null;
  isLoading: boolean;
}

export const BalanceCard = React.memo(function BalanceCard({ exchange, balances, error, isLoading }: BalanceCardProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Wallet size={16} color={theme.tint} />
          <Text style={[styles.exName, { color: theme.text }]}>{exchange.toUpperCase()}</Text>
        </View>
        {isLoading && <ActivityIndicator size="small" color={theme.tint} />}
      </View>
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.errorLight }]}>
          <Text style={[styles.errorText, { color: theme.errorDark }]}>{error}</Text>
        </View>
      ) : balances.length === 0 && !isLoading ? (
        <Text style={[styles.empty, { color: theme.textTertiary }]}>No balances found</Text>
      ) : (
        balances.map((b) => (
          <View key={b.asset} style={[styles.balRow, { borderBottomColor: theme.borderLight }]}>
            <View style={[styles.assetTag, { backgroundColor: theme.surfaceSecondary }]}>
              <Text style={[styles.assetText, { color: theme.text }]}>{b.asset}</Text>
            </View>
            <View style={styles.amtCol}>
              <Text style={[styles.amtLabel, { color: theme.textTertiary }]}>Available</Text>
              <Text style={[styles.amtVal, { color: theme.text }]}>{b.free.toFixed(6)}</Text>
            </View>
            <View style={styles.amtCol}>
              <Text style={[styles.amtLabel, { color: theme.textTertiary }]}>Total</Text>
              <Text style={[styles.amtVal, { color: theme.text }]}>{b.total.toFixed(6)}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 0 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exName: { fontSize: 15, fontWeight: '700' as const, letterSpacing: 0.5 },
  errorBox: { padding: 10, borderRadius: 8 },
  errorText: { fontSize: 12, lineHeight: 17 },
  empty: { fontSize: 12, textAlign: 'center', paddingVertical: 10 },
  balRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, gap: 10 },
  assetTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, minWidth: 45, alignItems: 'center' },
  assetText: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  amtCol: { flex: 1, alignItems: 'flex-end' },
  amtLabel: { fontSize: 9, fontWeight: '500' as const, marginBottom: 2 },
  amtVal: { fontSize: 13, fontWeight: '600' as const },
});
```

---

## components/trading/LivePriceTicker.tsx

```tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TickerData } from '@/types/exchanges';

interface LivePriceTickerProps {
  tickers: TickerData[];
  isFetching: boolean;
}

export const LivePriceTicker = React.memo(function LivePriceTicker({ tickers, isFetching }: LivePriceTickerProps) {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [dotAnim]);

  useEffect(() => {
    if (isFetching) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isFetching, pulseAnim]);

  if (tickers.length === 0) return null;

  const grouped: Record<string, { best: TickerData; worst: TickerData; all: TickerData[] }> = {};
  for (const t of tickers) {
    if (!grouped[t.symbol]) {
      grouped[t.symbol] = { best: t, worst: t, all: [t] };
    } else {
      grouped[t.symbol].all.push(t);
      if (parseFloat(t.askPrice) < parseFloat(grouped[t.symbol].best.askPrice)) grouped[t.symbol].best = t;
      if (parseFloat(t.bidPrice) > parseFloat(grouped[t.symbol].worst.bidPrice)) grouped[t.symbol].worst = t;
    }
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border, transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.headerRow}>
        <View style={styles.liveIndicator}>
          <Animated.View style={[styles.liveDot, { backgroundColor: theme.success, opacity: dotAnim }]} />
          <Text style={[styles.liveText, { color: theme.success }]}>LIVE PRICES</Text>
        </View>
        <Text style={[styles.updateTime, { color: theme.textTertiary }]}>{new Date().toLocaleTimeString()}</Text>
      </View>
      {Object.entries(grouped).map(([symbol, group]) => {
        const base = symbol.split('/')[0];
        const bestAsk = parseFloat(group.best.askPrice);
        const bestBid = parseFloat(group.worst.bidPrice);
        const midPrice = (bestAsk + bestBid) / 2;
        const spread = bestAsk - bestBid;
        const spreadPct = midPrice > 0 ? (spread / midPrice) * 100 : 0;
        return (
          <View key={symbol} style={[styles.pairRow, { borderTopColor: theme.borderLight }]}>
            <View style={styles.pairLeft}>
              <View style={[styles.pairBadge, { backgroundColor: theme.tint + '18' }]}>
                <Text style={[styles.pairSymbol, { color: theme.tint }]}>{base}</Text>
              </View>
              <View>
                <Text style={[styles.midPrice, { color: theme.text }]}>
                  ${midPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.spreadInfo, { color: theme.textTertiary }]}>Spread: ${spread.toFixed(2)} ({spreadPct.toFixed(3)}%)</Text>
              </View>
            </View>
            <View style={styles.pairRight}>
              {group.all.map((t) => {
                const ask = parseFloat(t.askPrice);
                const bid = parseFloat(t.bidPrice);
                return (
                  <View key={t.exchange} style={styles.exchangeMini}>
                    <Text style={[styles.miniEx, { color: theme.textSecondary }]}>{t.exchange.slice(0, 3).toUpperCase()}</Text>
                    <View style={styles.miniPrices}>
                      <Text style={[styles.miniBid, { color: theme.success }]}>{bid.toFixed(2)}</Text>
                      <Text style={[styles.miniSep, { color: theme.borderLight }]}>|</Text>
                      <Text style={[styles.miniAsk, { color: theme.error }]}>{ask.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: { borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 1.2 },
  updateTime: { fontSize: 10, fontWeight: '500' as const },
  pairRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
  pairLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pairBadge: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pairSymbol: { fontSize: 12, fontWeight: '800' as const, letterSpacing: 0.5 },
  midPrice: { fontSize: 16, fontWeight: '700' as const },
  spreadInfo: { fontSize: 10, marginTop: 1 },
  pairRight: { gap: 4 },
  exchangeMini: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniEx: { fontSize: 9, fontWeight: '700' as const, letterSpacing: 0.5, width: 28 },
  miniPrices: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  miniBid: { fontSize: 10, fontWeight: '600' as const },
  miniSep: { fontSize: 8 },
  miniAsk: { fontSize: 10, fontWeight: '600' as const },
});
```

---

## components/trading/PaperExecutionSimulator.tsx

```tsx
import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Crosshair, DollarSign, Percent, ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ArbitrageOpportunity } from '@/utils/arbitrage';
import { useTrading } from '@/contexts/TradingContext';
import { EXCHANGE_TRADING_FEES } from '@/constants/exchanges';

interface Props {
  opportunities: ArbitrageOpportunity[];
  isFetching: boolean;
}

export const PaperExecutionSimulator = React.memo(function PaperExecutionSimulator({ opportunities, isFetching }: Props) {
  const { theme } = useTheme();
  const { getPaperBalance } = useTrading();
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFetching) {
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [isFetching, flashAnim]);

  const simulations = useMemo(() => {
    return opportunities.slice(0, 3).map((opp) => {
      const [base, quote] = opp.symbol.split('/');
      const quoteBalance = getPaperBalance(quote);
      const baseBalance = getPaperBalance(base);

      const buyFeeRate = EXCHANGE_TRADING_FEES[opp.buyExchange].taker;
      const sellFeeRate = EXCHANGE_TRADING_FEES[opp.sellExchange].taker;
      const buyCost = opp.buyPrice * opp.tradeAmount;
      const buyFee = buyCost * buyFeeRate;
      const totalBuyCost = buyCost + buyFee;
      const sellRevenue = opp.sellPrice * opp.tradeAmount;
      const sellFee = sellRevenue * sellFeeRate;
      const totalSellRevenue = sellRevenue - sellFee;

      const canBuy = quoteBalance >= totalBuyCost;
      const canSell = baseBalance >= opp.tradeAmount || canBuy;

      const estimatedSlippage = opp.buyPrice * 0.0005;
      const slippageAdjustedNet = opp.netProfit - (estimatedSlippage * opp.tradeAmount * 2);

      const roiPct = totalBuyCost > 0 ? (opp.netProfit / totalBuyCost) * 100 : 0;

      return {
        ...opp, base, quote, quoteBalance, baseBalance, totalBuyCost, buyFee,
        totalSellRevenue, sellFee, canBuy, canSell, estimatedSlippage, slippageAdjustedNet, roiPct,
        executable: canBuy,
      };
    });
  }, [opportunities, getPaperBalance]);

  if (simulations.length === 0) return null;

  const totalPotentialProfit = simulations.filter((s) => s.executable).reduce((sum, s) => sum + s.netProfit, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Crosshair size={16} color={theme.warning} />
          <Text style={[styles.title, { color: theme.text }]}>Live Execution Simulator</Text>
        </View>
        <View style={[styles.simBadge, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
          <Text style={[styles.simBadgeText, { color: theme.warningDark }]}>SIMULATED</Text>
        </View>
      </View>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Real prices, simulated execution with your paper balance</Text>
      <View style={[styles.summaryStrip, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textTertiary }]}>Available</Text>
          <Text style={[styles.summaryVal, { color: theme.text }]}>
            ${getPaperBalance('USDT').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.borderLight }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textTertiary }]}>Executable</Text>
          <Text style={[styles.summaryVal, { color: theme.success }]}>{simulations.filter((s) => s.executable).length}/{simulations.length}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.borderLight }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textTertiary }]}>Potential</Text>
          <Text style={[styles.summaryVal, { color: totalPotentialProfit > 0 ? theme.success : theme.textSecondary }]}>${totalPotentialProfit.toFixed(2)}</Text>
        </View>
      </View>
      {simulations.map((sim, idx) => (
        <Animated.View
          key={`${sim.buyExchange}-${sim.sellExchange}-${sim.symbol}-${idx}`}
          style={[
            styles.simCard,
            {
              backgroundColor: sim.executable ? theme.successLight : theme.surfaceSecondary,
              borderColor: sim.executable ? theme.success : theme.border,
              opacity: Animated.add(flashAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }), 0),
            },
          ]}
        >
          <View style={styles.simHeader}>
            <View style={styles.simFlow}>
              <View style={[styles.sideDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.simExchange, { color: theme.text }]}>{sim.buyExchange.toUpperCase()}</Text>
              <Text style={[styles.simArrow, { color: theme.textTertiary }]}>→</Text>
              <View style={[styles.sideDot, { backgroundColor: theme.error }]} />
              <Text style={[styles.simExchange, { color: theme.text }]}>{sim.sellExchange.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: sim.executable ? theme.success + '20' : theme.error + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: sim.executable ? theme.success : theme.error }]} />
              <Text style={[styles.statusText, { color: sim.executable ? theme.successDark : theme.errorDark }]}>
                {sim.executable ? 'READY' : 'NO FUNDS'}
              </Text>
            </View>
          </View>
          <View style={[styles.simPriceStrip, { backgroundColor: theme.background + '80', borderColor: theme.borderLight }]}>
            <View style={styles.simPriceCol}>
              <Text style={[styles.simPriceLabel, { color: theme.textTertiary }]}>Buy @ Ask</Text>
              <Text style={[styles.simPriceVal, { color: theme.success }]}>${sim.buyPrice.toFixed(2)}</Text>
            </View>
            <View style={[styles.simPriceDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.simPriceCol}>
              <Text style={[styles.simPriceLabel, { color: theme.textTertiary }]}>Sell @ Bid</Text>
              <Text style={[styles.simPriceVal, { color: theme.error }]}>${sim.sellPrice.toFixed(2)}</Text>
            </View>
            <View style={[styles.simPriceDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.simPriceCol}>
              <Text style={[styles.simPriceLabel, { color: theme.textTertiary }]}>Spread</Text>
              <Text style={[styles.simPriceVal, { color: theme.tint }]}>{sim.percentDeviation.toFixed(3)}%</Text>
            </View>
          </View>
          <View style={styles.simMetrics}>
            <View style={styles.simMetricRow}>
              <View style={styles.simMetricLeft}>
                <ArrowDownRight size={11} color={theme.success} />
                <Text style={[styles.simMetricLabel, { color: theme.textSecondary }]}>Buy Cost</Text>
              </View>
              <Text style={[styles.simMetricVal, { color: theme.text }]}>
                ${sim.totalBuyCost.toFixed(2)}
                <Text style={[styles.simMetricSub, { color: theme.textTertiary }]}> (fee ${sim.buyFee.toFixed(2)})</Text>
              </Text>
            </View>
            <View style={styles.simMetricRow}>
              <View style={styles.simMetricLeft}>
                <ArrowUpRight size={11} color={theme.error} />
                <Text style={[styles.simMetricLabel, { color: theme.textSecondary }]}>Sell Revenue</Text>
              </View>
              <Text style={[styles.simMetricVal, { color: theme.text }]}>
                ${sim.totalSellRevenue.toFixed(2)}
                <Text style={[styles.simMetricSub, { color: theme.textTertiary }]}> (fee ${sim.sellFee.toFixed(2)})</Text>
              </Text>
            </View>
            <View style={styles.simMetricRow}>
              <View style={styles.simMetricLeft}>
                <DollarSign size={11} color={theme.successDark} />
                <Text style={[styles.simMetricLabel, { color: theme.textSecondary }]}>Net Profit</Text>
              </View>
              <Text style={[styles.simMetricVal, { color: sim.netProfit > 0 ? theme.successDark : theme.error, fontWeight: '700' as const }]}>
                ${sim.netProfit.toFixed(4)}
              </Text>
            </View>
            <View style={styles.simMetricRow}>
              <View style={styles.simMetricLeft}>
                <Percent size={11} color={theme.tint} />
                <Text style={[styles.simMetricLabel, { color: theme.textSecondary }]}>ROI</Text>
              </View>
              <Text style={[styles.simMetricVal, { color: sim.roiPct > 0 ? theme.successDark : theme.error }]}>{sim.roiPct.toFixed(4)}%</Text>
            </View>
            <View style={[styles.slippageRow, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
              <Text style={[styles.slippageLabel, { color: theme.textTertiary }]}>Est. slippage-adjusted net</Text>
              <Text style={[styles.slippageVal, { color: sim.slippageAdjustedNet > 0 ? theme.success : theme.error }]}>${sim.slippageAdjustedNet.toFixed(4)}</Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 15, fontWeight: '700' as const },
  simBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, borderWidth: 1 },
  simBadgeText: { fontSize: 8, fontWeight: '800' as const, letterSpacing: 1 },
  subtitle: { fontSize: 11, marginBottom: 12 },
  summaryStrip: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 9, fontWeight: '600' as const, letterSpacing: 0.3, marginBottom: 3 },
  summaryVal: { fontSize: 14, fontWeight: '700' as const },
  summaryDivider: { width: 1, height: 28 },
  simCard: { borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1 },
  simHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  simFlow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sideDot: { width: 6, height: 6, borderRadius: 3 },
  simExchange: { fontSize: 12, fontWeight: '700' as const },
  simArrow: { fontSize: 12, fontWeight: '700' as const },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '700' as const, letterSpacing: 0.5 },
  simPriceStrip: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 8, marginBottom: 10, borderWidth: 1 },
  simPriceCol: { flex: 1, alignItems: 'center' },
  simPriceDivider: { width: 1, height: 24 },
  simPriceLabel: { fontSize: 8, fontWeight: '600' as const, letterSpacing: 0.3, marginBottom: 2 },
  simPriceVal: { fontSize: 12, fontWeight: '700' as const },
  simMetrics: { gap: 5 },
  simMetricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  simMetricLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  simMetricLabel: { fontSize: 11 },
  simMetricVal: { fontSize: 12, fontWeight: '600' as const },
  simMetricSub: { fontSize: 9, fontWeight: '400' as const },
  slippageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, padding: 8, borderRadius: 6, borderWidth: 1 },
  slippageLabel: { fontSize: 10, fontWeight: '500' as const },
  slippageVal: { fontSize: 11, fontWeight: '700' as const },
});
```

---

## backend/hono.ts

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

app.route("/api/opportunities", oppRouter);

app.get("/", (c) => c.json({ status: "ok", message: "API is running" }));

export default app;
```

---

## backend/trpc/app-router.ts

```ts
import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import tickerRoute from "./routes/exchanges/ticker/route";
import balanceRoute from "./routes/exchanges/balance/route";
import executeRoute from "./routes/exchanges/execute/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({ hi: hiRoute }),
  exchanges: createTRPCRouter({
    ticker: tickerRoute,
    balance: balanceRoute,
    execute: executeRoute,
  }),
});

export type AppRouter = typeof appRouter;
```

---

## backend/trpc/create-context.ts

```ts
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return { req: opts.req };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({ transformer: superjson });

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
```

---

## backend/trpc/routes/example/hi/route.ts

```ts
import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ name: z.string() }))
  .mutation(({ input }) => {
    return { hello: input.name, date: new Date() };
  });
```

---

## backend/trpc/routes/exchanges/ticker/route.ts

```ts
import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { adapters } from "../../../../exchanges/adapters";

const inputSchema = z.object({
  exchanges: z.array(z.enum(["kraken", "coinbase", "binance", "bybit"])).min(1),
  symbols: z.array(z.string().regex(/^[A-Z]{2,10}\/[A-Z]{2,10}$/i)).min(1),
});

export default publicProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    console.log(`[Backend] Batch fetching: ${input.exchanges.join(",")} for ${input.symbols.join(",")}`);
    const tasks: Promise<any>[] = [];
    for (const ex of input.exchanges) {
      for (const sym of input.symbols) {
        const fetcher = adapters[ex];
        if (!fetcher) { console.warn(`[Backend] No adapter found for ${ex}`); continue; }
        tasks.push(fetcher(sym).catch((err) => ({ error: String(err), exchange: ex, symbol: sym, ts: Date.now() })));
      }
    }
    const results = await Promise.all(tasks);
    const successful = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);
    console.log(`[Backend] Batch complete: ${successful.length} success, ${failed.length} failed`);
    return { results };
  });
```

---

## backend/trpc/routes/exchanges/balance/route.ts

```ts
import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import * as crypto from "node:crypto";

const inputSchema = z.object({
  exchange: z.enum(["kraken", "coinbase", "binance", "bybit"]),
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
});

async function fetchKrakenBalance(apiKey: string, apiSecret: string) {
  const nonce = Date.now() * 1000;
  const path = "/0/private/Balance";
  const body = `nonce=${nonce}`;
  const hash = crypto.createHash("sha256").update(nonce + body).digest();
  const hmac = crypto.createHmac("sha512", Buffer.from(apiSecret, "base64"));
  hmac.update(path);
  hmac.update(hash);
  const signature = hmac.digest("base64");
  console.log("[Balance:Kraken] Fetching balance");
  const res = await fetch("https://api.kraken.com/0/private/Balance", {
    method: "POST",
    headers: { "API-Key": apiKey, "API-Sign": signature, "Content-Type": "application/x-www-form-urlencoded" },
    body, signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`kraken_http_${res.status}`);
  const json = await res.json();
  if (json.error?.length) throw new Error(`kraken_api_${json.error[0]}`);
  const balances: { asset: string; free: number; total: number }[] = [];
  for (const [asset, amount] of Object.entries(json.result || {})) {
    const total = parseFloat(amount as string);
    if (total > 0) {
      const normalizedAsset = asset === "XXBT" ? "BTC" : asset === "ZUSD" ? "USD" : asset === "XETH" ? "ETH" : asset.replace(/^[XZ]/, "");
      balances.push({ asset: normalizedAsset, free: total, total });
    }
  }
  return balances;
}

async function fetchCoinbaseBalance(apiKey: string, apiSecret: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const method = "GET";
  const path = "/accounts";
  const message = timestamp + method + path;
  const hmac = crypto.createHmac("sha256", apiSecret);
  hmac.update(message);
  const signature = hmac.digest("hex");
  console.log("[Balance:Coinbase] Fetching balance");
  const res = await fetch("https://api.exchange.coinbase.com/accounts", {
    method: "GET",
    headers: { "CB-ACCESS-KEY": apiKey, "CB-ACCESS-SIGN": signature, "CB-ACCESS-TIMESTAMP": timestamp, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`coinbase_http_${res.status}`);
  const accounts = await res.json();
  const balances: { asset: string; free: number; total: number }[] = [];
  if (Array.isArray(accounts)) {
    for (const acc of accounts) {
      const total = parseFloat(acc.balance || "0");
      const available = parseFloat(acc.available || "0");
      if (total > 0) balances.push({ asset: acc.currency, free: available, total });
    }
  }
  return balances;
}

async function fetchBinanceBalance(apiKey: string, apiSecret: string) {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac("sha256", apiSecret).update(queryString).digest("hex");
  console.log("[Balance:Binance] Fetching balance");
  const res = await fetch(`https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`, {
    headers: { "X-MBX-APIKEY": apiKey }, signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`binance_http_${res.status}`);
  const json = await res.json();
  const balances: { asset: string; free: number; total: number }[] = [];
  for (const b of json.balances || []) {
    const free = parseFloat(b.free);
    const locked = parseFloat(b.locked);
    const total = free + locked;
    if (total > 0) balances.push({ asset: b.asset, free, total });
  }
  return balances;
}

async function fetchBybitBalance(apiKey: string, apiSecret: string) {
  const timestamp = Date.now().toString();
  const recvWindow = "20000";
  const queryString = `accountType=UNIFIED`;
  const preSign = timestamp + apiKey + recvWindow + queryString;
  const signature = crypto.createHmac("sha256", apiSecret).update(preSign).digest("hex");
  console.log("[Balance:Bybit] Fetching balance");
  const res = await fetch(`https://api.bybit.com/v5/account/wallet-balance?${queryString}`, {
    headers: { "X-BAPI-API-KEY": apiKey, "X-BAPI-SIGN": signature, "X-BAPI-TIMESTAMP": timestamp, "X-BAPI-RECV-WINDOW": recvWindow },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`bybit_http_${res.status}`);
  const json = await res.json();
  const balances: { asset: string; free: number; total: number }[] = [];
  const accounts = json.result?.list || [];
  for (const acc of accounts) {
    for (const coin of acc.coin || []) {
      const total = parseFloat(coin.walletBalance || "0");
      const free = parseFloat(coin.availableToWithdraw || "0");
      if (total > 0) balances.push({ asset: coin.coin, free, total });
    }
  }
  return balances;
}

const fetchers: Record<string, (key: string, secret: string) => Promise<{ asset: string; free: number; total: number }[]>> = {
  kraken: fetchKrakenBalance,
  coinbase: fetchCoinbaseBalance,
  binance: fetchBinanceBalance,
  bybit: fetchBybitBalance,
};

export default publicProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    const fetcher = fetchers[input.exchange];
    if (!fetcher) return { exchange: input.exchange, balances: [], error: `No balance fetcher for ${input.exchange}` };
    try {
      const balances = await fetcher(input.apiKey, input.apiSecret);
      console.log(`[Balance] ${input.exchange}: ${balances.length} assets found`);
      return { exchange: input.exchange, balances, error: null };
    } catch (err) {
      console.error(`[Balance] ${input.exchange} error:`, err);
      return { exchange: input.exchange, balances: [], error: String(err) };
    }
  });
```

---

## backend/trpc/routes/exchanges/execute/route.ts

```ts
import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import * as crypto from "node:crypto";

const inputSchema = z.object({
  exchange: z.enum(["kraken", "coinbase", "binance", "bybit"]),
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
  symbol: z.string(),
  side: z.enum(["buy", "sell"]),
  amount: z.number().positive(),
  price: z.number().positive().optional(),
});

async function executeKraken(apiKey: string, apiSecret: string, pair: string, side: string, volume: number) {
  const nonce = Date.now() * 1000;
  const krakenPair = pair.replace("/", "").replace("BTC", "XBT");
  const body = `nonce=${nonce}&ordertype=market&type=${side}&volume=${volume}&pair=${krakenPair}`;
  const path = "/0/private/AddOrder";
  const hash = crypto.createHash("sha256").update(nonce + body).digest();
  const hmac = crypto.createHmac("sha512", Buffer.from(apiSecret, "base64"));
  hmac.update(path);
  hmac.update(hash);
  const signature = hmac.digest("base64");
  console.log(`[Execute:Kraken] ${side} ${volume} ${krakenPair}`);
  const res = await fetch("https://api.kraken.com/0/private/AddOrder", {
    method: "POST",
    headers: { "API-Key": apiKey, "API-Sign": signature, "Content-Type": "application/x-www-form-urlencoded" },
    body, signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`kraken_http_${res.status}`);
  const json = await res.json();
  if (json.error?.length) throw new Error(`kraken_api_${json.error[0]}`);
  return { orderId: json.result?.txid?.[0] || "unknown", status: "filled" as const, description: json.result?.descr?.order || "" };
}

async function executeCoinbase(apiKey: string, apiSecret: string, productId: string, side: string, size: number) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const method = "POST";
  const path = "/orders";
  const bodyObj = { type: "market", side, product_id: productId.replace("/", "-"), size: String(size) };
  const bodyStr = JSON.stringify(bodyObj);
  const message = timestamp + method + path + bodyStr;
  const signature = crypto.createHmac("sha256", apiSecret).update(message).digest("hex");
  console.log(`[Execute:Coinbase] ${side} ${size} ${productId}`);
  const res = await fetch("https://api.exchange.coinbase.com/orders", {
    method: "POST",
    headers: { "CB-ACCESS-KEY": apiKey, "CB-ACCESS-SIGN": signature, "CB-ACCESS-TIMESTAMP": timestamp, "Content-Type": "application/json" },
    body: bodyStr, signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) { const errBody = await res.text(); throw new Error(`coinbase_http_${res.status}: ${errBody}`); }
  const json = await res.json();
  return { orderId: json.id || "unknown", status: "filled" as const, description: `${side} ${size} ${productId}` };
}

async function executeBinance(apiKey: string, apiSecret: string, symbol: string, side: string, quantity: number) {
  const timestamp = Date.now();
  const binanceSymbol = symbol.replace("/", "");
  const params = `symbol=${binanceSymbol}&side=${side.toUpperCase()}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;
  const signature = crypto.createHmac("sha256", apiSecret).update(params).digest("hex");
  console.log(`[Execute:Binance] ${side} ${quantity} ${binanceSymbol}`);
  const res = await fetch(`https://api.binance.com/api/v3/order?${params}&signature=${signature}`, {
    method: "POST", headers: { "X-MBX-APIKEY": apiKey }, signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) { const errBody = await res.text(); throw new Error(`binance_http_${res.status}: ${errBody}`); }
  const json = await res.json();
  return { orderId: String(json.orderId || "unknown"), status: json.status === "FILLED" ? "filled" as const : "pending" as const, description: `${side} ${quantity} ${binanceSymbol}` };
}

async function executeBybit(apiKey: string, apiSecret: string, symbol: string, side: string, qty: number) {
  const timestamp = Date.now().toString();
  const recvWindow = "20000";
  const bodyObj = { category: "spot", symbol: symbol.replace("/", ""), side: side.charAt(0).toUpperCase() + side.slice(1), orderType: "Market", qty: String(qty) };
  const bodyStr = JSON.stringify(bodyObj);
  const preSign = timestamp + apiKey + recvWindow + bodyStr;
  const signature = crypto.createHmac("sha256", apiSecret).update(preSign).digest("hex");
  console.log(`[Execute:Bybit] ${side} ${qty} ${symbol}`);
  const res = await fetch("https://api.bybit.com/v5/order/create", {
    method: "POST",
    headers: { "X-BAPI-API-KEY": apiKey, "X-BAPI-SIGN": signature, "X-BAPI-TIMESTAMP": timestamp, "X-BAPI-RECV-WINDOW": recvWindow, "Content-Type": "application/json" },
    body: bodyStr, signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`bybit_http_${res.status}`);
  const json = await res.json();
  if (json.retCode !== 0) throw new Error(`bybit_api_${json.retMsg}`);
  return { orderId: json.result?.orderId || "unknown", status: "filled" as const, description: `${side} ${qty} ${symbol}` };
}

const executors: Record<string, (key: string, secret: string, symbol: string, side: string, amount: number) => Promise<{ orderId: string; status: string; description: string }>> = {
  kraken: executeKraken, coinbase: executeCoinbase, binance: executeBinance, bybit: executeBybit,
};

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    const executor = executors[input.exchange];
    if (!executor) return { success: false, error: `No executor for ${input.exchange}`, orderId: null };
    try {
      const result = await executor(input.apiKey, input.apiSecret, input.symbol, input.side, input.amount);
      console.log(`[Execute] ${input.exchange} ${input.side} success:`, result);
      return { success: true, error: null, ...result };
    } catch (err) {
      console.error(`[Execute] ${input.exchange} error:`, err);
      return { success: false, error: String(err), orderId: null, status: "failed", description: "" };
    }
  });
```

---

## backend/exchanges/adapters.ts

```ts
import { withBreaker } from "./safeFetch";

export type Ticker = {
  exchange: "kraken" | "coinbase" | "binance" | "bybit";
  symbol: string;
  bid: number;
  ask: number;
  ts: number;
};

type Fetcher = (symbol: string) => Promise<Ticker>;

const parseSymbol = (symbol: string) => {
  const [base, quote] = symbol.split("/");
  return { base, quote };
};

const toKrakenPair = (symbol: string) => {
  const { base, quote } = parseSymbol(symbol);
  const m = (s: string) => (s === "BTC" ? "XBT" : s);
  return `${m(base)}${m(quote)}`.toUpperCase();
};

export const krakenFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`kraken_${symbol}`, async () => {
    const pair = toKrakenPair(symbol);
    const url = `https://api.kraken.com/0/public/Ticker?pair=${pair}`;
    console.log(`[Kraken] Fetching ${pair} from ${url}`);
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (res.status === 520 || res.status === 503) throw new Error("kraken_service_unavailable");
    if (!res.ok) throw new Error(`kraken_http_${res.status}`);
    const json = await res.json();
    if (json.error?.length) throw new Error(`kraken_api_${json.error[0]}`);
    const data = json.result[Object.keys(json.result)[0]];
    const ask = parseFloat(data.a[0]);
    const bid = parseFloat(data.b[0]);
    console.log(`[Kraken] ${symbol} - bid: ${bid}, ask: ${ask}`);
    return { exchange: "kraken", symbol, bid, ask, ts: Date.now() };
  });
};

export const coinbaseFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`coinbase_${symbol}`, async () => {
    const { base, quote } = parseSymbol(symbol);
    const prod = `${base}-${quote}`.toUpperCase();
    const url = `https://api.exchange.coinbase.com/products/${prod}/ticker`;
    console.log(`[Coinbase] Fetching ${prod} from ${url}`);
    const res = await fetch(url, { headers: { "User-Agent": "arb-app/1.0" }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`coinbase_http_${res.status}`);
    const j = await res.json();
    const ask = parseFloat(j.ask);
    const bid = parseFloat(j.bid);
    console.log(`[Coinbase] ${symbol} - bid: ${bid}, ask: ${ask}`);
    return { exchange: "coinbase", symbol, bid, ask, ts: Date.now() };
  });
};

export const binanceFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`binance_${symbol}`, async () => {
    const { base, quote } = parseSymbol(symbol);
    const s = `${base}${quote}`.toUpperCase();
    const url = `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${s}`;
    console.log(`[Binance] Fetching ${s} from ${url}`);
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`binance_http_${res.status}`);
    const j = await res.json();
    const bid = parseFloat(j.bidPrice);
    const ask = parseFloat(j.askPrice);
    console.log(`[Binance] ${symbol} - bid: ${bid}, ask: ${ask}`);
    return { exchange: "binance", symbol, bid, ask, ts: Date.now() };
  });
};

export const bybitFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`bybit_${symbol}`, async () => {
    const { base, quote } = parseSymbol(symbol);
    const s = `${base}${quote}`.toUpperCase();
    const url = `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${s}`;
    console.log(`[Bybit] Fetching ${s} from ${url}`);
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`bybit_http_${res.status}`);
    const j = await res.json();
    const d = j.result?.list?.[0];
    const bid = parseFloat(d?.bid1Price ?? "0");
    const ask = parseFloat(d?.ask1Price ?? "0");
    console.log(`[Bybit] ${symbol} - bid: ${bid}, ask: ${ask}`);
    return { exchange: "bybit", symbol, bid, ask, ts: Date.now() };
  });
};

export const adapters: Record<string, Fetcher> = {
  kraken: krakenFetcher,
  coinbase: coinbaseFetcher,
  binance: binanceFetcher,
  bybit: bybitFetcher,
};
```

---

## backend/exchanges/safeFetch.ts

```ts
type State = { failures: number; until?: number };
const state: Record<string, State> = {};

export async function withBreaker<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const s = state[id] ?? (state[id] = { failures: 0 });
  if (s.until && now < s.until) throw new Error(`breaker_open_${id}`);
  try {
    const r = await fn();
    s.failures = 0;
    s.until = undefined;
    return r;
  } catch (e) {
    s.failures += 1;
    if (s.failures >= 3) s.until = now + 15_000;
    throw e;
  }
}
```

---

## backend/opportunities/opportunities.ts

```ts
import type { Ticker } from "../exchanges/adapters";

export type Opportunity = {
  symbol: string;
  buyOn: string;
  sellOn: string;
  spreadPct: number;
  gross: number;
  fees: number;
  net: number;
  ts: number;
};

export function computeOpportunities(tickers: Ticker[], feeTable: Record<string, number>): Opportunity[] {
  const bySymbol: Record<string, Ticker[]> = {};
  for (const t of tickers) {
    if (!bySymbol[t.symbol]) bySymbol[t.symbol] = [];
    bySymbol[t.symbol].push(t);
  }
  const out: Opportunity[] = [];
  for (const [symbol, arr] of Object.entries(bySymbol)) {
    for (const a of arr) {
      for (const b of arr) {
        if (a.exchange === b.exchange) continue;
        const spread = (b.bid - a.ask) / a.ask;
        if (spread <= 0) continue;
        const gross = b.bid - a.ask;
        const fees = (feeTable[a.exchange] ?? 0) + (feeTable[b.exchange] ?? 0);
        const net = gross - fees;
        if (net > 0) out.push({ symbol, buyOn: a.exchange, sellOn: b.exchange, spreadPct: spread * 100, gross, fees, net, ts: Date.now() });
      }
    }
  }
  return out.sort((x, y) => y.net - x.net);
}
```

---

## backend/routes/opportunities.ts

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
  console.log(`[Opportunities] Fetching: ex=${exchanges.join(",")}, sym=${symbols.join(",")}`);
  const tasks: Promise<any>[] = [];
  for (const ex of exchanges) {
    for (const sym of symbols) {
      const f = adapters[ex];
      if (!f) continue;
      tasks.push(f(sym).catch(() => null));
    }
  }
  const tickers = (await Promise.all(tasks)).filter(Boolean);
  const opps = computeOpportunities(tickers, fee);
  console.log(`[Opportunities] Found ${opps.length} opportunities from ${tickers.length} tickers`);
  return c.json({ tickers, opportunities: opps });
});
```
