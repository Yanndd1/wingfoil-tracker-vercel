import { WingfoilSession, StravaTokens, RunDetectionConfig } from '../types';

const STORAGE_KEYS = {
  TOKENS: 'wingfoil_strava_tokens',
  SESSIONS: 'wingfoil_sessions',
  CONFIG: 'wingfoil_config',
  LAST_SYNC: 'wingfoil_last_sync',
} as const;

// Compression utilities for rawData to reduce storage size
const compressNumbers = (arr: number[]): string => {
  // Round numbers to reduce precision and store as delta-encoded string
  const rounded = arr.map(n => Math.round(n * 100) / 100);
  const deltas: number[] = [rounded[0]];
  for (let i = 1; i < rounded.length; i++) {
    deltas.push(Math.round((rounded[i] - rounded[i - 1]) * 100) / 100);
  }
  return deltas.join(',');
};

const decompressNumbers = (str: string): number[] => {
  const deltas = str.split(',').map(Number);
  const result: number[] = [deltas[0]];
  for (let i = 1; i < deltas.length; i++) {
    result.push(Math.round((result[i - 1] + deltas[i]) * 100) / 100);
  }
  return result;
};

const compressLatLng = (arr: [number, number][]): string => {
  // Store lat/lng with 5 decimal precision (about 1m accuracy)
  return arr.map(([lat, lng]) =>
    `${Math.round(lat * 100000)},${Math.round(lng * 100000)}`
  ).join(';');
};

const decompressLatLng = (str: string): [number, number][] => {
  if (!str) return [];
  return str.split(';').map(pair => {
    const [lat, lng] = pair.split(',').map(Number);
    return [lat / 100000, lng / 100000] as [number, number];
  });
};

interface CompressedRawData {
  time: string;
  speed: string;
  heartrate?: string;
  distance: string;
  latlng?: string;
  _compressed: true;
}

interface StoredSession extends Omit<WingfoilSession, 'rawData'> {
  rawData?: WingfoilSession['rawData'] | CompressedRawData;
}

const compressRawData = (rawData: WingfoilSession['rawData']): CompressedRawData | undefined => {
  if (!rawData) return undefined;
  return {
    time: compressNumbers(rawData.time),
    speed: compressNumbers(rawData.speed),
    heartrate: rawData.heartrate ? compressNumbers(rawData.heartrate) : undefined,
    distance: compressNumbers(rawData.distance),
    latlng: rawData.latlng ? compressLatLng(rawData.latlng) : undefined,
    _compressed: true,
  };
};

const decompressRawData = (data: CompressedRawData | WingfoilSession['rawData']): WingfoilSession['rawData'] => {
  if (!data) return undefined;
  if ('_compressed' in data && data._compressed) {
    const compressed = data as CompressedRawData;
    return {
      time: decompressNumbers(compressed.time),
      speed: decompressNumbers(compressed.speed),
      heartrate: compressed.heartrate ? decompressNumbers(compressed.heartrate) : undefined,
      distance: decompressNumbers(compressed.distance),
      latlng: compressed.latlng ? decompressLatLng(compressed.latlng) : undefined,
    };
  }
  return data as WingfoilSession['rawData'];
};

const compressSession = (session: WingfoilSession): StoredSession => {
  return {
    ...session,
    rawData: compressRawData(session.rawData),
  };
};

const decompressSession = (stored: StoredSession): WingfoilSession => {
  return {
    ...stored,
    rawData: stored.rawData ? decompressRawData(stored.rawData) : undefined,
  } as WingfoilSession;
};

// Storage error class for quota exceeded
export class StorageQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

// Safely set item with error handling
const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e instanceof DOMException &&
        (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      throw new StorageQuotaError(
        'Le stockage local est plein. Essayez de supprimer des anciennes sessions ou d\'exporter vos données.'
      );
    }
    throw e;
  }
};

const DEFAULT_CONFIG: RunDetectionConfig = {
  minSpeedThreshold: 12, // km/h - higher for wingfoil
  minRunDuration: 10, // seconds - longer runs in wingfoil
  minStopDuration: 5, // seconds
  speedSmoothingWindow: 3, // data points
};

// Token management
export const saveTokens = (tokens: StravaTokens): void => {
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
};

export const getTokens = (): StravaTokens | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const clearTokens = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
};

// Session management
export const saveSessions = (sessions: WingfoilSession[]): void => {
  const compressed = sessions.map(compressSession);
  safeSetItem(STORAGE_KEYS.SESSIONS, JSON.stringify(compressed));
};

export const getSessions = (): WingfoilSession[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as StoredSession[];
    return parsed.map(decompressSession);
  } catch {
    return [];
  }
};

export const addSession = (session: WingfoilSession): void => {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex(s => s.stravaActivityId === session.stravaActivityId);

  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }

  // Sort by date descending
  sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  saveSessions(sessions);
};

// Migrate existing uncompressed data to compressed format
export const migrateToCompressedStorage = (): { migrated: boolean; savedBytes: number } => {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!stored) return { migrated: false, savedBytes: 0 };

  try {
    const parsed = JSON.parse(stored);
    // Check if already compressed (first session has _compressed flag in rawData)
    if (parsed.length > 0 && parsed[0].rawData && parsed[0].rawData._compressed) {
      return { migrated: false, savedBytes: 0 };
    }

    const originalSize = stored.length;
    const compressed = parsed.map((s: WingfoilSession) => compressSession(s));
    const newData = JSON.stringify(compressed);
    const newSize = newData.length;

    safeSetItem(STORAGE_KEYS.SESSIONS, newData);
    return { migrated: true, savedBytes: originalSize - newSize };
  } catch {
    return { migrated: false, savedBytes: 0 };
  }
};

// Remove rawData from oldest sessions to free space
export const pruneOldSessionsRawData = (keepCount: number = 20): number => {
  const sessions = getSessions();
  if (sessions.length <= keepCount) return 0;

  // Sort by date descending and remove rawData from older sessions
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let prunedCount = 0;
  for (let i = keepCount; i < sorted.length; i++) {
    if (sorted[i].rawData) {
      sorted[i].rawData = undefined;
      prunedCount++;
    }
  }

  if (prunedCount > 0) {
    saveSessions(sorted);
  }

  return prunedCount;
};

// Get storage usage info
export const getStorageInfo = (): { used: number; total: number; sessionsSize: number } => {
  let total = 0;
  let sessionsSize = 0;

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const size = localStorage.getItem(key)?.length || 0;
      total += size;
      if (key === STORAGE_KEYS.SESSIONS) {
        sessionsSize = size;
      }
    }
  }

  // Estimate total available (typically 5-10 MB, using 5MB as safe estimate)
  const estimatedTotal = 5 * 1024 * 1024;

  return {
    used: total,
    total: estimatedTotal,
    sessionsSize,
  };
};

export const deleteSession = (sessionId: string): void => {
  const sessions = getSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  saveSessions(filtered);
};

export const getSessionById = (sessionId: string): WingfoilSession | null => {
  const sessions = getSessions();
  return sessions.find(s => s.id === sessionId) || null;
};

// Config management
export const saveConfig = (config: RunDetectionConfig): void => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

export const getConfig = (): RunDetectionConfig => {
  const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (!stored) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_CONFIG;
  }
};

// Sync tracking
export const setLastSync = (timestamp: number): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
};

export const getLastSync = (): number | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  if (!stored) return null;
  return parseInt(stored, 10);
};

// Clear all data
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export { DEFAULT_CONFIG };
