import { useMemo, useState, useCallback } from 'react';
import type { CollectedImage, SortMode } from '../types';
import type { FormatOption } from '../utils/format';

function vt(fn: () => void) {
  document.startViewTransition ? document.startViewTransition(fn) : fn();
}

export function useImageFilters(images: CollectedImage[]) {
  const [format, setFormat_] = useState<FormatOption>('all');
  const [sort, setSort_] = useState<SortMode>('document');
  const [minWidth, setMinWidth_] = useState(0);

  const setFormat = useCallback((f: FormatOption) => vt(() => setFormat_(f)), []);
  const setSort = useCallback((s: SortMode) => vt(() => setSort_(s)), []);
  const setMinWidth = useCallback((w: number) => vt(() => setMinWidth_(w)), []);

  const filtered = useMemo(() => {
    const result = images.filter((image) => {
      const effectiveWidth = image.width || image.displayedWidth;
      const formatMatch =
        format === 'all' ||
        image.extension === format ||
        (format === 'jpg' && image.extension === 'jpeg');
      return formatMatch && effectiveWidth >= minWidth;
    });

    if (sort === 'largest') {
      return [...result].sort((a, b) => b.pixelCount - a.pixelCount);
    }
    if (sort === 'smallest') {
      return [...result].sort((a, b) => a.pixelCount - b.pixelCount);
    }
    if (sort === 'name') {
      return [...result].sort((a, b) => a.filename.localeCompare(b.filename));
    }
    return result;
  }, [images, format, sort, minWidth]);

  return { format, setFormat, sort, setSort, minWidth, setMinWidth, filtered };
}
