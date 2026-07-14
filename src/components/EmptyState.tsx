export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 self-stretch text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-panel-2 text-text-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 15-5-5L5 20" />
        </svg>
      </span>
      <h2 className="text-sm font-semibold text-text">No results</h2>
      <p className="max-w-[220px] text-xs leading-relaxed text-text-3">
        Adjust your filters or scan the page again.
      </p>
    </div>
  );
}
