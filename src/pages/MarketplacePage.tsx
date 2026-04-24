import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingBag, Plus, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import ListingCard from '../components/marketplace/ListingCard';
import ListingForm from '../components/marketplace/ListingForm';
import ListingDetail from '../components/marketplace/ListingDetail';
import {
  MarketplaceListing,
  ListingDraft,
  ListingCategory,
  ListingStatus,
} from '../types';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

type View =
  | { kind: 'browse' }
  | { kind: 'creating' }
  | { kind: 'detail'; id: number }
  | { kind: 'editing'; listing: MarketplaceListing };

const CATEGORIES: (ListingCategory | 'all')[] = [
  'all',
  'board',
  'foil',
  'wing',
  'wetsuit',
  'leash',
  'accessory',
  'complete_setup',
  'other',
];

const MarketplacePage: React.FC = () => {
  const { athlete } = useAuth();
  const { t } = useTranslation();

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<View>({ kind: 'browse' });
  const [filter, setFilter] = useState<ListingCategory | 'all'>('all');
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await api.listListings();
      setListings(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'load error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (filter !== 'all' && l.category !== filter) return false;
      if (showOnlyMine && athlete && l.ownerStravaId !== athlete.id) return false;
      return true;
    });
  }, [listings, filter, showOnlyMine, athlete]);

  const detailListing =
    view.kind === 'detail' ? listings.find(l => l.id === view.id) ?? null : null;
  const canEditDetail =
    !!athlete && !!detailListing && detailListing.ownerStravaId === athlete.id;

  const blankDraft: ListingDraft = {
    category: 'board',
    title: '',
    conditionGrade: 'good',
    priceEur: 0,
    photoUrls: [],
    contactEmail: athlete ? undefined : undefined,
  };

  const handleCreate = async (draft: ListingDraft) => {
    setSubmitting(true);
    try {
      const created = await api.createListing(draft);
      setListings(prev => [created, ...prev]);
      setView({ kind: 'detail', id: created.id });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (draft: ListingDraft) => {
    if (view.kind !== 'editing') return;
    setSubmitting(true);
    try {
      const updated = await api.updateListing(view.listing.id, draft);
      setListings(prev => prev.map(l => (l.id === updated.id ? updated : l)));
      setView({ kind: 'detail', id: updated.id });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (view.kind !== 'detail') return;
    if (!confirm(t('marketplace.confirmDelete'))) return;
    await api.deleteListing(view.id);
    setListings(prev => prev.filter(l => l.id !== view.id));
    setView({ kind: 'browse' });
  };

  const handleStatusChange = async (status: ListingStatus) => {
    if (view.kind !== 'detail') return;
    const updated = await api.setListingStatus(view.id, status);
    setListings(prev => prev.map(l => (l.id === updated.id ? updated : l)));
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingBag className="h-6 w-6 text-ocean-600 mr-2" />
              {t('marketplace.title')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">{t('marketplace.subtitle')}</p>
          </div>
          {view.kind === 'browse' && athlete && (
            <button
              onClick={() => setView({ kind: 'creating' })}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{t('marketplace.newListing')}</span>
            </button>
          )}
        </div>

        {view.kind === 'browse' && (
          <>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as ListingCategory | 'all')}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c === 'all'
                      ? t('marketplace.allCategories')
                      : t(`marketplace.categories.${c}`)}
                  </option>
                ))}
              </select>
              {athlete && (
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showOnlyMine}
                    onChange={e => setShowOnlyMine(e.target.checked)}
                    className="rounded text-ocean-600"
                  />
                  <span>{t('marketplace.onlyMine')}</span>
                </label>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</p>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {t('marketplace.loading')}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-8 text-center">
                {t('marketplace.empty')}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(l => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    onSelect={id => setView({ kind: 'detail', id })}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {view.kind === 'creating' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">{t('marketplace.newListing')}</h2>
            <ListingForm
              initial={blankDraft}
              onSubmit={handleCreate}
              onCancel={() => setView({ kind: 'browse' })}
              submitting={submitting}
            />
          </div>
        )}

        {view.kind === 'editing' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">{t('marketplace.editListing')}</h2>
            <ListingForm
              initial={{
                category: view.listing.category,
                title: view.listing.title,
                brand: view.listing.brand ?? undefined,
                model: view.listing.model ?? undefined,
                size: view.listing.size ?? undefined,
                conditionGrade: view.listing.conditionGrade,
                yearPurchased: view.listing.yearPurchased ?? undefined,
                priceEur: view.listing.priceEur,
                description: view.listing.description ?? undefined,
                photoUrls: view.listing.photoUrls,
                contactEmail: view.listing.contactEmail ?? undefined,
                contactPhone: view.listing.contactPhone ?? undefined,
                city: view.listing.city ?? undefined,
                lat: view.listing.lat ?? undefined,
                lng: view.listing.lng ?? undefined,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setView({ kind: 'detail', id: view.listing.id })}
              submitting={submitting}
            />
          </div>
        )}

        {view.kind === 'detail' && detailListing && (
          <ListingDetail
            listing={detailListing}
            canEdit={canEditDetail}
            onBack={() => setView({ kind: 'browse' })}
            onEdit={() => setView({ kind: 'editing', listing: detailListing })}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </Layout>
  );
};

export default MarketplacePage;
