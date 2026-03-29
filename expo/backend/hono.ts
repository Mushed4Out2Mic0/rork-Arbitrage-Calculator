import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { oppRouter } from "./routes/opportunities";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["*"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

app.route("/api/opportunities", oppRouter);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;
