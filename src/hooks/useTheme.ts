import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');

    const sync = () => {
      document.documentElement.classList.toggle('light', mq.matches);
    };

    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
}
