# Grab 1.2.0

Estensione Chrome Manifest V3 in React e TypeScript.

## Ottimizzazioni download

- Download singolo HTTP/HTTPS diretto con `chrome.downloads`, senza ricostruire il file in memoria.
- Fallback Blob per URL `blob:`, `data:` o download diretti non riusciti.
- Cache in memoria dei Blob per evitare di recuperare due volte la stessa immagine durante la sessione.
- Recupero ZIP concorrente con pool limitato a 6 immagini.
- Immagini archiviate con ZIP `STORE`: JPG, PNG, WebP, GIF e AVIF non vengono ricompressi inutilmente.
- Solo `metadata.json` usa DEFLATE.
- `streamFiles: true` durante la generazione dello ZIP.

## Avvio locale

```bash
npm install
npm run dev:extension
```

Carica la cartella `dist` da `chrome://extensions` usando **Carica estensione non pacchettizzata**.
Dopo una modifica, premi **Ricarica** sulla scheda dell'estensione.

## Build di produzione

```bash
npm run build
```

## Debug

- Side panel: click destro nel pannello, poi **Ispeziona**.
- Service worker: `chrome://extensions` → Image Collector → **Service worker / Ispeziona**.
- Script eseguiti nella pagina: DevTools del sito → **Sources**.
