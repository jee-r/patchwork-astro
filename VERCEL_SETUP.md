# Vercel Deployment Setup

## Required Environment Variables

Configure these in your Vercel project settings (Settings → Environment Variables):

### 1. Last.fm API Key (Required)
```
LASTFM_API_KEY=your_lastfm_api_key_here
```
Get yours at: https://www.last.fm/api/account/create

### 2. Adapter Configuration (Required for Vercel)
```
USE_VERCEL_ADAPTER=true
```
This switches from Node.js adapter to Vercel serverless adapter.

### 3. Cache Provider (Required for Vercel)
```
CACHE_PROVIDER=kv
```
Uses Vercel KV (Redis) instead of filesystem (which is read-only on Vercel).

### 4. Cache TTL Configuration (Optional)
Default values shown - customize if needed:
```
CACHE_TTL_7DAY=6
CACHE_TTL_1MONTH=12
CACHE_TTL_3MONTH=24
CACHE_TTL_6MONTH=48
CACHE_TTL_12MONTH=72
CACHE_TTL_OVERALL=168
```

### 5. Cache Limits (Optional)
```
CACHE_MAX_SIZE_MB=1024
CACHE_MAX_ENTRIES=10000
```

## Enable Vercel KV

1. Go to your project in Vercel dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **KV**
4. Choose a name (e.g., `patchwork-cache`)
5. Click **Create**

Vercel will automatically inject these variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Deployment Checklist

- [ ] Set `LASTFM_API_KEY` in environment variables
- [ ] Set `USE_VERCEL_ADAPTER=true`
- [ ] Set `CACHE_PROVIDER=kv`
- [ ] Create Vercel KV database
- [ ] Deploy and test

## Testing

After deployment, test the cache:
1. Generate a patchwork: `https://your-app.vercel.app`
2. Check cache stats: `https://your-app.vercel.app/api/cache-stats.json`
3. Verify second request is faster (cache hit)

## Quota Limits (Hobby Plan)

**Vercel KV Free Tier:**
- Storage: 256 MB
- Requests: 1,000 daily
- Bandwidth: Unlimited

**Recommendations:**
- Monitor usage in Vercel dashboard
- Adjust cache TTL to reduce storage if needed
- Upgrade to Pro plan if you exceed limits
