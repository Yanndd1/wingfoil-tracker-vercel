import React, { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import {
  ListingDraft,
  ListingCategory,
  ListingCondition,
} from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface ListingFormProps {
  initial: ListingDraft;
  onSubmit: (draft: ListingDraft) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const CATEGORIES: ListingCategory[] = [
  'board',
  'foil',
  'wing',
  'wetsuit',
  'leash',
  'accessory',
  'complete_setup',
  'other',
];

const CONDITIONS: ListingCondition[] = ['new', 'as_new', 'good', 'fair', 'for_parts'];

const ListingForm: React.FC<ListingFormProps> = ({
  initial,
  onSubmit,
  onCancel,
  submitting,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<ListingDraft>(initial);
  const [photoInput, setPhotoInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const addPhoto = () => {
    const url = photoInput.trim();
    if (!url) return;
    try {
      // eslint-disable-next-line no-new
      new URL(url);
    } catch {
      setError(t('marketplace.invalidPhotoUrl'));
      return;
    }
    if ((draft.photoUrls ?? []).length >= 5) {
      setError(t('marketplace.maxFivePhotos'));
      return;
    }
    setError(null);
    update('photoUrls', [...(draft.photoUrls ?? []), url]);
    setPhotoInput('');
  };

  const removePhoto = (idx: number) => {
    update(
      'photoUrls',
      (draft.photoUrls ?? []).filter((_, i) => i !== idx)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!draft.title.trim()) {
      setError(t('marketplace.titleRequired'));
      return;
    }
    if (draft.priceEur < 0) {
      setError(t('marketplace.priceInvalid'));
      return;
    }
    try {
      await onSubmit({
        ...draft,
        title: draft.title.trim(),
        brand: draft.brand?.trim(),
        model: draft.model?.trim(),
        description: draft.description?.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('marketplace.category')}
          </label>
          <select
            value={draft.category}
            onChange={e => update('category', e.target.value as ListingCategory)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {t(`marketplace.categories.${c}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('marketplace.condition')}
          </label>
          <select
            value={draft.conditionGrade}
            onChange={e => update('conditionGrade', e.target.value as ListingCondition)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            {CONDITIONS.map(c => (
              <option key={c} value={c}>
                {t(`marketplace.conditions.${c}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('marketplace.titleField')}
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={e => update('title', e.target.value)}
          maxLength={140}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('marketplace.brand')}
          </label>
          <input
            type="text"
            value={draft.brand ?? ''}
            onChange={e => update('brand', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('marketplace.model')}
          </label>
          <input
            type="text"
            value={draft.model ?? ''}
            onChange={e => update('model', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('marketplace.size')}
          </label>
          <input
            type="text"
            value={draft.size ?? ''}
            onChange={e => update('size', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('marketplace.year')}
          </label>
          <input
            type="number"
            min="1990"
            max="2099"
            value={draft.yearPurchased ?? ''}
            onChange={e =>
              update('yearPurchased', e.target.value === '' ? undefined : parseInt(e.target.value, 10))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('marketplace.price')} (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.priceEur}
            onChange={e => update('priceEur', parseFloat(e.target.value) || 0)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('marketplace.description')}
        </label>
        <textarea
          rows={3}
          value={draft.description ?? ''}
          onChange={e => update('description', e.target.value)}
          maxLength={2000}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('marketplace.photoUrls')}
        </label>
        <p className="text-xs text-gray-500 mb-2">{t('marketplace.photoHint')}</p>
        <div className="flex space-x-2 mb-2">
          <input
            type="url"
            value={photoInput}
            onChange={e => setPhotoInput(e.target.value)}
            placeholder="https://i.imgur.com/abc.jpg"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          />
          <button
            type="button"
            onClick={addPhoto}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('common.add')}
          </button>
        </div>
        {(draft.photoUrls ?? []).length > 0 && (
          <ul className="space-y-1">
            {(draft.photoUrls ?? []).map((url, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm"
              >
                <span className="truncate flex-1 mr-2">{url}</span>
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('marketplace.city')}
          </label>
          <input
            type="text"
            value={draft.city ?? ''}
            onChange={e => update('city', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('marketplace.contactEmail')}
          </label>
          <input
            type="email"
            value={draft.contactEmail ?? ''}
            onChange={e => update('contactEmail', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('marketplace.contactPhone')}
          </label>
          <input
            type="tel"
            value={draft.contactPhone ?? ''}
            onChange={e => update('contactPhone', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded p-2">{error}</p>
      )}

      <div className="flex space-x-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{submitting ? t('common.saving') : t('common.save')}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex items-center space-x-2"
        >
          <X className="h-4 w-4" />
          <span>{t('common.cancel')}</span>
        </button>
      </div>
    </form>
  );
};

export default ListingForm;
