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
        ...opp,
        base,
        quote,
        quoteBalance,
        baseBalance,
        totalBuyCost,
        buyFee,
        totalSellRevenue,
        sellFee,
        canBuy,
        canSell,
        estimatedSlippage,
        slippageAdjustedNet,
        roiPct,
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

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Real prices, simulated execution with your paper balance
      </Text>

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
          <Text style={[styles.summaryVal, { color: theme.success }]}>
            {simulations.filter((s) => s.executable).length}/{simulations.length}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.borderLight }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textTertiary }]}>Potential</Text>
          <Text style={[styles.summaryVal, { color: totalPotentialProfit > 0 ? theme.success : theme.textSecondary }]}>
            ${totalPotentialProfit.toFixed(2)}
          </Text>
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
            <View style={[
              styles.statusChip,
              { backgroundColor: sim.executable ? theme.success + '20' : theme.error + '20' },
            ]}>
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
              <Text style={[styles.simPriceVal, { color: theme.tint }]}>
                {sim.percentDeviation.toFixed(3)}%
              </Text>
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
              <Text style={[styles.simMetricVal, { color: sim.roiPct > 0 ? theme.successDark : theme.error }]}>
                {sim.roiPct.toFixed(4)}%
              </Text>
            </View>
            <View style={[styles.slippageRow, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
              <Text style={[styles.slippageLabel, { color: theme.textTertiary }]}>Est. slippage-adjusted net</Text>
              <Text style={[styles.slippageVal, { color: sim.slippageAdjustedNet > 0 ? theme.success : theme.error }]}>
                ${sim.slippageAdjustedNet.toFixed(4)}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
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
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  simBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  simBadgeText: {
    fontSize: 8,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 12,
  },
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  summaryDivider: {
    width: 1,
    height: 28,
  },
  simCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  simHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  simFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sideDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  simExchange: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  simArrow: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  simPriceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  simPriceCol: {
    flex: 1,
    alignItems: 'center',
  },
  simPriceDivider: {
    width: 1,
    height: 24,
  },
  simPriceLabel: {
    fontSize: 8,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  simPriceVal: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  simMetrics: {
    gap: 5,
  },
  simMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simMetricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  simMetricLabel: {
    fontSize: 11,
  },
  simMetricVal: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  simMetricSub: {
    fontSize: 9,
    fontWeight: '400' as const,
  },
  slippageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  slippageLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
  },
  slippageVal: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
});
