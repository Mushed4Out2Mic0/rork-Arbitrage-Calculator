type State = { failures: number; until?: number };
const state: Record<string, State> = {};

export async function withBreaker<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const s = state[id] ?? (state[id] = { failures: 0 });
  if (s.until && now < s.until) {
    throw new Error(`breaker_open_${id}`);
  }

  try {
    const r = await fn();
    s.failures = 0;
    s.until = undefined;
    return r;
  } catch (e) {
    s.failures += 1;
    if (s.failures >= 3) {
      s.until = now + 15_000;
    }
    throw e;
  }
}
