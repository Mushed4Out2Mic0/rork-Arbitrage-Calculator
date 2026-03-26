import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import tickerRoute from "./routes/exchanges/ticker/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  exchanges: createTRPCRouter({
    ticker: tickerRoute,
  }),
});

export type AppRouter = typeof appRouter;
