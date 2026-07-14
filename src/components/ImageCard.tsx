import type { CollectedImage } from '../types';

interface ImageCardProps {
  image: CollectedImage;
  isSelected: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
  onDownload: (image: CollectedImage) => void;
  onPreview: (image: CollectedImage) => void;
}

export function ImageCard({
  image,
  isSelected,
  disabled,
  onToggle,
  onDownload,
  onPreview,
}: ImageCardProps) {
  return (
    <article
      className={
        'group mb-2 min-w-0 overflow-hidden rounded-xl border bg-panel transition-all duration-200 ' +
        (isSelected
          ? 'border-text/40 shadow-[inset_0_0_0_1px_var(--color-border)]'
          : 'border-border hover:border-border-strong hover:bg-panel-2') +
        (disabled ? ' cursor-wait opacity-70' : ' cursor-pointer active:scale-[0.98]')
      }
      onClick={() => !disabled && onToggle(image.id)}
    >
      <div
        className="relative grid min-h-[100px] place-items-center overflow-hidden bg-panel-3"
        style={{ aspectRatio: image.aspectRatio ?? 'auto' }}
      >
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(45deg, color-mix(in srgb, var(--color-text) 6%, transparent) 25%, transparent 25%), ' +
              'linear-gradient(-45deg, color-mix(in srgb, var(--color-text) 6%, transparent) 25%, transparent 25%), ' +
              'linear-gradient(45deg, transparent 75%, color-mix(in srgb, var(--color-text) 6%, transparent) 75%), ' +
              'linear-gradient(-45deg, transparent 75%, color-mix(in srgb, var(--color-text) 6%, transparent) 75%)',
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
        <span className="absolute bottom-1.5 left-1.5 z-3 rounded-md border border-border bg-panel/80 px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase text-text-2 backdrop-blur-sm">
          {image.extension}
        </span>
        <span
          className="absolute left-1.5 top-1.5 z-3 grid h-5 w-5 place-items-center rounded-md border bg-panel/70 text-text backdrop-blur-sm transition-all duration-150"
          style={{ borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border-strong)' }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={'transition-all duration-150 ' + (isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0')}
          >
            <polyline points="5 12 9 16 19 6" />
          </svg>
        </span>
        <div className="absolute right-1.5 top-1.5 z-3 flex gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            disabled={disabled}
            onClick={(e) => { e.stopPropagation(); onDownload(image); }}
            className="grid h-7 w-7 place-items-center rounded-lg border border-border-strong bg-panel/80 text-text-2 backdrop-blur-sm transition-all hover:bg-accent hover:text-accent-text active:scale-90 disabled:opacity-50"
            title="Quick download"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" />
            </svg>
          </button>
          <button
            disabled={disabled}
            onClick={(e) => { e.stopPropagation(); onPreview(image); }}
            className="grid h-7 w-7 place-items-center rounded-lg border border-border-strong bg-panel/80 text-text-2 backdrop-blur-sm transition-all hover:bg-accent hover:text-accent-text active:scale-90 disabled:opacity-50"
            title="Preview"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 3H3v5" /><path d="m3 3 6 6" /><path d="M16 21h5v-5" /><path d="m21 21-6-6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-1 px-2.5 py-2">
        <strong className="truncate text-xs font-semibold text-text" title={image.filename}>
          {image.filename}
        </strong>
        <span className="truncate font-mono text-[9px] lowercase text-text-3">
          {image.width || image.displayedWidth || '?'} × {image.height || image.displayedHeight || '?'} · {image.source}
        </span>
      </div>
    </article>
  );
}
