import { useCallback, useState } from 'react';
import { downloadUrl } from '../services/chrome';
import { triggerBlobDownload } from '../services/download';
import { createZip } from '../services/zip';
import type { CollectedImage } from '../types';

export function useDownload(
  selectedImages: CollectedImage[],
  pageUrl: string,
  pageTitle: string,
  domain: string,
  setStatus: (status: string) => void,
  fetchBlob: (image: CollectedImage) => Promise<Blob>,
  onDone?: () => void,
) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadSingle = useCallback(
    async (image: CollectedImage) => {
      if (downloading) return;
      setDownloading(true);
      setDownloadingId(image.id);
      setStatus(`Downloading ${image.filename}…`);
      try {
        if (/^https?:/.test(image.url)) {
          await downloadUrl(image.url, image.filename, false);
        } else {
          const blob = await fetchBlob(image);
          await triggerBlobDownload(blob, image.filename, false);
        }
        setStatus(`${image.filename} downloaded`);
      } catch (directError) {
        try {
          const blob = await fetchBlob(image);
          await triggerBlobDownload(blob, image.filename, false);
          setStatus(`${image.filename} downloaded`);
        } catch (fallbackError) {
          const error =
            fallbackError instanceof Error ? fallbackError : directError;
          setStatus(
            error instanceof Error
              ? `Download failed: ${error.message}`
              : 'Download failed',
          );
        }
      } finally {
        setDownloading(false);
        setDownloadingId(null);
        onDone?.();
      }
    },
    [fetchBlob, setStatus, downloading, onDone],
  );

  const downloadZip = useCallback(async () => {
    if (!selectedImages.length || downloading) return;
    setDownloading(true);
    setStatus(`Preparing ${selectedImages.length} images…`);
    try {
      const { blob, summary } = await createZip(
        selectedImages,
        fetchBlob,
        { url: pageUrl, title: pageTitle, domain },
        (completed, total) => {
          setStatus(`Fetched ${completed} of ${total} images…`);
        },
      );
      const filename = `images-${domain || 'page'}.zip`;
      await triggerBlobDownload(blob, filename, true, (received, total) => {
        const pct = Math.round((received / total) * 100);
        setStatus(`Downloading: ${pct}%`);
      });
      setStatus(
        summary.failed
          ? `ZIP created · ${summary.failed} unreachable`
          : 'ZIP created',
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `ZIP error: ${error.message}`
          : 'Failed to create the ZIP',
      );
    } finally {
      setDownloading(false);
      onDone?.();
    }
  }, [selectedImages, fetchBlob, pageUrl, pageTitle, domain, setStatus, downloading, onDone]);

  return { downloading, downloadingId, downloadSingle, downloadZip };
}
