export const FORMAT_OPTIONS = ['all', 'jpg', 'png', 'webp', 'gif', 'svg', 'avif', 'bmp', 'image'] as const;
export type FormatOption = typeof FORMAT_OPTIONS[number];
