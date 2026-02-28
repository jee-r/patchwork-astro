/**
 * ListenBrainz API integration
 * Alternative to Last.fm
 */

interface ListenBrainzRelease {
  artist_name: string;
  release_name: string;
  release_mbid?: string;
  listen_count: number;
}

interface ListenBrainzStatsResponse {
  payload: {
    releases: ListenBrainzRelease[];
    count: number;
    total_release_count: number;
    user_id: string;
    from_ts: number;
    to_ts: number;
    range: string;
  };
}

/**
 * Map period format from Last.fm to ListenBrainz
 */
function mapPeriodToRange(period: string): string {
  const periodMap: Record<string, string> = {
    '7day': 'week',
    '1month': 'month',
    '3month': 'quarter',
    '6month': 'half_yearly',
    '12month': 'year',
    'overall': 'all_time',
    'this_week': 'this_week',
    'this_month': 'this_month',
    'this_year': 'this_year'
  };

  return periodMap[period] || period;
}

/**
 * Check if ListenBrainz user exists
 */
export async function checkUserExist(username: string): Promise<boolean> {
  const url = `https://api.listenbrainz.org/1/user/${username}/listen-count`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.payload?.count !== undefined;

  } catch (error) {
    console.error('ListenBrainz user check error:', error);
    return false;
  }
}

/**
 * Fetch user's top releases from ListenBrainz
 */
export async function fetchTopReleases(
  username: string,
  period: string,
  limit: number
): Promise<ListenBrainzRelease[]> {
  const range = mapPeriodToRange(period);
  const url = `https://api.listenbrainz.org/1/stats/user/${username}/releases?range=${range}&count=${limit}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Unable to fetch ListenBrainz user stats');
    }

    const data: ListenBrainzStatsResponse = await response.json();

    if (!data.payload?.releases) {
      throw new Error('No releases found');
    }

    return data.payload.releases;

  } catch (error) {
    console.error('ListenBrainz top releases error:', error);
    throw error;
  }
}

/**
 * Fetch cover art from MusicBrainz Cover Art Archive
 */
async function fetchCoverArt(mbid: string): Promise<string | null> {
  if (!mbid) return null;

  // Try different sizes - 500 is a good balance
  const sizes = ['500', '250', '1200'];

  for (const size of sizes) {
    try {
      const url = `https://coverartarchive.org/release/${mbid}/front-${size}`;
      const response = await fetch(url, { method: 'HEAD' });

      if (response.ok) {
        return url;
      }
    } catch {
      // Try next size
    }
  }

  // Fallback: try without size specification
  try {
    const url = `https://coverartarchive.org/release/${mbid}/front`;
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return url;
    }
  } catch {
    // No cover art available
  }

  return null;
}

/**
 * Extract cover URLs from ListenBrainz releases
 */
export async function createReleaseCoverArray(releases: ListenBrainzRelease[]): Promise<string[]> {
  const coverPromises = releases.map(async (release) => {
    if (!release.release_mbid) {
      console.warn(`No MBID for release: ${release.release_name} by ${release.artist_name}`);
      return null;
    }

    return await fetchCoverArt(release.release_mbid);
  });

  const covers = await Promise.all(coverPromises);
  return covers.filter((url): url is string => url !== null);
}

/**
 * Fetch covers for a user's top releases
 * Complete flow: check user -> fetch releases -> fetch cover art
 */
export async function fetchUserTopReleaseCovers(
  username: string,
  period: string = 'all_time',
  limit: number = 9
): Promise<string[]> {
  // Check if user exists
  const userExists = await checkUserExist(username);
  if (!userExists) {
    throw new Error('User does not exist');
  }

  // Fetch top releases
  const topReleases = await fetchTopReleases(username, period, limit);

  if (!topReleases || topReleases.length === 0) {
    throw new Error('User does not have any release statistics');
  }

  // Extract cover URLs (with MusicBrainz lookup)
  const coverUrls = await createReleaseCoverArray(topReleases);

  if (coverUrls.length === 0) {
    throw new Error('No release covers found');
  }

  return coverUrls;
}
