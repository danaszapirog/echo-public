import Redis from 'ioredis';
import env from './env';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (redisClient) {
    return redisClient;
  }

  // If Redis URL is not configured, return null (caching disabled)
  if (!env.REDIS_URL) {
    console.warn('Redis URL not configured - caching disabled');
    return null;
  }

  try {
    redisClient = new Redis(env.REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
};

export const redis = getRedisClient();

