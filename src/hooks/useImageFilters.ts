import { useMemo, useState } from 'react';
import type { CollectedImage, SortMode } from '../types';
import type { FormatOption } from '../utils/format';

export function useImageFilters(images: CollectedImage[]) {
  const [format, setFormat] = useState<FormatOption>('all');
  const [sort, setSort] = useState<SortMode>('document');
  const [minWidth, setMinWidth] = useState(0);

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
