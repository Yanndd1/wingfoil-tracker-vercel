import React, { useEffect, useState } from 'react';
import { Wind, Droplets, Thermometer, Loader2 } from 'lucide-react';
import { WeatherSnapshot } from '../../types';
import { getSpotWeather, windDirectionLabel } from '../../services/weather';
import { useTranslation } from '../../context/LanguageContext';

interface SpotWeatherWidgetProps {
  lat: number;
  lng: number;
}

const SpotWeatherWidget: React.FC<SpotWeatherWidgetProps> = ({ lat, lng }) => {
  const { t } = useTranslation();
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSpotWeather(lat, lng)
      .then(s => {
        if (!cancelled) setSnapshot(s);
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'fetch error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {t('spots.loadingWeather')}
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <p className="text-sm text-gray-500">{t('spots.weatherUnavailable')}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="flex items-center space-x-2 bg-gray-50 rounded p-2">
        <Thermometer className="h-4 w-4 text-orange-500" />
        <div>
          <p className="text-xs text-gray-500">{t('spots.temperature')}</p>
          <p className="font-semibold">{snapshot.temperatureC.toFixed(1)} °C</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 bg-gray-50 rounded p-2">
        <Wind className="h-4 w-4 text-blue-500" />
        <div>
          <p className="text-xs text-gray-500">{t('spots.wind')}</p>
          <p className="font-semibold">
            {snapshot.windSpeedKmh.toFixed(0)} km/h{' '}
            <span className="text-gray-500">
              {windDirectionLabel(snapshot.windDirectionDeg)}
            </span>
          </p>
        </div>
      </div>
      {snapshot.waveHeightM !== undefined && (
        <div className="col-span-2 flex items-center space-x-2 bg-gray-50 rounded p-2">
          <Droplets className="h-4 w-4 text-teal-500" />
          <div>
            <p className="text-xs text-gray-500">{t('spots.waves')}</p>
            <p className="font-semibold">
              {snapshot.waveHeightM.toFixed(1)} m
              {snapshot.wavePeriodS !== undefined && (
                <> · {snapshot.wavePeriodS.toFixed(0)} s</>
              )}
              {snapshot.waveDirectionDeg !== undefined && (
                <>
                  {' '}
                  <span className="text-gray-500">
                    {windDirectionLabel(snapshot.waveDirectionDeg)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotWeatherWidget;
