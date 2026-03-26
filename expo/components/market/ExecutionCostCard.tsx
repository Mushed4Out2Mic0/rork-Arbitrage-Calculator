import { StyleSheet, Text, View } from 'react-native';
import { TickerData } from '@/types/exchanges';
import { calculateArbitrageOpportunity, getCryptoSymbol } from '@/utils/arbitrage';
import { TRADE_AMOUNT } from '@/constants/exchanges';
import { useTheme } from '@/contexts/ThemeContext';

interface ExecutionCostCardProps {
  tickers: TickerData[];
}

export function ExecutionCostCard({ tickers }: ExecutionCostCardProps) {
  const { theme } = useTheme();
  if (tickers.length < 2) return null;

  const cryptoSymbol = getCryptoSymbol(tickers[0]?.symbol || 'BTC/USDT');
  
  const opportunities = [];
  for (let i = 0; i < tickers.length; i++) {
    for (let j = 0; j < tickers.length; j++) {
      if (i === j) continue;
      opportunities.push(calculateArbitrageOpportunity(tickers[i], tickers[j], TRADE_AMOUNT));
    }
  }

  const topOpportunities = opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, 3);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
      <Text style={[styles.title, { color: theme.text }]}>Execution Cost Analysis</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Cross-exchange execution costs for {TRADE_AMOUNT} {cryptoSymbol}</Text>
      <View style={styles.content}>
        {topOpportunities.map((opp, index) => (
          <View 
            key={`${opp.buyExchange}-${opp.sellExchange}-${index}`}
            style={[
              styles.row,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
              opp.isProfitable && { backgroundColor: theme.successLight, borderColor: theme.success, borderWidth: 2 },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.exchangeFlow}>
                <View style={[styles.buyIndicator, { backgroundColor: theme.success }]}>
                  <Text style={styles.buyIndicatorText}>BUY</Text>
                </View>
                <Text style={[styles.exchangeName, { color: theme.text }]}>{opp.buyExchange.toUpperCase()}</Text>
                <Text style={[styles.flowArrow, { color: theme.textSecondary }]}>→</Text>
                <View style={[styles.sellIndicator, { backgroundColor: theme.error }]}>
                  <Text style={styles.sellIndicatorText}>SELL</Text>
                </View>
                <Text style={[styles.exchangeName, { color: theme.text }]}>{opp.sellExchange.toUpperCase()}</Text>
              </View>
              {opp.isProfitable && index === 0 && (
                <View style={[styles.bestBadge, { backgroundColor: theme.success }]}>
                  <Text style={styles.bestBadgeText}>BEST</Text>
                </View>
              )}
            </View>

            <View style={styles.metrics}>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Buy Price:</Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>${opp.buyPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Sell Price:</Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>${opp.sellPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Gross Profit:</Text>
                <Text style={[styles.metricValue, { color: opp.grossProfit > 0 ? theme.success : theme.error }]}>
                  ${opp.grossProfit.toFixed(2)}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Fees:</Text>
                <Text style={[styles.metricValue, { color: theme.error }]}>
                  ${opp.totalCost.toFixed(2)} ({opp.costPercentage.toFixed(3)}%)
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Net Profit:</Text>
                <Text style={[styles.metricValue, { color: opp.isProfitable ? theme.successDark : theme.error }]}>
                  ${opp.netProfit.toFixed(2)} ({((opp.netProfit / (opp.buyPrice * opp.tradeAmount)) * 100).toFixed(3)}%)
                </Text>
              </View>
              <View style={[styles.feesBreakdown, { borderTopColor: theme.border }]}>
                <Text style={[styles.feesLabel, { color: theme.textSecondary }]}>Fee Breakdown:</Text>
                <Text style={[styles.feesDetail, { color: theme.textTertiary }]}>
                  Buy ${opp.buyFee.toFixed(2)} + Sell ${opp.sellFee.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  content: {
    gap: 12,
  },
  row: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  metrics: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  exchangeFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buyIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buyIndicatorText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sellIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sellIndicatorText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  exchangeName: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  flowArrow: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  feesBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  feesLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  feesDetail: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
});
