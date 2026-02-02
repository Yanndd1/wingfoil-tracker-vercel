import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { WingfoilSession, WingRun } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { formatDuration, formatDistance } from '../../utils/runDetection';

interface SessionMapProps {
  session: WingfoilSession;
  selectedRun?: WingRun | null;
  onSelectRun?: (run: WingRun | null) => void;
  height?: string;
}

// Helper to get color based on speed
const getSpeedColor = (speed: number, minSpeed: number, maxSpeed: number): string => {
  const range = maxSpeed - minSpeed || 1;
  const normalized = Math.max(0, Math.min(1, (speed - minSpeed) / range));

  // Green (0) -> Yellow (0.5) -> Red (1)
  if (normalized < 0.5) {
    const g = Math.round(255);
    const r = Math.round(255 * (normalized * 2));
    return `rgb(${r}, ${g}, 0)`;
  } else {
    const r = Math.round(255);
    const g = Math.round(255 * (1 - (normalized - 0.5) * 2));
    return `rgb(${r}, ${g}, 0)`;
  }
};

// Component to fit bounds when session changes
const FitBoundsComponent: React.FC<{ bounds: LatLngBounds }> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, bounds]);

  return null;
};

const SessionMap: React.FC<SessionMapProps> = ({
  session,
  selectedRun,
  onSelectRun,
  height = '400px',
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);

  // Get GPS data
  const latlngData = session.rawData?.latlng;
  const speedData = session.rawData?.speed;
  const timeData = session.rawData?.time;

  // Calculate bounds and speed range
  const { bounds, minSpeed, maxSpeed, segments } = useMemo(() => {
    if (!latlngData || latlngData.length === 0) {
      return { bounds: new LatLngBounds([[0, 0], [0, 0]]), minSpeed: 0, maxSpeed: 30, segments: [] };
    }

    const bounds = new LatLngBounds(latlngData as [number, number][]);

    // Get speed range (convert m/s to km/h)
    const speeds = speedData?.map((s: number) => s * 3.6) || [];
    const validSpeeds = speeds.filter((s: number) => s > 0);
    const minSpeed = validSpeeds.length > 0 ? Math.min(...validSpeeds) : 0;
    const maxSpeed = validSpeeds.length > 0 ? Math.max(...validSpeeds) : 30;

    // Create segments for gradient coloring
    const segments: { positions: [number, number][]; color: string }[] = [];

    if (speeds.length > 0) {
      for (let i = 0; i < latlngData.length - 1; i++) {
        const speed = speeds[i] || 0;
        segments.push({
          positions: [latlngData[i] as [number, number], latlngData[i + 1] as [number, number]],
          color: getSpeedColor(speed, minSpeed, maxSpeed),
        });
      }
    }

    return { bounds, minSpeed, maxSpeed, segments };
  }, [latlngData, speedData]);

  // Get run segments
  const runSegments = useMemo(() => {
    if (!latlngData || !timeData) return [];

    return session.runs.map((run: WingRun) => {
      const startIdx = timeData.findIndex((t: number) => t >= run.startTime);
      const endIdx = timeData.findIndex((t: number) => t >= run.endTime);

      if (startIdx === -1 || endIdx === -1) return null;

      const positions = latlngData.slice(startIdx, endIdx + 1) as [number, number][];
      const isSelected = selectedRun?.id === run.id;

      return {
        run,
        positions,
        isSelected,
        startPos: positions[0],
        endPos: positions[positions.length - 1],
      };
    }).filter(Boolean);
  }, [session.runs, latlngData, timeData, selectedRun]);

  if (!latlngData || latlngData.length === 0) {
    return (
      <div
        className="bg-gray-100 rounded-xl flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        {t('map.noGpsData')}
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height }}>
      <MapContainer
        ref={mapRef}
        center={latlngData[0] as [number, number]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBoundsComponent bounds={bounds} />

        {/* Speed-colored trace */}
        {segments.map((segment: { positions: [number, number][]; color: string }, idx: number) => (
          <Polyline
            key={idx}
            positions={segment.positions}
            pathOptions={{ color: segment.color, weight: 3, opacity: 0.8 }}
          />
        ))}

        {/* Run overlays */}
        {runSegments.map((segment, idx) => segment && (
          <React.Fragment key={idx}>
            {/* Run path highlight */}
            <Polyline
              positions={segment.positions}
              pathOptions={{
                color: segment.isSelected ? '#0d9488' : '#0ea5e9',
                weight: segment.isSelected ? 5 : 3,
                opacity: segment.isSelected ? 1 : 0.6,
              }}
              eventHandlers={{
                click: () => onSelectRun?.(segment.isSelected ? null : segment.run),
              }}
            />

            {/* Start marker */}
            <CircleMarker
              center={segment.startPos}
              radius={6}
              pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1 }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{t('map.run')} {idx + 1}</strong><br/>
                  {t('map.startPoint')}
                </div>
              </Popup>
            </CircleMarker>

            {/* End marker */}
            <CircleMarker
              center={segment.endPos}
              radius={6}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{t('map.run')} {idx + 1}</strong><br/>
                  {t('map.endPoint')}<br/>
                  {formatDuration(segment.run.duration)} | {formatDistance(segment.run.distance)}
                </div>
              </Popup>
            </CircleMarker>
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Speed Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <p className="text-xs font-medium text-gray-700 mb-2">{t('map.speedLegend')}</p>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">{minSpeed.toFixed(0)}</span>
          <div
            className="h-3 w-24 rounded"
            style={{
              background: 'linear-gradient(to right, rgb(0, 255, 0), rgb(255, 255, 0), rgb(255, 0, 0))'
            }}
          />
          <span className="text-xs text-gray-500">{maxSpeed.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

export default SessionMap;
