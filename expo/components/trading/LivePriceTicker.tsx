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
      if (parseFloat(t.askPrice) < parseFloat(grouped[t.symbol].best.askPrice)) {
        grouped[t.symbol].best = t;
      }
      if (parseFloat(t.bidPrice) > parseFloat(grouped[t.symbol].worst.bidPrice)) {
        grouped[t.symbol].worst = t;
      }
    }
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border, transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.headerRow}>
        <View style={styles.liveIndicator}>
          <Animated.View style={[styles.liveDot, { backgroundColor: theme.success, opacity: dotAnim }]} />
          <Text style={[styles.liveText, { color: theme.success }]}>LIVE PRICES</Text>
        </View>
        <Text style={[styles.updateTime, { color: theme.textTertiary }]}>
          {new Date().toLocaleTimeString()}
        </Text>
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
                <Text style={[styles.spreadInfo, { color: theme.textTertiary }]}>
                  Spread: ${spread.toFixed(2)} ({spreadPct.toFixed(3)}%)
                </Text>
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
  container: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
  updateTime: {
    fontSize: 10,
    fontWeight: '500' as const,
  },
  pairRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  pairLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pairBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairSymbol: {
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  midPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  spreadInfo: {
    fontSize: 10,
    marginTop: 1,
  },
  pairRight: {
    gap: 4,
  },
  exchangeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniEx: {
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    width: 28,
  },
  miniPrices: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniBid: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  miniSep: {
    fontSize: 8,
  },
  miniAsk: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
});
