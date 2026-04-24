import React, { useEffect, useState } from 'react';
import { Phone, Globe, MapPin, Loader2 } from 'lucide-react';
import { Shop } from '../../types';
import { listShopsNear } from '../../services/api';
import { useTranslation } from '../../context/LanguageContext';

interface ShopsDirectoryProps {
  // Centre point used to search nearby shops. Defaults to Paris if the
  // user has no Strava sessions yet.
  lat: number;
  lng: number;
  radiusKm?: number;
}

const ShopsDirectory: React.FC<ShopsDirectoryProps> = ({
  lat,
  lng,
  radiusKm = 50,
}) => {
  const { t } = useTranslation();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listShopsNear(lat, lng, radiusKm)
      .then(s => !cancelled && setShops(s))
      .catch(e => !cancelled && setError(e instanceof Error ? e.message : 'load error'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [lat, lng, radiusKm]);

  if (loading) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {t('gear.loadingShops')}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-700 bg-red-50 rounded p-2">{error}</p>
    );
  }

  if (shops.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">{t('gear.noShops')}</p>
    );
  }

  return (
    <div className="space-y-2">
      {shops.map(shop => (
        <div key={shop.id} className="bg-gray-50 rounded-lg p-3">
          <p className="font-semibold text-gray-900">{shop.name}</p>
          {shop.address && (
            <p className="text-sm text-gray-600 flex items-start mt-1">
              <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
              {shop.address}
            </p>
          )}
          <div className="flex items-center space-x-3 mt-2 text-sm">
            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="flex items-center text-ocean-700 hover:underline"
              >
                <Phone className="h-3 w-3 mr-1" />
                {shop.phone}
              </a>
            )}
            {shop.website && (
              <a
                href={shop.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-ocean-700 hover:underline"
              >
                <Globe className="h-3 w-3 mr-1" />
                {t('gear.website')}
              </a>
            )}
          </div>
          {shop.services.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {shop.services.map(service => (
                <span
                  key={service}
                  className="text-xs bg-ocean-100 text-ocean-700 rounded-full px-2 py-0.5"
                >
                  {t(`gear.services.${service}`)}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ShopsDirectory;
