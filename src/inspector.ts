type InspectorState = {
  overlay: HTMLDivElement;
  highlight: HTMLDivElement;
  onMouseMove: (e: MouseEvent) => void;
  onClick: (e: MouseEvent) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onVisibility: () => void;
};

export function installInspector(): boolean {
  const win = window as typeof window & { __grabInspector?: InspectorState };
  if (win.__grabInspector) return false;

  const overlay = document.createElement('div');
  overlay.id = '__grab-inspector-overlay';
  overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;display:none;border:2px solid #1a73e8;background:rgba(26,115,232,0.08);border-radius:2px;transition:opacity 0.08s ease';
  document.body.appendChild(overlay);

  const highlight = document.createElement('div');
  highlight.id = '__grab-inspector-label';
  highlight.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;display:none;background:#1a73e8;color:#fff;font:11px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;padding:2px 6px;border-radius:3px;white-space:nowrap';
  document.body.appendChild(highlight);

  let currentEl: Element | null = null;

  function describeElement(el: Element): string {
    if (el instanceof HTMLImageElement) return `${el.naturalWidth}×${el.naturalHeight}`;
    if (el instanceof HTMLCanvasElement) return `canvas ${el.width}×${el.height}`;
    if (el.tagName === 'SVG' || el instanceof SVGElement) return `svg`;
    const style = getComputedStyle(el);
    if (style.backgroundImage && style.backgroundImage !== 'none') return `bg`;
    return el.tagName.toLowerCase();
  }

  function isImageElement(el: Element): boolean {
    if (el instanceof HTMLImageElement && (el.currentSrc || el.src)) return true;
    if (el instanceof HTMLCanvasElement) return true;
    if (el.tagName === 'SVG' || el instanceof SVGElement) return true;
    const style = getComputedStyle(el);
    if (style.backgroundImage && style.backgroundImage !== 'none' && style.backgroundImage.includes('url(')) return true;
    return false;
  }

  // scan the whole stack under the cursor: on most sites images sit below
  // hover overlays/links, so the topmost element is never the image itself
  const pickImageAt = (x: number, y: number): Element | null => {
    for (const candidate of document.elementsFromPoint(x, y)) {
      if (candidate.id === '__grab-inspector-overlay' || candidate.id === '__grab-inspector-label') continue;
      if (candidate === document.body || candidate === document.documentElement) break;
      if (candidate instanceof SVGElement) return candidate.ownerSVGElement ?? candidate;
      if (isImageElement(candidate)) return candidate;
    }
    return null;
  };

  const onMouseMove = (e: MouseEvent) => {
    const el = pickImageAt(e.clientX, e.clientY);
    if (el) {
      if (el === currentEl) return;
      currentEl = el;
      const rect = el.getBoundingClientRect();
      overlay.style.display = 'block';
      overlay.style.top = rect.top + 'px';
      overlay.style.left = rect.left + 'px';
      overlay.style.width = rect.width + 'px';
      overlay.style.height = rect.height + 'px';

      highlight.style.display = 'block';
      highlight.style.top = Math.max(0, rect.top - 22) + 'px';
      highlight.style.left = rect.left + 'px';
      highlight.textContent = describeElement(el);
    } else {
      currentEl = null;
      overlay.style.display = 'none';
      highlight.style.display = 'none';
    }
  };

  const cleanup = () => {
    overlay.remove();
    highlight.remove();
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('visibilitychange', onVisibility);
    delete win.__grabInspector;
  };

  // page-side dismissals (Esc, tab switch) must reset the panel's toggle state too
  const dismiss = () => {
    cleanup();
    void chrome.runtime.sendMessage({ type: 'grab:inspector-dismissed' }).catch(() => undefined);
  };

  const onVisibility = () => {
    if (document.hidden) dismiss();
  };

  const onClick = (e: MouseEvent) => {
    if (!currentEl) return;
    e.preventDefault();
    e.stopPropagation();

    const el = currentEl;
    let url = '';
    let width = 0;
    let height = 0;
    let alt = '';

    if (el instanceof HTMLImageElement) {
      url = el.currentSrc || el.src;
      width = el.naturalWidth;
      height = el.naturalHeight;
      alt = el.alt;
    } else if (el instanceof HTMLCanvasElement) {
      try {
        url = el.toDataURL('image/png');
        width = el.width;
        height = el.height;
      } catch { return; }
    } else if (el.tagName === 'SVG' || el instanceof SVGElement) {
      try {
        const clone = (el as SVGElement).cloneNode(true) as SVGElement;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
        const rect = el.getBoundingClientRect();
        width = Math.round(rect.width);
        height = Math.round(rect.height);
      } catch { return; }
    } else {
      const style = getComputedStyle(el);
      const bg = style.backgroundImage;
      if (bg && bg !== 'none' && bg.includes('url(')) {
        const match = bg.match(/url\((['"]?)(.*?)\1\)/);
        if (match) {
          try {
            url = new URL(match[2], document.baseURI).href;
          } catch { return; }
        }
        const rect = el.getBoundingClientRect();
        width = Math.round(rect.width);
        height = Math.round(rect.height);
      }
    }

    if (url) {
      void chrome.runtime.sendMessage({
        type: 'grab:inspect-image',
        url,
        width,
        height,
        alt: alt || el.getAttribute('aria-label') || '',
      });
    }

    cleanup();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') dismiss();
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibility);

  win.__grabInspector = { overlay, highlight, onMouseMove, onClick, onKeyDown, onVisibility };
  return true;
}

export function uninstallInspector(): boolean {
  const win = window as typeof window & { __grabInspector?: InspectorState };
  const state = win.__grabInspector;
  if (!state) return false;
  state.overlay.remove();
  state.highlight.remove();
  document.removeEventListener('mousemove', state.onMouseMove);
  document.removeEventListener('click', state.onClick, true);
  document.removeEventListener('keydown', state.onKeyDown);
  document.removeEventListener('visibilitychange', state.onVisibility);
  delete win.__grabInspector;
  return true;
}
