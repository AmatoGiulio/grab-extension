interface DownloadBarProps {
  selectedCount: number;
  downloading: boolean;
  onDownloadZip: () => void;
}

export function DownloadBar({
  selectedCount,
  downloading,
  onDownloadZip,
}: DownloadBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-25 flex h-[68px] items-center justify-between gap-3 border-t border-border bg-panel/94 px-4 backdrop-blur-xl">
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-semibold text-text">{selectedCount}</span>
        <span className="text-[10px] text-text-3">selected</span>
      </div>
      <button
        onClick={onDownloadZip}
        disabled={!selectedCount || downloading}
        className="flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-bold text-accent-text shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:bg-panel-3 disabled:text-text-3 disabled:shadow-none disabled:active:scale-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" />
        </svg>
        {downloading ? 'Downloading…' : 'Download ZIP'}
      </button>
    </footer>
  );
}
