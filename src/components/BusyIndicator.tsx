import { TextShimmer } from '@/components/motion-primitives/text-shimmer';

export function BusyIndicator() {
  return (
    <div
      className="fixed left-1/2 top-20 z-70 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-lg"
      role="status"
    >
      <span className="h-3 w-3 animate-spin rounded-full border border-border border-t-foreground" />
      <TextShimmer className="text-[10px]" duration={1.5}>
        Downloading…
      </TextShimmer>
    </div>
  );
}
