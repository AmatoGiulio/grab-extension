import type { CollectedImage, ImageSource } from './types';

export function collectImagesInPage(options?: {
  includeCssBackgrounds?: boolean;
  includeSvg?: boolean;
  includeCanvas?: boolean;
  strictDedup?: boolean;
}): CollectedImage[] {
  const MIN_DIMENSION = 32;
  const MIN_PIXEL_COUNT = 256;
  const { includeCssBackgrounds = true, includeSvg = true, includeCanvas = true, strictDedup = false } = options ?? {};

  const queryAllWithShadow = (root: Document | ShadowRoot | Element, cb: (el: Element) => void): void => {
    function walk(node: Node) {
      if (node instanceof Element) {
        cb(node);
        if (node.shadowRoot) walk(node.shadowRoot);
      }
      for (const child of node.childNodes) {
        if (child instanceof Element) {
          walk(child);
        }
      }
    }
    walk(root);
  };

  const walkShadowRoots = (root: Document | ShadowRoot | Element, cb: (el: Element) => void): void => {
    if (root instanceof Element) {
      cb(root);
      if (root.shadowRoot) walkShadowRoots(root.shadowRoot, cb);
    }
    for (const child of (root as Document | Element).children) {
      if (child instanceof Element) walkShadowRoots(child, cb);
    }
  };

  type Raw = Omit<CollectedImage, 'id'>;
  const found = new Map<string, Raw>();

  const normalize = (value: string | null | undefined): string | null => {
    if (!value) return null;
    const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
    if (!trimmed) return null;
    if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) return trimmed;
    try {
      return new URL(trimmed, document.baseURI).href;
    } catch {
      return null;
    }
  };

  const dedupKey = (url: string): string => {
    try {
      const parsed = new URL(url);
      let key = parsed.origin + parsed.pathname;
      if (strictDedup) {
        key = key.replace(/^https:/, 'http:').toLowerCase();
      }
      return key;
    } catch {
      return url;
    }
  };

  const hasTrackingParams = (url: string): boolean => {
    try {
      const search = new URL(url).searchParams;
      const trackers = ['utm_', 'fbclid', 'gclid', 'ref', 'spm'];
      return trackers.some((t) => [...search.keys()].some((k) => k.startsWith(t)));
    } catch {
      return false;
    }
  };

  const extensionFromUrl = (url: string): string => {
    if (url.startsWith('data:image/')) {
      const end = url.indexOf(';');
      return url.slice(11, end > -1 ? end : undefined).replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    }
    try {
      const match = new URL(url).pathname.match(/\.([a-zA-Z0-9]{2,6})$/);
      return (match?.[1] ?? 'image').toLowerCase();
    } catch {
      return 'image';
    }
  };

  const mimeFromExtension = (extension: string): string => {
    const normalized = extension === 'jpg' ? 'jpeg' : extension;
    return ['jpeg', 'png', 'webp', 'gif', 'avif', 'bmp'].includes(normalized)
      ? `image/${normalized}`
      : extension === 'svg' ? 'image/svg+xml' : 'application/octet-stream';
  };

  const cleanFilename = (name: string): string => {
    return name
      .replace(/[\\/:*?"<>|]/g, '-')
      .replace(/[#?].*$/, '')
      .replace(/[-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
  };

  const smartFilename = (alt: string, title: string, url: string, index: number): string => {
    const label = alt || title;
    if (label && label.length > 2 && /[a-zA-Z]/.test(label)) {
      const cleaned = cleanFilename(label);
      if (cleaned) return `${cleaned}.${extensionFromUrl(url)}`;
    }

    if (url.startsWith('data:') || url.startsWith('blob:')) return `image-${index + 1}.${extensionFromUrl(url)}`;
    try {
      const path = decodeURIComponent(new URL(url).pathname);
      let last = path.split('/').filter(Boolean).pop() || '';
      if (last.includes('.')) {
        last = last
          .replace(/[-_]\d+x\d+[-_]/g, '-')
          .replace(/[-_]\d+x\d+$/, '')
          .replace(/[.#][a-f0-9]{8,32}\./i, '.');
        if (last !== '.' && !last.startsWith('-')) return last;
      }
    } catch { /* ignored */ }
    return `image-${index + 1}.${extensionFromUrl(url)}`;
  };

  const selectorFor = (element: Element | null): string => {
    if (!element) return '';
    if (element.id) return `#${CSS.escape(element.id)}`;
    const parts: string[] = [];
    let current: Element | null = element;
    while (current && parts.length < 4 && current !== document.documentElement) {
      let part = current.tagName.toLowerCase();
      const classes = [...current.classList].slice(0, 2).map((name) => `.${CSS.escape(name)}`).join('');
      if (classes) part += classes;
      const parent: Element | null = current.parentElement;
      if (parent) {
        const siblings = [...parent.children].filter((child) => child.tagName === current?.tagName);
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
      parts.unshift(part);
      current = parent;
    }
    return parts.join(' > ');
  };

  const add = (
    rawUrl: string | null | undefined,
    source: ImageSource,
    element: Element | null = null,
    dimensions: Partial<Pick<Raw, 'width' | 'height' | 'displayedWidth' | 'displayedHeight' | 'alt' | 'title' | 'description' | 'srcset'>> = {},
  ) => {
    const url = normalize(rawUrl);
    if (!url || (!url.startsWith('http') && !url.startsWith('data:image/') && !url.startsWith('blob:'))) return;

    const width = Math.max(dimensions.width ?? 0, 0);
    const height = Math.max(dimensions.height ?? 0, 0);
    const displayedWidth = Math.max(dimensions.displayedWidth ?? 0, Math.round(element?.getBoundingClientRect().width ?? 0));
    const displayedHeight = Math.max(dimensions.displayedHeight ?? 0, Math.round(element?.getBoundingClientRect().height ?? 0));

    const effectiveWidth = width || displayedWidth;
    const effectiveHeight = height || displayedHeight;

    if (effectiveWidth < MIN_DIMENSION && effectiveHeight < MIN_DIMENSION) return;
    if (effectiveWidth * effectiveHeight < MIN_PIXEL_COUNT) return;

    const key = dedupKey(url);
    const previous = found.get(key);
    const index = found.size;
    const finalWidth = Math.max(previous?.width ?? 0, width);
    const finalHeight = Math.max(previous?.height ?? 0, height);
    const finalDisplayedWidth = Math.max(previous?.displayedWidth ?? 0, displayedWidth);
    const finalDisplayedHeight = Math.max(previous?.displayedHeight ?? 0, displayedHeight);
    const extension = previous?.extension ?? extensionFromUrl(url);
    const rect = element?.getBoundingClientRect();
    const visible = Boolean(rect && rect.width > 0 && rect.height > 0 && getComputedStyle(element as Element).visibility !== 'hidden');
    let origin = '';
    let pathname = '';
    try {
      const parsed = new URL(url);
      origin = parsed.origin;
      pathname = parsed.pathname;
    } catch { /* data/blob */ }

    const htmlElement = element instanceof HTMLElement ? element : null;
    const imageElement = element instanceof HTMLImageElement ? element : null;
    const ariaDescription = element?.getAttribute('aria-description') || element?.getAttribute('aria-label') || '';
    const computedDescription = dimensions.description || ariaDescription || dimensions.alt || dimensions.title || '';

    const pixelCount = finalWidth * finalHeight;
    const keepNew = !previous || pixelCount > previous.pixelCount;

    found.set(key, {
      url: keepNew ? url : previous.url,
      width: finalWidth,
      height: finalHeight,
      displayedWidth: finalDisplayedWidth,
      displayedHeight: finalDisplayedHeight,
      alt: dimensions.alt || previous?.alt || element?.getAttribute('alt') || '',
      title: dimensions.title || previous?.title || element?.getAttribute('title') || '',
      description: computedDescription || previous?.description || '',
      source: previous?.source ?? source,
      filename: previous?.filename ?? smartFilename(dimensions.alt || '', dimensions.title || '', url, index),
      extension,
      mimeType: previous?.mimeType ?? mimeFromExtension(extension),
      elementTag: previous?.elementTag || element?.tagName.toLowerCase() || source,
      selector: previous?.selector || selectorFor(element),
      className: previous?.className || htmlElement?.className || '',
      loading: previous?.loading || imageElement?.loading || '',
      decoding: previous?.decoding || imageElement?.decoding || '',
      crossOrigin: previous?.crossOrigin || imageElement?.crossOrigin || '',
      referrerPolicy: previous?.referrerPolicy || imageElement?.referrerPolicy || '',
      srcset: dimensions.srcset || previous?.srcset || imageElement?.srcset || '',
      visible: previous?.visible || visible,
      pageUrl: location.href,
      pageTitle: document.title,
      origin,
      pathname,
      aspectRatio: finalWidth > 0 && finalHeight > 0 ? Number((finalWidth / finalHeight).toFixed(4)) : null,
      pixelCount,
    });
  };

  queryAllWithShadow(document, (el) => {
    if (el.tagName === 'IMG') {
      const image = el as HTMLImageElement;
      if (image.naturalWidth === 0 && image.naturalHeight === 0) return;
      const rect = image.getBoundingClientRect();
      const dims = {
        width: image.naturalWidth,
        height: image.naturalHeight,
        displayedWidth: Math.round(rect.width),
        displayedHeight: Math.round(rect.height),
        alt: image.alt,
        title: image.title,
        description: image.getAttribute('aria-description') || image.getAttribute('aria-label') || image.alt,
        srcset: image.srcset,
      };
      const src = image.currentSrc || image.src;
      if (strictDedup && hasTrackingParams(src) && !found.has(dedupKey(src))) return;
      add(src, 'img', image, dims);
      image.srcset.split(',').forEach((candidate) => add(candidate.trim().split(/\s+/)[0], 'srcset', image, dims));
      ['data-src', 'data-original', 'data-lazy-src', 'data-url', 'data-image'].forEach((attribute) => add(image.getAttribute(attribute), 'img', image, dims));
    }
  });

  queryAllWithShadow(document, (el) => {
    if (el.tagName === 'SOURCE' && el.getAttribute('srcset')) {
      el.getAttribute('srcset')?.split(',').forEach((candidate) => add(candidate.trim().split(/\s+/)[0], 'srcset', el));
    }
  });

  if (includeCssBackgrounds) {
    const cssSeen = new Set<string>();
    walkShadowRoots(document, (el) => {
      if (!(el instanceof HTMLElement)) return;
      const style = getComputedStyle(el);
      const background = style.backgroundImage;
      if (!background || background === 'none' || !background.includes('url(')) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < MIN_DIMENSION && rect.height < MIN_DIMENSION) return;
      for (const match of background.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
        const url = match[2];
        if (!cssSeen.has(url)) {
          cssSeen.add(url);
          add(url, 'css', el, {
            displayedWidth: Math.round(rect.width),
            displayedHeight: Math.round(rect.height),
            title: el.title,
            description: el.getAttribute('aria-description') || el.getAttribute('aria-label') || '',
          });
        }
      }
    });

    try {
      const stylesheetUrls = new Set<string>();
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            const cssText = rule.cssText;
            for (const match of cssText.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
              const raw = match[2].trim();
              if (raw.endsWith('.svg') || raw.endsWith('.png') || raw.endsWith('.jpg') || raw.endsWith('.jpeg') || raw.endsWith('.webp') || raw.endsWith('.gif') || raw.endsWith('.avif') || raw.endsWith('.bmp')) {
                if (!cssSeen.has(raw)) {
                  stylesheetUrls.add(raw);
                }
              }
            }
          }
        } catch { /* cross-origin stylesheet */ }
      }
      for (const raw of stylesheetUrls) {
        add(raw, 'css', null);
      }
    } catch { /* stylesheet iteration not supported */ }
  }

  queryAllWithShadow(document, (el) => {
    if (el.tagName === 'META' || el.tagName === 'LINK') {
      const prop = el.getAttribute('property') || '';
      const name = el.getAttribute('name') || '';
      const rel = el.getAttribute('rel') || '';
      if (prop === 'og:image' || name === 'twitter:image' || rel === 'image_src') {
        add(el.getAttribute('content') || el.getAttribute('href'), 'meta', el, {
          description: prop || name || rel || '',
        });
      }
    }
  });

  if (includeSvg) {
    let svgIndex = 0;
    queryAllWithShadow(document, (el) => {
      if (el.tagName !== 'SVG') return;
      const svg = el as SVGElement;
      try {
        const rect = svg.getBoundingClientRect();
        if (rect.width < MIN_DIMENSION && rect.height < MIN_DIMENSION) return;
        const clone = svg.cloneNode(true) as SVGElement;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const serialized = new XMLSerializer().serializeToString(clone);
        const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
        svgIndex++;
        add(url, 'svg', svg, {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          displayedWidth: Math.round(rect.width),
          displayedHeight: Math.round(rect.height),
          alt: svg.getAttribute('aria-label') || `SVG ${svgIndex}`,
          title: svg.getAttribute('title') || '',
          description: svg.getAttribute('aria-description') || svg.getAttribute('aria-label') || `SVG inline ${svgIndex}`,
        });
      } catch { /* ignored */ }
    });
  }

  if (includeCanvas) {
    queryAllWithShadow(document, (el) => {
      if (el.tagName !== 'CANVAS') return;
      const canvas = el as HTMLCanvasElement;
      try {
        const dataUrl = canvas.toDataURL('image/png');
        if (!dataUrl || dataUrl === 'data:,') return;
        const rect = canvas.getBoundingClientRect();
        add(dataUrl, 'canvas', canvas, {
          width: canvas.width || Math.round(rect.width),
          height: canvas.height || Math.round(rect.height),
          displayedWidth: Math.round(rect.width),
          displayedHeight: Math.round(rect.height),
          alt: canvas.getAttribute('aria-label') || canvas.getAttribute('alt') || '',
          title: canvas.getAttribute('title') || '',
          description: canvas.getAttribute('aria-description') || canvas.getAttribute('aria-label') || '',
        });
      } catch { /* tainted canvas — skip */ }
    });
  }

  return [...found.values()].map((item) => ({ ...item, id: item.url }));
}

export function installRealtimeImageWatcher(): boolean {
  const target = window as typeof window & { __imageCollectorWatcherInstalled?: boolean; __imageCollectorTimer?: number };
  if (target.__imageCollectorWatcherInstalled) return false;
  target.__imageCollectorWatcherInstalled = true;

  const notify = () => {
    window.clearTimeout(target.__imageCollectorTimer);
    target.__imageCollectorTimer = window.setTimeout(() => {
      void chrome.runtime.sendMessage({ type: 'grab:page-change', url: location.href }).catch(() => undefined);
    }, 280);
  };

  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['src', 'srcset', 'style', 'class', 'href', 'content', 'data-src', 'data-original', 'data-lazy-src', 'data-url'],
  });

  document.addEventListener('load', notify, true);
  document.addEventListener('error', notify, true);
  return true;
}
