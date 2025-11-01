import { StyleSheet, Text, View } from 'react-native';
import { TickerData } from '@/types/exchanges';
import { calculateSpread, calculateSpreadPercentage, getCryptoSymbol } from '@/utils/arbitrage';

interface TickerCardProps {
  ticker: TickerData;
}

export function TickerCard({ ticker }: TickerCardProps) {
  const spread = calculateSpread(ticker.bidPrice, ticker.askPrice);
  const spreadPercentage = calculateSpreadPercentage(ticker.bidPrice, ticker.askPrice);
  const cryptoSymbol = getCryptoSymbol(ticker.symbol);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.exchangeName}>{ticker.exchange.toUpperCase()}</Text>
        <Text style={styles.timestamp}>
          {new Date(ticker.timestamp).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.priceGrid}>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>BID</Text>
          <Text style={styles.bidPrice}>
            ${parseFloat(ticker.bidPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.priceQty}>{parseFloat(ticker.bidQty).toFixed(4)} {cryptoSymbol}</Text>
        </View>

        <View style={styles.spreadColumn}>
          <Text style={styles.spreadLabel}>SPREAD</Text>
          <Text style={styles.spreadValue}>${spread.toFixed(2)}</Text>
          <Text style={styles.spreadPercentage}>{spreadPercentage.toFixed(3)}%</Text>
        </View>

        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>ASK</Text>
          <Text style={styles.askPrice}>
            ${parseFloat(ticker.askPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.priceQty}>{parseFloat(ticker.askQty).toFixed(4)} {cryptoSymbol}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  exchangeName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
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
    color: '#9CA3AF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  bidPrice: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#10B981',
    marginBottom: 4,
  },
  askPrice: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#EF4444',
    marginBottom: 4,
  },
  priceQty: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  spreadLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  spreadValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#3B82F6',
    marginBottom: 2,
  },
  spreadPercentage: {
    fontSize: 11,
    color: '#6B7280',
  },
});
