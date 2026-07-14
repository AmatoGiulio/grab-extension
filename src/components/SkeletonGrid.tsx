export function SkeletonGrid() {
  return (
    <div className="columns-2 gap-3 sm:columns-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="mb-2 overflow-hidden rounded-xl border border-border bg-panel">
          <div className="aspect-[1.25] animate-pulse bg-gradient-to-r from-panel-2 via-panel-3 to-panel-2 bg-[length:200%_100%]" />
          <div className="space-y-2 px-2.5 py-2">
            <div className="h-3 w-3/4 rounded bg-panel-3" />
            <div className="h-2 w-1/2 rounded bg-panel-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
