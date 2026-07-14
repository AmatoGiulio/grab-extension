import { useEffect } from 'react';
import type { CollectedImage } from '../types';

interface PreviewModalProps {
  image: CollectedImage;
  disabled: boolean;
  onClose: () => void;
  onDownload: (image: CollectedImage) => void;
}

export function PreviewModal({
  image,
  disabled,
  onClose,
  onDownload,
}: PreviewModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disabled) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [disabled, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-overlay p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={() => !disabled && onClose()}
    >
      <div
        className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-border-strong bg-panel shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            disabled={disabled}
            className="absolute right-2.5 top-2.5 z-2 grid h-8 w-8 place-items-center rounded-xl border border-border-strong bg-panel/80 text-text-2 backdrop-blur-sm transition-all hover:bg-panel active:scale-90 disabled:opacity-50"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m6 6 12 12" /><path d="m18 6-12 12" />
            </svg>
          </button>
          <div
            className="grid min-h-[200px] place-items-center bg-panel-3"
            style={{ maxHeight: '72vh' }}
          >
            <img
              src={image.url}
              alt={image.alt}
              referrerPolicy="no-referrer"
              className="max-h-[72vh] max-w-full object-contain"
            />
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-3 px-3.5 py-3">
          <div className="flex min-w-0 flex-col gap-1">
            <strong className="truncate text-xs font-semibold text-text">{image.filename}</strong>
            <span className="truncate text-[10px] text-text-3">
              {image.description || image.alt || image.source}
            </span>
          </div>
          <div className="flex flex-none items-center gap-2">
            <span className="font-mono text-[10px] text-text-3">
              {image.width || image.displayedWidth} × {image.height || image.displayedHeight}
            </span>
            <button
              onClick={() => onDownload(image)}
              disabled={disabled}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-2.5 text-[10px] font-semibold text-accent-text transition-all hover:brightness-110 active:scale-95 disabled:bg-panel-3 disabled:text-text-3"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
