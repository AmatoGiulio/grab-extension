type InspectorState = {
  overlay: HTMLDivElement;
  highlight: HTMLDivElement;
  onMouseMove: (e: MouseEvent) => void;
  onClick: (e: MouseEvent) => void;
  onKeyDown: (e: KeyboardEvent) => void;
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

  const onMouseMove = (e: MouseEvent) => {
    let el = document.elementFromPoint(e.clientX, e.clientY);
    if (el?.id === '__grab-inspector-overlay' || el?.id === '__grab-inspector-label') {
      el = document.elementFromPoint(e.clientX, e.clientY);
    }
    if (el && el !== document.body && el !== document.documentElement && isImageElement(el)) {
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

    overlay.remove();
    highlight.remove();
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown);
    delete win.__grabInspector;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      highlight.remove();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown);
      delete win.__grabInspector;
    }
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown);

  win.__grabInspector = { overlay, highlight, onMouseMove, onClick, onKeyDown };
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
  delete win.__grabInspector;
  return true;
}
