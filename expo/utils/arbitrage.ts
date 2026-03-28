import { TickerData, ExchangeName } from '@/types/exchanges';
import { EXCHANGE_TRADING_FEES, TRADE_AMOUNT } from '@/constants/exchanges';

export interface ArbitrageOpportunity {
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

export function calculateArbitrageOpportunity(
  buyTicker: TickerData,
  sellTicker: TickerData,
  tradeAmount: number = TRADE_AMOUNT
): ArbitrageOpportunity {
  const buyPrice = parseFloat(buyTicker.askPrice);
  const sellPrice = parseFloat(sellTicker.bidPrice);
  const deviation = sellPrice - buyPrice;
  const percentDeviation = buyPrice > 0 ? (deviation / buyPrice) * 100 : 0;

  const buyFees = EXCHANGE_TRADING_FEES[buyTicker.exchange];
  const sellFees = EXCHANGE_TRADING_FEES[sellTicker.exchange];
  const buyFee = buyPrice * tradeAmount * buyFees.taker;
  const sellFee = sellPrice * tradeAmount * sellFees.taker;
  const totalCost = buyFee + sellFee;
  const costPercentage = buyPrice > 0 ? (totalCost / (buyPrice * tradeAmount)) * 100 : 0;

  const grossProfit = deviation * tradeAmount;
  const netProfit = grossProfit - totalCost;

  return {
    timestamp: Date.now(),
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
    isProfitable: netProfit > 0,
    symbol: buyTicker.symbol,
  };
}

export function findTopArbitrageOpportunities(
  tickersByPair: Record<string, TickerData[]>,
  limit: number = 5
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  for (const pairTickers of Object.values(tickersByPair)) {
    if (pairTickers.length < 2) continue;
    for (let i = 0; i < pairTickers.length; i++) {
      for (let j = 0; j < pairTickers.length; j++) {
        if (i === j) continue;
        const opp = calculateArbitrageOpportunity(pairTickers[i], pairTickers[j]);
        if (opp.deviation > 0 && opp.isProfitable) {
          opportunities.push(opp);
        }
      }
    }
  }

  return opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, limit);
}

export function getBestArbitragePath(tickers: TickerData[]) {
  if (tickers.length < 2) return null;

  let lowestAsk = Infinity;
  let highestBid = -Infinity;
  let lowestAskExchange: ExchangeName = tickers[0].exchange;
  let highestBidExchange: ExchangeName = tickers[0].exchange;

  for (const t of tickers) {
    const ask = parseFloat(t.askPrice);
    const bid = parseFloat(t.bidPrice);
    if (ask < lowestAsk) { lowestAsk = ask; lowestAskExchange = t.exchange; }
    if (bid > highestBid) { highestBid = bid; highestBidExchange = t.exchange; }
  }

  const priceDifference = highestBid - lowestAsk;
  const priceDifferencePercent = lowestAsk > 0 ? (priceDifference / lowestAsk) * 100 : 0;

  return { lowestAskExchange, lowestAsk, highestBidExchange, highestBid, priceDifference, priceDifferencePercent };
}

export function formatPrice(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPriceStr(value: string, decimals: number = 2): string {
  return formatPrice(parseFloat(value), decimals);
}
