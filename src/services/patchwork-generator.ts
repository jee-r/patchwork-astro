import sharp from 'sharp';
import { fetchUserTopAlbumCovers } from './lastfm';
import { fetchUserTopReleaseCovers } from './listenbrainz';

interface PatchworkOptions {
  username: string;
  period: string;
  rows: number;
  cols: number;
  imageSize: number;
  noBorder: boolean;
  provider: 'lastfm' | 'listenbrainz';
}

interface PatchworkResult {
  buffer: Buffer;
  width: number;
  height: number;
}

/**
 * Download a single image with retry logic and timeout
 */
async function downloadImageWithRetry(url: string, retries = 3, timeout = 10000): Promise<Buffer | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Patchwork-Generator/1.0'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (attempt === retries) {
          console.warn(`Failed to download after ${retries} attempts: ${url}`);
        }
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);

    } catch (error) {
      if (attempt === retries) {
        console.error(`Error downloading ${url} (attempt ${attempt}/${retries}):`, error instanceof Error ? error.message : error);
        return null;
      }
      // Exponential backoff: 500ms, 1000ms, 2000ms
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt - 1)));
    }
  }
  return null;
}

/**
 * Download and resize images from URLs with concurrency limit
 */
async function downloadAndResizeImages(urls: string[], size: number): Promise<Buffer[]> {
  const CONCURRENT_LIMIT = 5; // Limit concurrent requests to avoid overwhelming servers
  const results: (Buffer | null)[] = [];

  // Process in batches
  for (let i = 0; i < urls.length; i += CONCURRENT_LIMIT) {
    const batch = urls.slice(i, i + CONCURRENT_LIMIT);

    const batchPromises = batch.map(async (url) => {
      const imageBuffer = await downloadImageWithRetry(url);

      if (!imageBuffer) {
        return null;
      }

      try {
        // Resize with Sharp (supports JPG, PNG, GIF automatically)
        const resizedImage = await sharp(imageBuffer)
          .resize(size, size, {
            fit: 'cover',
            position: 'center'
          })
          .toBuffer();

        return resizedImage;
      } catch (error) {
        console.error(`Error resizing image from ${url}:`, error instanceof Error ? error.message : error);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Small delay between batches to be nice to servers
    if (i + CONCURRENT_LIMIT < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results.filter((img): img is Buffer => img !== null);
}

/**
 * Create patchwork image from individual album covers
 */
async function createPatchwork(
  imageSize: number,
  patchworkHeight: number,
  patchworkWidth: number,
  noBorder: boolean,
  cols: number,
  rows: number,
  covers: Buffer[]
): Promise<Buffer> {
  // Calculate border size (1px white border between images, or 0 if noBorder)
  const borderSize = noBorder ? 0 : 1;

  // Background color (white for borders, black for no borders)
  const backgroundColor = noBorder
    ? { r: 0, g: 0, b: 0 }
    : { r: 255, g: 255, b: 255 };

  // Prepare composite operations for all images
  const compositeOps = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;

      if (covers[index]) {
        // Calculate position (same logic as PHP: $j * $imagesSideSize + $j)
        compositeOps.push({
          input: covers[index],
          top: row * imageSize + row * borderSize,
          left: col * imageSize + col * borderSize,
        });
      }
    }
  }

  // Create the patchwork using Sharp
  try {
    const patchwork = await sharp({
      create: {
        width: patchworkWidth,
        height: patchworkHeight,
        channels: 3,
        background: backgroundColor
      }
    })
      .composite(compositeOps)
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    return patchwork;

  } catch (error) {
    console.error('Error creating patchwork:', error);
    throw new Error('Failed to create patchwork');
  }
}

/**
 * Main function to generate a complete patchwork
 */
export async function generatePatchwork(options: PatchworkOptions): Promise<PatchworkResult> {
  const { username, period, rows, cols, imageSize, noBorder, provider } = options;

  // Calculate patchwork dimensions (same as PHP)
  const borderSize = noBorder ? 0 : 1;
  const width = imageSize * cols + borderSize * (cols - 1);
  const height = imageSize * rows + borderSize * (rows - 1);

  // Calculate how many covers we need (+ extra for safety)
  const limit = rows * cols + Math.ceil((rows * cols) / 3);

  // Fetch cover URLs based on provider
  let coverUrls: string[];

  if (provider === 'lastfm') {
    coverUrls = await fetchUserTopAlbumCovers(username, period, limit);
  } else {
    coverUrls = await fetchUserTopReleaseCovers(username, period, limit);
  }

  console.log(`📡 Fetched ${coverUrls.length} cover URLs for ${username}`);

  // Take only what we need
  const neededUrls = coverUrls.slice(0, rows * cols);

  if (neededUrls.length < rows * cols) {
    console.warn(`Only found ${neededUrls.length} covers, need ${rows * cols}`);
  }

  // Download and resize all images
  console.log(`⬇️  Downloading and resizing ${neededUrls.length} images...`);
  const covers = await downloadAndResizeImages(neededUrls, imageSize);

  if (covers.length === 0) {
    throw new Error('Failed to download any album covers');
  }

  console.log(`✅ Downloaded ${covers.length} covers`);

  // Create the patchwork
  console.log(`🎨 Creating ${cols}x${rows} patchwork (${width}x${height}px)...`);
  const buffer = await createPatchwork(imageSize, height, width, noBorder, cols, rows, covers);

  console.log(`✨ Patchwork created (${(buffer.length / 1024).toFixed(2)} KB)`);

  return {
    buffer,
    width,
    height
  };
}
