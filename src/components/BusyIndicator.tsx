export function BusyIndicator() {
  return (
    <div
      className="fixed left-1/2 top-20 z-70 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border-strong bg-panel px-3 py-2 text-[10px] text-text-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      role="status"
    >
      <span className="h-3 w-3 animate-spin rounded-full border border-border-strong border-t-text" />
      Downloading…
    </div>
  );
}
