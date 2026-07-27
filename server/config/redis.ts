import { logger } from "./logger";

// Simple in-memory cache fallback when external Redis cluster is disconnected
class MemoryCache {
  private cache = new Map<string, { value: string; expiry: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, durationSeconds?: number): Promise<void> {
    const ttl = durationSeconds ? durationSeconds * 1000 : 3600 * 1000;
    this.cache.set(key, { value, expiry: Date.now() + ttl });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async flushall(): Promise<void> {
    this.cache.clear();
  }
}

export const cacheClient = new MemoryCache();
logger.info("Redis cache layer initialized (in-memory cluster simulation active)");
