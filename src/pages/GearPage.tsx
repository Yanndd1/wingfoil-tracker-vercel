import React, { useEffect, useMemo, useState } from 'react';
import { Package, Plus, Store } from 'lucide-react';
import Layout from '../components/layout/Layout';
import GearList from '../components/gear/GearList';
import GearForm from '../components/gear/GearForm';
import ShopsDirectory from '../components/gear/ShopsDirectory';
import {
  listGear,
  saveGearItem,
  deleteGearItem,
  newGearId,
} from '../components/gear/gearStorage';
import { GearItem } from '../types';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';

type FormMode =
  | { kind: 'idle' }
  | { kind: 'creating' }
  | { kind: 'editing'; item: GearItem };

// Default centre when the user has no Strava sessions yet — Paris.
const DEFAULT_CENTRE: [number, number] = [48.8566, 2.3522];

const GearPage: React.FC = () => {
  const { t } = useTranslation();
  const { sessions } = useData();
  const [items, setItems] = useState<GearItem[]>([]);
  const [mode, setMode] = useState<FormMode>({ kind: 'idle' });

  useEffect(() => {
    setItems(listGear());
  }, []);

  // Use the most recent session's start position to bias the shops search.
  // Falls back to Paris when nothing is available.
  const centre = useMemo<[number, number]>(() => {
    for (const session of sessions) {
      if (session.excluded) continue;
      const first = session.runs[0]?.startPosition ?? session.rawData?.latlng?.[0];
      if (first) return first;
    }
    return DEFAULT_CENTRE;
  }, [sessions]);

  const handleSave = (item: GearItem) => {
    saveGearItem(item);
    setItems(listGear());
    setMode({ kind: 'idle' });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t('gear.confirmDelete'))) return;
    deleteGearItem(id);
    setItems(listGear());
  };

  const startCreate = () => {
    setMode({ kind: 'creating' });
  };

  const startEdit = (item: GearItem) => {
    setMode({ kind: 'editing', item });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="h-6 w-6 text-ocean-600 mr-2" />
            {t('gear.title')}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t('gear.subtitle')}</p>
        </div>

        {/* Personal gear */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('gear.myGear')}</h2>
            {mode.kind === 'idle' && (
              <button
                onClick={startCreate}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{t('gear.add')}</span>
              </button>
            )}
          </div>

          {mode.kind === 'creating' && (
            <GearForm
              initial={{
                id: newGearId(),
                category: 'board',
                brand: '',
                model: '',
                createdAt: new Date().toISOString(),
              }}
              onSubmit={handleSave}
              onCancel={() => setMode({ kind: 'idle' })}
            />
          )}

          {mode.kind === 'editing' && (
            <GearForm
              initial={mode.item}
              onSubmit={handleSave}
              onCancel={() => setMode({ kind: 'idle' })}
            />
          )}

          {mode.kind === 'idle' && (
            <GearList items={items} onEdit={startEdit} onDelete={handleDelete} />
          )}
        </div>

        {/* Shops directory */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-1">
            <Store className="h-5 w-5 text-ocean-600 mr-2" />
            {t('gear.localShops')}
          </h2>
          <p className="text-xs text-gray-500 mb-4">{t('gear.localShopsHelp')}</p>
          <ShopsDirectory lat={centre[0]} lng={centre[1]} />
        </div>
      </div>
    </Layout>
  );
};

export default GearPage;
