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
            <Text style={[styles.bid, { color: theme.success }, p.bid === path.highestBid && styles.highlight]}>
              ${p.bid.toFixed(2)}
            </Text>
            <Text style={[styles.sep, { color: theme.textTertiary }]}>|</Text>
            <Text style={[styles.ask, { color: theme.error }, p.ask === path.lowestAsk && styles.highlight]}>
              ${p.ask.toFixed(2)}
            </Text>
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
            <Text style={[styles.diffValue, { color: theme.successDark }]}>
              ${path.priceDifference.toFixed(2)} ({path.priceDifferencePercent.toFixed(3)}%)
            </Text>
          </View>
        )}
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
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  exchange: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bid: { fontSize: 13, fontWeight: '600' as const },
  ask: { fontSize: 13, fontWeight: '600' as const },
  sep: { fontSize: 11 },
  highlight: {
    fontWeight: '700' as const,
    textDecorationLine: 'underline' as const,
  },
  pathBox: {
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  pathStep: { alignItems: 'center', gap: 3 },
  pathLabel: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.5 },
  pathExchange: { fontSize: 15, fontWeight: '700' as const },
  pathPrice: { fontSize: 13, fontWeight: '600' as const },
  arrow: { fontSize: 22, fontWeight: '700' as const },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  diffLabel: { fontSize: 12, fontWeight: '600' as const },
  diffValue: { fontSize: 13, fontWeight: '700' as const },
});
