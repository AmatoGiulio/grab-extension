export type ImageSource = 'img' | 'srcset' | 'css' | 'svg' | 'meta';

export interface CollectedImage {
  id: string;
  url: string;
  width: number;
  height: number;
  displayedWidth: number;
  displayedHeight: number;
  alt: string;
  title: string;
  description: string;
  source: ImageSource;
  filename: string;
  extension: string;
  mimeType: string;
  elementTag: string;
  selector: string;
  className: string;
  loading: string;
  decoding: string;
  crossOrigin: string;
  referrerPolicy: string;
  srcset: string;
  visible: boolean;
  pageUrl: string;
  pageTitle: string;
  origin: string;
  pathname: string;
  aspectRatio: number | null;
  pixelCount: number;
}

export interface DownloadedImageMetadata extends CollectedImage {
  archiveFilename: string;
  byteSize: number | null;
  downloadedMimeType: string;
  status: 'downloaded' | 'failed';
  error?: string;
}

export interface MetadataFile {
  schemaVersion: 1;
  generatedAt: string;
  page: {
    url: string;
    title: string;
    domain: string;
  };
  summary: {
    selected: number;
    downloaded: number;
    failed: number;
    totalBytes: number;
  };
  images: DownloadedImageMetadata[];
}

export type SortMode = 'document' | 'largest' | 'smallest' | 'name';
export type ThemeMode = 'light' | 'dark';
