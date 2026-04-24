import React, { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  CircleMarker,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WingfoilSpot } from '../../types';

// Fix the default Leaflet icon path so markers don't 404 in Vite builds.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface SpotsMapProps {
  spots: WingfoilSpot[];
  // Pre-existing positions extracted from the user's Strava history. Shown
  // as faded blue dots to suggest "you've been here, want to add a spot?".
  stravaSeedPositions?: [number, number][];
  selectedSpotId: number | null;
  onSelectSpot: (id: number | null) => void;
  onMapClick: (lat: number, lng: number) => void;
}

function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FitBounds({
  spots,
  seeds,
}: {
  spots: WingfoilSpot[];
  seeds: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    const allPoints: [number, number][] = [
      ...spots.map(s => [s.lat, s.lng] as [number, number]),
      ...seeds,
    ];
    if (allPoints.length === 0) return;
    if (allPoints.length === 1) {
      map.setView(allPoints[0], 11);
      return;
    }
    const bounds = L.latLngBounds(allPoints);
    // Only zoom in if the bounding box is reasonably tight (<500 km diagonal).
    // Otherwise the world view is more useful (the user has very scattered
    // sessions).
    const distanceKm =
      bounds.getNorthEast().distanceTo(bounds.getSouthWest()) / 1000;
    if (distanceKm < 500) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [map, spots, seeds]);
  return null;
}

function starColor(stars: number): string {
  if (stars >= 5) return '#16a34a'; // green-600
  if (stars >= 4) return '#0d9488'; // ocean-600
  if (stars >= 3) return '#0284c7'; // sky-600
  if (stars >= 2) return '#a16207'; // yellow-700
  return '#9ca3af'; // gray-400
}

function makeStarIcon(stars: number): L.DivIcon {
  const color = starColor(stars);
  return L.divIcon({
    className: 'pumpfoil-spot-marker',
    html: `<div style="background:${color};color:white;border:2px solid white;border-radius:9999px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;box-shadow:0 1px 3px rgba(0,0,0,0.3);">${stars}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

const SpotsMap: React.FC<SpotsMapProps> = ({
  spots,
  stravaSeedPositions = [],
  selectedSpotId,
  onSelectSpot,
  onMapClick,
}) => {
  const seeds = useMemo(() => stravaSeedPositions.slice(0, 200), [stravaSeedPositions]);

  return (
    <MapContainer
      // World view by default — `FitBounds` will tighten if relevant.
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom
      className="h-full w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={onMapClick} />
      <FitBounds spots={spots} seeds={seeds} />

      {/* Strava-derived seed positions — translucent so they don't compete
          with real spots visually. Clicking one opens the create form via
          the parent (treated as a normal map click). */}
      {seeds.map(([lat, lng], idx) => (
        <CircleMarker
          key={`seed_${idx}`}
          center={[lat, lng]}
          radius={5}
          pathOptions={{ color: '#60a5fa', fillColor: '#60a5fa', fillOpacity: 0.5, weight: 1 }}
          eventHandlers={{ click: () => onMapClick(lat, lng) }}
        />
      ))}

      {spots.map(spot => (
        <Marker
          key={spot.id}
          position={[spot.lat, spot.lng]}
          icon={makeStarIcon(spot.stars)}
          eventHandlers={{
            click: () => onSelectSpot(spot.id === selectedSpotId ? null : spot.id),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{spot.name}</p>
              <p className="text-xs text-gray-500">{spot.stars}★ — {spot.departureType}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default SpotsMap;
