import { WingRun, RunDetectionConfig, SessionStats } from '../types';

/**
 * Smooth speed data using a moving average to reduce noise
 */
const smoothSpeed = (speeds: number[], windowSize: number): number[] => {
  if (windowSize <= 1) return speeds;

  const smoothed: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < speeds.length; i++) {
    let sum = 0;
    let count = 0;

    for (let j = Math.max(0, i - halfWindow); j <= Math.min(speeds.length - 1, i + halfWindow); j++) {
      sum += speeds[j];
      count++;
    }

    smoothed.push(sum / count);
  }

  return smoothed;
};

/**
 * Convert m/s to km/h
 */
const msToKmh = (speedMs: number): number => speedMs * 3.6;

/**
 * Detect wing runs from activity stream data
 *
 * A run is detected when:
 * 1. Speed goes above the threshold (start of run)
 * 2. Speed stays above threshold for minimum duration
 * 3. Speed drops below threshold (end of run)
 */
export const detectRuns = (
  timeData: number[],
  speedData: number[], // in m/s from Strava
  distanceData: number[],
  config: RunDetectionConfig,
  heartrateData?: number[],
  latlngData?: [number, number][]
): WingRun[] => {
  if (timeData.length === 0 || speedData.length === 0) {
    return [];
  }

  // Convert speed to km/h and smooth
  const speedKmh = speedData.map(msToKmh);
  const smoothedSpeed = smoothSpeed(speedKmh, config.speedSmoothingWindow);

  const runs: WingRun[] = [];
  let runStartIndex: number | null = null;
  let runId = 1;

  for (let i = 0; i < smoothedSpeed.length; i++) {
    const speed = smoothedSpeed[i];
    const isAboveThreshold = speed >= config.minSpeedThreshold;

    if (isAboveThreshold && runStartIndex === null) {
      // Start of a potential run
      runStartIndex = i;
    } else if (!isAboveThreshold && runStartIndex !== null) {
      // End of a potential run
      const runEndIndex = i - 1;
      const runDuration = timeData[runEndIndex] - timeData[runStartIndex];

      if (runDuration >= config.minRunDuration) {
        // Valid run detected
        const run = createRun(
          runId.toString(),
          runStartIndex,
          runEndIndex,
          timeData,
          smoothedSpeed,
          distanceData,
          heartrateData,
          latlngData
        );
        runs.push(run);
        runId++;
      }

      runStartIndex = null;
    }
  }

  // Handle case where activity ends during a run
  if (runStartIndex !== null) {
    const runEndIndex = smoothedSpeed.length - 1;
    const runDuration = timeData[runEndIndex] - timeData[runStartIndex];

    if (runDuration >= config.minRunDuration) {
      const run = createRun(
        runId.toString(),
        runStartIndex,
        runEndIndex,
        timeData,
        smoothedSpeed,
        distanceData,
        heartrateData,
        latlngData
      );
      runs.push(run);
    }
  }

  return runs;
};

/**
 * Create a WingRun object from detected indices
 */
const createRun = (
  id: string,
  startIndex: number,
  endIndex: number,
  timeData: number[],
  speedData: number[], // already in km/h
  distanceData: number[],
  heartrateData?: number[],
  latlngData?: [number, number][]
): WingRun => {
  const startTime = timeData[startIndex];
  const endTime = timeData[endIndex];
  const duration = endTime - startTime;
  const distance = distanceData[endIndex] - distanceData[startIndex];

  // Calculate speed stats for this run
  const runSpeeds = speedData.slice(startIndex, endIndex + 1);
  const averageSpeed = runSpeeds.reduce((a, b) => a + b, 0) / runSpeeds.length;
  const maxSpeed = Math.max(...runSpeeds);

  // Calculate heartrate stats if available
  let averageHeartrate: number | undefined;
  let maxHeartrate: number | undefined;
  let startHeartrate: number | undefined;
  let endHeartrate: number | undefined;

  if (heartrateData && heartrateData.length > endIndex) {
    const runHeartrates = heartrateData.slice(startIndex, endIndex + 1).filter(hr => hr > 0);
    if (runHeartrates.length > 0) {
      averageHeartrate = runHeartrates.reduce((a, b) => a + b, 0) / runHeartrates.length;
      maxHeartrate = Math.max(...runHeartrates);
    }
    // Capture start and end heartrate
    if (heartrateData[startIndex] > 0) {
      startHeartrate = heartrateData[startIndex];
    }
    if (heartrateData[endIndex] > 0) {
      endHeartrate = heartrateData[endIndex];
    }
  }

  // Get start/end positions if available
  let startPosition: [number, number] | undefined;
  let endPosition: [number, number] | undefined;

  if (latlngData && latlngData.length > endIndex) {
    startPosition = latlngData[startIndex];
    endPosition = latlngData[endIndex];
  }

  return {
    id,
    startIndex,
    endIndex,
    startTime,
    endTime,
    duration,
    distance,
    averageSpeed: Math.round(averageSpeed * 10) / 10,
    maxSpeed: Math.round(maxSpeed * 10) / 10,
    averageHeartrate: averageHeartrate ? Math.round(averageHeartrate) : undefined,
    maxHeartrate,
    startHeartrate,
    endHeartrate,
    startPosition,
    endPosition,
  };
};

/**
 * Calculate session statistics from detected runs
 */
export const calculateSessionStats = (runs: WingRun[]): SessionStats => {
  if (runs.length === 0) {
    return {
      numberOfRuns: 0,
      totalRidingTime: 0,
      totalRidingDistance: 0,
      averageRunDuration: 0,
      averageRunDistance: 0,
      longestRunDuration: 0,
      longestRunDistance: 0,
      bestAverageSpeed: 0,
      bestMaxSpeed: 0,
    };
  }

  const totalRidingTime = runs.reduce((sum, run) => sum + run.duration, 0);
  const totalRidingDistance = runs.reduce((sum, run) => sum + run.distance, 0);

  const avgHeartrates = runs.filter(r => r.averageHeartrate).map(r => r.averageHeartrate!);
  const maxHeartrates = runs.filter(r => r.maxHeartrate).map(r => r.maxHeartrate!);

  return {
    numberOfRuns: runs.length,
    totalRidingTime,
    totalRidingDistance,
    averageRunDuration: totalRidingTime / runs.length,
    averageRunDistance: totalRidingDistance / runs.length,
    longestRunDuration: Math.max(...runs.map(r => r.duration)),
    longestRunDistance: Math.max(...runs.map(r => r.distance)),
    bestAverageSpeed: Math.max(...runs.map(r => r.averageSpeed)),
    bestMaxSpeed: Math.max(...runs.map(r => r.maxSpeed)),
    averageHeartrate:
      avgHeartrates.length > 0
        ? Math.round(avgHeartrates.reduce((a, b) => a + b, 0) / avgHeartrates.length)
        : undefined,
    maxHeartrate: maxHeartrates.length > 0 ? Math.max(...maxHeartrates) : undefined,
  };
};

/**
 * Format duration in seconds to human-readable string
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format distance in meters to human-readable string
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }

  return `${(meters / 1000).toFixed(2)}km`;
};

/**
 * Format speed in km/h
 */
export const formatSpeed = (kmh: number): string => {
  return `${kmh.toFixed(1)} km/h`;
};
