import crypto from 'crypto';
import {
  CACHE_TTL_7DAY,
  CACHE_TTL_1MONTH,
  CACHE_TTL_3MONTH,
  CACHE_TTL_6MONTH,
  CACHE_TTL_12MONTH,
  CACHE_TTL_OVERALL,
  CACHE_MAX_SIZE_MB,
  CACHE_MAX_ENTRIES,
  CACHE_PROVIDER
} from 'astro:env/server';
import type { CacheProvider } from './cache-provider';
import { FilesystemCache } from './filesystem-cache';
import { KVCache } from './kv-cache';

export interface CacheEntry {
  key: string;
  filename: string;
  size: number;
  createdAt: number;
  lastAccess: number;
  hits: number;
  ttl: number;
}

class CacheManager {
  private provider: CacheProvider;

  // Configuration (from env with defaults)
  private readonly MAX_CACHE_SIZE = (CACHE_MAX_SIZE_MB || 1024) * 1024 * 1024;
  private readonly MAX_ENTRIES = CACHE_MAX_ENTRIES || 10000;

  // TTL mapping (in milliseconds)
  private readonly TTL_MAP: Record<string, number> = {
    '7day': (CACHE_TTL_7DAY || 6) * 60 * 60 * 1000,
    '1month': (CACHE_TTL_1MONTH || 12) * 60 * 60 * 1000,
    '3month': (CACHE_TTL_3MONTH || 24) * 60 * 60 * 1000,
    '6month': (CACHE_TTL_6MONTH || 48) * 60 * 60 * 1000,
    '12month': (CACHE_TTL_12MONTH || 72) * 60 * 60 * 1000,
    'overall': (CACHE_TTL_OVERALL || 168) * 60 * 60 * 1000
  };

  constructor() {
    // Initialize provider based on env
    const providerType = CACHE_PROVIDER || 'filesystem';

    if (providerType === 'kv') {
      this.provider = new KVCache();
      console.log('Cache provider: Vercel KV');
    } else {
      this.provider = new FilesystemCache();
      console.log('Cache provider: Filesystem');
    }
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(params: Record<string, any>): string {
    const normalized = JSON.stringify(params, Object.keys(params).sort());
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Get TTL for a specific period
   */
  private getTTL(period?: string): number {
    if (!period || !this.TTL_MAP[period]) {
      return this.TTL_MAP['overall'];
    }
    return this.TTL_MAP[period];
  }

  /**
   * Get image from cache
   */
  async get(key: string): Promise<Buffer | null> {
    return await this.provider.get(key);
  }

  /**
   * Save image to cache
   */
  async set(key: string, buffer: Buffer, period?: string): Promise<void> {
    await this.cleanup();

    const ttl = this.getTTL(period);
    await this.provider.set(key, buffer, ttl);
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    await this.provider.delete(key);
  }

  /**
   * Cleanup cache according to rules
   */
  async cleanup(): Promise<void> {
    await this.provider.cleanup(this.MAX_CACHE_SIZE, this.MAX_ENTRIES);
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const entries = await this.provider.getAllEntries();
    const totalSize = entries.reduce((sum, e) => sum + e.size, 0);

    return {
      totalEntries: entries.length,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      avgSize: entries.length > 0 ? totalSize / entries.length : 0,
      totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.createdAt)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.createdAt)) : null,
    };
  }
}

// Singleton
export const cacheManager = new CacheManager();
