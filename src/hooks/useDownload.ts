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
      setStatus(`Download di ${image.filename}…`);
      try {
        if (/^https?:/.test(image.url)) {
          await downloadUrl(image.url, image.filename, false);
        } else {
          const blob = await fetchBlob(image);
          await triggerBlobDownload(blob, image.filename, false);
        }
        setStatus(`${image.filename} scaricata`);
      } catch (directError) {
        try {
          const blob = await fetchBlob(image);
          await triggerBlobDownload(blob, image.filename, false);
          setStatus(`${image.filename} scaricata`);
        } catch (fallbackError) {
          const error =
            fallbackError instanceof Error ? fallbackError : directError;
          setStatus(
            error instanceof Error
              ? `Download non riuscito: ${error.message}`
              : 'Download non riuscito',
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
    setStatus(`Preparazione di ${selectedImages.length} immagini…`);
    try {
      const { blob, summary } = await createZip(
        selectedImages,
        fetchBlob,
        { url: pageUrl, title: pageTitle, domain },
        (completed, total) => {
          setStatus(`Recuperate ${completed} di ${total} immagini…`);
        },
      );
      const filename = `images-${domain || 'page'}.zip`;
      await triggerBlobDownload(blob, filename, true, (received, total) => {
        const pct = Math.round((received / total) * 100);
        setStatus(`Download in corso: ${pct}%`);
      });
      setStatus(
        summary.failed
          ? `ZIP creato · ${summary.failed} non accessibili`
          : 'ZIP creato',
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Errore ZIP: ${error.message}`
          : 'Errore durante la creazione dello ZIP',
      );
    } finally {
      setDownloading(false);
      onDone?.();
    }
  }, [selectedImages, fetchBlob, pageUrl, pageTitle, domain, setStatus, downloading, onDone]);

  return { downloading, downloadingId, downloadSingle, downloadZip };
}
