import type { CacheEntry } from './cache-manager';

export interface CacheProvider {
  get(key: string): Promise<Buffer | null>;
  set(key: string, buffer: Buffer, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
  getAllEntries(): Promise<CacheEntry[]>;
  cleanup(maxSize: number, maxEntries: number): Promise<void>;
}
