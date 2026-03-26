import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import crypto from "crypto";

const inputSchema = z.object({
  exchange: z.enum(["kraken", "coinbase", "binance", "bybit"]),
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
  symbol: z.string(),
  side: z.enum(["buy", "sell"]),
  amount: z.number().positive(),
  price: z.number().positive().optional(),
});

async function executeKraken(apiKey: string, apiSecret: string, pair: string, side: string, volume: number) {
  const nonce = Date.now() * 1000;
  const krakenPair = pair.replace("/", "").replace("BTC", "XBT");
  const body = `nonce=${nonce}&ordertype=market&type=${side}&volume=${volume}&pair=${krakenPair}`;
  const path = "/0/private/AddOrder";

  const hash = crypto.createHash("sha256").update(nonce + body).digest();
  const hmac = crypto.createHmac("sha512", Buffer.from(apiSecret, "base64"));
  hmac.update(path);
  hmac.update(hash);
  const signature = hmac.digest("base64");

  console.log(`[Execute:Kraken] ${side} ${volume} ${krakenPair}`);
  const res = await fetch("https://api.kraken.com/0/private/AddOrder", {
    method: "POST",
    headers: {
      "API-Key": apiKey,
      "API-Sign": signature,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`kraken_http_${res.status}`);
  const json = await res.json();
  if (json.error?.length) throw new Error(`kraken_api_${json.error[0]}`);

  return {
    orderId: json.result?.txid?.[0] || "unknown",
    status: "filled" as const,
    description: json.result?.descr?.order || "",
  };
}

async function executeCoinbase(apiKey: string, apiSecret: string, productId: string, side: string, size: number) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const method = "POST";
  const path = "/orders";
  const bodyObj = {
    type: "market",
    side,
    product_id: productId.replace("/", "-"),
    size: String(size),
  };
  const bodyStr = JSON.stringify(bodyObj);
  const message = timestamp + method + path + bodyStr;
  const signature = crypto.createHmac("sha256", apiSecret).update(message).digest("hex");

  console.log(`[Execute:Coinbase] ${side} ${size} ${productId}`);
  const res = await fetch("https://api.exchange.coinbase.com/orders", {
    method: "POST",
    headers: {
      "CB-ACCESS-KEY": apiKey,
      "CB-ACCESS-SIGN": signature,
      "CB-ACCESS-TIMESTAMP": timestamp,
      "Content-Type": "application/json",
    },
    body: bodyStr,
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`coinbase_http_${res.status}: ${errBody}`);
  }
  const json = await res.json();
  return {
    orderId: json.id || "unknown",
    status: "filled" as const,
    description: `${side} ${size} ${productId}`,
  };
}

async function executeBinance(apiKey: string, apiSecret: string, symbol: string, side: string, quantity: number) {
  const timestamp = Date.now();
  const binanceSymbol = symbol.replace("/", "");
  const params = `symbol=${binanceSymbol}&side=${side.toUpperCase()}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;
  const signature = crypto.createHmac("sha256", apiSecret).update(params).digest("hex");

  console.log(`[Execute:Binance] ${side} ${quantity} ${binanceSymbol}`);
  const res = await fetch(`https://api.binance.com/api/v3/order?${params}&signature=${signature}`, {
    method: "POST",
    headers: { "X-MBX-APIKEY": apiKey },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`binance_http_${res.status}: ${errBody}`);
  }
  const json = await res.json();
  return {
    orderId: String(json.orderId || "unknown"),
    status: json.status === "FILLED" ? "filled" as const : "pending" as const,
    description: `${side} ${quantity} ${binanceSymbol}`,
  };
}

async function executeBybit(apiKey: string, apiSecret: string, symbol: string, side: string, qty: number) {
  const timestamp = Date.now().toString();
  const recvWindow = "20000";
  const bodyObj = {
    category: "spot",
    symbol: symbol.replace("/", ""),
    side: side.charAt(0).toUpperCase() + side.slice(1),
    orderType: "Market",
    qty: String(qty),
  };
  const bodyStr = JSON.stringify(bodyObj);
  const preSign = timestamp + apiKey + recvWindow + bodyStr;
  const signature = crypto.createHmac("sha256", apiSecret).update(preSign).digest("hex");

  console.log(`[Execute:Bybit] ${side} ${qty} ${symbol}`);
  const res = await fetch("https://api.bybit.com/v5/order/create", {
    method: "POST",
    headers: {
      "X-BAPI-API-KEY": apiKey,
      "X-BAPI-SIGN": signature,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recvWindow,
      "Content-Type": "application/json",
    },
    body: bodyStr,
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`bybit_http_${res.status}`);
  const json = await res.json();
  if (json.retCode !== 0) throw new Error(`bybit_api_${json.retMsg}`);

  return {
    orderId: json.result?.orderId || "unknown",
    status: "filled" as const,
    description: `${side} ${qty} ${symbol}`,
  };
}

const executors: Record<string, (key: string, secret: string, symbol: string, side: string, amount: number) => Promise<{ orderId: string; status: string; description: string }>> = {
  kraken: executeKraken,
  coinbase: executeCoinbase,
  binance: executeBinance,
  bybit: executeBybit,
};

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    const executor = executors[input.exchange];
    if (!executor) {
      return { success: false, error: `No executor for ${input.exchange}`, orderId: null };
    }

    try {
      const result = await executor(input.apiKey, input.apiSecret, input.symbol, input.side, input.amount);
      console.log(`[Execute] ${input.exchange} ${input.side} success:`, result);
      return { success: true, error: null, ...result };
    } catch (err) {
      console.error(`[Execute] ${input.exchange} error:`, err);
      return { success: false, error: String(err), orderId: null, status: "failed", description: "" };
    }
  });
