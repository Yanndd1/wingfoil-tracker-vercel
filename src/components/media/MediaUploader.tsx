import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { addMedia } from './mediaStorage';
import { SessionMediaMeta } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface MediaUploaderProps {
  sessionId: string;
  onAdded: (media: SessionMediaMeta) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ sessionId, onAdded }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);
    setWarning(null);
    try {
      for (const file of Array.from(files)) {
        const result = await addMedia(sessionId, file);
        onAdded(result.media);
        if (result.warning) setWarning(result.warning);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'upload failed';
      // Quota exceeded raises QuotaExceededError on most browsers — message it.
      setError(`${t('media.uploadError')}: ${message}`);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center space-x-2 border border-dashed border-ocean-400 text-ocean-700 hover:bg-ocean-50 px-4 py-3 rounded-lg w-full justify-center transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span>{isUploading ? t('media.uploading') : t('media.addMedia')}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      {error && (
        <p className="mt-2 text-sm text-red-700 bg-red-50 rounded p-2">{error}</p>
      )}
      {warning && (
        <p className="mt-2 text-sm text-amber-700 bg-amber-50 rounded p-2">
          {warning}
        </p>
      )}
    </div>
  );
};

export default MediaUploader;
