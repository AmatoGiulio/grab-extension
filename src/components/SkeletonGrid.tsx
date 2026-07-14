import { TextShimmer } from '@/components/motion-primitives/text-shimmer';

export function SkeletonGrid() {
  return (
    <div className="columns-[180px] gap-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="mb-2 overflow-hidden rounded-[10px] border border-border bg-card">
          <div className="aspect-[1.25] animate-pulse bg-gradient-to-r from-muted via-secondary to-muted bg-[length:200%_100%]" />
          <div className="space-y-2 px-2.5 py-2">
            <div className="h-3 w-3/4 rounded bg-muted" />
            <div className="h-2 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
      <div className="mb-4 text-center">
        <TextShimmer className="text-[11px]" duration={1.5}>
          Scanning images…
        </TextShimmer>
      </div>
    </div>
  );
}
