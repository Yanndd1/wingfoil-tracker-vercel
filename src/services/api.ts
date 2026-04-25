import {
  WingfoilSpot,
  SpotDraft,
  Shop,
  MarketplaceListing,
  ListingDraft,
  ListingStatus,
  ListingCategory,
} from '../types';
import { getValidAccessToken } from './strava';

/**
 * REST client for the v2 backend (PHP API on the OVH host shared with
 * Pumpfoil). Every request adds `discipline=wingfoil` so the same backend
 * can serve both apps without data leakage between them — the spots and
 * marketplace tables have a `discipline` column the backend filters on.
 *
 * Auth: write requests carry the user's Strava bearer token, validated
 * server-side via Strava's `/athlete` endpoint.
 */

const DISCIPLINE = 'wingfoil';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://pumpfoil.solicare.fr/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  requireAuth?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  if (opts.requireAuth) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('Not authenticated with Strava');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json())?.error ?? '';
    } catch {
      /* ignore parse errors */
    }
    throw new Error(`API ${response.status}: ${detail || response.statusText}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function withDiscipline(extraQuery = ''): string {
  // Append `discipline=wingfoil` to the query string so the backend
  // returns only wingfoil rows.
  const sep = extraQuery ? '&' : '';
  return `?discipline=${DISCIPLINE}${sep}${extraQuery}`;
}

// ───── Analytics tracking ─────

/**
 * Best-effort fire-and-forget. Failures are swallowed so analytics never
 * blocks the user. The endpoint accepts unauthenticated POSTs (we attach
 * the athlete_id from the active Strava session when available).
 */
export async function track(
  eventType: string,
  athleteId?: number
): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        athlete_id: athleteId ?? null,
        discipline: DISCIPLINE,
      }),
      keepalive: true,
    });
  } catch {
    /* analytics MUST NOT throw */
  }
}

// ───── Spots ─────

interface ApiSpotRow {
  id: number;
  lat: string | number;
  lng: string | number;
  name: string;
  stars: number;
  departure_type: WingfoilSpot['departureType'];
  has_other_riders: number | boolean;
  risks: string | null;
  parking_close: number | boolean;
  optimal_wind_directions: string[] | string | null;
  min_wind_knots: number | null;
  max_wind_knots: number | null;
  tide_dependent: number | boolean;
  crowd_level: WingfoilSpot['crowdLevel'] | null;
  created_by_strava_id: string | number;
  created_at: string;
  updated_at: string;
}

function parseStringArray(input: string[] | string | null): string[] {
  if (Array.isArray(input)) return input.filter(s => typeof s === 'string');
  if (typeof input === 'string' && input) {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.filter(s => typeof s === 'string');
    } catch {
      /* ignore */
    }
  }
  return [];
}

function rowToSpot(row: ApiSpotRow): WingfoilSpot {
  return {
    id: row.id,
    lat: typeof row.lat === 'string' ? parseFloat(row.lat) : row.lat,
    lng: typeof row.lng === 'string' ? parseFloat(row.lng) : row.lng,
    name: row.name,
    stars: row.stars,
    departureType: row.departure_type,
    hasOtherRiders: !!row.has_other_riders,
    risks: row.risks ?? undefined,
    parkingClose: !!row.parking_close,
    optimalWindDirections: parseStringArray(row.optimal_wind_directions),
    minWindKnots: row.min_wind_knots ?? undefined,
    maxWindKnots: row.max_wind_knots ?? undefined,
    tideDependent: !!row.tide_dependent,
    crowdLevel: row.crowd_level ?? undefined,
    createdByStravaId:
      typeof row.created_by_strava_id === 'string'
        ? parseInt(row.created_by_strava_id, 10)
        : row.created_by_strava_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export async function listSpots(bbox?: BoundingBox): Promise<WingfoilSpot[]> {
  const params = new URLSearchParams();
  if (bbox) {
    params.set('minLat', bbox.minLat.toString());
    params.set('maxLat', bbox.maxLat.toString());
    params.set('minLng', bbox.minLng.toString());
    params.set('maxLng', bbox.maxLng.toString());
  }
  const rows = await request<ApiSpotRow[]>(`/spots${withDiscipline(params.toString())}`);
  return rows.map(rowToSpot);
}

export async function createSpot(draft: SpotDraft): Promise<WingfoilSpot> {
  const row = await request<ApiSpotRow>(`/spots${withDiscipline()}`, {
    method: 'POST',
    requireAuth: true,
    body: {
      lat: draft.lat,
      lng: draft.lng,
      name: draft.name,
      stars: draft.stars,
      departure_type: draft.departureType,
      has_other_riders: draft.hasOtherRiders,
      risks: draft.risks ?? null,
      parking_close: draft.parkingClose,
      optimal_wind_directions: draft.optimalWindDirections,
      min_wind_knots: draft.minWindKnots ?? null,
      max_wind_knots: draft.maxWindKnots ?? null,
      tide_dependent: draft.tideDependent,
      crowd_level: draft.crowdLevel ?? null,
      discipline: DISCIPLINE,
    },
  });
  return rowToSpot(row);
}

export async function updateSpot(id: number, draft: SpotDraft): Promise<WingfoilSpot> {
  const row = await request<ApiSpotRow>(`/spots/${id}${withDiscipline()}`, {
    method: 'PUT',
    requireAuth: true,
    body: {
      lat: draft.lat,
      lng: draft.lng,
      name: draft.name,
      stars: draft.stars,
      departure_type: draft.departureType,
      has_other_riders: draft.hasOtherRiders,
      risks: draft.risks ?? null,
      parking_close: draft.parkingClose,
      optimal_wind_directions: draft.optimalWindDirections,
      min_wind_knots: draft.minWindKnots ?? null,
      max_wind_knots: draft.maxWindKnots ?? null,
      tide_dependent: draft.tideDependent,
      crowd_level: draft.crowdLevel ?? null,
    },
  });
  return rowToSpot(row);
}

export async function deleteSpot(id: number): Promise<void> {
  await request<void>(`/spots/${id}${withDiscipline()}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}

