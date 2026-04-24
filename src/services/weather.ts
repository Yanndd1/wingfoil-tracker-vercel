import { WeatherSnapshot } from '../types';

/**
 * Open-Meteo client (https://open-meteo.com).
 *
 * Why Open-Meteo: free, no API key, no usage cap. Two endpoints are queried
 * for each spot:
 *   - /v1/forecast — current temperature + wind (always available)
 *   - /v1/marine    — wave height + period + direction (only on coastal grid)
 *
 * Results are cached in-memory for one hour because spot weather doesn't
 * change every minute and we want to avoid spamming the public service.
 */

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  fetchedAt: number;
  snapshot: WeatherSnapshot;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(lat: number, lng: number): string {
  // Round to 0.01° (~1.1 km) — different spots in the same town share weather
  return `${lat.toFixed(2)}_${lng.toFixed(2)}`;
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
  };
}

interface MarineResponse {
  current?: {
    wave_height?: number;
    wave_period?: number;
    wave_direction?: number;
  };
}

export async function getSpotWeather(
  lat: number,
  lng: number
): Promise<WeatherSnapshot> {
  const key = cacheKey(lat, lng);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.snapshot;
  }

  // Forecast (always available worldwide)
  const forecastUrl = new URL(FORECAST_URL);
  forecastUrl.searchParams.set('latitude', lat.toString());
  forecastUrl.searchParams.set('longitude', lng.toString());
  forecastUrl.searchParams.set(
    'current',
    'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m'
  );
  forecastUrl.searchParams.set('wind_speed_unit', 'kmh');
  forecastUrl.searchParams.set('timezone', 'auto');

  const forecastRes = await fetch(forecastUrl.toString());
  if (!forecastRes.ok) {
    throw new Error(`Open-Meteo forecast error: ${forecastRes.status}`);
  }
  const forecast: ForecastResponse = await forecastRes.json();
  const current = forecast.current ?? {};

  // Marine (coastal grid only — failures are tolerated, the spot might be
  // inland and we still want to surface the wind data).
  let waveHeight: number | undefined;
  let wavePeriod: number | undefined;
  let waveDirection: number | undefined;
  try {
    const marineUrl = new URL(MARINE_URL);
    marineUrl.searchParams.set('latitude', lat.toString());
    marineUrl.searchParams.set('longitude', lng.toString());
    marineUrl.searchParams.set('current', 'wave_height,wave_period,wave_direction');
    marineUrl.searchParams.set('timezone', 'auto');
    const marineRes = await fetch(marineUrl.toString());
    if (marineRes.ok) {
      const marine: MarineResponse = await marineRes.json();
      waveHeight = marine.current?.wave_height;
      wavePeriod = marine.current?.wave_period;
      waveDirection = marine.current?.wave_direction;
    }
  } catch {
    /* marine endpoint is best-effort */
  }

  const snapshot: WeatherSnapshot = {
    temperatureC: current.temperature_2m ?? 0,
    windSpeedKmh: current.wind_speed_10m ?? 0,
    windDirectionDeg: current.wind_direction_10m ?? 0,
    windGustsKmh: current.wind_gusts_10m,
    waveHeightM: waveHeight,
    wavePeriodS: wavePeriod,
    waveDirectionDeg: waveDirection,
    fetchedAt: new Date().toISOString(),
  };

  cache.set(key, { fetchedAt: Date.now(), snapshot });
  return snapshot;
}

/**
 * Convert a wind direction in degrees to a 16-point compass abbreviation
 * (e.g. 0° → "N", 45° → "NE", 235° → "WSW"). Useful for compact UIs.
 */
export function windDirectionLabel(deg: number): string {
  const points = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  return points[Math.round(((deg % 360) / 22.5)) % 16];
}
