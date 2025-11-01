import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useExchange } from '@/contexts/ExchangeContext';
import { calculateSpread, calculateSpreadPercentage } from '@/services/exchangeApi';
import { TickerData, ExchangeName } from '@/types/exchanges';
import { REFRESH_INTERVAL, EXCHANGE_TRADING_FEES } from '@/constants/exchanges';
import { Stack } from 'expo-router';
import { useState, useEffect, useMemo, useRef } from 'react';
import { trpcClient } from '@/lib/trpc';

interface CrossExchangeDeviation {
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

function getCryptoSymbol(symbol: string): string {
  const parts = symbol.split('/');
  return parts[0];
}

export default function MarketScreen() {
  const { getEnabledConfigs, globalMode, getEnabledCryptoPairs } = useExchange();
  const enabledConfigs = getEnabledConfigs();
  const enabledPairs = getEnabledCryptoPairs();
  const [crossDeviations, setCrossDeviations] = useState<CrossExchangeDeviation[]>([]);

  const queries = useQueries({
    queries: enabledConfigs.flatMap((config) =>
      enabledPairs.map((pair) => ({
        queryKey: ['ticker', config.name, config.mode, pair.symbol],
        queryFn: async () => {
          const fetchTime = new Date().toLocaleTimeString();
          console.log(`[Query] Fetching ${config.name} ${pair.symbol} at ${fetchTime}`);
          const result = await trpcClient.exchanges.ticker.query({
            exchange: config.name,
            mode: config.mode,
            pairSymbol: pair.symbol,
          });
          console.log(`[Query] Received ${config.name} ${pair.symbol} at ${fetchTime}:`, result.bidPrice, result.askPrice);
          return result;
        },
        refetchInterval: REFRESH_INTERVAL,
        refetchIntervalInBackground: true,
        retry: 1,
        retryDelay: 2000,
        staleTime: 0,
        gcTime: 1000,
        networkMode: 'always',
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
      }))
    ),
  });

  const isAnyLoading = queries.some((q) => q.isLoading);
  const isAnyRefetching = queries.some((q) => q.isRefetching);

  const handleRefresh = () => {
    queries.forEach((q) => q.refetch());
  };

  const tickers = queries
    .map((q) => q.data)
    .filter((data): data is TickerData => data !== undefined);

  useEffect(() => {
    console.log('[Market] Tickers updated:', tickers.length, 'tickers at', new Date().toLocaleTimeString());
    tickers.forEach(t => console.log(`  ${t.exchange} ${t.symbol}: ${t.bidPrice} / ${t.askPrice}`));
  }, [tickers]);

  const tickersByPair = useMemo(() => {
    const grouped: Record<string, TickerData[]> = {};
    tickers.forEach((ticker) => {
      if (!grouped[ticker.symbol]) {
        grouped[ticker.symbol] = [];
      }
      grouped[ticker.symbol].push(ticker);
    });
    return grouped;
  }, [tickers]);

  const tickersKey = useMemo(
    () => tickers.map(t => `${t.exchange}-${t.symbol}-${t.timestamp}-${t.bidPrice}-${t.askPrice}`).join(','),
    [tickers]
  );

  const prevTickersKeyRef = useRef<string>('');

  useEffect(() => {
    if (tickersKey === prevTickersKeyRef.current) {
      return;
    }
    prevTickersKeyRef.current = tickersKey;

    const newDeviations: CrossExchangeDeviation[] = [];

    Object.entries(tickersByPair).forEach(([pairSymbol, pairTickers]) => {
      if (pairTickers.length >= 2) {
        const timestamp = Date.now();
        const tradeAmount = 0.1;

        for (let i = 0; i < pairTickers.length; i++) {
          for (let j = 0; j < pairTickers.length; j++) {
            if (i === j) continue;

            const buyTicker = pairTickers[i];
            const sellTicker = pairTickers[j];

            const buyPrice = parseFloat(buyTicker.askPrice);
            const sellPrice = parseFloat(sellTicker.bidPrice);
            
            const deviation = sellPrice - buyPrice;
            const percentDeviation = (deviation / buyPrice) * 100;
            
            const buyFees = EXCHANGE_TRADING_FEES[buyTicker.exchange];
            const sellFees = EXCHANGE_TRADING_FEES[sellTicker.exchange];
            
            const buyFee = buyPrice * tradeAmount * buyFees.taker;
            const sellFee = sellPrice * tradeAmount * sellFees.taker;
            const totalCost = buyFee + sellFee;
            const costPercentage = (totalCost / (buyPrice * tradeAmount)) * 100;
            
            const grossProfit = deviation * tradeAmount;
            const netProfit = grossProfit - totalCost;
            const isProfitable = netProfit > 0;

            if (deviation > 0 && isProfitable) {
              newDeviations.push({
                timestamp,
                buyExchange: buyTicker.exchange,
                sellExchange: sellTicker.exchange,
                buyPrice,
                sellPrice,
                deviation,
                percentDeviation,
                tradeAmount,
                buyFee,
                sellFee,
                totalCost,
                costPercentage,
                grossProfit,
                netProfit,
                isProfitable,
                symbol: pairSymbol,
              });
            }
          }
        }
      }
    });

    newDeviations.sort((a, b) => b.netProfit - a.netProfit);

    setCrossDeviations(newDeviations.slice(0, 5));
  }, [tickersKey, tickers, tickersByPair]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Market',
          headerRight: () => (
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.modeBadge,
                  globalMode === 'live' ? styles.modeBadgeLive : styles.modeBadgeSandbox,
                ]}
              >
                <Text
                  style={[
                    styles.modeText,
                    globalMode === 'live' ? styles.modeTextLive : styles.modeTextSandbox,
                  ]}
                >
                  {globalMode.toUpperCase()}
                </Text>
              </View>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isAnyRefetching && !isAnyLoading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <TrendingUp size={32} color="#10B981" strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>Crypto Market</Text>
          <Text style={styles.subtitle}>Real-time bid/ask prices from multiple exchanges</Text>
          {enabledPairs.length > 0 && (
            <View style={styles.enabledPairsRow}>
              {enabledPairs.map((pair) => (
                <View key={pair.name} style={styles.pairChip}>
                  <Text style={styles.pairChipText}>{pair.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {isAnyLoading && tickers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading market data...</Text>
          </View>
        ) : (
          <>
            {enabledPairs.map((pair) => {
              const pairTickers = tickersByPair[pair.symbol] || [];
              
              return (
                <View key={pair.symbol} style={styles.pairSection}>
                  <View style={styles.pairHeader}>
                    <Text style={styles.pairTitle}>{pair.displayName}</Text>
                    <Text style={styles.pairSymbol}>{pair.symbol}</Text>
                  </View>

                  {pairTickers.map((ticker) => (
                    <TickerCard key={`${ticker.exchange}-${ticker.symbol}`} ticker={ticker} />
                  ))}

                  {pairTickers.length > 1 && (
                    <>
                      <View style={styles.comparisonCard}>
                        <Text style={styles.comparisonTitle}>Price Comparison</Text>
                        <ComparisonView tickers={pairTickers} />
                      </View>

                      <View style={styles.executionCard}>
                        <Text style={styles.executionTitle}>Execution Cost Analysis</Text>
                        <ExecutionCostView tickers={pairTickers} />
                      </View>
                    </>
                  )}
                </View>
              );
            })}

            {crossDeviations.length > 0 && (
              <View style={styles.deviationCard}>
                <Text style={styles.deviationTitle}>Top 5 Profitable Opportunities</Text>
                <Text style={styles.deviationSubtitle}>After cost analysis • Sorted by net profit</Text>
                <CrossDeviationView deviations={crossDeviations} />
              </View>
            )}

            {queries.filter((q) => q.isError).map((query, index) => {
              const queryIndex = queries.indexOf(query);
              const configIndex = Math.floor(queryIndex / enabledPairs.length);
              const pairIndex = queryIndex % enabledPairs.length;
              const config = enabledConfigs[configIndex];
              const pair = enabledPairs[pairIndex];
              
              return (
                <View key={`error-${config?.name || index}-${pair?.symbol || index}`} style={styles.errorCard}>
                  <AlertCircle size={20} color="#EF4444" />
                  <View style={styles.errorTextContainer}>
                    <Text style={styles.errorExchange}>
                      [{config?.displayName || 'Exchange'}] {pair?.symbol || ''}
                    </Text>
                    <Text style={styles.errorText}>
                      {(query.error as Error)?.message || 'Connection failed'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {isAnyRefetching && !isAnyLoading && (
          <View style={styles.refreshIndicator}>
            <RefreshCw size={16} color="#6B7280" />
            <Text style={styles.refreshText}>Updating...</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

function TickerCard({ ticker }: { ticker: TickerData }) {
  const spread = calculateSpread(ticker.bidPrice, ticker.askPrice);
  const spreadPercentage = calculateSpreadPercentage(ticker.bidPrice, ticker.askPrice);
  const cryptoSymbol = getCryptoSymbol(ticker.symbol);

  return (
    <View style={styles.tickerCard}>
      <View style={styles.tickerHeader}>
        <Text style={styles.exchangeName}>{ticker.exchange.toUpperCase()}</Text>
        <Text style={styles.timestamp}>
          {new Date(ticker.timestamp).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.priceGrid}>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>BID</Text>
          <Text style={styles.bidPrice}>${parseFloat(ticker.bidPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={styles.priceQty}>{parseFloat(ticker.bidQty).toFixed(4)} {cryptoSymbol}</Text>
        </View>

        <View style={styles.spreadColumn}>
          <Text style={styles.spreadLabel}>SPREAD</Text>
          <Text style={styles.spreadValue}>${spread.toFixed(2)}</Text>
          <Text style={styles.spreadPercentage}>{spreadPercentage.toFixed(3)}%</Text>
        </View>

        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>ASK</Text>
          <Text style={styles.askPrice}>${parseFloat(ticker.askPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={styles.priceQty}>{parseFloat(ticker.askQty).toFixed(4)} {cryptoSymbol}</Text>
        </View>
      </View>
    </View>
  );
}

function ComparisonView({ tickers }: { tickers: TickerData[] }) {
  if (tickers.length < 2) return null;

  const prices = tickers.map((t) => ({
    exchange: t.exchange,
    bid: parseFloat(t.bidPrice),
    ask: parseFloat(t.askPrice),
  }));

  const highestBid = Math.max(...prices.map((p) => p.bid));
  const lowestAsk = Math.min(...prices.map((p) => p.ask));
  const highestBidExchange = prices.find(p => p.bid === highestBid)?.exchange || '';
  const lowestAskExchange = prices.find(p => p.ask === lowestAsk)?.exchange || '';

  return (
    <View style={styles.comparisonContent}>
      <Text style={styles.comparisonDescription}>Cross-Exchange Price Analysis</Text>

      {prices.map((price) => (
        <View key={price.exchange} style={styles.comparisonRow}>
          <Text style={styles.comparisonExchange}>{price.exchange.toUpperCase()}</Text>
          <View style={styles.comparisonPrices}>
            <Text
              style={[
                styles.comparisonBid,
                price.bid === highestBid && styles.highlightedPrice,
              ]}
            >
              ${price.bid.toFixed(2)}
            </Text>
            <Text style={styles.comparisonSeparator}>|</Text>
            <Text
              style={[
                styles.comparisonAsk,
                price.ask === lowestAsk && styles.highlightedPrice,
              ]}
            >
              ${price.ask.toFixed(2)}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.arbitrageExplanation}>
        <View style={styles.arbitrageHeaderRow}>
          <Text style={styles.arbitrageExplainTitle}>Best Arbitrage Path:</Text>
          <View style={styles.cryptoBadge}>
            <Text style={styles.cryptoBadgeText}>{tickers[0]?.symbol || 'BTC/USDT'}</Text>
          </View>
        </View>
        <View style={styles.arbitragePathRow}>
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
        {highestBid > lowestAsk && (
          <View style={styles.arbitragePotential}>
            <Text style={styles.potentialLabel}>Price Difference:</Text>
            <Text style={styles.potentialValue}>
              ${(highestBid - lowestAsk).toFixed(2)} ({((highestBid - lowestAsk) / lowestAsk * 100).toFixed(3)}%)
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function CrossDeviationView({ deviations }: { deviations: CrossExchangeDeviation[] }) {
  return (
    <View style={styles.deviationContent}>
      {deviations.map((dev, index) => {
        const cryptoSymbol = getCryptoSymbol(dev.symbol);
        
        return (
          <View key={`${dev.buyExchange}-${dev.sellExchange}-${dev.timestamp}-${index}`} style={styles.deviationRow}>
            <View style={styles.crossDeviationHeader}>
              <View style={styles.exchangePair}>
                <View style={styles.buyBadge}>
                  <Text style={styles.buyBadgeText}>BUY</Text>
                </View>
                <Text style={styles.deviationExchange}>{dev.buyExchange.toUpperCase()}</Text>
                <Text style={styles.arrowText}>→</Text>
                <View style={styles.sellBadge}>
                  <Text style={styles.sellBadgeText}>SELL</Text>
                </View>
                <Text style={styles.deviationExchange}>{dev.sellExchange.toUpperCase()}</Text>
              </View>
              <Text style={styles.deviationTime}>{new Date(dev.timestamp).toLocaleTimeString()}</Text>
            </View>
            <View style={styles.pairBadgeRow}>
              <View style={styles.pairBadgeSmall}>
                <Text style={styles.pairBadgeSmallText}>{dev.symbol}</Text>
              </View>
            </View>
            <View style={styles.deviationValues}>
              <View style={styles.deviationItem}>
                <Text style={styles.deviationLabel}>Buy Price:</Text>
                <Text style={styles.deviationValue}>${dev.buyPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.deviationItem}>
                <Text style={styles.deviationLabel}>Sell Price:</Text>
                <Text style={styles.deviationValue}>${dev.sellPrice.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.deviationMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Price Deviation:</Text>
                <Text style={[styles.metricValue, styles.positiveValue]}>
                  ${dev.deviation.toFixed(2)} ({dev.percentDeviation.toFixed(3)}%)
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Execution Cost:</Text>
                <Text style={[styles.metricValue, styles.costValue]}>
                  ${dev.totalCost.toFixed(2)} ({dev.costPercentage.toFixed(3)}%)
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Gross Profit:</Text>
                <Text style={[styles.metricValue, styles.neutralValue]}>
                  ${dev.grossProfit.toFixed(2)}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Net Profit ({dev.tradeAmount} {cryptoSymbol}):</Text>
                <Text style={[styles.metricValue, styles.profitValue]}>
                  ${dev.netProfit.toFixed(2)}
                </Text>
              </View>
              <View style={styles.feesBreakdown}>
                <Text style={styles.feesLabel}>Fees:</Text>
                <Text style={styles.feesDetail}>Buy ${dev.buyFee.toFixed(2)} + Sell ${dev.sellFee.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ExecutionCostView({ tickers }: { tickers: TickerData[] }) {
  if (tickers.length < 2) return null;

  const tradeAmount = 0.1;
  const cryptoSymbol = getCryptoSymbol(tickers[0]?.symbol || 'BTC/USDT');

  const opportunities = [];
  for (let i = 0; i < tickers.length; i++) {
    for (let j = 0; j < tickers.length; j++) {
      if (i === j) continue;

      const buyTicker = tickers[i];
      const sellTicker = tickers[j];

      const buyPrice = parseFloat(buyTicker.askPrice);
      const sellPrice = parseFloat(sellTicker.bidPrice);
      
      const buyFees = EXCHANGE_TRADING_FEES[buyTicker.exchange];
      const sellFees = EXCHANGE_TRADING_FEES[sellTicker.exchange];
      
      const buyFee = buyPrice * tradeAmount * buyFees.taker;
      const sellFee = sellPrice * tradeAmount * sellFees.taker;
      const totalFees = buyFee + sellFee;
      
      const grossRevenue = sellPrice * tradeAmount;
      const grossCost = buyPrice * tradeAmount;
      const grossProfit = grossRevenue - grossCost;
      const netProfit = grossProfit - totalFees;
      
      const costPercentage = (totalFees / grossCost) * 100;
      const profitPercentage = (netProfit / grossCost) * 100;

      opportunities.push({
        buyExchange: buyTicker.exchange,
        sellExchange: sellTicker.exchange,
        buyPrice,
        sellPrice,
        buyFee,
        sellFee,
        totalFees,
        grossCost,
        grossRevenue,
        grossProfit,
        netProfit,
        costPercentage,
        profitPercentage,
        isProfitable: netProfit > 0,
      });
    }
  }

  opportunities.sort((a, b) => b.netProfit - a.netProfit);
  const topOpportunities = opportunities.slice(0, 3);

  return (
    <View style={styles.executionContent}>
      <Text style={styles.executionSubtitle}>Cross-exchange execution costs for {tradeAmount} {cryptoSymbol}</Text>

      {topOpportunities.map((opp, index) => (
        <View 
          key={`${opp.buyExchange}-${opp.sellExchange}-${index}`}
          style={[
            styles.executionRow,
            opp.isProfitable && styles.profitableExecutionRow,
          ]}
        >
          <View style={styles.executionHeader}>
            <View style={styles.exchangeFlow}>
              <View style={styles.buyIndicator}>
                <Text style={styles.buyIndicatorText}>BUY</Text>
              </View>
              <Text style={styles.executionExchangeName}>{opp.buyExchange.toUpperCase()}</Text>
              <Text style={styles.flowArrow}>→</Text>
              <View style={styles.sellIndicator}>
                <Text style={styles.sellIndicatorText}>SELL</Text>
              </View>
              <Text style={styles.executionExchangeName}>{opp.sellExchange.toUpperCase()}</Text>
            </View>
            {opp.isProfitable && index === 0 && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>BEST</Text>
              </View>
            )}
          </View>

          <View style={styles.executionMetrics}>
            <View style={styles.metricRow}>
              <Text style={styles.executionMetricLabel}>Buy Price:</Text>
              <Text style={styles.executionMetricValue}>${opp.buyPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.executionMetricLabel}>Sell Price:</Text>
              <Text style={styles.executionMetricValue}>${opp.sellPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.executionMetricLabel}>Gross Profit:</Text>
              <Text style={[styles.executionMetricValue, opp.grossProfit > 0 ? styles.positiveValue : styles.negativeValue]}>
                ${opp.grossProfit.toFixed(2)}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.executionMetricLabel}>Total Fees:</Text>
              <Text style={[styles.executionMetricValue, styles.costValue]}>
                ${opp.totalFees.toFixed(2)} ({opp.costPercentage.toFixed(3)}%)
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.executionMetricLabel}>Net Profit:</Text>
              <Text style={[styles.executionMetricValue, opp.isProfitable ? styles.profitValue : styles.negativeValue]}>
                ${opp.netProfit.toFixed(2)} ({opp.profitPercentage.toFixed(3)}%)
              </Text>
            </View>
            <View style={styles.feesBreakdown}>
              <Text style={styles.feesLabel}>Fee Breakdown:</Text>
              <Text style={styles.feesDetail}>
                Buy ${opp.buyFee.toFixed(2)} + Sell ${opp.sellFee.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  headerRight: {
    marginRight: 8,
  },
  modeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeBadgeLive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  modeBadgeSandbox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  modeTextLive: {
    color: '#059669',
  },
  modeTextSandbox: {
    color: '#D97706',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  tickerCard: {
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
  tickerHeader: {
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
  comparisonCard: {
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
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  comparisonContent: {
    gap: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  comparisonExchange: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    flex: 1,
  },
  comparisonPrices: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparisonBid: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  comparisonSeparator: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  comparisonAsk: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  highlightedPrice: {
    fontWeight: '700' as const,
    textDecorationLine: 'underline',
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  errorTextContainer: {
    flex: 1,
    gap: 4,
  },
  errorExchange: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#991B1B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  refreshText: {
    fontSize: 12,
    color: '#6B7280',
  },
  deviationCard: {
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
  deviationTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  deviationSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  deviationContent: {
    gap: 12,
  },
  deviationRow: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  crossDeviationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exchangePair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviationExchange: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#111827',
  },
  deviationTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  deviationValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  deviationItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviationLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  deviationValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#111827',
  },
  buyBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buyBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sellBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sellBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  arrowText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700' as const,
  },
  deviationMetrics: {
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  profitValue: {
    color: '#059669',
    fontSize: 15,
  },
  positiveValue: {
    color: '#10B981',
  },
  neutralValue: {
    color: '#6B7280',
  },
  feesBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  feesLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  feesDetail: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  executionCard: {
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
  executionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  executionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  executionContent: {
    gap: 12,
  },
  executionRow: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bestExecutionRow: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  profitableExecutionRow: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  executionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  executionExchange: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  bestBadge: {
    backgroundColor: '#10B981',
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
  executionMetrics: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  executionMetricLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  executionMetricValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  costValue: {
    color: '#EF4444',
    fontWeight: '700' as const,
  },
  negativeValue: {
    color: '#EF4444',
  },
  exchangeFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buyIndicator: {
    backgroundColor: '#10B981',
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
    backgroundColor: '#EF4444',
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
  executionExchangeName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#111827',
  },
  flowArrow: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700' as const,
  },
  comparisonDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500' as const,
  },
  arbitrageExplanation: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  arbitrageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  arbitrageExplainTitle: {
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
  arbitragePathRow: {
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
  arbitragePotential: {
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
  enabledPairsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pairChip: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pairChipText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pairSection: {
    marginBottom: 24,
  },
  pairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  pairTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
  },
  pairSymbol: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#059669',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pairBadgeRow: {
    marginBottom: 8,
  },
  pairBadgeSmall: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pairBadgeSmallText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
});
