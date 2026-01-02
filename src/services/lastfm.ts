import { LASTFM_API_KEY } from 'astro:env/server';

interface LastFmAlbum {
  name: string;
  artist: {
    name: string;
  };
  image: Array<{
    '#text': string;
    size: string;
  }>;
  playcount: string;
}

interface LastFmTopAlbumsResponse {
  topalbums: {
    album: LastFmAlbum[];
  };
}

/**
 * Check if Last.fm user exists
 */
export async function checkUserExist(username: string): Promise<boolean> {
  const params = new URLSearchParams({
    method: 'user.getinfo',
    user: username,
    api_key: LASTFM_API_KEY,
    format: 'json'
  });

  const url = `https://ws.audioscrobbler.com/2.0/?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Unable to fetch Last.fm user info.');
    }

    const data = await response.json();

    if (!data.user?.name) {
      throw new Error('Unable to fetch Last.fm user info.');
    }

    return true;

  } catch (error) {
    console.error('Last.fm user check error:', error);
    return false;
  }
}

/**
 * Fetch user's top albums from Last.fm API
 */
export async function fetchTopAlbums(
  username: string,
  period: string,
  limit: number
): Promise<LastFmAlbum[]> {
  const params = new URLSearchParams({
    method: 'user.gettopalbums',
    user: username,
    api_key: LASTFM_API_KEY,
    period: period,
    limit: limit.toString(),
    format: 'json'
  });

  const url = `https://ws.audioscrobbler.com/2.0/?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Unable to fetch Last.fm user Top Albums.');
    }

    const data: LastFmTopAlbumsResponse = await response.json();

    if (!data.topalbums?.album) {
      throw new Error('No albums found');
    }

    return data.topalbums.album;

  } catch (error) {
    console.error('Last.fm top albums error:', error);
    throw error;
  }
}

/**
 * Extract album cover URLs from Last.fm album data
 */
export function createAlbumsCoverArray(topAlbums: LastFmAlbum[]): string[] {
  const albumsCoverUrlList: string[] = [];

  for (const album of topAlbums) {
    // Check if extralarge image exists
    const extralargeImage = album.image?.find(img => img.size === 'extralarge');

    if (extralargeImage?.['#text'] && extralargeImage['#text'].length > 0) {
      try {
        // Parse URL and get filename
        const url = new URL(extralargeImage['#text']);
        const pathParts = url.pathname.split('/');
        const filename = pathParts[pathParts.length - 1];

        // Construct original image link (same logic as PHP)
        const originalImageLink = `https://${url.hostname}/i/u/${filename}`;
        albumsCoverUrlList.push(originalImageLink);
      } catch (error) {
        console.warn('Failed to parse album cover URL:', error);
      }
    }
  }

  return albumsCoverUrlList;
}

/**
 * Fetch album cover URLs for a user's top albums
 */
export async function fetchUserTopAlbumCovers(
  username: string,
  period: string = 'overall',
  limit: number = 9
): Promise<string[]> {
  // Check if user exists
  const userExists = await checkUserExist(username);
  if (!userExists) {
    throw new Error('User does not exist');
  }

  // Fetch top albums
  const topAlbums = await fetchTopAlbums(username, period, limit);

  if (!topAlbums || topAlbums.length === 0) {
    throw new Error('User does not have scrobbled any albums');
  }

  // Extract cover URLs
  const coverUrls = createAlbumsCoverArray(topAlbums);

  if (coverUrls.length === 0) {
    throw new Error('No album covers found');
  }

  return coverUrls;
}
