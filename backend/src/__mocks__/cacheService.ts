/**
 * Mock Cache Service for Testing
 * Provides in-memory mock implementation of Redis caching
 */

const mockCache = new Map<string, { value: any; expiresAt?: number }>();

export const mockCacheService = {
  get: jest.fn<Promise<any | null>, [string]>().mockImplementation(async (key: string) => {
    const item = mockCache.get(key);
    if (!item) {
      return null;
    }
    if (item.expiresAt && Date.now() > item.expiresAt) {
      mockCache.delete(key);
      return null;
    }
    return item.value;
  }),

  set: jest.fn<Promise<void>, [string, any, { ttl?: number }?]>().mockImplementation(
    async (key: string, value: any, options?: { ttl?: number }) => {
      const expiresAt = options?.ttl ? Date.now() + options.ttl * 1000 : undefined;
      mockCache.set(key, { value, expiresAt });
    }
  ),

  delete: jest.fn<Promise<void>, [string]>().mockImplementation(async (key: string) => {
    mockCache.delete(key);
  }),

  clear: jest.fn<Promise<void>, []>().mockImplementation(async () => {
    mockCache.clear();
  }),
};

// Clear cache before each test
beforeEach(() => {
  mockCache.clear();
  jest.clearAllMocks();
});

