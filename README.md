# Grab — Image Collector

Chrome MV3 extension side panel. Scans any web page, collects all images, lets you filter, select, and download them individually or as ZIP.

## Build

```bash
npm install
npm run build      # production → dist/
```

Carica `dist/` da `chrome://extensions` usando **Carica estensione non impacchettata**.

## Sviluppo

```bash
npm run dev:extension   # build rapida
```

Ricarica l'estensione da `chrome://extensions` dopo ogni modifica.

## Bundle

| Asset | Dimensione |
|-------|-----------|
| JS | ~312 KB |
| CSS | ~25 KB |
| ZIP (release) | ~109 KB |

## Debug

- **Side panel**: click destro nel pannello → **Ispeziona**
- **Service worker**: `chrome://extensions` → Grab → **Service worker**
