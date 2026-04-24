import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Plus, X, Calendar, Clock, Gauge } from 'lucide-react';
import Layout from '../components/layout/Layout';
import SpotsMap from '../components/spots/SpotsMap';
import SpotForm from '../components/spots/SpotForm';
import SpotDetailPanel from '../components/spots/SpotDetailPanel';
import { WingfoilSpot, SpotDraft } from '../types';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import { formatDuration } from '../utils/runDetection';

type Mode =
  | { kind: 'idle' }
  | { kind: 'creating'; lat: number; lng: number }
  | { kind: 'editing'; spot: WingfoilSpot };

interface AutoSpot {
  id: string;
  name: string;
  coordinates: [number, number];
  sessionsCount: number;
  totalDuration: number;
  bestSpeed: number;
  lastVisit: Date;
}

const SpotsPage: React.FC = () => {
  const { athlete } = useAuth();
  const { sessions } = useData();
  const { t } = useTranslation();

  const [spots, setSpots] = useState<WingfoilSpot[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // v2: auto-aggregated spots from Strava sessions (same logic as the
  // original SpotsPage) — kept as a complementary view below the map.
  const autoSpots = useMemo(() => {
    const spotMap = new Map<string, AutoSpot>();
    const PROXIMITY_THRESHOLD = 0.005; // ~500m in degrees
    const seenSeeds = new Set<string>();

    sessions
      .filter(s => !s.excluded)
      .forEach(session => {
        const startLat = session.rawData?.latlng?.[0]?.[0];
        const startLng = session.rawData?.latlng?.[0]?.[1];
        if (startLat === undefined || startLng === undefined) return;

        let found: AutoSpot | undefined;
        let foundKey: string | undefined;
        spotMap.forEach((spot, key) => {
          const [lat, lng] = spot.coordinates;
          const distance = Math.sqrt(
            Math.pow(lat - startLat, 2) + Math.pow(lng - startLng, 2)
          );
          if (distance < PROXIMITY_THRESHOLD) {
            found = spot;
            foundKey = key;
          }
        });

        if (found && foundKey) {
          spotMap.set(foundKey, {
            ...found,
            sessionsCount: found.sessionsCount + 1,
            totalDuration: found.totalDuration + session.stats.totalRidingTime,
            bestSpeed: Math.max(found.bestSpeed, session.stats.bestMaxSpeed),
            lastVisit:
              new Date(session.date) > found.lastVisit
                ? new Date(session.date)
                : found.lastVisit,
          });
        } else {
          const key = `${startLat.toFixed(4)}_${startLng.toFixed(4)}`;
          spotMap.set(key, {
            id: key,
            name: session.location ?? `${startLat.toFixed(3)}, ${startLng.toFixed(3)}`,
            coordinates: [startLat, startLng],
            sessionsCount: 1,
            totalDuration: session.stats.totalRidingTime,
            bestSpeed: session.stats.bestMaxSpeed,
            lastVisit: new Date(session.date),
          });
        }
        seenSeeds.add(`${startLat.toFixed(3)}_${startLng.toFixed(3)}`);
      });

    return Array.from(spotMap.values()).sort(
      (a, b) => b.lastVisit.getTime() - a.lastVisit.getTime()
    );
  }, [sessions]);

  // Strava-derived seed positions for the map (one dot per distinct
  // ~100m cell, max 200) — invites the user to add a community spot.
  const stravaSeedPositions = useMemo<[number, number][]>(() => {
    const seen = new Set<string>();
    const result: [number, number][] = [];
    for (const session of sessions) {
      if (session.excluded) continue;
      const first =
        session.runs[0]?.startPosition ?? session.rawData?.latlng?.[0];
      if (!first) continue;
      const key = `${first[0].toFixed(3)}_${first[1].toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(first);
    }
    return result;
  }, [sessions]);

  useEffect(() => {
    api
      .listSpots()
      .then(setSpots)
      .catch(e => setLoadError(e instanceof Error ? e.message : 'load error'));
  }, []);

  const selectedSpot = spots.find(s => s.id === selectedSpotId) ?? null;
  const canEditSelected =
    !!athlete && !!selectedSpot && selectedSpot.createdByStravaId === athlete.id;

  const handleMapClick = (lat: number, lng: number) => {
    if (mode.kind !== 'idle') return;
    if (!athlete) {
      setLoadError(t('spots.loginToAdd'));
      return;
    }
    setSelectedSpotId(null);
    setMode({ kind: 'creating', lat, lng });
  };

  const handleCreateSubmit = async (draft: SpotDraft) => {
    setSubmitting(true);
    try {
      const created = await api.createSpot(draft);
      setSpots(prev => [...prev, created]);
      setSelectedSpotId(created.id);
      setMode({ kind: 'idle' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (draft: SpotDraft) => {
    if (mode.kind !== 'editing') return;
    setSubmitting(true);
    try {
      const updated = await api.updateSpot(mode.spot.id, draft);
      setSpots(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      setMode({ kind: 'idle' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedSpot) return;
    if (!confirm(t('spots.confirmDelete'))) return;
    await api.deleteSpot(selectedSpot.id);
    setSpots(prev => prev.filter(s => s.id !== selectedSpot.id));
    setSelectedSpotId(null);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <MapPin className="h-6 w-6 text-ocean-600 mr-2" />
            {t('spots.title')}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t('spots.subtitle')}</p>
        </div>

        {loadError && (
          <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{loadError}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[500px] rounded-xl overflow-hidden border border-gray-200">
            <SpotsMap
              spots={spots}
              stravaSeedPositions={stravaSeedPositions}
              selectedSpotId={selectedSpotId}
              onSelectSpot={setSelectedSpotId}
              onMapClick={handleMapClick}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 min-h-[300px]">
            {mode.kind === 'creating' && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Plus className="h-5 w-5 text-ocean-600 mr-1" />
                    {t('spots.newSpot')}
                  </h2>
                </div>
                <SpotForm
                  initial={{
                    lat: mode.lat,
                    lng: mode.lng,
                    name: '',
                    stars: 3,
                    departureType: 'plage',
                    hasOtherRiders: false,
                    parkingClose: false,
                    optimalWindDirections: [],
                    tideDependent: false,
                  }}
                  onSubmit={handleCreateSubmit}
                  onCancel={() => setMode({ kind: 'idle' })}
                  submitting={submitting}
                />
              </>
            )}

            {mode.kind === 'editing' && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('spots.editSpot')}
                  </h2>
                  <button
                    onClick={() => setMode({ kind: 'idle' })}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SpotForm
                  initial={{
                    lat: mode.spot.lat,
                    lng: mode.spot.lng,
                    name: mode.spot.name,
                    stars: mode.spot.stars,
                    departureType: mode.spot.departureType,
                    hasOtherRiders: mode.spot.hasOtherRiders,
                    parkingClose: mode.spot.parkingClose,
                    risks: mode.spot.risks,
                    optimalWindDirections: mode.spot.optimalWindDirections,
                    minWindKnots: mode.spot.minWindKnots,
                    maxWindKnots: mode.spot.maxWindKnots,
                    tideDependent: mode.spot.tideDependent,
                    crowdLevel: mode.spot.crowdLevel,
                  }}
                  onSubmit={handleEditSubmit}
                  onCancel={() => setMode({ kind: 'idle' })}
                  submitting={submitting}
                />
              </>
            )}

            {mode.kind === 'idle' && selectedSpot && (
              <SpotDetailPanel
                spot={selectedSpot}
                canEdit={canEditSelected}
                onEdit={() => setMode({ kind: 'editing', spot: selectedSpot })}
                onDelete={handleDeleteSelected}
              />
            )}

            {mode.kind === 'idle' && !selectedSpot && (
              <div className="text-sm text-gray-500 space-y-3">
                <p>{t('spots.helpClickMap')}</p>
                <p>{t('spots.helpClickMarker')}</p>
                {stravaSeedPositions.length > 0 && (
                  <p className="text-xs italic">
                    {stravaSeedPositions.length} {t('spots.seedsFromStrava')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Legacy auto-aggregated view — kept as a quick history of the
            user's own Strava sessions per location. Useful even without
            community spots: tells the rider "you've ridden here X times". */}
        {autoSpots.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('dashboard.yourSpots')}
              </h2>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {autoSpots.map(spot => (
                <div
                  key={spot.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <p className="font-semibold text-gray-900 truncate">{spot.name}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    {spot.coordinates[0].toFixed(3)}, {spot.coordinates[1].toFixed(3)}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {spot.sessionsCount} {t('spots.sessionsCount')}
                    </span>
                    <span className="flex items-center text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(spot.totalDuration)}
                    </span>
                    <span className="flex items-center text-gray-600 col-span-2">
                      <Gauge className="h-3 w-3 mr-1" />
                      {spot.bestSpeed.toFixed(1)} km/h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SpotsPage;
