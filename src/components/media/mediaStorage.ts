import { SessionMediaMeta, MediaKind } from '../../types';

/**
 * IndexedDB wrapper for session media (photos + videos).
 *
 * Why IndexedDB: localStorage cannot hold binary blobs above ~5 MB and a
 * single video easily exceeds that. IndexedDB lets us persist tens of MB
 * client-side without an upload server.
 *
 * Storage layout:
 *   DB:    pumpfoil_media (v1)
 *   Store: media — keyPath `id`, indexed by `sessionId` + `createdAt`
 *
 * The exported `exportMediaForAnalysis` returns the raw Blob — wired now so
 * the future posture-analysis IA workflow (v3) can hit it without changing
 * the storage layout.
 */

const DB_NAME = 'pumpfoil_media';
const DB_VERSION = 1;
const STORE = 'media';

interface MediaRecord extends SessionMediaMeta {
  blob: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('bySession', 'sessionId', { unique: false });
        store.createIndex('byCreatedAt', 'createdAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    db =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const store = transaction.objectStore(STORE);
        const request = run(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

function uuid(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const PHOTO_MAX_DIMENSION = 1920;
const PHOTO_QUALITY = 0.82;
const VIDEO_WARN_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Compress a photo to a max dimension + JPEG quality so IndexedDB stays
 * usable. Originals can be huge (10+ MB from a phone camera) — most photos
 * end up under 500 KB after this.
 */
async function compressPhoto(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, PHOTO_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('canvas.toBlob returned null'))),
      'image/jpeg',
      PHOTO_QUALITY
    )
  );
  bitmap.close();
  return { blob, width, height };
}

async function probeVideo(file: File): Promise<{ width: number; height: number; durationSeconds: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const meta = {
        width: video.videoWidth,
        height: video.videoHeight,
        durationSeconds: video.duration,
      };
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('video metadata read failed'));
    };
    video.src = url;
  });
}

export async function addMedia(
  sessionId: string,
  file: File
): Promise<{ media: SessionMediaMeta; warning?: string }> {
  const kind: MediaKind = file.type.startsWith('video/') ? 'video' : 'photo';
  const id = uuid();
  let blob: Blob;
  let width: number | undefined;
  let height: number | undefined;
  let durationSeconds: number | undefined;
  let warning: string | undefined;

  if (kind === 'photo') {
    const compressed = await compressPhoto(file);
    blob = compressed.blob;
    width = compressed.width;
    height = compressed.height;
  } else {
    if (file.size > VIDEO_WARN_BYTES) {
      warning = `La vidéo fait ${(file.size / 1024 / 1024).toFixed(1)} MB — au-delà de 100 MB la place IndexedDB peut manquer rapidement.`;
    }
    blob = file;
    const probe = await probeVideo(file).catch(() => undefined);
    if (probe) {
      width = probe.width;
      height = probe.height;
      durationSeconds = probe.durationSeconds;
    }
  }

  const record: MediaRecord = {
    id,
    sessionId,
    kind,
    mimeType: blob.type || file.type,
    sizeBytes: blob.size,
    createdAt: new Date().toISOString(),
    width,
    height,
    durationSeconds,
    blob,
  };

  await tx('readwrite', store => store.put(record));

  const { blob: _omit, ...meta } = record;
  return { media: meta, warning };
}

export async function listMediaForSession(sessionId: string): Promise<SessionMediaMeta[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const index = transaction.objectStore(STORE).index('bySession');
    const request = index.getAll(IDBKeyRange.only(sessionId));
    request.onsuccess = () => {
      const records = request.result as MediaRecord[];
      const metas = records
        .map(({ blob, ...meta }) => meta)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      resolve(metas);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  const record = await tx<MediaRecord | undefined>('readonly', store => store.get(id));
  return record?.blob ?? null;
}

export async function getMediaObjectUrl(id: string): Promise<string | null> {
  const blob = await getMediaBlob(id);
  return blob ? URL.createObjectURL(blob) : null;
}

export async function deleteMedia(id: string): Promise<void> {
  await tx('readwrite', store => store.delete(id));
}

export async function deleteAllMediaForSession(sessionId: string): Promise<void> {
  const metas = await listMediaForSession(sessionId);
  await Promise.all(metas.map(m => deleteMedia(m.id)));
}

/**
 * Reserved entry-point for the future posture-analysis IA workflow.
 * The blob is returned as-is so the caller can stream it to a backend
 * model without touching the storage layer.
 */
export async function exportMediaForAnalysis(id: string): Promise<Blob | null> {
  return getMediaBlob(id);
}
