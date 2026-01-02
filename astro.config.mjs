// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

// Use Vercel adapter only if explicitly set to 'true' (defaults to false = Node.js)
const USE_VERCEL = process.env.USE_VERCEL_ADAPTER === 'true';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: USE_VERCEL ? vercel() : node({
    mode: 'standalone'
  }),
  env: {
    schema: {
      LASTFM_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: false
      }),
      // Cache provider: 'filesystem' or 'kv'
      CACHE_PROVIDER: envField.enum({
        context: 'server',
        access: 'public',
        values: ['filesystem', 'kv'],
        optional: true,
        default: 'filesystem'
      }),
      // Cache TTL configuration (in hours)
      CACHE_TTL_7DAY: envField.number({
        context: 'server',
        access: 'public',
        optional: true,
        default: 6
      }),
      CACHE_TTL_1MONTH: envField.number({
        context: 'server',
        access: 'public',
        optional: true,
        default: 12
      }),
      CACHE_TTL_3MONTH: envField.number({
        context: 'server',
        access: 'public',
        optional: true,
        default: 24
      }),
      CACHE_TTL_6MONTH: envField.number({
        context: 'server',
        access: 'public',
        optional: true,
        default: 48
      }),
      CACHE_TTL_12MONTH: envField.number({
        context: 'server',
        access: 'public',
        optional: true,
        default: 72
      }),
      CACHE_TTL_OVERALL: envField.number({
        context: 'server',
        access: 'public',
        optional: true,
        default: 168
      }),
      // Cache size limits
      CACHE_MAX_SIZE_MB: envField.number({
        context: 'server',
        access: 'public',
        optional: true,
        default: 1024
      }),
      CACHE_MAX_ENTRIES: envField.number({
        context: 'server',
        access: 'public',
        optional: true,
        default: 10000
      })
    }
  }
});
