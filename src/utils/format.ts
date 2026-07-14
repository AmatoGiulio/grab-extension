export const FORMAT_OPTIONS = ['all', 'jpg', 'png', 'webp', 'gif', 'svg', 'avif'] as const;
export type FormatOption = typeof FORMAT_OPTIONS[number];
