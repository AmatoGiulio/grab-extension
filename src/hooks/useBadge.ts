import { useEffect } from 'react';
import type { CollectedImage } from '../types';

export function useBadge(images: CollectedImage[]) {
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'CLEAR_BADGE' });
  }, []);

  useEffect(() => {
    const reachable = images.filter((img) => img.pixelCount > 0);
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', count: reachable.length });
  }, [images.length]);
}
