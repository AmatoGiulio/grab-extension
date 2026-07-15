import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import type { SortMode } from '../types';

interface ToolbarProps {
  allVisibleSelected: boolean;
  hasItems: boolean;
  hasSelection: boolean;
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
  hasSelection,
  disabled,
  minWidth,
  sort,
  onToggleAll,
  onMinWidthChange,
  onSortChange,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <Switch
        label={allVisibleSelected ? 'Deselect all' : hasSelection ? 'Select all' : 'Select all'}
        checked={allVisibleSelected}
        onToggle={onToggleAll}
        disabled={!hasItems || disabled}
      />

      <div className="flex items-center gap-1">
        <Select
          value={String(minWidth)}
          onValueChange={(v) => onMinWidthChange(Number(v))}
          disabled={disabled}
        >
          <SelectTrigger
            variant="borderless"
            placeholder="Size"
            className="min-w-3"
          />
          <SelectContent>
            <SelectItem index={0} value="0">Size</SelectItem>
            <SelectItem index={1} value="256">≥ 256 px</SelectItem>
            <SelectItem index={2} value="512">≥ 512 px</SelectItem>
            <SelectItem index={3} value="1024">≥ 1024 px</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v) => onSortChange(v as SortMode)}
          disabled={disabled}
        >
          <SelectTrigger
            variant="borderless"
            placeholder="Order"
            className="min-w-3"
          />
          <SelectContent>
            <SelectItem index={0} value="document">Order</SelectItem>
            <SelectItem index={1} value="largest">Largest</SelectItem>
            <SelectItem index={2} value="smallest">Smallest</SelectItem>
            <SelectItem index={3} value="name">Name</SelectItem>
            <SelectItem index={4} value="heaviest">Heaviest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
