import { motion } from 'motion/react';
import type { CollectedImage } from '../types';
import { ImageCard } from './ImageCard';
import { SkeletonGrid } from './SkeletonGrid';
import { EmptyState } from './EmptyState';
import { InView } from '@/components/motion-primitives/in-view';

interface ImageGridProps {
  filtered: CollectedImage[];
  selected: Set<string>;
  loading: boolean;
  disabled: boolean;
  downloadingId: string | null;
  previewImageId: string | null;
  onToggle: (id: string) => void;
  onDownload: (image: CollectedImage) => void;
  onPreviewOpenChange?: (imageId: string | null) => void;
}

export function ImageGrid({
  filtered,
  selected,
  loading,
  disabled,
  downloadingId,
  previewImageId,
  onToggle,
  onDownload,
  onPreviewOpenChange,
}: ImageGridProps) {
  if (loading) return <SkeletonGrid />;
  if (!filtered.length) return <EmptyState />;

  return (
    <div className="columns-[180px] gap-4 [&>*]:break-inside-avoid">
        {filtered.map((image, index) => (
          <motion.div
            layout="position"
            key={image.id}
            data-image-id={image.id}
            className="mb-4"
          >
            <InView
              once
              viewOptions={{ margin: '0px 0px -40px 0px' }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
            >
              <ImageCard
                image={image}
                isSelected={selected.has(image.id)}
                disabled={disabled}
                downloadingId={downloadingId}
                previewOpen={previewImageId === image.id}
                onToggle={onToggle}
                onDownload={onDownload}
                onPreviewOpenChange={onPreviewOpenChange}
              />
            </InView>
          </motion.div>
        ))}
    </div>
  );
}
