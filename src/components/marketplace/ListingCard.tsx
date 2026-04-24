import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { MarketplaceListing } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface ListingCardProps {
  listing: MarketplaceListing;
  onSelect: (id: number) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect }) => {
  const { t } = useTranslation();
  const cover = listing.photoUrls[0];

  return (
    <button
      type="button"
      onClick={() => onSelect(listing.id)}
      className="text-left bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-ocean-300 overflow-hidden transition-all"
    >
      <div className="aspect-video bg-gray-100 relative">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            {t('marketplace.noPhoto')}
          </div>
        )}
        {listing.status !== 'active' && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs uppercase tracking-wide px-2 py-0.5 rounded">
            {t(`marketplace.status.${listing.status}`)}
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <span className="text-xs uppercase tracking-wide text-ocean-600 font-medium">
            {t(`marketplace.categories.${listing.category}`)}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {listing.priceEur.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
        {(listing.brand || listing.model || listing.size) && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
            {[listing.brand, listing.model, listing.size].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          {listing.city && (
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {listing.city}
            </span>
          )}
          {listing.yearPurchased && (
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {listing.yearPurchased}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ListingCard;
