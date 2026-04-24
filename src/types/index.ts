// Strava API Types
export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile: string;
  profile_medium: string;
}

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: StravaAthlete;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  has_heartrate: boolean;
  start_latlng?: [number, number];
  end_latlng?: [number, number];
  map?: {
    summary_polyline: string;
  };
}

export interface StravaStream {
  type: string;
  data: number[];
  series_type: string;
  original_size: number;
  resolution: string;
}

export interface StravaStreamsResponse {
  time?: StravaStream;
  distance?: StravaStream;
  velocity_smooth?: StravaStream;
  heartrate?: StravaStream;
  altitude?: StravaStream;
  latlng?: {
    type: string;
    data: [number, number][];
    series_type: string;
    original_size: number;
    resolution: string;
  };
}

// Wingfoil App Types
export interface WingRun {
  id: string;
  startIndex: number;
  endIndex: number;
  startTime: number; // seconds from activity start
  endTime: number;
  duration: number; // seconds
  distance: number; // meters
  averageSpeed: number; // km/h
  maxSpeed: number; // km/h
  averageHeartrate?: number;
  maxHeartrate?: number;
  startHeartrate?: number; // FC au début du run
  endHeartrate?: number; // FC à la fin du run
  startPosition?: [number, number];
  endPosition?: [number, number];
}

export interface WingfoilSession {
  id: string;
  stravaActivityId: number;
  name: string;
  date: string;
  location?: string;
  totalDuration: number; // seconds
  totalDistance: number; // meters
  runs: WingRun[];
  stats: SessionStats;
  // v2: true if the max-speed guard rejected this session — kept in storage
  // so a higher threshold later re-includes it without re-syncing Strava.
  excluded?: boolean;
  // v2: IDs of photos/videos stored in IndexedDB for this session.
  mediaIds?: string[];
  rawData?: {
    time: number[];
    speed: number[];
    heartrate?: number[];
    distance: number[];
    latlng?: [number, number][];
  };
}

export interface SessionStats {
  numberOfRuns: number;
  totalRidingTime: number; // seconds
  totalRidingDistance: number; // meters
  averageRunDuration: number;
  averageRunDistance: number;
  longestRunDuration: number;
  longestRunDistance: number;
  bestAverageSpeed: number;
  bestMaxSpeed: number;
  // v2: arithmetic mean of every run's averageSpeed in the session.
  averageRunAverageSpeed: number;
  averageHeartrate?: number;
  maxHeartrate?: number;
}

export interface ProgressStats {
  totalSessions: number;
  totalRuns: number;
  totalRidingTime: number;
  totalRidingDistance: number;
  averageRunsPerSession: number;
  averageRunDuration: number;
  averageRunDistance: number;
  bestRunDuration: number;
  bestRunDistance: number;
  bestMaxSpeed: number;
  // v2: mean of every run's averageSpeed across the entire history.
  allTimeAverageSpeed: number;
  // v2: metrics for the most recent active session (used as headline KPIs).
  lastSession?: {
    longestRunDuration: number;
    longestRunDistance: number;
  };
  recentTrend: {
    runDuration: number; // percentage change
    runDistance: number;
    runsPerSession: number;
  };
}

export interface ChartDataPoint {
  date: string;
  label: string;
  value: number;
  sessionId?: string;
}

export interface RunDetectionConfig {
  minSpeedThreshold: number; // km/h - speed above which we consider riding
  // v2: sessions whose max smoothed speed exceeds this value are excluded.
  // Wingfoil tolerates a higher ceiling than pumpfoil (planing reaches
  // 30-40 km/h easily, racing setups can go past 50).
  maxSpeedThreshold: number; // km/h
  minRunDuration: number; // seconds - minimum duration to count as a run
  minStopDuration: number; // seconds - minimum stop duration between runs
  speedSmoothingWindow: number; // number of data points for smoothing
  // v2: Strava `type` / `sport_type` values treated as wingfoil.
  // Defaults include the historical Kitesurf labels + Windsurf for users
  // who pick the more accurate Strava category. Editable from Settings.
  wingfoilSportTypes: string[];
}

