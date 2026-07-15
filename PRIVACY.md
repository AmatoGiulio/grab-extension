# Grab — Privacy Policy

_Last updated: July 15, 2026_

Grab does not collect, store, transmit, or sell any user data.

## What the extension does

Grab runs entirely on your device. When you open the side panel, it scans the
current page for images and lists them. Network requests are made only to:

- the image URLs already present on the page you are viewing, to verify they
  are reachable and to download the ones you select.

That's it. There are no analytics, no telemetry, no tracking, no external
services, and no accounts.

## What is stored

Your preferences (filters, sorting, advanced options, theme) are saved locally
via `chrome.storage.local` on your device. They never leave your browser.

## Permissions

| Permission | Purpose |
|---|---|
| `activeTab`, `tabs`, `scripting` | inject the image collector into the page you are viewing |
| `sidePanel` | display the extension UI |
| `downloads` | save the images you choose to download |
| `storage` | persist your settings locally |
| `<all_urls>` | fetch image files cross-origin so downloads and ZIP export work on any site |

## Contact

Questions: open an issue at
[github.com/AmatoGiulio/grab-extension](https://github.com/AmatoGiulio/grab-extension/issues).
