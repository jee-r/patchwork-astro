import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import type { CacheProvider } from './cache-provider';
import type { CacheEntry } from './cache-manager';

interface CacheMetadata {
  entries: Record<string, CacheEntry>;
  totalSize: number;
}

export class FilesystemCache implements CacheProvider {
  private cacheDir: string;
  private metadataFile: string;
  private metadata: CacheMetadata;

  constructor(cacheDir: string = './cache/images') {
    this.cacheDir = cacheDir;
    this.metadataFile = join(cacheDir, '../metadata.json');

    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }

    this.metadata = this.loadMetadata();
  }

  async get(key: string): Promise<Buffer | null> {
    const entry = this.metadata.entries[key];

    if (!entry) {
      return null;
    }

    const filePath = join(this.cacheDir, entry.filename);

    if (!existsSync(filePath)) {
      console.warn(`Cache entry exists but file missing: ${key}`);
      delete this.metadata.entries[key];
      this.saveMetadata();
      return null;
    }

    entry.lastAccess = Date.now();
    entry.hits++;
    this.saveMetadata();

    return readFileSync(filePath);
  }

  async set(key: string, buffer: Buffer, ttl: number): Promise<void> {
    const filename = `${key}.jpg`;
    const filePath = join(this.cacheDir, filename);

    writeFileSync(filePath, buffer);

    const entry: CacheEntry = {
      key,
      filename,
      size: buffer.length,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      hits: 0,
      ttl
    };

    this.metadata.entries[key] = entry;
    this.metadata.totalSize += buffer.length;
    this.saveMetadata();

    const ttlHours = Math.round(ttl / 3600000);
    console.log(`✅ Cached (FS): ${key} (${(buffer.length / 1024).toFixed(2)} KB, TTL: ${ttlHours}h)`);
  }

  async delete(key: string): Promise<void> {
    const entry = this.metadata.entries[key];
    if (!entry) return;

    const filePath = join(this.cacheDir, entry.filename);

    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    this.metadata.totalSize -= entry.size;
    delete this.metadata.entries[key];
    this.saveMetadata();

    console.log(`🗑️  Deleted (FS): ${key}`);
  }

  async getAllEntries(): Promise<CacheEntry[]> {
    return Object.values(this.metadata.entries);
  }

  async cleanup(maxSize: number, maxEntries: number): Promise<void> {
    const entries = Object.values(this.metadata.entries);
    const now = Date.now();

    // Delete expired entries
    const expired = entries.filter(e => now - e.createdAt > e.ttl);
    for (const e of expired) {
      await this.delete(e.key);
    }

    // If too many entries, delete least used
    if (entries.length > maxEntries) {
      const sorted = entries.sort((a, b) => a.hits - b.hits);
      const toDelete = sorted.slice(0, entries.length - maxEntries);
      for (const e of toDelete) {
        await this.delete(e.key);
      }
      console.log(`🧹 Cleaned ${toDelete.length} entries (max entries reached)`);
    }

    // If cache too large, delete oldest
    if (this.metadata.totalSize > maxSize) {
      const sorted = entries.sort((a, b) => a.lastAccess - b.lastAccess);
      let freed = 0;

      for (const entry of sorted) {
        if (this.metadata.totalSize - freed < maxSize * 0.8) break;
        await this.delete(entry.key);
        freed += entry.size;
      }

      console.log(`🧹 Cleaned (FS) ${(freed / 1024 / 1024).toFixed(2)} MB (cache size limit)`);
    }
  }

  private loadMetadata(): CacheMetadata {
    if (existsSync(this.metadataFile)) {
      try {
        const data = readFileSync(this.metadataFile, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        console.warn('Failed to load metadata, creating new');
      }
    }

    return { entries: {}, totalSize: 0 };
  }

  private saveMetadata(): void {
    const dir = join(this.metadataFile, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.metadataFile, JSON.stringify(this.metadata, null, 2));
  }
}
