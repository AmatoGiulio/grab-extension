import JSZip from 'jszip';
import { mapWithConcurrency } from '../utils/concurrency';
import { uniqueFilename } from '../utils/filename';
import type { CollectedImage, DownloadedImageMetadata, MetadataFile } from '../types';

export interface ZipResult {
  blob: Blob;
  metadata: DownloadedImageMetadata[];
  summary: MetadataFile['summary'];
}

export async function createZip(
  images: CollectedImage[],
  fetchBlob: (image: CollectedImage) => Promise<Blob>,
  page: { url: string; title: string; domain: string },
  onProgress?: (completed: number, total: number) => void,
): Promise<ZipResult> {
  const zip = new JSZip();
  const usedNames = new Map<string, number>();

  const metadata = await mapWithConcurrency(images, 6, async (image, index) => {
    const raw = image.filename || `image-${index + 1}.${image.extension}`;
    const archiveFilename = uniqueFilename(raw, usedNames);
    try {
      const blob = await fetchBlob(image);
      zip.file(archiveFilename, blob, { binary: true, compression: 'STORE' });
      onProgress?.(index + 1, images.length);
      return {
        ...image,
        archiveFilename,
        byteSize: blob.size,
        downloadedMimeType: blob.type || image.mimeType,
        status: 'downloaded' as const,
      };
    } catch (error) {
      onProgress?.(index + 1, images.length);
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ZIP] Failed to fetch ${image.url}: ${message}`);
      return {
        ...image,
        archiveFilename,
        byteSize: null,
        downloadedMimeType: '',
        status: 'failed' as const,
        error: message,
      };
    }
  });

  const downloaded = metadata.filter((item) => item.status === 'downloaded');
  const failed = metadata.filter((item) => item.status === 'failed');

  const summary = {
    selected: images.length,
    downloaded: downloaded.length,
    failed: failed.length,
    totalBytes: downloaded.reduce((total, item) => total + (item.byteSize ?? 0), 0),
  };

  const metadataFile: MetadataFile = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    page,
    summary,
    images: metadata,
  };

  zip.file('metadata.json', JSON.stringify(metadataFile, null, 2), {
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'STORE',
  });

  return { blob, metadata, summary };
}
