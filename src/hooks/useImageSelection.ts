import { useCallback, useMemo, useState } from 'react';
import type { CollectedImage } from '../types';

export function useImageSelection(
  images: CollectedImage[],
  filtered: CollectedImage[],
) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((image) => selected.has(image.id));

  const selectedImages = useMemo(
    () => images.filter((image) => selected.has(image.id)),
    [images, selected],
  );

  const toggle = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        filtered.forEach((image) => next.delete(image.id));
      } else {
        filtered.forEach((image) => next.add(image.id));
      }
      return next;
    });
  }, [allVisibleSelected, filtered]);

  const resetSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const pruneSelection = useCallback((validIds: Set<string>) => {
    setSelected((prev) => new Set([...prev].filter((id) => validIds.has(id))));
  }, []);

  return {
    selected,
    allVisibleSelected,
    selectedImages,
    toggle,
    toggleAll,
    resetSelection,
    pruneSelection,
  };
}
