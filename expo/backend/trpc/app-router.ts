import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import tickerRoute from "./routes/exchanges/ticker/route";
import balanceRoute from "./routes/exchanges/balance/route";
import executeRoute from "./routes/exchanges/execute/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  exchanges: createTRPCRouter({
    ticker: tickerRoute,
    balance: balanceRoute,
    execute: executeRoute,
  }),
});

export type AppRouter = typeof appRouter;
