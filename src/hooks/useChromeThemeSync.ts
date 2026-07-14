import { useEffect } from 'react';

type RgbArray = [number, number, number];

// Trasforma l'array nativo di Chrome [r, g, b] in una stringa rgb valida per i fogli di stile
function parseChromeColor(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v.length >= 3) return `rgb(${v[0]},${v[1]},${v[2]})`;
  return '';
}

function brighten([r, g, b]: RgbArray, amount: number): string {
  return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`;
}

function darken([r, g, b]: RgbArray, amount: number): string {
  return `rgb(${Math.max(0, r - amount)},${Math.max(0, g - amount)},${Math.max(0, b - amount)})`;
}

function isDark(rgb: RgbArray): boolean {
  return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 < 156;
}

// Fallback nativi se Chrome non risponde o non ha temi personalizzati
function getFallbackTheme() {
  const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return {
    bg: isDarkTheme ? 'rgb(47,47,47)' : 'rgb(241,243,244)', // Grigio barra nativa di Chrome
    text: isDarkTheme ? 'rgb(232,234,237)' : 'rgb(32,33,36)',
    card: isDarkTheme ? 'rgb(40,41,44)' : 'rgb(255,255,255)',
  };
}

export function useChromeThemeSync() {
  useEffect(() => {
    // === ESTENSIONE DI TAILWIND INIETTATA A RUNTIME ===
    // Configura i token di Tailwind mappandoli direttamente sulle variabili CSS
    const win = window as any;
    if (win.tailwind) {
      win.tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              chrome: {
                DEFAULT: 'var(--chrome-bg)',
                text: 'var(--chrome-text)',
                card: 'var(--chrome-card-bg)',
              }
            }
          }
        }
      };
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const t = (chrome as any).theme;

    const applyThemeProperties = () => {
      const isSystemDark = mq.matches;

      // Sincronizza la classe per Tailwind e il comportamento di rendering dei controlli nativi
      document.documentElement.classList.toggle('dark', isSystemDark);
      document.documentElement.style.colorScheme = isSystemDark ? 'dark' : 'light';

      if (t?.getCurrent) {
        t.getCurrent()
          .then((theme: any) => {
            const rawToolbar = theme?.colors?.toolbar ?? theme?.colors?.frame;
            const rawTabText = theme?.colors?.tab_text ?? theme?.colors?.bookmark_text;

            const bgStr = parseChromeColor(rawToolbar);
            const textStr = parseChromeColor(rawTabText);

            if (Array.isArray(rawToolbar) && rawToolbar.length >= 3) {
              const rgb: RgbArray = [rawToolbar[0], rawToolbar[1], rawToolbar[2]];
              const resolvedText = textStr || (isDark(rgb) ? 'rgb(232,234,237)' : 'rgb(32,33,36)');
              const cardStr = isDark(rgb) ? brighten(rgb, 12) : darken(rgb, 8);

              document.documentElement.style.setProperty('--chrome-bg', bgStr);
              document.documentElement.style.setProperty('--chrome-text', resolvedText);
              document.documentElement.style.setProperty('--chrome-card-bg', cardStr);
            } else {
              useFallbackValues();
            }
          })
          .catch(() => useFallbackValues());
      } else {
        useFallbackValues();
      }
    };

    const useFallbackValues = () => {
      const fallback = getFallbackTheme();
      document.documentElement.style.setProperty('--chrome-bg', fallback.bg);
      document.documentElement.style.setProperty('--chrome-text', fallback.text);
      document.documentElement.style.setProperty('--chrome-card-bg', fallback.card);
    };

    // Esecuzione iniziale
    applyThemeProperties();

    // Event Listeners per i cambi a runtime (Sia di sistema che delle impostazioni di Chrome)
    mq.addEventListener('change', applyThemeProperties);
    if (t?.onUpdated) t.onUpdated.addListener(applyThemeProperties);

    return () => {
      mq.removeEventListener('change', applyThemeProperties);
      if (t?.onUpdated) t.onUpdated.removeListener(applyThemeProperties);
    };
  }, []);
}