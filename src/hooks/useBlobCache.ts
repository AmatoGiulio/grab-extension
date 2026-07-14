import { useCallback, useRef } from 'react';
import { getActiveTab } from '../services/chrome';
import type { CollectedImage } from '../types';

async function fetchBlobDirect(url: string, pageUrl?: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  if (pageUrl) headers['Referer'] = pageUrl;

  const response = await fetch(url, {
    cache: 'no-store',
    headers,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
}

async function fetchBlobFromTab(url: string): Promise<Blob> {
  const tab = await getActiveTab();
  if (!tab.id) throw new Error('Scheda non disponibile');

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [url],
    func: async (fetchUrl: string) => {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      return { bytes: Array.from(new Uint8Array(buffer)), type: blob.type };
    },
  });

  const value = result[0]?.result as { bytes: number[]; type: string } | undefined;
  if (!value) throw new Error('Blob non accessibile');
  return new Blob([new Uint8Array(value.bytes)], { type: value.type });
}

export function useBlobCache(pageUrl?: string) {
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
          return await fetchBlobDirect(image.url, pageUrl);
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
    [pageUrl],
  );

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { fetchBlob, clearCache };
}
