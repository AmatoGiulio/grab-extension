import { useMemo } from 'react';
import type { CollectedImage, SortMode } from '../types';
import type { FormatOption } from '../utils/format';
import { useStoredState } from './useStoredState';

export function useImageFilters(images: CollectedImage[]) {
  const [format, setFormat] = useStoredState<FormatOption>('filter:format', 'all');
  const [sort, setSort] = useStoredState<SortMode>('filter:sort', 'document');
  const [minWidth, setMinWidth] = useStoredState('filter:minWidth', 0);

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
    if (sort === 'heaviest') {
      // unknown sizes sink to the bottom
      return [...result].sort((a, b) => (b.byteSize ?? -1) - (a.byteSize ?? -1));
    }
    return result;
  }, [images, format, sort, minWidth]);

  return { format, setFormat, sort, setSort, minWidth, setMinWidth, filtered };
}
