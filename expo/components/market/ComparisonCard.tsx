import { StyleSheet, Text, View } from 'react-native';
import { TickerData } from '@/types/exchanges';
import { getBestArbitragePath, getPriceComparisons } from '@/utils/arbitrage';

interface ComparisonCardProps {
  tickers: TickerData[];
}

export function ComparisonCard({ tickers }: ComparisonCardProps) {
  if (tickers.length < 2) return null;

  const prices = getPriceComparisons(tickers);
  const arbitragePath = getBestArbitragePath(tickers);

  if (!arbitragePath) return null;

  const { lowestAskExchange, lowestAsk, highestBidExchange, highestBid, priceDifference, priceDifferencePercent } = arbitragePath;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Price Comparison</Text>
      <View style={styles.content}>
        <Text style={styles.description}>Cross-Exchange Price Analysis</Text>

        {prices.map((price) => (
          <View key={price.exchange} style={styles.row}>
            <Text style={styles.exchange}>{price.exchange.toUpperCase()}</Text>
            <View style={styles.prices}>
              <Text
                style={[
                  styles.bid,
                  price.bid === highestBid && styles.highlightedPrice,
                ]}
              >
                ${price.bid.toFixed(2)}
              </Text>
              <Text style={styles.separator}>|</Text>
              <Text
                style={[
                  styles.ask,
                  price.ask === lowestAsk && styles.highlightedPrice,
                ]}
              >
                ${price.ask.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.arbitrageBox}>
          <View style={styles.arbitrageHeader}>
            <Text style={styles.arbitrageTitle}>Best Arbitrage Path:</Text>
            <View style={styles.cryptoBadge}>
              <Text style={styles.cryptoBadgeText}>{tickers[0]?.symbol || 'BTC/USDT'}</Text>
            </View>
          </View>
          <View style={styles.pathRow}>
            <View style={styles.pathStep}>
              <Text style={styles.pathLabel}>BUY on</Text>
              <Text style={styles.pathExchange}>{lowestAskExchange.toUpperCase()}</Text>
              <Text style={styles.pathPrice}>${lowestAsk.toFixed(2)}</Text>
            </View>
            <Text style={styles.pathArrow}>→</Text>
            <View style={styles.pathStep}>
              <Text style={styles.pathLabel}>SELL on</Text>
              <Text style={styles.pathExchange}>{highestBidExchange.toUpperCase()}</Text>
              <Text style={styles.pathPrice}>${highestBid.toFixed(2)}</Text>
            </View>
          </View>
          {priceDifference > 0 && (
            <View style={styles.potential}>
              <Text style={styles.potentialLabel}>Price Difference:</Text>
              <Text style={styles.potentialValue}>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
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
  },
  exchange: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
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
    color: '#10B981',
  },
  separator: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ask: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  highlightedPrice: {
    fontWeight: '700' as const,
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500' as const,
  },
  arbitrageBox: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
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
    color: '#166534',
  },
  cryptoBadge: {
    backgroundColor: '#059669',
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
    color: '#6B7280',
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pathExchange: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  pathPrice: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#059669',
  },
  pathArrow: {
    fontSize: 24,
    color: '#10B981',
    fontWeight: '700' as const,
  },
  potential: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  potentialLabel: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600' as const,
  },
  potentialValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
});
