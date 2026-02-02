import React, { useMemo } from 'react';
import { MapPin, Calendar, Clock, Gauge, TrendingUp } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import { formatDuration } from '../utils/runDetection';

interface Spot {
  id: string;
  name: string;
  coordinates: [number, number];
  sessionsCount: number;
  totalDuration: number;
  bestSpeed: number;
  avgRunsPerSession: number;
  lastVisit: Date;
}

const SpotsPage: React.FC = () => {
  const { sessions } = useData();
  const { t } = useTranslation();

  // Group sessions by spot (based on GPS proximity)
  const spots = useMemo(() => {
    const spotMap = new Map<string, Spot>();
    const PROXIMITY_THRESHOLD = 0.005; // ~500m in degrees

    sessions.forEach(session => {
      // Get starting coordinates from the session
      const startLat = session.rawData?.latlng?.[0]?.[0];
      const startLng = session.rawData?.latlng?.[0]?.[1];

      if (startLat === undefined || startLng === undefined) return;

      // Find existing spot within proximity or create new one
      let foundSpot: Spot | undefined;
      let foundKey: string | undefined;

      spotMap.forEach((spot, key) => {
        const [lat, lng] = spot.coordinates;
        const distance = Math.sqrt(
          Math.pow(lat - startLat, 2) + Math.pow(lng - startLng, 2)
        );
        if (distance < PROXIMITY_THRESHOLD) {
          foundSpot = spot;
          foundKey = key;
        }
      });

      if (foundSpot && foundKey) {
        // Update existing spot
        foundSpot.sessionsCount += 1;
        foundSpot.totalDuration += session.stats.totalRidingTime;
        foundSpot.bestSpeed = Math.max(foundSpot.bestSpeed, session.stats.bestMaxSpeed);
        foundSpot.avgRunsPerSession = (foundSpot.avgRunsPerSession * (foundSpot.sessionsCount - 1) + session.stats.numberOfRuns) / foundSpot.sessionsCount;
        if (new Date(session.date) > foundSpot.lastVisit) {
          foundSpot.lastVisit = new Date(session.date);
        }
      } else {
        // Create new spot
        const spotId = `spot-${startLat.toFixed(3)}-${startLng.toFixed(3)}`;
        const spotName = session.location || `Spot ${spotMap.size + 1}`;

        spotMap.set(spotId, {
          id: spotId,
          name: spotName,
          coordinates: [startLat, startLng],
          sessionsCount: 1,
          totalDuration: session.stats.totalRidingTime,
          bestSpeed: session.stats.bestMaxSpeed,
          avgRunsPerSession: session.stats.numberOfRuns,
          lastVisit: new Date(session.date),
        });
      }
    });

    // Convert to array and sort by sessions count
    return Array.from(spotMap.values()).sort((a, b) => b.sessionsCount - a.sessionsCount);
  }, [sessions]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('spots.title')}</h1>
          <p className="text-gray-600 mt-1">{t('spots.subtitle')}</p>
        </div>

        {/* Spots Grid */}
        {spots.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('spots.noSpots')}
            </h3>
            <p className="text-gray-500">
              {t('spots.noSpotsDesc')}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {spots.map(spot => (
              <div
                key={spot.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Spot Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-ocean-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-ocean-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                      <p className="text-sm text-gray-500">
                        {spot.sessionsCount} {t('spots.sessionsCount')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">{t('spots.lastVisit')}</p>
                      <p className="text-sm font-medium">
                        {spot.lastVisit.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">{t('spots.totalTime')}</p>
                      <p className="text-sm font-medium">
                        {formatDuration(spot.totalDuration)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">{t('spots.bestSpeed')}</p>
                      <p className="text-sm font-medium">
                        {spot.bestSpeed.toFixed(1)} km/h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">{t('spots.avgRuns')}</p>
                      <p className="text-sm font-medium">
                        {spot.avgRunsPerSession.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SpotsPage;
