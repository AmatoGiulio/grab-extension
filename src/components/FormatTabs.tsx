import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import type { FormatOption } from '../utils/format';
import { FORMAT_OPTIONS } from '../utils/format';

interface FormatTabsProps {
  format: FormatOption;
  disabled: boolean;
  onChange: (format: FormatOption) => void;
}

const LABELS: Record<string, string> = {
  all: 'All',
  jpg: 'JPG',
  png: 'PNG',
  webp: 'WEBP',
  gif: 'GIF',
  svg: 'SVG',
  avif: 'AVIF',
};

export function FormatTabs({ format, disabled, onChange }: FormatTabsProps) {
  return (
    <Tabs value={format} onValueChange={(v) => onChange(v as FormatOption)}>
      <TabsList className="overflow-x-auto scrollbar-none">
        {FORMAT_OPTIONS.map((option) => (
          <TabsTrigger
            key={option}
            value={option}
            disabled={disabled}
          >
            {LABELS[option]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
