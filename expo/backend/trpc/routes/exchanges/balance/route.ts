import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import * as crypto from "node:crypto";

const inputSchema = z.object({
  exchange: z.enum(["kraken", "coinbase", "binance", "bybit"]),
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
});

async function fetchKrakenBalance(apiKey: string, apiSecret: string) {
  const nonce = Date.now() * 1000;
  const path = "/0/private/Balance";
  const body = `nonce=${nonce}`;

  const hash = crypto.createHash("sha256").update(nonce + body).digest();
  const hmac = crypto.createHmac("sha512", Buffer.from(apiSecret, "base64"));
  hmac.update(path);
  hmac.update(hash);
  const signature = hmac.digest("base64");

  console.log("[Balance:Kraken] Fetching balance");
  const res = await fetch("https://api.kraken.com/0/private/Balance", {
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

  const balances: { asset: string; free: number; total: number }[] = [];
  for (const [asset, amount] of Object.entries(json.result || {})) {
    const total = parseFloat(amount as string);
    if (total > 0) {
      const normalizedAsset = asset === "XXBT" ? "BTC" : asset === "ZUSD" ? "USD" : asset === "XETH" ? "ETH" : asset.replace(/^[XZ]/, "");
      balances.push({ asset: normalizedAsset, free: total, total });
    }
  }
  return balances;
}

async function fetchCoinbaseBalance(apiKey: string, apiSecret: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const method = "GET";
  const path = "/accounts";
  const message = timestamp + method + path;

  const hmac = crypto.createHmac("sha256", apiSecret);
  hmac.update(message);
  const signature = hmac.digest("hex");

  console.log("[Balance:Coinbase] Fetching balance");
  const res = await fetch("https://api.exchange.coinbase.com/accounts", {
    method: "GET",
    headers: {
      "CB-ACCESS-KEY": apiKey,
      "CB-ACCESS-SIGN": signature,
      "CB-ACCESS-TIMESTAMP": timestamp,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`coinbase_http_${res.status}`);
  const accounts = await res.json();

  const balances: { asset: string; free: number; total: number }[] = [];
  if (Array.isArray(accounts)) {
    for (const acc of accounts) {
      const total = parseFloat(acc.balance || "0");
      const available = parseFloat(acc.available || "0");
      if (total > 0) {
        balances.push({ asset: acc.currency, free: available, total });
      }
    }
  }
  return balances;
}

async function fetchBinanceBalance(apiKey: string, apiSecret: string) {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac("sha256", apiSecret).update(queryString).digest("hex");

  console.log("[Balance:Binance] Fetching balance");
  const res = await fetch(`https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`, {
    headers: { "X-MBX-APIKEY": apiKey },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`binance_http_${res.status}`);
  const json = await res.json();

  const balances: { asset: string; free: number; total: number }[] = [];
  for (const b of json.balances || []) {
    const free = parseFloat(b.free);
    const locked = parseFloat(b.locked);
    const total = free + locked;
    if (total > 0) {
      balances.push({ asset: b.asset, free, total });
    }
  }
  return balances;
}

async function fetchBybitBalance(apiKey: string, apiSecret: string) {
  const timestamp = Date.now().toString();
  const recvWindow = "20000";
  const queryString = `accountType=UNIFIED`;
  const preSign = timestamp + apiKey + recvWindow + queryString;
  const signature = crypto.createHmac("sha256", apiSecret).update(preSign).digest("hex");

  console.log("[Balance:Bybit] Fetching balance");
  const res = await fetch(`https://api.bybit.com/v5/account/wallet-balance?${queryString}`, {
    headers: {
      "X-BAPI-API-KEY": apiKey,
      "X-BAPI-SIGN": signature,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recvWindow,
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`bybit_http_${res.status}`);
  const json = await res.json();

  const balances: { asset: string; free: number; total: number }[] = [];
  const accounts = json.result?.list || [];
  for (const acc of accounts) {
    for (const coin of acc.coin || []) {
      const total = parseFloat(coin.walletBalance || "0");
      const free = parseFloat(coin.availableToWithdraw || "0");
      if (total > 0) {
        balances.push({ asset: coin.coin, free, total });
      }
    }
  }
  return balances;
}

const fetchers: Record<string, (key: string, secret: string) => Promise<{ asset: string; free: number; total: number }[]>> = {
  kraken: fetchKrakenBalance,
  coinbase: fetchCoinbaseBalance,
  binance: fetchBinanceBalance,
  bybit: fetchBybitBalance,
};

export default publicProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    const fetcher = fetchers[input.exchange];
    if (!fetcher) {
      return { exchange: input.exchange, balances: [], error: `No balance fetcher for ${input.exchange}` };
    }

    try {
      const balances = await fetcher(input.apiKey, input.apiSecret);
      console.log(`[Balance] ${input.exchange}: ${balances.length} assets found`);
      return { exchange: input.exchange, balances, error: null };
    } catch (err) {
      console.error(`[Balance] ${input.exchange} error:`, err);
      return { exchange: input.exchange, balances: [], error: String(err) };
    }
  });
