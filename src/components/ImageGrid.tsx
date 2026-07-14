import type { CollectedImage } from '../types';
import type { FormatOption } from '../utils/format';
import { ImageCard } from './ImageCard';
import { SkeletonGrid } from './SkeletonGrid';
import { EmptyState } from './EmptyState';

interface ImageGridProps {
  images: CollectedImage[];
  filtered: CollectedImage[];
  selected: Set<string>;
  loading: boolean;
  disabled: boolean;
  format: FormatOption;
  onToggle: (id: string) => void;
  onDownload: (image: CollectedImage) => void;
  onPreview: (image: CollectedImage) => void;
}

export function ImageGrid({
  images,
  filtered,
  selected,
  loading,
  disabled,
  format,
  onToggle,
  onDownload,
  onPreview,
}: ImageGridProps) {
  if (loading) return <SkeletonGrid />;
  if (!filtered.length) return <EmptyState />;

  return (
    <div className="columns-2 gap-3 sm:columns-3" style={{ viewTransitionName: 'card-grid' }}>
      {filtered.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          isSelected={selected.has(image.id)}
          disabled={disabled}
          onToggle={onToggle}
          onDownload={onDownload}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}
