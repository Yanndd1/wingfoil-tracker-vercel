/**
 * Jibe Detection Algorithm for Wingfoil
 *
 * A jibe is detected when the rider makes a significant direction change
 * while maintaining speed (turning through the wind).
 */

export interface Jibe {
  index: number;
  position: [number, number];
  time: number;
  headingBefore: number;
  headingAfter: number;
  angleChange: number;
}

/**
 * Calculate the heading (bearing) between two GPS points
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Heading in degrees (0-360)
 */
const calculateHeading = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let heading = Math.atan2(y, x) * 180 / Math.PI;
  heading = (heading + 360) % 360;

  return heading;
};

/**
 * Calculate the smallest angle difference between two headings
 * @param heading1 First heading in degrees
 * @param heading2 Second heading in degrees
 * @returns Angle difference in degrees (0-180)
 */
const angleDifference = (heading1: number, heading2: number): number => {
  let diff = Math.abs(heading1 - heading2);
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff;
};

/**
 * Smooth headings using a moving average
 * @param headings Array of headings
 * @param windowSize Window size for smoothing
 * @returns Smoothed headings
 */
const smoothHeadings = (headings: number[], windowSize: number): number[] => {
  if (windowSize <= 1) return headings;

  const smoothed: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < headings.length; i++) {
    let sinSum = 0;
    let cosSum = 0;
    let count = 0;

    for (let j = Math.max(0, i - halfWindow); j <= Math.min(headings.length - 1, i + halfWindow); j++) {
      const rad = headings[j] * Math.PI / 180;
      sinSum += Math.sin(rad);
      cosSum += Math.cos(rad);
      count++;
    }

    const avgHeading = Math.atan2(sinSum / count, cosSum / count) * 180 / Math.PI;
    smoothed.push((avgHeading + 360) % 360);
  }

  return smoothed;
};

/**
 * Detect jibes from GPS data
 * @param latlng Array of [lat, lng] coordinates
 * @param time Array of timestamps (seconds)
 * @param speed Optional speed data to filter out slow maneuvers
 * @param minAngleChange Minimum angle change to be considered a jibe (default 60°)
 * @param minSpeed Minimum speed to consider (km/h, default 5)
 * @returns Array of detected jibes
 */
export const detectJibes = (
  latlng: [number, number][],
  time: number[],
  speed?: number[],
  minAngleChange: number = 60,
  minSpeed: number = 5
): Jibe[] => {
  if (latlng.length < 10) return [];

  const jibes: Jibe[] = [];

  // Calculate headings between consecutive points
  const headings: number[] = [];
  for (let i = 0; i < latlng.length - 1; i++) {
    const heading = calculateHeading(
      latlng[i][0], latlng[i][1],
      latlng[i + 1][0], latlng[i + 1][1]
    );
    headings.push(heading);
  }

  // Smooth headings to reduce GPS noise
  const smoothedHeadings = smoothHeadings(headings, 5);

  // Detect significant direction changes
  const windowSize = 10; // Look at heading change over 10 points

  for (let i = windowSize; i < smoothedHeadings.length - windowSize; i++) {
    // Get average heading before and after this point
    let beforeSin = 0, beforeCos = 0;
    let afterSin = 0, afterCos = 0;

    for (let j = i - windowSize; j < i; j++) {
      const rad = smoothedHeadings[j] * Math.PI / 180;
      beforeSin += Math.sin(rad);
      beforeCos += Math.cos(rad);
    }

    for (let j = i; j < i + windowSize; j++) {
      const rad = smoothedHeadings[j] * Math.PI / 180;
      afterSin += Math.sin(rad);
      afterCos += Math.cos(rad);
    }

    const headingBefore = (Math.atan2(beforeSin, beforeCos) * 180 / Math.PI + 360) % 360;
    const headingAfter = (Math.atan2(afterSin, afterCos) * 180 / Math.PI + 360) % 360;
    const angleChange = angleDifference(headingBefore, headingAfter);

    // Check if this is a significant direction change
    if (angleChange >= minAngleChange) {
      // Check speed if available (must be above minSpeed, convert m/s to km/h)
      if (speed && speed[i] * 3.6 < minSpeed) continue;

      // Avoid detecting multiple jibes too close together
      const lastJibe = jibes[jibes.length - 1];
      if (lastJibe && time[i] - lastJibe.time < 5) continue; // Min 5 seconds between jibes

      jibes.push({
        index: i,
        position: latlng[i],
        time: time[i],
        headingBefore,
        headingAfter,
        angleChange,
      });
    }
  }

  return jibes;
};

/**
 * Classify jibe types based on angle change
 * @param angleChange The angle change in degrees
 * @returns 'small' | 'medium' | 'large'
 */
export const classifyJibe = (angleChange: number): 'small' | 'medium' | 'large' => {
  if (angleChange < 90) return 'small';
  if (angleChange < 135) return 'medium';
  return 'large';
};

/**
 * Get color for jibe marker based on angle
 * @param angleChange The angle change in degrees
 * @returns CSS color string
 */
export const getJibeColor = (angleChange: number): string => {
  const type = classifyJibe(angleChange);
  switch (type) {
    case 'small': return '#22c55e'; // green
    case 'medium': return '#eab308'; // yellow
    case 'large': return '#ef4444'; // red
  }
};
