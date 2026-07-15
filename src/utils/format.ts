export const FORMAT_OPTIONS = ['all', 'jpg', 'png', 'webp', 'gif', 'svg', 'avif', 'bmp', 'image'] as const;
export type FormatOption = typeof FORMAT_OPTIONS[number];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
