import React, { useState } from 'react';
import { Save, X, Star } from 'lucide-react';
import { SpotDraft, SpotDepartureType, CrowdLevel } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface SpotFormProps {
  initial: SpotDraft;
  onSubmit: (draft: SpotDraft) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const DEPARTURE_TYPES: SpotDepartureType[] = ['ponton', 'rocher', 'plage', 'autre'];
const CROWD_LEVELS: CrowdLevel[] = ['low', 'medium', 'high'];

// 16-point compass — wing-friendly. Most wing spots care about a span of
// 2-3 adjacent bearings, hence multi-select with chips.
const WIND_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW',
];

const SpotForm: React.FC<SpotFormProps> = ({ initial, onSubmit, onCancel, submitting }) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<SpotDraft>(initial);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof SpotDraft>(key: K, value: SpotDraft[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const toggleDirection = (dir: string) => {
    setDraft(prev => {
      const current = prev.optimalWindDirections ?? [];
      const next = current.includes(dir)
        ? current.filter(d => d !== dir)
        : [...current, dir];
      return { ...prev, optimalWindDirections: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!draft.name.trim()) {
      setError(t('spots.nameRequired'));
      return;
    }
    try {
      await onSubmit({
        ...draft,
        name: draft.name.trim(),
        risks: draft.risks?.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xs text-gray-500">
        {t('spots.coordinates')}: {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('spots.spotName')}
        </label>
        <input
          type="text"
          value={draft.name}
          onChange={e => update('name', e.target.value)}
          maxLength={120}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('spots.stars')}
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              type="button"
              key={n}
              onClick={() => update('stars', n)}
              className="p-1"
              aria-label={`${n} stars`}
            >
              <Star
                className={`h-6 w-6 ${
                  n <= draft.stars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('spots.departureType')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {DEPARTURE_TYPES.map(type => (
            <button
              type="button"
              key={type}
              onClick={() => update('departureType', type)}
              className={`px-3 py-2 rounded-lg text-sm border ${
                draft.departureType === type
                  ? 'bg-ocean-600 text-white border-ocean-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t(`spots.departure.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {/* v2 wing-specific: optimal wind directions (multi-select chips) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('spots.optimalWindDirections')}
        </label>
        <div className="grid grid-cols-8 gap-1">
          {WIND_DIRECTIONS.map(dir => {
            const active = draft.optimalWindDirections?.includes(dir);
            return (
              <button
                type="button"
                key={dir}
                onClick={() => toggleDirection(dir)}
                className={`px-1 py-1 text-xs rounded border ${
                  active
                    ? 'bg-ocean-600 text-white border-ocean-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {dir}
              </button>
            );
          })}
        </div>
      </div>

      {/* v2 wing-specific: usable wind range in knots */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('spots.windRange')}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            max="60"
            value={draft.minWindKnots ?? ''}
            onChange={e =>
              update('minWindKnots', e.target.value === '' ? undefined : parseInt(e.target.value, 10))
            }
            placeholder="min"
            className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-sm"
          />
          <span className="text-gray-500">→</span>
          <input
            type="number"
            min="0"
            max="60"
            value={draft.maxWindKnots ?? ''}
            onChange={e =>
              update('maxWindKnots', e.target.value === '' ? undefined : parseInt(e.target.value, 10))
            }
            placeholder="max"
            className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-sm"
          />
          <span className="text-sm text-gray-500">kts</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={draft.hasOtherRiders}
            onChange={e => update('hasOtherRiders', e.target.checked)}
            className="rounded text-ocean-600 focus:ring-ocean-500"
          />
          <span className="text-sm">{t('spots.otherRiders')}</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={draft.parkingClose}
            onChange={e => update('parkingClose', e.target.checked)}
            className="rounded text-ocean-600 focus:ring-ocean-500"
          />
          <span className="text-sm">{t('spots.parkingClose')}</span>
        </label>
        <label className="flex items-center space-x-2 col-span-2">
          <input
            type="checkbox"
            checked={draft.tideDependent}
            onChange={e => update('tideDependent', e.target.checked)}
            className="rounded text-ocean-600 focus:ring-ocean-500"
          />
          <span className="text-sm">{t('spots.tideDependent')}</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('spots.crowdLevel')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CROWD_LEVELS.map(level => (
            <button
              type="button"
              key={level}
              onClick={() => update('crowdLevel', level)}
              className={`px-3 py-2 rounded-lg text-sm border ${
                draft.crowdLevel === level
                  ? 'bg-ocean-600 text-white border-ocean-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t(`spots.crowd.${level}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('spots.risks')}
        </label>
        <textarea
          rows={3}
          value={draft.risks ?? ''}
          onChange={e => update('risks', e.target.value)}
          maxLength={500}
          placeholder={t('spots.risksPlaceholder')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
        />
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded p-2">{error}</p>
      )}

      <div className="flex space-x-2 pt-2">
        <button type="submit" disabled={submitting} className="btn-primary flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{submitting ? t('common.saving') : t('common.save')}</span>
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex items-center space-x-2">
          <X className="h-4 w-4" />
          <span>{t('common.cancel')}</span>
        </button>
      </div>
    </form>
  );
};

export default SpotForm;
