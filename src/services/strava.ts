import { StravaActivity, StravaTokens, StravaStreamsResponse } from '../types';
import { getTokens, saveTokens, clearTokens } from './storage';

// Strava API configuration
// These should be replaced with your actual Strava app credentials
const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || '';
const STRAVA_CLIENT_SECRET = import.meta.env.VITE_STRAVA_CLIENT_SECRET || '';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/callback';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_URL = 'https://www.strava.com/api/v3';

// Default Strava activity types treated as wingfoil when the caller
// doesn't pass a custom list (see `getWingfoilActivities`).
const DEFAULT_WINGFOIL_ACTIVITY_TYPES = ['Kitesurf', 'Kitesurfing', 'Kitesurf Session', 'Windsurf'];

export const getAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'read,activity:read_all',
    approval_prompt: 'auto',
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
};

export const exchangeCodeForTokens = async (code: string): Promise<StravaTokens> => {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens');
  }

  const data = await response.json();
  const tokens: StravaTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete: data.athlete,
  };

  saveTokens(tokens);
  return tokens;
};

export const refreshAccessToken = async (): Promise<StravaTokens | null> => {
  const tokens = getTokens();
  if (!tokens?.refresh_token) {
    return null;
  }

  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    const newTokens: StravaTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: tokens.athlete,
    };

    saveTokens(newTokens);
    return newTokens;
  } catch {
    clearTokens();
    return null;
  }
};

export const getValidAccessToken = async (): Promise<string | null> => {
  let tokens = getTokens();
  if (!tokens) {
    return null;
  }

  // Check if token is expired (with 5 minute buffer)
  const now = Math.floor(Date.now() / 1000);
  if (tokens.expires_at < now + 300) {
    tokens = await refreshAccessToken();
    if (!tokens) {
      return null;
    }
  }

  return tokens.access_token;
};

const fetchWithAuth = async (url: string): Promise<Response> => {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    // Try to refresh token
    const newTokens = await refreshAccessToken();
    if (newTokens) {
      return fetch(url, {
        headers: {
          Authorization: `Bearer ${newTokens.access_token}`,
        },
      });
    }
    throw new Error('Authentication expired');
  }

  return response;
};

export const getActivities = async (
  page: number = 1,
  perPage: number = 30,
  after?: number,
  before?: number
): Promise<StravaActivity[]> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (after) params.append('after', after.toString());
  if (before) params.append('before', before.toString());

  const response = await fetchWithAuth(`${STRAVA_API_URL}/athlete/activities?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }

  return response.json();
};

export const getActivity = async (activityId: number): Promise<StravaActivity> => {
  const response = await fetchWithAuth(`${STRAVA_API_URL}/activities/${activityId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch activity');
  }

  return response.json();
};

export const getActivityStreams = async (activityId: number): Promise<StravaStreamsResponse> => {
  const streamTypes = ['time', 'distance', 'velocity_smooth', 'heartrate', 'altitude', 'latlng'];
  const params = new URLSearchParams({
    keys: streamTypes.join(','),
    key_by_type: 'true',
  });

  const response = await fetchWithAuth(
    `${STRAVA_API_URL}/activities/${activityId}/streams?${params}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch activity streams');
  }

  return response.json();
};

/**
 * v2: fetch every wingfoil activity from the athlete's Strava history.
 *
 * The previous version capped at 10 pages (~500 activities). Long-time
 * winger users had their history truncated; the progression chart on the
 * dashboard now wants the full timeline. We page until Strava returns
 * an empty array, with a soft 200-page (~10 000 activities) cap as a
 * safety net against an accidental infinite loop.
 */
export const getWingfoilActivities = async (
  after?: number,
  before?: number,
  onProgress?: (fetched: number, page: number) => void,
  sportTypes: string[] = DEFAULT_WINGFOIL_ACTIVITY_TYPES
): Promise<StravaActivity[]> => {
  const allowed = new Set(sportTypes.filter(s => s.trim() !== ''));
  const filterEnabled = allowed.size > 0;

  const allActivities: StravaActivity[] = [];
  const perPage = 100; // 200 req/15min Strava budget — bigger pages = fewer calls
  const SAFETY_MAX_PAGES = 200;

  for (let page = 1; page <= SAFETY_MAX_PAGES; page++) {
    const activities = await getActivities(page, perPage, after, before);
    if (activities.length === 0) break;

    const wingfoilActivities = filterEnabled
      ? activities.filter(
          a => allowed.has(a.type) || allowed.has(a.sport_type)
        )
      : activities;
    allActivities.push(...wingfoilActivities);

    if (onProgress) onProgress(allActivities.length, page);

    // Strava returns fewer than perPage when the last page is reached —
    // breaking here saves one round-trip that would just be an empty array.
    if (activities.length < perPage) break;
  }

  return allActivities;
};

export const isAuthenticated = (): boolean => {
  const tokens = getTokens();
  return tokens !== null && tokens.access_token !== '';
};

export const logout = (): void => {
  clearTokens();
};

export const getAthlete = (): StravaTokens['athlete'] | null => {
  const tokens = getTokens();
  return tokens?.athlete || null;
};
