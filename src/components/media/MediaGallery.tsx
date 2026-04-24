import React, { useEffect, useState } from 'react';
import { Trash2, Film, Image as ImageIcon } from 'lucide-react';
import { SessionMediaMeta } from '../../types';
import { deleteMedia, getMediaObjectUrl } from './mediaStorage';
import { useTranslation } from '../../context/LanguageContext';

interface MediaGalleryProps {
  media: SessionMediaMeta[];
  onDeleted: (id: string) => void;
}

interface ResolvedMedia extends SessionMediaMeta {
  url: string | null;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, onDeleted }) => {
  const { t } = useTranslation();
  const [resolved, setResolved] = useState<ResolvedMedia[]>([]);

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    (async () => {
      const items = await Promise.all(
        media.map(async m => {
          const url = await getMediaObjectUrl(m.id);
          if (url) urls.push(url);
          return { ...m, url };
        })
      );
      if (!cancelled) setResolved(items);
    })();
    return () => {
      cancelled = true;
      // Revoke object URLs created in the previous render — prevents leaking
      // the underlying Blobs in long-lived sessions.
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [media]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('media.confirmDelete'))) return;
    await deleteMedia(id);
    onDeleted(id);
  };

  if (resolved.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">{t('media.noMediaYet')}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {resolved.map(item => (
        <div
          key={item.id}
          className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video"
        >
          {item.url && item.kind === 'photo' && (
            <img
              src={item.url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {item.url && item.kind === 'video' && (
            <video
              src={item.url}
              controls
              preload="metadata"
              className="w-full h-full object-cover"
            />
          )}
          {!item.url && (
            <div className="flex items-center justify-center h-full text-gray-400">
              {item.kind === 'video' ? (
                <Film className="h-6 w-6" />
              ) : (
                <ImageIcon className="h-6 w-6" />
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={t('media.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
            {(item.sizeBytes / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;