// ───── Shops (read-only directory shared across disciplines) ─────

interface ApiShopRow {
  id: number;
  name: string;
  lat: string | number;
  lng: string | number;
  address: string | null;
  phone: string | null;
  website: string | null;
  services: string | string[] | null;
}

function rowToShop(row: ApiShopRow): Shop {
  let services: Shop['services'] = [];
  if (Array.isArray(row.services)) {
    services = row.services as Shop['services'];
  } else if (typeof row.services === 'string') {
    try {
      services = JSON.parse(row.services);
    } catch {
      services = [];
    }
  }
  return {
    id: row.id,
    name: row.name,
    lat: typeof row.lat === 'string' ? parseFloat(row.lat) : row.lat,
    lng: typeof row.lng === 'string' ? parseFloat(row.lng) : row.lng,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    services,
  };
}

export async function listShopsNear(
  lat: number,
  lng: number,
  radiusKm = 50
): Promise<Shop[]> {
  // Shops are not discipline-scoped — most wing-friendly shops also sell
  // pumpfoil/kite gear. We reuse the same table without the filter.
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radiusKm: radiusKm.toString(),
  });
  const rows = await request<ApiShopRow[]>(`/shops?${params}`);
  return rows.map(rowToShop);
}

// ───── Marketplace ─────

