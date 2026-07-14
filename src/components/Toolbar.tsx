import type { SortMode } from '../types';

interface ToolbarProps {
  allVisibleSelected: boolean;
  hasItems: boolean;
  disabled: boolean;
  minWidth: number;
  sort: SortMode;
  onToggleAll: () => void;
  onMinWidthChange: (value: number) => void;
  onSortChange: (value: SortMode) => void;
}

export function Toolbar({
  allVisibleSelected,
  hasItems,
  disabled,
  minWidth,
  sort,
  onToggleAll,
  onMinWidthChange,
  onSortChange,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        className={
          'flex items-center gap-1.5 border-0 bg-none text-xs transition-colors ' +
          (allVisibleSelected ? 'text-text' : 'text-text-2') +
          (hasItems && !disabled ? ' cursor-pointer hover:text-text' : ' opacity-40')
        }
        onClick={onToggleAll}
        disabled={!hasItems || disabled}
      >
        <span
          className={
            'grid h-4 w-4 place-items-center rounded-md border transition-all duration-150 ' +
            (allVisibleSelected
              ? 'border-accent bg-accent text-accent-text'
              : 'border-border-strong bg-panel')
          }
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={'transition-all duration-150 ' + (allVisibleSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0')}
          >
            <polyline points="5 12 9 16 19 6" />
          </svg>
        </span>
        {allVisibleSelected ? 'Deselect all' : 'Select all'}
      </button>

      <div className="flex gap-1.5">
        <select
          value={minWidth}
          onChange={(e) => onMinWidthChange(Number(e.target.value))}
          disabled={disabled}
          className="h-7 max-w-[116px] cursor-pointer rounded-lg border border-border bg-panel-2 px-2 text-[10px] text-text-2 outline-none transition-colors hover:border-border-strong disabled:cursor-default"
        >
          <option value="0">Any size</option>
          <option value="256">≥ 256 px</option>
          <option value="512">≥ 512 px</option>
          <option value="1024">≥ 1024 px</option>
        </select>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortMode)}
          disabled={disabled}
          className="h-7 max-w-[116px] cursor-pointer rounded-lg border border-border bg-panel-2 px-2 text-[10px] text-text-2 outline-none transition-colors hover:border-border-strong disabled:cursor-default"
        >
          <option value="document">Page order</option>
          <option value="largest">Largest</option>
          <option value="smallest">Smallest</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
  );
}
