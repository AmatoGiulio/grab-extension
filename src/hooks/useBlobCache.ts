import { useCallback, useRef } from 'react';
import { getActiveTab } from '../services/chrome';
import type { CollectedImage } from '../types';

async function fetchBlobDirect(url: string): Promise<Blob> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
}

async function fetchBlobFromTab(url: string): Promise<Blob> {
  const tab = await getActiveTab();
  if (!tab.id) throw new Error('Tab not available');

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [url],
    func: async (fetchUrl: string) => {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      // base64 data URL: bytes as a JSON number array bloats the message ~4x and hits size limits
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    },
  });

  const dataUrl = result[0]?.result as string | undefined;
  if (!dataUrl) throw new Error('Blob not accessible');
  return (await fetch(dataUrl)).blob();
}

export function useBlobCache() {
  const cache = useRef(new Map<string, Promise<Blob>>());

  const fetchBlob = useCallback(
    async (image: CollectedImage): Promise<Blob> => {
      const key = image.url;
      const cached = cache.current.get(key);
      if (cached) return cached;

      const pending = (async () => {
        if (image.url.startsWith('data:')) {
          return (await fetch(image.url)).blob();
        }
        if (image.url.startsWith('blob:')) {
          return fetchBlobFromTab(image.url);
        }

        try {
          return await fetchBlobDirect(image.url);
        } catch {
          return fetchBlobFromTab(image.url);
        }
      })();

      const guarded = pending.catch((error) => {
        cache.current.delete(key);
        throw error;
      });

      cache.current.set(key, guarded);
      return guarded;
    },
    [],
  );

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { fetchBlob, clearCache };
}
