import { useCallback, useRef, useState } from 'react';
import { getActiveTab, executeInTab } from '../services/chrome';
import { collectImagesInPage, installRealtimeImageWatcher } from '../collector';
import { mapWithConcurrency } from '../utils/concurrency';
import type { CollectedImage, AdvancedOptions } from '../types';
import { DEFAULT_ADVANCED_OPTIONS } from '../types';

async function isReachable(url: string, pageUrl: string, signal?: AbortSignal): Promise<boolean> {
  if (url.startsWith('data:') || url.startsWith('blob:')) return true;
  if (signal?.aborted) return false;

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), 5000);
  const combined = signal ? AbortSignal.any([timeout.signal, signal]) : timeout.signal;

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      headers: pageUrl ? { Referer: pageUrl } : {},
      signal: combined,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function applyQualityFilter(
  images: CollectedImage[],
  opts: AdvancedOptions,
): CollectedImage[] {
  let filtered = images;

  if (!opts.includeCssBackgrounds) {
    filtered = filtered.filter((img) => img.source !== 'css');
  }
  if (!opts.includeSvg) {
    filtered = filtered.filter((img) => img.source !== 'svg');
  }
  if (!opts.includeCanvas) {
    filtered = filtered.filter((img) => img.source !== 'canvas');
  }

  filtered = filtered.filter((img) => {
    const w = img.width || img.displayedWidth;
    const h = img.height || img.displayedHeight;
    if (w < opts.minDimension && h < opts.minDimension) return false;
    if (w * h < opts.minPixelCount) return false;
    return true;
  });

  if (opts.strictDedup && filtered.length > 0) {
    const deduped = new Map<string, CollectedImage>();
    for (const img of filtered) {
      const key = img.url.replace(/^https:/i, 'http:').toLowerCase();
      const prev = deduped.get(key);
      if (!prev || img.pixelCount > prev.pixelCount) {
        deduped.set(key, img);
      }
    }
    filtered = [...deduped.values()];
  }

  return filtered;
}

export function useImageCollection() {
  const [images, setImages] = useState<CollectedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Scanning page…');
  const [domain, setDomain] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const scanVersion = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const activeTabId = useRef<number | null>(null);

  const installWatcher = useCallback(async (tabId: number) => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        func: installRealtimeImageWatcher,
      });
    } catch {
      /* restricted frame or page */
    }
  }, []);

  const scan = useCallback(
    async (options: {
      silent?: boolean;
      onTabChange?: () => void;
      onImagesUpdate?: (validIds: Set<string>) => void;
      advancedOptions?: AdvancedOptions;
    } = {}) => {
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      const version = ++scanVersion.current;

      if (!options.silent) {
        setLoading(true);
        setStatus('Scanning page…');
      }

      try {
        const tab = await getActiveTab();
        if (!tab.id || !tab.url || !/^https?:/.test(tab.url)) {
          throw new Error('Open a regular web page to get started.');
        }

        const prevTabId = activeTabId.current;
        activeTabId.current = tab.id;
        if (prevTabId !== null && prevTabId !== tab.id) {
          options.onTabChange?.();
        }

        const parsed = new URL(tab.url);
        const currentPageUrl = tab.url;
        setDomain(parsed.hostname.replace(/^www\./, ''));
        setPageUrl(currentPageUrl);
        setPageTitle(tab.title || parsed.hostname);

        const opts = options.advancedOptions ?? DEFAULT_ADVANCED_OPTIONS;

        const results = await executeInTab(tab.id, collectImagesInPage);
        if (version !== scanVersion.current) return;

        const merged = new Map<string, CollectedImage>();
        results
          .flatMap((result) => result.result ?? [])
          .forEach((image) => {
            const current = merged.get(image.url);
            if (!current || image.pixelCount > current.pixelCount) {
              merged.set(image.url, image);
            }
          });

        let candidates = [...merged.values()];
        candidates = applyQualityFilter(candidates, opts);

        if (!candidates.length) {
          if (version !== scanVersion.current) return;
          setImages([]);
          options.onImagesUpdate?.(new Set());
          setStatus('No images found');
          return;
        }

        if (!options.silent) {
          setStatus(`Checking ${candidates.length} images…`);
        }

        const reachable: CollectedImage[] = [];
        await mapWithConcurrency(candidates, 15, async (image) => {
          if (abort.signal.aborted) return;
          if (await isReachable(image.url, currentPageUrl, abort.signal)) {
            reachable.push(image);
          }
        }, abort.signal);

        if (version !== scanVersion.current) return;

        const validIds = new Set(reachable.map((i) => i.id));
        setImages(reachable);
        options.onImagesUpdate?.(validIds);

        if (reachable.length > 0) {
          setStatus(`${reachable.length} images`);
        } else {
          setStatus('No reachable images');
        }

        await installWatcher(tab.id);
      } catch (error) {
        if (version !== scanVersion.current) return;
        setImages([]);
        options.onImagesUpdate?.(new Set());
        setStatus(
          error instanceof Error
            ? error.message
            : 'Could not scan this page.',
        );
      } finally {
        if (version === scanVersion.current) setLoading(false);
      }
    },
    [installWatcher],
  );

  return {
    images,
    loading,
    status,
    setStatus,
    domain,
    pageUrl,
    pageTitle,
    activeTabId,
    scan,
    scanVersion,
  };
}
