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
  minRunDuration: number; // seconds - minimum duration to count as a run
  minStopDuration: number; // seconds - minimum stop duration between runs
  speedSmoothingWindow: number; // number of data points for smoothing
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
