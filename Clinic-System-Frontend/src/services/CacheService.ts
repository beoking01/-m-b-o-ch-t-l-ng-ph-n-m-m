type CacheEntry<T> = {
  data: T;
  expires: number;
};

export class CacheService {
  private static store: Record<string, CacheEntry<any>> = {};
  private static TTL = 2 * 60 * 1000; // default 2 phút

  static setTTL(ms: number) {
    CacheService.TTL = ms;
  }

  static set<T>(key: string, data: T) {
    CacheService.store[key] = {
      data,
      expires: Date.now() + CacheService.TTL,
    };
  }

  static get<T>(key: string): T | null {
    const entry = CacheService.store[key];
    if (!entry) return null;

    if (entry.expires < Date.now()) {
      delete CacheService.store[key];
      return null;
    }

    return entry.data;
  }

  static has(key: string) {
    const entry = CacheService.store[key];
    return entry && entry.expires > Date.now();
  }

  static clear() {
    CacheService.store = {};
  }
}
