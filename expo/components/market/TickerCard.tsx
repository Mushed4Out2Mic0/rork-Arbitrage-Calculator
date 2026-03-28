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
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  exchangeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exchangeName: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBlock: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  spreadBlock: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 8,
  },
  spreadLabel: {
    fontSize: 9,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  spreadValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  spreadPct: {
    fontSize: 10,
  },
});
