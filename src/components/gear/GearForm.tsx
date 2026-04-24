import React, { useState, useMemo } from 'react';
import { Save, X } from 'lucide-react';
import { GearItem, GearCategory } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { GEAR_CATALOG, catalogKeyFor } from './gearCatalog';

interface GearFormProps {
  initial: GearItem;
  onSubmit: (item: GearItem) => void;
  onCancel: () => void;
}

const CATEGORIES: GearCategory[] = [
  'board',
  'frontwing',
  'stab',
  'fuselage',
  'mast',
  'wing',
  'leash',
  'wetsuit',
  'accessory',
  'other',
];

const GearForm: React.FC<GearFormProps> = ({ initial, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<GearItem>(initial);

  const update = <K extends keyof GearItem>(key: K, value: GearItem[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  // v2: when the chosen category has a known catalog (board, frontwing,
  // stab, fuselage, mast, wing, leash, wetsuit), surface dropdowns of
  // brands → models → sizes. Custom values stay possible via the "Other"
  // option in each dropdown.
  const catalogKey = catalogKeyFor(draft.category);
  const catalog = catalogKey ? GEAR_CATALOG[catalogKey] : undefined;
  const brands = catalog ? Object.keys(catalog) : [];

  const models = useMemo<string[]>(() => {
    if (!catalog || !draft.brand) return [];
    const brandModels = (catalog as Record<string, Record<string, readonly string[]>>)[draft.brand];
    return brandModels ? Object.keys(brandModels) : [];
  }, [catalog, draft.brand]);

  const sizes = useMemo<readonly string[]>(() => {
    if (!catalog || !draft.brand || !draft.model) return [];
    const brandModels = (catalog as Record<string, Record<string, readonly string[]>>)[draft.brand];
    return brandModels?.[draft.model] ?? [];
  }, [catalog, draft.brand, draft.model]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...draft,
      brand: draft.brand?.trim() ?? '',
      model: draft.model?.trim() ?? '',
    });
  };

  // The "free text" sentinel value used in dropdowns. When picked, the
  // corresponding text input is shown so the user can type a custom value.
  const OTHER = '__other__';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('gear.category')}
        </label>
        <select
          value={draft.category}
          onChange={e => {
            // Resetting brand/model/size when the category changes avoids
            // stale combinations like "Armstrong frontwing 5'2 / 60L".
            const next = e.target.value as GearCategory;
            setDraft(prev => ({ ...prev, category: next, brand: '', model: '', size: '' }));
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ocean-500"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {t(`gear.categories.${c}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Brand: dropdown if catalog known, else free text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('gear.brand')}
          </label>
          {brands.length > 0 ? (
            <>
              <select
                value={
                  draft.brand && brands.includes(draft.brand)
                    ? draft.brand
                    : draft.brand
                    ? OTHER
                    : ''
                }
                onChange={e => {
                  const v = e.target.value;
                  if (v === OTHER) {
                    update('brand', '');
                  } else {
                    setDraft(prev => ({ ...prev, brand: v, model: '', size: '' }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">{t('gear.selectBrand')}</option>
                {brands.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value={OTHER}>{t('gear.otherBrand')}</option>
              </select>
              {draft.brand && !brands.includes(draft.brand) && (
                <input
                  type="text"
                  value={draft.brand}
                  onChange={e => update('brand', e.target.value)}
                  placeholder={t('gear.customBrandPlaceholder')}
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              )}
            </>
          ) : (
            <input
              type="text"
              value={draft.brand}
              onChange={e => update('brand', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          )}
        </div>

        {/* Model: dropdown if a known brand is selected */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('gear.model')}
          </label>
          {models.length > 0 ? (
            <>
              <select
                value={
                  draft.model && models.includes(draft.model)
                    ? draft.model
                    : draft.model
                    ? OTHER
                    : ''
                }
                onChange={e => {
                  const v = e.target.value;
                  if (v === OTHER) {
                    update('model', '');
                  } else {
                    setDraft(prev => ({ ...prev, model: v, size: '' }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">{t('gear.selectModel')}</option>
                {models.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                <option value={OTHER}>{t('gear.otherModel')}</option>
              </select>
              {draft.model && !models.includes(draft.model) && (
                <input
                  type="text"
                  value={draft.model}
                  onChange={e => update('model', e.target.value)}
                  placeholder={t('gear.customModelPlaceholder')}
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              )}
            </>
          ) : (
            <input
              type="text"
              value={draft.model}
              onChange={e => update('model', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Size: dropdown if a known model is selected */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('gear.size')}
          </label>
          {sizes.length > 0 ? (
            <>
              <select
                value={
                  draft.size && sizes.includes(draft.size)
                    ? draft.size
                    : draft.size
                    ? OTHER
                    : ''
                }
                onChange={e => {
                  const v = e.target.value;
                  if (v === OTHER) {
                    update('size', '');
                  } else {
                    update('size', v);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">{t('gear.selectSize')}</option>
                {sizes.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value={OTHER}>{t('gear.otherSize')}</option>
              </select>
              {draft.size && !sizes.includes(draft.size) && (
                <input
                  type="text"
                  value={draft.size}
                  onChange={e => update('size', e.target.value)}
                  placeholder={t('gear.sizePlaceholder')}
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              )}
            </>
          ) : (
            <input
              type="text"
              value={draft.size ?? ''}
              onChange={e => update('size', e.target.value)}
              placeholder={t('gear.sizePlaceholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('gear.purchaseDate')}
          </label>
          <input
            type="date"
            value={draft.purchaseDate ?? ''}
            onChange={e => update('purchaseDate', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('gear.notes')}
        </label>
        <textarea
          rows={2}
          value={draft.notes ?? ''}
          onChange={e => update('notes', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div className="flex space-x-2">
        <button type="submit" className="btn-primary flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{t('common.save')}</span>
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

export default GearForm;
