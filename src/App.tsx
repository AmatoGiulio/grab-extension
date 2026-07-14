import { useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { FormatTabs } from './components/FormatTabs';
import { Toolbar } from './components/Toolbar';
import { ImageGrid } from './components/ImageGrid';
import { PreviewModal } from './components/PreviewModal';
import { DownloadBar } from './components/DownloadBar';
import { BusyIndicator } from './components/BusyIndicator';
import { useImageCollection } from './hooks/useImageCollection';
import { useImageFilters } from './hooks/useImageFilters';
import { useImageSelection } from './hooks/useImageSelection';
import { useBlobCache } from './hooks/useBlobCache';
import { useDownload } from './hooks/useDownload';
import { useChromeEvents } from './hooks/useChromeEvents';
import { useTheme } from './hooks/useTheme';
import type { CollectedImage } from './types';

function App() {
  useTheme();
  const { images, loading, status, setStatus, domain, pageUrl, pageTitle, scan } =
    useImageCollection();
  const { fetchBlob } = useBlobCache(pageUrl);
  const { format, setFormat, sort, setSort, minWidth, setMinWidth, filtered } =
    useImageFilters(images);
  const { selected, allVisibleSelected, selectedImages, toggle, toggleAll, resetSelection, pruneSelection } =
    useImageSelection(images, filtered);
  const { downloading, downloadSingle, downloadZip } = useDownload(
    selectedImages,
    pageUrl,
    pageTitle,
    domain,
    setStatus,
    fetchBlob,
  );
  const [preview, setPreview] = useState<CollectedImage | null>(null);

  const handleScan = useCallback(
    (options?: { silent?: boolean }) => scan({
      ...options,
      onTabChange: resetSelection,
      onImagesUpdate: pruneSelection,
    }),
    [scan, resetSelection, pruneSelection],
  );

  useChromeEvents(handleScan, downloading);

  useEffect(() => { handleScan(); }, [handleScan]);

  const isBusy = loading || downloading;

  return (
    <div className="flex min-h-screen flex-col" aria-busy={isBusy}>
      <ErrorBoundary>
        <Header
          domain={domain}
          status={status}
          loading={loading}
          downloading={downloading}
          onRefresh={() => handleScan()}
        />

        <main className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-[76px] pt-3">
          <FormatTabs format={format} disabled={downloading} onChange={setFormat} />
          <Toolbar
            allVisibleSelected={allVisibleSelected}
            hasItems={filtered.length > 0}
            disabled={downloading}
            minWidth={minWidth}
            sort={sort}
            onToggleAll={toggleAll}
            onMinWidthChange={setMinWidth}
            onSortChange={setSort}
          />

          <ImageGrid
            images={images}
            filtered={filtered}
            selected={selected}
            loading={loading}
            disabled={downloading}
            format={format}
            onToggle={toggle}
            onDownload={downloadSingle}
            onPreview={setPreview}
          />
        </main>

        <DownloadBar
          selectedCount={selected.size}
          downloading={downloading}
          onDownloadZip={downloadZip}
        />

        {preview && (
          <PreviewModal
            image={preview}
            disabled={downloading}
            onClose={() => setPreview(null)}
            onDownload={downloadSingle}
          />
        )}

        {downloading && <BusyIndicator />}
      </ErrorBoundary>
    </div>
  );
}

export default App;
