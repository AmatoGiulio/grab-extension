import { useRef, useState } from 'react';
import { RefreshCw, Settings2, Target } from 'lucide-react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { FormatOption } from '../utils/format';
import { FORMAT_OPTIONS } from '../utils/format';
import { TextShimmer } from '@/components/motion-primitives/text-shimmer';
import { TabsSubtle, TabsSubtleItem } from '@/components/ui/tabs-subtle';
import type { AdvancedOptions } from '../types';

interface HeaderProps {
  domain: string;
  pageUrl: string;
  status: string;
  format: FormatOption;
  loading: boolean;
  downloading: boolean;
  filteredCount: number;
  advancedOptions: AdvancedOptions;
  inspectorActive: boolean;
  onRefresh: () => void;
  onFormatChange: (format: FormatOption) => void;
  onAdvancedOptionsChange: (update: Partial<AdvancedOptions>) => void;
  onInspectorToggle: () => void;
}

const LABELS: Record<string, string> = {
  all: 'All',
  jpg: 'JPG',
  png: 'PNG',
  webp: 'WEBP',
  gif: 'GIF',
  svg: 'SVG',
  avif: 'AVIF',
  bmp: 'BMP',
  image: 'IMG',
};

export function Header({
  domain,
  pageUrl,
  status,
  format,
  loading,
  downloading,
  filteredCount,
  advancedOptions,
  inspectorActive,
  onRefresh,
  onFormatChange,
  onAdvancedOptionsChange,
  onInspectorToggle,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const busy = loading || downloading;
  const formatIndex = FORMAT_OPTIONS.indexOf(format);
  const busyOrInspector = busy || inspectorActive;

  return (
    <header className="sticky top-0 z-20 bg-background">
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          {pageUrl && (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
              alt=""
              className="size-4 flex-none rounded-[2px]"
            />
          )}
          <span className="truncate text-sm font-medium">{domain || 'Current page'}</span>
          {loading && status ? (
            <TextShimmer className="flex-none truncate font-mono text-[11px]">
              {status}
            </TextShimmer>
          ) : !loading ? (
            <span className="flex-none truncate font-mono text-[11px] text-muted-foreground">
              {filteredCount} image{filteredCount !== 1 ? 's' : ''}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onInspectorToggle}
            disabled={busy}
            title={inspectorActive ? 'Inspector active — click an image or press Escape' : 'Inspector mode — hover & click images on the page'}
            className={
              'flex size-6 flex-none items-center justify-center rounded-full text-xs disabled:opacity-30 transition-all' +
              (inspectorActive ? ' border border-foreground/40 bg-muted' : '')
            }
            style={{ color: 'var(--chrome-text)', opacity: inspectorActive ? 1 : 0.55 }}
          >
            <Target className="h-3 w-3" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              disabled={busyOrInspector}
              title="Advanced options"
              className="flex size-6 flex-none items-center justify-center rounded-full text-xs disabled:opacity-30"
              style={{ color: 'var(--chrome-text)', opacity: 0.55 }}
            >
              <Settings2 className="h-3 w-3" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-40 mt-1 w-56 rounded-lg border bg-popover p-2 shadow-lg">
                  <div className="flex flex-col gap-1">
                    <label className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent">
                      <span>CSS backgrounds</span>
                      <SwitchPrimitive.Root
                        checked={advancedOptions.includeCssBackgrounds}
                        onCheckedChange={(v) =>
                          onAdvancedOptionsChange({ includeCssBackgrounds: v })
                        }
                        className="relative h-5 w-8 shrink-0 rounded-full bg-accent outline-none data-[state=checked]:bg-foreground"
                      >
                        <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-background transition-transform duration-100 data-[state=checked]:translate-x-[14px]" />
                      </SwitchPrimitive.Root>
                    </label>
                    <label className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent">
                      <span>SVG images</span>
                      <SwitchPrimitive.Root
                        checked={advancedOptions.includeSvg}
                        onCheckedChange={(v) =>
                          onAdvancedOptionsChange({ includeSvg: v })
                        }
                        className="relative h-5 w-8 shrink-0 rounded-full bg-accent outline-none data-[state=checked]:bg-foreground"
                      >
                        <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-background transition-transform duration-100 data-[state=checked]:translate-x-[14px]" />
                      </SwitchPrimitive.Root>
                    </label>
                    <label className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent">
                      <span>Canvas capture</span>
                      <SwitchPrimitive.Root
                        checked={advancedOptions.includeCanvas}
                        onCheckedChange={(v) =>
                          onAdvancedOptionsChange({ includeCanvas: v })
                        }
                        className="relative h-5 w-8 shrink-0 rounded-full bg-accent outline-none data-[state=checked]:bg-foreground"
                      >
                        <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-background transition-transform duration-100 data-[state=checked]:translate-x-[14px]" />
                      </SwitchPrimitive.Root>
                    </label>
                    <label className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent">
                      <div className="flex flex-col">
                        <span>Strict dedup</span>
                        <span className="text-[10px] text-muted-foreground">
                          Detect tracking params
                        </span>
                      </div>
                      <SwitchPrimitive.Root
                        checked={advancedOptions.strictDedup}
                        onCheckedChange={(v) =>
                          onAdvancedOptionsChange({ strictDedup: v })
                        }
                        className="relative h-5 w-8 shrink-0 rounded-full bg-accent outline-none data-[state=checked]:bg-foreground"
                      >
                        <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-background transition-transform duration-100 data-[state=checked]:translate-x-[14px]" />
                      </SwitchPrimitive.Root>
                    </label>
                  </div>
                  <div className="mt-1 border-t pt-1.5 px-2">
                    <span className="text-[10px] text-muted-foreground">
                      Min {advancedOptions.minDimension}×{advancedOptions.minDimension}px · ≥{advancedOptions.minPixelCount}px²
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={busy}
            title="Scan again"
            className="flex size-6 flex-none items-center justify-center rounded-full text-xs disabled:opacity-30"
            style={{ color: 'var(--chrome-text)', opacity: 0.55 }}
          >
            <RefreshCw className={`h-3 w-3${busy ? ' animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pb-2">
        <TabsSubtle
          selectedIndex={formatIndex}
          onSelect={(index) => onFormatChange(FORMAT_OPTIONS[index])}
        >
          {FORMAT_OPTIONS.map((option, index) => (
            <TabsSubtleItem
              key={option}
              index={index}
              label={LABELS[option]}
            />
          ))}
        </TabsSubtle>
      </div>
    </header>
  );
}
