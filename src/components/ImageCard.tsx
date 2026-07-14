import { Download } from 'lucide-react';
import { Check } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BorderTrail } from '@/components/motion-primitives/border-trail';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogImage,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogClose,
} from '@/components/motion-primitives/morphing-dialog';
import type { CollectedImage } from '../types';

interface ImageCardProps {
  image: CollectedImage;
  isSelected: boolean;
  disabled: boolean;
  downloadingId: string | null;
  previewOpen: boolean;
  onToggle: (id: string) => void;
  onDownload: (image: CollectedImage) => void;
  onPreviewOpenChange?: (open: boolean) => void;
}

function handleDragStart(e: React.DragEvent, image: CollectedImage) {
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('text/plain', image.url);
  e.dataTransfer.setData('text/uri-list', image.url);
  e.dataTransfer.setData(
    'DownloadURL',
    `${image.mimeType}:${image.filename}:${image.url}`,
  );
}

export function ImageCard({
  image,
  isSelected,
  disabled,
  downloadingId,
  previewOpen,
  onToggle,
  onDownload,
  onPreviewOpenChange,
}: ImageCardProps) {
  const isDownloading = downloadingId === image.id;

  return (
    <MorphingDialog open={previewOpen} onOpenChange={onPreviewOpenChange}>
      <article
        draggable={!disabled}
        onDragStart={(e) => handleDragStart(e, image)}
        className={
          'group relative min-w-0 overflow-hidden rounded-[10px] border bg-card transition-all duration-200 ' +
          (isSelected
            ? 'border-foreground/60 shadow-[inset_0_0_0_1px_var(--color-border)]'
            : 'border-border hover:border-foreground/20 hover:bg-muted/50') +
          (disabled ? ' cursor-wait opacity-70' : ' cursor-pointer')
        }
        onClick={() => !disabled && onToggle(image.id)}
      >
        {isDownloading && (
          <BorderTrail size={80} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} />
        )}
        <div
          className="relative grid min-h-[100px] place-items-center overflow-hidden bg-secondary"
          style={{ aspectRatio: image.aspectRatio ?? 'auto' }}
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'linear-gradient(45deg, color-mix(in srgb, var(--color-foreground) 6%, transparent) 25%, transparent 25%), ' +
                'linear-gradient(-45deg, color-mix(in srgb, var(--color-foreground) 6%, transparent) 25%, transparent 25%), ' +
                'linear-gradient(45deg, transparent 75%, color-mix(in srgb, var(--color-foreground) 6%, transparent) 75%), ' +
                'linear-gradient(-45deg, transparent 75%, color-mix(in srgb, var(--color-foreground) 6%, transparent) 75%)',
              backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0',
              backgroundSize: '10px 10px',
            }}
          />
          <img
            src={image.url}
            alt={image.alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="relative z-1 block h-full w-full object-contain"
          />
          <Badge className="absolute bottom-1.5 left-1.5 z-3">
            {image.extension}
          </Badge>
          <span
            className="absolute left-1.5 top-1.5 z-3 grid h-5 w-5 place-items-center rounded-md border bg-card/70 text-foreground backdrop-blur-sm transition-all duration-150"
            style={{ borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)' }}
          >
            <Check
              className={`h-3 w-3 transition-all duration-150 ${
                isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}
            />
          </span>
          <div className="absolute right-1.5 top-1.5 z-3 flex gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => { e.stopPropagation(); onDownload(image); }}
              title="Quick download"
              className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-card/80 text-muted-foreground backdrop-blur-sm transition-all duration-80 hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
            </button>
            <MorphingDialogTrigger
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-card/80 text-muted-foreground backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
              style={{ display: 'inline-flex' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            </MorphingDialogTrigger>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-1 px-2.5 py-2">
          <strong className="truncate text-xs font-semibold text-foreground" title={image.filename}>
            {image.filename}
          </strong>
          <span className="truncate font-mono text-[9px] lowercase text-muted-foreground">
            {image.width || image.displayedWidth || '?'} × {image.height || image.displayedHeight || '?'} · {image.source}
          </span>
        </div>
      </article>
      <MorphingDialogContainer>
        <MorphingDialogContent className="max-w-[90vw] rounded-xl bg-card shadow-2xl sm:max-w-lg">
          <MorphingDialogImage
            src={image.url}
            alt={image.alt}
            className="max-h-[60vh] w-full object-contain"
          />
          <div className="p-4">
            <MorphingDialogTitle className="text-sm font-semibold text-foreground">
              {image.filename}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="mt-1 text-[11px] text-muted-foreground">
              {image.width || image.displayedWidth || '?'} × {image.height || image.displayedHeight || '?'}
              {image.description ? ` · ${image.description}` : ''}
            </MorphingDialogSubtitle>
            <Button
              size="sm"
              leadingIcon={Download}
              disabled={disabled}
              onClick={(e) => { e.stopPropagation(); onDownload(image); }}
              className="mt-3 h-8 gap-1.5 px-2.5 text-[10px]"
            >
              Download
            </Button>
          </div>
          <MorphingDialogClose />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
