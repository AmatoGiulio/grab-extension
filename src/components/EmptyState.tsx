import { ImageOff } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 self-stretch text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-muted text-muted-foreground">
        <ImageOff className="h-5 w-5" />
      </span>
      <h2 className="text-sm font-semibold text-foreground">No results</h2>
      <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">
        Adjust your filters or scan the page again.
      </p>
    </div>
  );
}
