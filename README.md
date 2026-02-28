# Patchwork

Album cover collage generator for Last.fm and ListenBrainz.

## Features

- Dual provider support (Last.fm and ListenBrainz)
- Customizable grid layouts (1×1 to 10×10)
- Flexible image sizing (50-300px)
- Optional borders between covers
- Intelligent filesystem caching with dynamic TTL
- Fast image processing with Sharp
- Docker deployment ready

## Tech Stack

- [Astro](https://astro.build) (SSR mode)
- [Sharp](https://sharp.pixelplumbing.com/) for image processing
- Node.js 20
- pnpm

## Installation

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Last.fm API key ([Get one here](https://www.last.fm/api/account/create))

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/jee-r/patchwork-astro.git
   cd patchwork-astro
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Configure environment variables
   ```bash
   cp .env.example .env
   # Edit .env and add your LASTFM_API_KEY
   ```

4. Start development server
   ```bash
   pnpm dev
   ```

5. Open http://localhost:4321

### Docker Deployment

```bash
git clone https://github.com/jee-r/patchwork-astro.git
cd patchwork-astro
cp .env.example .env
# Edit .env and add your LASTFM_API_KEY
docker-compose up -d
```

Application available at http://localhost:3000

### Vercel Deployment

> **Note:** A [Last.fm API key](https://www.last.fm/api/account/create) is required for Last.fm support.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjee-r%2Fpatchwork-astro&env=LASTFM_API_KEY,USE_VERCEL_ADAPTER&envDescription=Last.fm%20API%20key%20required%20for%20Last.fm%20support&envLink=https%3A%2F%2Fgithub.com%2Fjee-r%2Fpatchwork-astro%2Fblob%2Fmain%2F.env.example)

## Usage

1. Select a provider (Last.fm or ListenBrainz)
2. Enter your username
3. Choose time period (overall, 7day, 1month, 3month, 6month, 12month)
4. Configure grid size (1-10 rows/columns)
5. Set image size (50-300px)
6. Toggle borders if desired
7. Generate patchwork

## Project Structure

```
patchwork-astro/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── patchwork.jpg.ts
│   │   └── api/cache-stats.json.ts
│   ├── services/
│   │   ├── cache-manager.ts
│   │   ├── lastfm.ts
│   │   ├── listenbrainz.ts
│   │   └── patchwork-generator.ts
│   └── styles/main.css
├── public/assets/
├── cache/
├── Dockerfile
├── docker-compose.yml
└── astro.config.mjs
```

## Configuration

### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

**Required:**
| Variable | Description | Default |
|----------|-------------|---------|
| `LASTFM_API_KEY` | Your Last.fm API key ([Get one](https://www.last.fm/api/account/create)) | - |

**Cache TTL Configuration (Optional):**
| Variable | Description | Default |
|----------|-------------|---------|
| `CACHE_TTL_7DAY` | Cache duration for 7-day period (hours) | `6` |
| `CACHE_TTL_1MONTH` | Cache duration for 1-month period (hours) | `12` |
| `CACHE_TTL_3MONTH` | Cache duration for 3-month period (hours) | `24` |
| `CACHE_TTL_6MONTH` | Cache duration for 6-month period (hours) | `48` |
| `CACHE_TTL_12MONTH` | Cache duration for 12-month period (hours) | `72` |
| `CACHE_TTL_OVERALL` | Cache duration for overall period (hours) | `168` |

**Cache Size Limits (Optional):**
| Variable | Description | Default |
|----------|-------------|---------|
| `CACHE_MAX_SIZE_MB` | Maximum cache size in MB | `1024` (1GB) |
| `CACHE_MAX_ENTRIES` | Maximum number of cached images | `10000` |

**Matomo Analytics (Optional):**

Disabled by default. All three variables must be explicitly set to enable tracking. Analytics will never load in dev mode, preview, or forks without this configuration.

| Variable | Description | Default |
|----------|-------------|---------|
| `MATOMO_ENABLED` | Set to `true` to enable Matomo | `false` |
| `MATOMO_HOST` | Your Matomo instance hostname (without `https://`) | - |
| `MATOMO_SITE_ID` | Site ID from your Matomo instance | - |
| `MATOMO_TOKEN_AUTH` | Auth token to forward real visitor IP ([generate in Matomo](https://matomo.org/faq/general/faq_114/)) | - |

When enabled, the Matomo tracking script is downloaded from your instance at build time and served locally as `/js/wtfisthis.js` to reduce ad-blocker interference.

### Cache Behavior

The cache uses **dynamic TTL** based on the time period:
- Short periods (`7day`) have shorter cache (6h) to keep data fresh
- Long periods (`overall`) have longer cache (7 days) since data changes slowly
- Expired entries are automatically cleaned up when new images are generated

## API Endpoints

### Generate Patchwork

```
GET /patchwork.jpg?username=USER&provider=lastfm&period=overall&rows=3&cols=3&size=150&border=normal
```

Query Parameters:
- `username` (required) - Last.fm or ListenBrainz username
- `provider` (optional) - `lastfm` or `listenbrainz` (default: `lastfm`)
- `period` (optional) - `overall`, `7day`, `1month`, `3month`, `6month`, `12month` (default: `overall`)
- `rows` (optional) - 1-10 (default: 3)
- `cols` (optional) - 1-10 (default: 3)
- `size` (optional) - 50-300 pixels (default: 150)
- `border` (optional) - `normal` or `none` (default: `normal`)

Response Headers:
- `X-Cache` - `HIT` or `MISS`
- `X-Generation-Time` - Generation duration (only on MISS)
- `X-Image-Width` - Image width in pixels
- `X-Image-Height` - Image height in pixels

### Cache Statistics

```
GET /api/cache-stats.json
```

Returns cache statistics in JSON format.

## Performance

- First generation: ~2-3 seconds (network + image processing)
- Cached requests: < 50ms (filesystem read)
- CDN cached: < 10ms

## Migration from PHP

This is a complete rewrite of the [original PHP version](https://github.com/jee-r/Patchwork) with improvements:

- TypeScript for type safety
- ListenBrainz support added
- Intelligent caching with dynamic TTL
- Modern stack (Astro + Sharp vs PHP + GD)
- Query parameter URLs
- Better developer experience

## Contributing

Contributions welcome. Please submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file.

## Author

[Jee](https://artz.dev)

## Links

- [Original PHP version](https://github.com/jee-r/Patchwork)
- [Last.fm API](https://www.last.fm/api)
- [ListenBrainz API](https://listenbrainz.readthedocs.io/)
