import React from 'react';
import { Star, Trash2, Pencil } from 'lucide-react';
import { WingfoilSpot } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import SpotWeatherWidget from './SpotWeatherWidget';

interface SpotDetailPanelProps {
  spot: WingfoilSpot;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const SpotDetailPanel: React.FC<SpotDetailPanelProps> = ({
  spot,
  canEdit,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{spot.name}</h3>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(n => (
              <Star
                key={n}
                className={`h-4 w-4 ${
                  n <= spot.stars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {spot.lat.toFixed(5)}, {spot.lng.toFixed(5)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">{t('spots.departureType')}</p>
          <p className="font-medium">{t(`spots.departure.${spot.departureType}`)}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">{t('spots.parkingClose')}</p>
          <p className="font-medium">{spot.parkingClose ? t('common.yes') : t('common.no')}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">{t('spots.otherRiders')}</p>
          <p className="font-medium">{spot.hasOtherRiders ? t('common.yes') : t('common.no')}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">{t('spots.tideDependent')}</p>
          <p className="font-medium">{spot.tideDependent ? t('common.yes') : t('common.no')}</p>
        </div>
        {spot.crowdLevel && (
          <div className="bg-gray-50 rounded p-2 col-span-2">
            <p className="text-xs text-gray-500">{t('spots.crowdLevel')}</p>
            <p className="font-medium">{t(`spots.crowd.${spot.crowdLevel}`)}</p>
          </div>
        )}
      </div>

      {(spot.optimalWindDirections.length > 0 ||
        spot.minWindKnots !== undefined ||
        spot.maxWindKnots !== undefined) && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            {t('spots.wind')}
          </p>
          {spot.optimalWindDirections.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {spot.optimalWindDirections.map(d => (
                <span
                  key={d}
                  className="text-xs bg-ocean-100 text-ocean-700 rounded px-2 py-0.5"
                >
                  {d}
                </span>
              ))}
            </div>
          )}
          {(spot.minWindKnots !== undefined || spot.maxWindKnots !== undefined) && (
            <p className="text-sm text-gray-700">
              {spot.minWindKnots ?? '?'} – {spot.maxWindKnots ?? '?'} kts
            </p>
          )}
        </div>
      )}

      {spot.risks && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {t('spots.risks')}
          </p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{spot.risks}</p>
        </div>
      )}

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
          {t('spots.weatherNow')}
        </p>
        <SpotWeatherWidget lat={spot.lat} lng={spot.lng} />
      </div>

      {canEdit && (
        <div className="flex space-x-2 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center space-x-1 text-ocean-600 hover:bg-ocean-50 px-3 py-1.5 rounded text-sm"
          >
            <Pencil className="h-4 w-4" />
            <span>{t('common.edit')}</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center space-x-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('common.delete')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SpotDetailPanel;
