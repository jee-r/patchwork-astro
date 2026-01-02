import { kv } from '@vercel/kv';
import type { CacheProvider } from './cache-provider';
import type { CacheEntry } from './cache-manager';

export class KVCache implements CacheProvider {
  private readonly IMG_PREFIX = 'cache:img:';
  private readonly META_PREFIX = 'cache:meta:';

  async get(key: string): Promise<Buffer | null> {
    try {
      // Fetch image and metadata in parallel
      const [cached, metadata] = await Promise.all([
        kv.get<string>(`${this.IMG_PREFIX}${key}`),
        kv.get<CacheEntry>(`${this.META_PREFIX}${key}`)
      ]);

      if (!cached || !metadata) {
        // Clean up orphaned data
        if (cached && !metadata) {
          await kv.del(`${this.IMG_PREFIX}${key}`);
        }
        if (!cached && metadata) {
          await kv.del(`${this.META_PREFIX}${key}`);
        }
        return null;
      }

      // Update metadata stats
      metadata.lastAccess = Date.now();
      metadata.hits++;

      // Update metadata with same TTL as remaining image TTL
      const age = Date.now() - metadata.createdAt;
      const remainingTTL = Math.max(0, metadata.ttl - age);
      const ttlSeconds = Math.ceil(remainingTTL / 1000);

      await kv.set(`${this.META_PREFIX}${key}`, metadata, { ex: ttlSeconds });

      // Decode from base64
      return Buffer.from(cached, 'base64');
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }

  async set(key: string, buffer: Buffer, ttl: number): Promise<void> {
    try {
      const base64 = buffer.toString('base64');
      const ttlSeconds = Math.ceil(ttl / 1000);

      // Create metadata entry
      const entry: CacheEntry = {
        key,
        filename: `${key}.jpg`,
        size: buffer.length,
        createdAt: Date.now(),
        lastAccess: Date.now(),
        hits: 0,
        ttl
      };

      // Store both image and metadata with same TTL (auto-cleanup)
      await Promise.all([
        kv.set(`${this.IMG_PREFIX}${key}`, base64, { ex: ttlSeconds }),
        kv.set(`${this.META_PREFIX}${key}`, entry, { ex: ttlSeconds })
      ]);

      const ttlHours = Math.round(ttl / 3600000);
      console.log(`✅ Cached (KV): ${key} (${(buffer.length / 1024).toFixed(2)} KB, TTL: ${ttlHours}h)`);
    } catch (error) {
      console.error('KV set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      // Delete both image and metadata
      await Promise.all([
        kv.del(`${this.IMG_PREFIX}${key}`),
        kv.del(`${this.META_PREFIX}${key}`)
      ]);
      console.log(`🗑️  Deleted (KV): ${key}`);
    } catch (error) {
      console.error('KV delete error:', error);
    }
  }

  async getAllEntries(): Promise<CacheEntry[]> {
    try {
      // Scan for all metadata keys
      const keys: string[] = [];
      let cursor: string | number = 0;

      do {
        const result: [string | number, string[]] = await kv.scan(cursor, {
          match: `${this.META_PREFIX}*`,
          count: 100
        });

        cursor = result[0];
        keys.push(...result[1]);
      } while (cursor !== 0 && cursor !== '0');

      // Fetch all metadata entries
      if (keys.length === 0) {
        return [];
      }

      const entries = await Promise.all(
        keys.map(key => kv.get<CacheEntry>(key))
      );

      // Filter out null entries (expired between scan and get)
      return entries.filter((e): e is CacheEntry => e !== null);
    } catch (error) {
      console.error('KV getAllEntries error:', error);
      return [];
    }
  }

  async cleanup(maxSize: number, maxEntries: number): Promise<void> {
    try {
      const entries = await this.getAllEntries();

      if (entries.length === 0) {
        return;
      }

      const now = Date.now();

      // Check for expired entries (shouldn't happen due to TTL, but cleanup orphans)
      const expired = entries.filter(e => now - e.createdAt > e.ttl);
      if (expired.length > 0) {
        await Promise.all(expired.map(e => this.delete(e.key)));
        console.log(`🧹 Cleaned ${expired.length} expired entries`);
      }

      // Refresh entries list after cleanup
      const currentEntries = entries.filter(e => now - e.createdAt <= e.ttl);

      // If too many entries, delete least used (LFU)
      if (currentEntries.length > maxEntries) {
        const sorted = [...currentEntries].sort((a, b) => a.hits - b.hits);
        const toDelete = sorted.slice(0, currentEntries.length - maxEntries);
        await Promise.all(toDelete.map(e => this.delete(e.key)));
        console.log(`🧹 Cleaned (KV) ${toDelete.length} entries (max entries reached)`);
      }

      // If cache too large, delete least recently used (LRU)
      const totalSize = currentEntries.reduce((sum, e) => sum + e.size, 0);
      if (totalSize > maxSize) {
        const sorted = [...currentEntries].sort((a, b) => a.lastAccess - b.lastAccess);
        let freed = 0;
        const toDelete: CacheEntry[] = [];

        for (const entry of sorted) {
          if (totalSize - freed < maxSize * 0.8) break;
          toDelete.push(entry);
          freed += entry.size;
        }

        await Promise.all(toDelete.map(e => this.delete(e.key)));
        console.log(`🧹 Cleaned (KV) ${(freed / 1024 / 1024).toFixed(2)} MB (cache size limit)`);
      }
    } catch (error) {
      console.error('KV cleanup error:', error);
    }
  }
}
