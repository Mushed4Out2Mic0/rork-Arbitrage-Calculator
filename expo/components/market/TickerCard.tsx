import { StyleSheet, Text, View } from 'react-native';
import { TickerData } from '@/types/exchanges';
import { calculateSpread, calculateSpreadPercentage, getCryptoSymbol } from '@/utils/arbitrage';
import { useTheme } from '@/contexts/ThemeContext';

interface TickerCardProps {
  ticker: TickerData;
}

export function TickerCard({ ticker }: TickerCardProps) {
  const { theme } = useTheme();
  const spread = calculateSpread(ticker.bidPrice, ticker.askPrice);
  const spreadPercentage = calculateSpreadPercentage(ticker.bidPrice, ticker.askPrice);
  const cryptoSymbol = getCryptoSymbol(ticker.symbol);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
      <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
        <Text style={[styles.exchangeName, { color: theme.text }]}>{ticker.exchange.toUpperCase()}</Text>
        <Text style={[styles.timestamp, { color: theme.textTertiary }]}>
          {new Date(ticker.timestamp).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.priceGrid}>
        <View style={styles.priceColumn}>
          <Text style={[styles.priceLabel, { color: theme.textTertiary }]}>BID</Text>
          <Text style={[styles.bidPrice, { color: theme.success }]}>
            ${parseFloat(ticker.bidPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.priceQty, { color: theme.textTertiary }]}>{parseFloat(ticker.bidQty).toFixed(4)} {cryptoSymbol}</Text>
        </View>

        <View style={styles.spreadColumn}>
          <Text style={[styles.spreadLabel, { color: theme.textTertiary }]}>SPREAD</Text>
          <Text style={[styles.spreadValue, { color: theme.tint }]}>${spread.toFixed(2)}</Text>
          <Text style={[styles.spreadPercentage, { color: theme.textSecondary }]}>{spreadPercentage.toFixed(3)}%</Text>
        </View>

        <View style={styles.priceColumn}>
          <Text style={[styles.priceLabel, { color: theme.textTertiary }]}>ASK</Text>
          <Text style={[styles.askPrice, { color: theme.error }]}>
            ${parseFloat(ticker.askPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.priceQty, { color: theme.textTertiary }]}>{parseFloat(ticker.askQty).toFixed(4)} {cryptoSymbol}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  exchangeName: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 12,
  },
  priceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
  },
  spreadColumn: {
    flex: 0.8,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginBottom: 8,
    letterSpacing: 1,
  },
  bidPrice: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  askPrice: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  priceQty: {
    fontSize: 11,
  },
  spreadLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  spreadValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  spreadPercentage: {
    fontSize: 11,
  },
});
