import { redis } from '../config/redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

/**
 * Cache service for storing and retrieving cached data
 */
export class CacheService {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redis) {
      return null;
    }

    try {
      const value = await redis.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<boolean> {
    if (!redis) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      if (options?.ttl) {
        await redis.setex(key, options.ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!redis) {
      return false;
    }

    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!redis) {
      return 0;
    }

    try {
      const stream = redis.scanStream({
        match: pattern,
        count: 100,
      });

      let deletedCount = 0;
      const pipeline = redis.pipeline();

      return new Promise((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
          keys.forEach((key) => {
            pipeline.del(key);
            deletedCount++;
          });
        });

        stream.on('end', async () => {
          if (deletedCount > 0) {
            await pipeline.exec();
          }
          resolve(deletedCount);
        });

        stream.on('error', reject);
      });
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    if (!redis) {
      return false;
    }

    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }
}

export const cacheService = new CacheService();

