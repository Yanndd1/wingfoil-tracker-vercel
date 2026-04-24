import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { GearItem } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface GearListProps {
  items: GearItem[];
  onEdit: (item: GearItem) => void;
  onDelete: (id: string) => void;
}

const GearList: React.FC<GearListProps> = ({ items, onEdit, onDelete }) => {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">{t('gear.empty')}</p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div
          key={item.id}
          className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline space-x-2">
              <span className="text-xs uppercase tracking-wide text-ocean-600 font-medium">
                {t(`gear.categories.${item.category}`)}
              </span>
              {item.size && (
                <span className="text-xs text-gray-500">· {item.size}</span>
              )}
            </div>
            <p className="font-semibold text-gray-900 truncate">
              {item.brand} {item.model}
            </p>
            {item.notes && (
              <p className="text-xs text-gray-500 truncate">{item.notes}</p>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-2 text-gray-500 hover:text-ocean-600 hover:bg-ocean-50 rounded"
              aria-label={t('common.edit')}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
              aria-label={t('common.delete')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GearList;
