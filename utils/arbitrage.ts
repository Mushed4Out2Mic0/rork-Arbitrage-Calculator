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
    isProfitable,
    symbol: buyTicker.symbol,
  };
}

export function findTopArbitrageOpportunities(
  tickersByPair: Record<string, TickerData[]>,
  limit: number = 5
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  Object.entries(tickersByPair).forEach(([pairSymbol, pairTickers]) => {
    if (pairTickers.length < 2) return;

    for (let i = 0; i < pairTickers.length; i++) {
      for (let j = 0; j < pairTickers.length; j++) {
        if (i === j) continue;

        const opportunity = calculateArbitrageOpportunity(
          pairTickers[i],
          pairTickers[j]
        );

        if (opportunity.deviation > 0 && opportunity.isProfitable) {
          opportunities.push(opportunity);
        }
      }
    }
  });

  return opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, limit);
}

export function getCryptoSymbol(symbol: string): string {
  const parts = symbol.split('/');
  return parts[0];
}

export function calculateSpread(bidPrice: string, askPrice: string): number {
  const bid = parseFloat(bidPrice);
  const ask = parseFloat(askPrice);
  return ask - bid;
}

export function calculateSpreadPercentage(bidPrice: string, askPrice: string): number {
  const bid = parseFloat(bidPrice);
  const ask = parseFloat(askPrice);
  const spread = ask - bid;
  return (spread / bid) * 100;
}

export interface PriceComparison {
  exchange: ExchangeName;
  bid: number;
  ask: number;
}

export function getPriceComparisons(tickers: TickerData[]): PriceComparison[] {
  return tickers.map((t) => ({
    exchange: t.exchange,
    bid: parseFloat(t.bidPrice),
    ask: parseFloat(t.askPrice),
  }));
}

export function getBestArbitragePath(tickers: TickerData[]): {
  lowestAskExchange: ExchangeName;
  lowestAsk: number;
  highestBidExchange: ExchangeName;
  highestBid: number;
  priceDifference: number;
  priceDifferencePercent: number;
} | null {
  if (tickers.length < 2) return null;

  const prices = getPriceComparisons(tickers);
  
  const highestBid = Math.max(...prices.map((p) => p.bid));
  const lowestAsk = Math.min(...prices.map((p) => p.ask));
  const highestBidExchange = prices.find(p => p.bid === highestBid)?.exchange!;
  const lowestAskExchange = prices.find(p => p.ask === lowestAsk)?.exchange!;

  const priceDifference = highestBid - lowestAsk;
  const priceDifferencePercent = (priceDifference / lowestAsk) * 100;

  return {
    lowestAskExchange,
    lowestAsk,
    highestBidExchange,
    highestBid,
    priceDifference,
    priceDifferencePercent,
  };
}
