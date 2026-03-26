import { StyleSheet, Text, View } from 'react-native';
import { TickerData } from '@/types/exchanges';
import { getBestArbitragePath, getPriceComparisons } from '@/utils/arbitrage';
import { useTheme } from '@/contexts/ThemeContext';

interface ComparisonCardProps {
  tickers: TickerData[];
}

export function ComparisonCard({ tickers }: ComparisonCardProps) {
  const { theme } = useTheme();
  if (tickers.length < 2) return null;

  const prices = getPriceComparisons(tickers);
  const arbitragePath = getBestArbitragePath(tickers);

  if (!arbitragePath) return null;

  const { lowestAskExchange, lowestAsk, highestBidExchange, highestBid, priceDifference, priceDifferencePercent } = arbitragePath;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
      <Text style={[styles.title, { color: theme.text }]}>Price Comparison</Text>
      <View style={styles.content}>
        <Text style={[styles.description, { color: theme.textSecondary }]}>Cross-Exchange Price Analysis</Text>

        {prices.map((price) => (
          <View key={price.exchange} style={[styles.row, { borderBottomColor: theme.borderLight }]}>
            <Text style={[styles.exchange, { color: theme.text }]}>{price.exchange.toUpperCase()}</Text>
            <View style={styles.prices}>
              <Text
                style={[
                  styles.bid,
                  { color: theme.success },
                  price.bid === highestBid && styles.highlightedPrice,
                ]}
              >
                ${price.bid.toFixed(2)}
              </Text>
              <Text style={[styles.separator, { color: theme.textTertiary }]}>|</Text>
              <Text
                style={[
                  styles.ask,
                  { color: theme.error },
                  price.ask === lowestAsk && styles.highlightedPrice,
                ]}
              >
                ${price.ask.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={[styles.arbitrageBox, { backgroundColor: theme.successLight, borderColor: theme.successDark }]}>
          <View style={styles.arbitrageHeader}>
            <Text style={[styles.arbitrageTitle, { color: theme.successDark }]}>Best Arbitrage Path:</Text>
            <View style={[styles.cryptoBadge, { backgroundColor: theme.successDark }]}>
              <Text style={styles.cryptoBadgeText}>{tickers[0]?.symbol || 'BTC/USDT'}</Text>
            </View>
          </View>
          <View style={styles.pathRow}>
            <View style={styles.pathStep}>
              <Text style={[styles.pathLabel, { color: theme.textSecondary }]}>BUY on</Text>
              <Text style={[styles.pathExchange, { color: theme.text }]}>{lowestAskExchange.toUpperCase()}</Text>
              <Text style={[styles.pathPrice, { color: theme.successDark }]}>${lowestAsk.toFixed(2)}</Text>
            </View>
            <Text style={[styles.pathArrow, { color: theme.success }]}>→</Text>
            <View style={styles.pathStep}>
              <Text style={[styles.pathLabel, { color: theme.textSecondary }]}>SELL on</Text>
              <Text style={[styles.pathExchange, { color: theme.text }]}>{highestBidExchange.toUpperCase()}</Text>
              <Text style={[styles.pathPrice, { color: theme.successDark }]}>${highestBid.toFixed(2)}</Text>
            </View>
          </View>
          {priceDifference > 0 && (
            <View style={[styles.potential, { borderTopColor: theme.successDark }]}>
              <Text style={[styles.potentialLabel, { color: theme.successDark }]}>Price Difference:</Text>
              <Text style={[styles.potentialValue, { color: theme.successDark }]}>
                ${priceDifference.toFixed(2)} ({priceDifferencePercent.toFixed(3)}%)
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  content: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  exchange: {
    fontSize: 14,
    fontWeight: '600' as const,
    flex: 1,
  },
  prices: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bid: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  separator: {
    fontSize: 12,
  },
  ask: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  highlightedPrice: {
    fontWeight: '700' as const,
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '500' as const,
  },
  arbitrageBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  arbitrageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  arbitrageTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  cryptoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cryptoBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  pathStep: {
    alignItems: 'center',
    gap: 4,
  },
  pathLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pathExchange: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  pathPrice: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  pathArrow: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  potential: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  potentialLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  potentialValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
});