// App State Types
export interface AppState {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessions: WingfoilSession[];
  selectedSession: WingfoilSession | null;
  config: RunDetectionConfig;
}

// Filter Types
export interface SessionFilter {
  dateFrom?: string;
  dateTo?: string;
  minRuns?: number;
  location?: string;
}

// ───── v2: Media (photos / videos per session) ─────

export type MediaKind = 'photo' | 'video';

export interface SessionMediaMeta {
  id: string;
  sessionId: string;
  kind: MediaKind;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
}

// ───── v2: Wingfoil spots (shared backend) ─────

export type SpotDepartureType = 'ponton' | 'rocher' | 'plage' | 'autre';

// Wingfoil-specific characteristics.
// `optimalWindDirections` is an array of 16-point compass labels
// ('N','NNE','NE',… 'NNW') so a spot can flag multiple usable bearings.
// Wind range stays in knots (industry standard for wing).
export type CrowdLevel = 'low' | 'medium' | 'high';

export interface WingfoilSpot {
  id: number;
  lat: number;
  lng: number;
  name: string;
  stars: number; // 1-5
  departureType: SpotDepartureType;
  hasOtherRiders: boolean;
  risks?: string;
  parkingClose: boolean;
  optimalWindDirections: string[]; // ['N','NE','E',…]
  minWindKnots?: number;
  maxWindKnots?: number;
  tideDependent: boolean;
  crowdLevel?: CrowdLevel;
  createdByStravaId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpotDraft {
  lat: number;
  lng: number;
  name: string;
  stars: number;
  departureType: SpotDepartureType;
  hasOtherRiders: boolean;
  risks?: string;
  parkingClose: boolean;
  optimalWindDirections: string[];
  minWindKnots?: number;
  maxWindKnots?: number;
  tideDependent: boolean;
  crowdLevel?: CrowdLevel;
}

// ───── v2: Gear (local) + Shops (backend directory) ─────

export type GearCategory =
  | 'board'
  | 'wing'
  | 'frontwing'
  | 'stab'
  | 'fuselage'
  | 'mast'
  | 'leash'
  | 'wetsuit'
  | 'harness'
  | 'accessory'
  | 'other'
  | 'foil';

export interface GearItem {
  id: string;
  category: GearCategory;
  brand: string;
  model: string;
  size?: string;
  purchaseDate?: string;
  notes?: string;
  mediaId?: string;
  createdAt: string;
}

export type ShopService = 'rental' | 'sale' | 'school' | 'repair';

export interface Shop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  website?: string;
  services: ShopService[];
}

// ───── v2: Marketplace (second-hand gear) ─────

export type ListingCategory =
  | 'board'
  | 'wing'
  | 'foil'
  | 'wetsuit'
  | 'harness'
  | 'leash'
  | 'accessory'
  | 'complete_setup'
  | 'other';

export type ListingCondition = 'new' | 'as_new' | 'good' | 'fair' | 'for_parts';

export type ListingStatus = 'active' | 'reserved' | 'sold' | 'withdrawn';

export interface MarketplaceListing {
  id: number;
  ownerStravaId: number;
  category: ListingCategory;
  title: string;
  brand?: string | null;
  model?: string | null;
  size?: string | null;
  conditionGrade: ListingCondition;
  yearPurchased?: number | null;
  priceEur: number;
  description?: string | null;
  photoUrls: string[];
  contactEmail?: string | null;
  contactPhone?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListingDraft {
  category: ListingCategory;
  title: string;
  brand?: string;
  model?: string;
  size?: string;
  conditionGrade: ListingCondition;
  yearPurchased?: number;
  priceEur: number;
  description?: string;
  photoUrls: string[];
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  lat?: number;
  lng?: number;
  status?: ListingStatus;
}

// ───── v2: Weather (Open-Meteo) ─────

export interface WeatherSnapshot {
  temperatureC: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windGustsKmh?: number;
  waveHeightM?: number;
  wavePeriodS?: number;
  waveDirectionDeg?: number;
  fetchedAt: string;
}
