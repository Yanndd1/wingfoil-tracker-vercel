import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Pencil, Trash2 } from 'lucide-react';
import { MarketplaceListing, ListingStatus } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface ListingDetailProps {
  listing: MarketplaceListing;
  canEdit: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: ListingStatus) => void;
}

const ListingDetail: React.FC<ListingDetailProps> = ({
  listing,
  canEdit,
  onBack,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('common.back')}
      </button>

      {listing.photoUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {listing.photoUrls.map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-video rounded-lg overflow-hidden bg-gray-100"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-xs uppercase tracking-wide text-ocean-600 font-medium">
              {t(`marketplace.categories.${listing.category}`)}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{listing.title}</h2>
            {(listing.brand || listing.model || listing.size) && (
              <p className="text-gray-600 mt-1">
                {[listing.brand, listing.model, listing.size].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <span className="text-3xl font-bold text-ocean-600 flex-shrink-0 ml-4">
            {listing.priceEur.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
          <span className="flex items-center">
            <span className="text-gray-400 mr-1">{t('marketplace.condition')}:</span>
            {t(`marketplace.conditions.${listing.conditionGrade}`)}
          </span>
          {listing.yearPurchased && (
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
              {listing.yearPurchased}
            </span>
          )}
          {listing.city && (
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
              {listing.city}
            </span>
          )}
          <span className="flex items-center">
            <span className="text-gray-400 mr-1">{t('marketplace.statusLabel')}:</span>
            {t(`marketplace.status.${listing.status}`)}
          </span>
        </div>

        {listing.description && (
          <p className="mt-4 text-gray-800 whitespace-pre-wrap">{listing.description}</p>
        )}

        {(listing.contactEmail || listing.contactPhone) && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
            {listing.contactEmail && (
              <a
                href={`mailto:${listing.contactEmail}`}
                className="flex items-center text-ocean-700 hover:underline"
              >
                <Mail className="h-4 w-4 mr-2" />
                {listing.contactEmail}
              </a>
            )}
            {listing.contactPhone && (
              <a
                href={`tel:${listing.contactPhone}`}
                className="flex items-center text-ocean-700 hover:underline"
              >
                <Phone className="h-4 w-4 mr-2" />
                {listing.contactPhone}
              </a>
            )}
          </div>
        )}

        {canEdit && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center space-x-1 text-ocean-600 hover:bg-ocean-50 px-3 py-1.5 rounded text-sm border border-ocean-200"
            >
              <Pencil className="h-4 w-4" />
              <span>{t('common.edit')}</span>
            </button>
            {listing.status === 'active' && (
              <button
                type="button"
                onClick={() => onStatusChange('sold')}
                className="px-3 py-1.5 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200"
              >
                {t('marketplace.markSold')}
              </button>
            )}
            {listing.status === 'sold' && (
              <button
                type="button"
                onClick={() => onStatusChange('active')}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded border border-gray-300"
              >
                {t('marketplace.markActive')}
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center space-x-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-sm border border-red-200 ml-auto"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('common.delete')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
