import { Redis } from "@upstash/redis";

// Abstract counter store. Uses Upstash Redis in production (when env vars are
// present) and a process-local in-memory map otherwise, so the full funnel
// works locally with zero setup. No PII is ever stored — only integer counters.
export interface CounterStore {
  incr(key: string): Promise<number>;
  mget(keys: string[]): Promise<number[]>;
}

const KEY_PREFIX = "wp:";

class UpstashStore implements CounterStore {
  constructor(private redis: Redis) {}
  async incr(key: string): Promise<number> {
    return this.redis.incr(KEY_PREFIX + key);
  }
  async mget(keys: string[]): Promise<number[]> {
    if (keys.length === 0) return [];
    const values = await this.redis.mget<(number | null)[]>(
      ...keys.map((k) => KEY_PREFIX + k),
    );
    return values.map((v) => Number(v ?? 0));
  }
}

class MemoryStore implements CounterStore {
  private map = new Map<string, number>();
  async incr(key: string): Promise<number> {
    const next = (this.map.get(key) ?? 0) + 1;
    this.map.set(key, next);
    return next;
  }
  async mget(keys: string[]): Promise<number[]> {
    return keys.map((k) => this.map.get(k) ?? 0);
  }
}

let store: CounterStore | null = null;

export function getStore(): CounterStore {
  if (store) return store;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    store = new UpstashStore(new Redis({ url, token }));
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[wp-quiz] Upstash env vars missing — falling back to in-memory counters. " +
          "Aggregate stats will reset between invocations. Set UPSTASH_REDIS_REST_URL/TOKEN.",
      );
    }
    store = new MemoryStore();
  }
  return store;
}

// Key builders — keep stable; renaming breaks historical counts.
export const keys = {
  total: () => "total",
  cluster: (id: string) => `cluster:${id}`,
  mode: (id: string) => `mode:${id}`,
  companion: (id: string) => `companion:${id}`,
  poll: (pollId: string, optionId: string) => `poll:${pollId}:${optionId}`,
};
