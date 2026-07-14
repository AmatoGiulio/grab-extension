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
    <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
      {FORMAT_OPTIONS.map((option) => (
        <button
          key={option}
          className={
            'flex-none rounded-md px-2.5 py-1.5 font-mono text-[10px] font-semibold leading-none transition-all ' +
            (format === option
              ? 'bg-panel-3 text-text'
              : 'bg-transparent text-text-3 hover:text-text-2') +
            (disabled ? ' opacity-30' : '')
          }
          onClick={() => onChange(option)}
          disabled={disabled}
        >
          {LABELS[option]}
        </button>
      ))}
    </div>
  );
}
