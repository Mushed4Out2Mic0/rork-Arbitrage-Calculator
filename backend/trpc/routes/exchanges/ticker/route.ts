import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { adapters } from "../../../../exchanges/adapters";

const inputSchema = z.object({
  exchanges: z.array(z.enum(["kraken", "coinbase", "binance", "bybit"])).nonempty(),
  symbols: z.array(z.string().regex(/^[A-Z]{2,10}\/[A-Z]{2,10}$/i)).nonempty(),
});

export default publicProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    console.log(`[Backend] Batch fetching: ${input.exchanges.join(",")} for ${input.symbols.join(",")}`);
    
    const tasks: Promise<any>[] = [];
    
    for (const ex of input.exchanges) {
      for (const sym of input.symbols) {
        const fetcher = adapters[ex];
        if (!fetcher) {
          console.warn(`[Backend] No adapter found for ${ex}`);
          continue;
        }
        
        tasks.push(
          fetcher(sym).catch((err) => ({
            error: String(err),
            exchange: ex,
            symbol: sym,
            ts: Date.now(),
          }))
        );
      }
    }
    
    const results = await Promise.all(tasks);
    
    const successful = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);
    
    console.log(`[Backend] Batch complete: ${successful.length} success, ${failed.length} failed`);
    
    return { results };
  });
