import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { WingSession } from '../../types';

interface MiniMapProps {
  session: WingSession;
  width?: string;
  height?: string;
}

// Component to fit bounds
const FitBoundsComponent: React.FC<{ bounds: LatLngBounds }> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [5, 5] });
    }
  }, [map, bounds]);

  return null;
};

const MiniMap: React.FC<MiniMapProps> = ({
  session,
  width = '120px',
  height = '80px',
}) => {
  const latlngData = session.rawData?.latlng;

  const { bounds, positions } = useMemo(() => {
    if (!latlngData || latlngData.length === 0) {
      return {
        bounds: new LatLngBounds([[0, 0], [0, 0]]),
        positions: [] as [number, number][],
      };
    }

    // Simplify the trace for performance (keep every Nth point)
    const simplified: [number, number][] = [];
    const step = Math.max(1, Math.floor(latlngData.length / 50));

    for (let i = 0; i < latlngData.length; i += step) {
      simplified.push(latlngData[i] as [number, number]);
    }

    // Always include the last point
    if (simplified[simplified.length - 1] !== latlngData[latlngData.length - 1]) {
      simplified.push(latlngData[latlngData.length - 1] as [number, number]);
    }

    return {
      bounds: new LatLngBounds(latlngData as [number, number][]),
      positions: simplified,
    };
  }, [latlngData]);

  if (!latlngData || latlngData.length === 0) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ width, height }}
      >
        <span className="text-xs text-gray-400">No GPS</span>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden flex-shrink-0"
      style={{ width, height }}
    >
      <MapContainer
        center={positions[0]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBoundsComponent bounds={bounds} />

        <Polyline
          positions={positions}
          pathOptions={{ color: '#0d9488', weight: 2, opacity: 0.8 }}
        />
      </MapContainer>
    </div>
  );
};

export default MiniMap;
