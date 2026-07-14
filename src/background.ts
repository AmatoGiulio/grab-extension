function brightness(rgb: unknown): number | null {
  if (!rgb) return null;
  if (Array.isArray(rgb)) {
    const [r, g, b] = rgb;
    if (typeof r === 'number' && typeof g === 'number' && typeof b === 'number')
      return (r * 299 + g * 587 + b * 114) / 1000;
  }
  if (typeof rgb === 'string') {
    const hex = rgb.replace('#', '');
    const num = parseInt(hex.length === 3 ? hex.replace(/./g, '$&$&') : hex, 16);
    if (!isNaN(num))
      return (((num >> 16) & 255) * 299 + ((num >> 8) & 255) * 587 + (num & 255) * 114) / 1000;
  }
  return null;
}

function toCssColor(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v.length >= 3) return `rgb(${v[0]},${v[1]},${v[2]})`;
  return '';
}

function applyTheme(theme: { colors?: Record<string, unknown> }) {
  const frame = theme?.colors?.frame;
  const cssColor = toCssColor(frame);
  const b = brightness(frame);
  const light = b === null || b >= 156;

  chrome.action.setIcon({
    path: light
      ? { 16: 'icons/icon-dark-16.png', 32: 'icons/icon-dark-32.png', 48: 'icons/icon-dark-48.png', 128: 'icons/icon-dark-128.png' }
      : { 16: 'icons/icon-light-16.png', 32: 'icons/icon-light-32.png', 48: 'icons/icon-light-48.png', 128: 'icons/icon-light-128.png' },
  });

  if (cssColor) {
    chrome.storage.local.set({ toolbarColor: cssColor });
  }

  chrome.runtime.sendMessage({ type: 'THEME_COLOR', color: cssColor }).catch(() => {});
}

async function syncTheme() {
  try {
    const t = (chrome as any).theme as { getCurrent: () => Promise<{ colors?: Record<string, unknown> }> } | undefined;
    if (!t?.getCurrent) return;
    applyTheme(await t.getCurrent());
  } catch { /* chrome.theme not available */ }
}

chrome.runtime.onInstalled.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  syncTheme();
});

chrome.runtime.onStartup.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  syncTheme();
});

try {
  const t = (chrome as any).theme as { onUpdated?: { addListener: (cb: () => void) => void } } | undefined;
  t?.onUpdated?.addListener(syncTheme);
} catch { /* chrome.theme not available */ }

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'UPDATE_BADGE') {
    const count = msg.count as number;
    if (count > 0) {
      chrome.action.setBadgeText({ text: String(count) });
      chrome.action.setBadgeBackgroundColor({ color: '#1a73e8' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
    sendResponse({ ok: true });
  }
  if (msg.type === 'CLEAR_BADGE') {
    chrome.action.setBadgeText({ text: '' });
    sendResponse({ ok: true });
  }
  if (msg.type === 'REQ_THEME') {
    chrome.storage.local.get('toolbarColor').then((data) => {
      sendResponse({ type: 'THEME_COLOR', color: (data.toolbarColor as string) ?? '' });
    });
    return true;
  }
  return true;
});
