import { useCallback, useEffect, useRef, useState } from 'react';
import { ShapeProvider } from '@/lib/shape-context';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { ImageGrid } from './components/ImageGrid';
import { DownloadBar } from './components/DownloadBar';
import { BusyIndicator } from './components/BusyIndicator';
import { ScrollArea } from './components/ui/scroll-area';
import { useImageCollection } from './hooks/useImageCollection';
import { useImageFilters } from './hooks/useImageFilters';
import { useImageSelection } from './hooks/useImageSelection';
import { useBlobCache } from './hooks/useBlobCache';
import { useDownload } from './hooks/useDownload';
import { useChromeEvents } from './hooks/useChromeEvents';
import { useChromeThemeSync } from './hooks/useChromeThemeSync';
import { useBadge } from './hooks/useBadge';
import { useInspector } from './hooks/useInspector';
import type { AdvancedOptions } from './types';
import { DEFAULT_ADVANCED_OPTIONS } from './types';

function App() {
  useChromeThemeSync();
  const { images, loading, status, setStatus, domain, pageUrl, pageTitle, scan } =
    useImageCollection();
  useBadge(images);
  const { fetchBlob } = useBlobCache(pageUrl);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>(DEFAULT_ADVANCED_OPTIONS);
  const { format, setFormat, sort, setSort, minWidth, setMinWidth, filtered } =
    useImageFilters(images);
  const { selected, allVisibleSelected, selectedImages, toggle, toggleAll, resetSelection, pruneSelection } =
    useImageSelection(images, filtered);
  const { downloading, downloadingId, downloadSingle, downloadZip } = useDownload(
    selectedImages,
    pageUrl,
    pageTitle,
    domain,
    setStatus,
    fetchBlob,
    resetSelection,
  );
  const { active: inspectorActive, inspectedImageId, setInspectedImageId, toggle: toggleInspector } =
    useInspector(images);

  const handleScan = useCallback(
    (options?: { silent?: boolean }) => scan({
      ...options,
      onTabChange: resetSelection,
      onImagesUpdate: pruneSelection,
      advancedOptions,
    }),
    [scan, resetSelection, pruneSelection, advancedOptions],
  );

  useChromeEvents(handleScan, downloading);

  useEffect(() => { handleScan(); }, [handleScan]);

  const handleAdvancedOptionsChange = useCallback((update: Partial<AdvancedOptions>) => {
    setAdvancedOptions((prev) => ({ ...prev, ...update }));
  }, []);

  useEffect(() => {
    if (!inspectedImageId) return;
    toggle(inspectedImageId);

    const id = setTimeout(() => {
      const el = document.querySelector(`[data-image-id="${inspectedImageId}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    return () => clearTimeout(id);
  }, [inspectedImageId, toggle]);

  const isBusy = loading || downloading;
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-screen flex-col" aria-busy={isBusy}>
      <ShapeProvider defaultShape="rounded">
      <ErrorBoundary>
        <Header
          domain={domain}
          pageUrl={pageUrl}
          status={status}
          format={format}
          loading={loading}
          downloading={downloading}
          filteredCount={filtered.length}
          advancedOptions={advancedOptions}
          inspectorActive={inspectorActive}
          onRefresh={() => handleScan()}
          onFormatChange={setFormat}
          onAdvancedOptionsChange={handleAdvancedOptionsChange}
          onInspectorToggle={toggleInspector}
        />

        <div className="flex flex-col gap-2 px-4">
          <Toolbar
            allVisibleSelected={allVisibleSelected}
            hasItems={filtered.length > 0}
            hasSelection={selected.size > 0}
            disabled={downloading}
            minWidth={minWidth}
            sort={sort}
            onToggleAll={toggleAll}
            onMinWidthChange={setMinWidth}
            onSortChange={setSort}
          />
        </div>

        <div className="relative min-h-0 flex-1 flex flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background to-transparent" />
          <ScrollArea
            viewportRef={viewportRef}
            className="min-h-0 flex-1"
            viewportClassName="px-4"
          >
            <ImageGrid
              filtered={filtered}
              selected={selected}
              loading={loading}
              disabled={downloading}
              downloadingId={downloadingId}
              previewImageId={inspectedImageId}
              onToggle={toggle}
              onDownload={downloadSingle}
              onPreviewOpenChange={(id) => setInspectedImageId(id)}
            />
          </ScrollArea>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        <DownloadBar
          selectedCount={selected.size}
          downloading={downloading}
          onDownloadZip={downloadZip}
        />

        {downloading && <BusyIndicator />}
      </ErrorBoundary>
      </ShapeProvider>
    </div>
  );
}

export default App;