interface ApiListingRow {
  id: number;
  owner_strava_id: string | number;
  category: ListingCategory;
  title: string;
  brand: string | null;
  model: string | null;
  size: string | null;
  condition_grade: MarketplaceListing['conditionGrade'];
  year_purchased: number | null;
  price_eur: string | number;
  description: string | null;
  photo_urls: string[] | string | null;
  contact_email: string | null;
  contact_phone: string | null;
  city: string | null;
  lat: string | number | null;
  lng: string | number | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

function rowToListing(row: ApiListingRow): MarketplaceListing {
  let photos: string[] = [];
  if (Array.isArray(row.photo_urls)) {
    photos = row.photo_urls;
  } else if (typeof row.photo_urls === 'string') {
    try {
      const parsed = JSON.parse(row.photo_urls);
      if (Array.isArray(parsed)) photos = parsed.filter(s => typeof s === 'string');
    } catch {
      /* ignore */
    }
  }
  return {
    id: row.id,
    ownerStravaId:
      typeof row.owner_strava_id === 'string'
        ? parseInt(row.owner_strava_id, 10)
        : row.owner_strava_id,
    category: row.category,
    title: row.title,
    brand: row.brand,
    model: row.model,
    size: row.size,
    conditionGrade: row.condition_grade,
    yearPurchased: row.year_purchased,
    priceEur:
      typeof row.price_eur === 'string' ? parseFloat(row.price_eur) : row.price_eur,
    description: row.description,
    photoUrls: photos,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    city: row.city,
    lat: row.lat === null ? null : typeof row.lat === 'string' ? parseFloat(row.lat) : row.lat,
    lng: row.lng === null ? null : typeof row.lng === 'string' ? parseFloat(row.lng) : row.lng,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function draftToBackend(draft: ListingDraft) {
  return {
    category: draft.category,
    title: draft.title,
    brand: draft.brand ?? null,
    model: draft.model ?? null,
    size: draft.size ?? null,
    condition_grade: draft.conditionGrade,
    year_purchased: draft.yearPurchased ?? null,
    price_eur: draft.priceEur,
    description: draft.description ?? null,
    photo_urls: draft.photoUrls ?? [],
    contact_email: draft.contactEmail ?? null,
    contact_phone: draft.contactPhone ?? null,
    city: draft.city ?? null,
    lat: draft.lat ?? null,
    lng: draft.lng ?? null,
    status: draft.status,
    discipline: DISCIPLINE,
  };
}

export interface ListingFilters {
  category?: ListingCategory;
  status?: ListingStatus;
  owner?: number;
}

export async function listListings(filters: ListingFilters = {}): Promise<MarketplaceListing[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.status) params.set('status', filters.status);
  if (filters.owner !== undefined) params.set('owner', String(filters.owner));
  const rows = await request<ApiListingRow[]>(
    `/marketplace${withDiscipline(params.toString())}`
  );
  return rows.map(rowToListing);
}

export async function getListing(id: number): Promise<MarketplaceListing> {
  const row = await request<ApiListingRow>(`/marketplace/${id}${withDiscipline()}`);
  return rowToListing(row);
}

export async function createListing(draft: ListingDraft): Promise<MarketplaceListing> {
  const row = await request<ApiListingRow>(`/marketplace${withDiscipline()}`, {
    method: 'POST',
    requireAuth: true,
    body: draftToBackend(draft),
  });
  return rowToListing(row);
}

export async function updateListing(
  id: number,
  draft: ListingDraft
): Promise<MarketplaceListing> {
  const row = await request<ApiListingRow>(`/marketplace/${id}${withDiscipline()}`, {
    method: 'PUT',
    requireAuth: true,
    body: draftToBackend(draft),
  });
  return rowToListing(row);
}

export async function setListingStatus(
  id: number,
  status: ListingStatus
): Promise<MarketplaceListing> {
  const row = await request<ApiListingRow>(`/marketplace/${id}${withDiscipline()}`, {
    method: 'PUT',
    requireAuth: true,
    body: { status, discipline: DISCIPLINE },
  });
  return rowToListing(row);
}

export async function deleteListing(id: number): Promise<void> {
  await request<void>(`/marketplace/${id}${withDiscipline()}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}
