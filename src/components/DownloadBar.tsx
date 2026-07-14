import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { AnimatedNumber } from '@/components/motion-primitives/animated-number';

interface DownloadBarProps {
  selectedCount: number;
  downloading: boolean;
  onDownloadZip: () => void;
}

export function DownloadBar({
  selectedCount,
  downloading,
  onDownloadZip,
}: DownloadBarProps) {
  return (
    <footer className="z-25 flex items-center justify-between gap-3 border-t border-border bg-background/94 px-4 py-3 shadow-[0_-1px_6px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <div className="flex flex-col leading-tight">
        <AnimatedNumber
          value={selectedCount}
          className="text-lg font-semibold text-foreground"
          springOptions={{ stiffness: 200, damping: 30 }}
        />
        <span className="text-[10px] text-muted-foreground">selected</span>
      </div>
      <Button
        onClick={onDownloadZip}
        disabled={!selectedCount || downloading}
        leadingIcon={Download}
        className="h-10 gap-2 px-4 text-xs font-bold shadow-sm"
      >
        {downloading ? 'Downloading…' : 'Download ZIP'}
      </Button>
    </footer>
  );
}
