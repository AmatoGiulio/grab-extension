import type { CollectedImage, ImageSource } from './types';

export function collectImagesInPage(): CollectedImage[] {
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

  const filenameFromUrl = (url: string, index: number): string => {
    if (url.startsWith('data:') || url.startsWith('blob:')) return `image-${index + 1}.${extensionFromUrl(url)}`;
    try {
      const path = decodeURIComponent(new URL(url).pathname);
      const last = path.split('/').filter(Boolean).pop();
      if (last && last.includes('.')) return last.replace(/[\\/:*?"<>|]/g, '-');
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

    const previous = found.get(url);
    const index = found.size;
    const width = Math.max(previous?.width ?? 0, dimensions.width ?? 0);
    const height = Math.max(previous?.height ?? 0, dimensions.height ?? 0);
    const displayedWidth = Math.max(previous?.displayedWidth ?? 0, dimensions.displayedWidth ?? 0);
    const displayedHeight = Math.max(previous?.displayedHeight ?? 0, dimensions.displayedHeight ?? 0);
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

    found.set(url, {
      url,
      width,
      height,
      displayedWidth,
      displayedHeight,
      alt: dimensions.alt || previous?.alt || element?.getAttribute('alt') || '',
      title: dimensions.title || previous?.title || element?.getAttribute('title') || '',
      description: computedDescription || previous?.description || '',
      source: previous?.source ?? source,
      filename: previous?.filename ?? filenameFromUrl(url, index),
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
      aspectRatio: width > 0 && height > 0 ? Number((width / height).toFixed(4)) : null,
      pixelCount: width * height,
    });
  };

  document.querySelectorAll('img').forEach((image) => {
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
    add(image.currentSrc || image.src, 'img', image, dims);
    image.srcset.split(',').forEach((candidate) => add(candidate.trim().split(/\s+/)[0], 'srcset', image, dims));
    ['data-src', 'data-original', 'data-lazy-src', 'data-url', 'data-image'].forEach((attribute) => add(image.getAttribute(attribute), 'img', image, dims));
  });

  document.querySelectorAll('source[srcset]').forEach((source) => {
    source.getAttribute('srcset')?.split(',').forEach((candidate) => add(candidate.trim().split(/\s+/)[0], 'srcset', source));
  });

  document.querySelectorAll<HTMLElement>('*').forEach((element) => {
    const background = getComputedStyle(element).backgroundImage;
    if (!background || background === 'none') return;
    const rect = element.getBoundingClientRect();
    for (const match of background.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
      add(match[2], 'css', element, {
        displayedWidth: Math.round(rect.width),
        displayedHeight: Math.round(rect.height),
        title: element.title,
        description: element.getAttribute('aria-description') || element.getAttribute('aria-label') || '',
      });
    }
  });

  document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"], link[rel="image_src"]').forEach((element) => {
    add(element.getAttribute('content') || element.getAttribute('href'), 'meta', element, {
      description: element.getAttribute('property') || element.getAttribute('name') || element.getAttribute('rel') || '',
    });
  });

  document.querySelectorAll('svg').forEach((svg, svgIndex) => {
    try {
      const clone = svg.cloneNode(true) as SVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const serialized = new XMLSerializer().serializeToString(clone);
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
      const rect = svg.getBoundingClientRect();
      add(url, 'svg', svg, {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        displayedWidth: Math.round(rect.width),
        displayedHeight: Math.round(rect.height),
        alt: svg.getAttribute('aria-label') || `SVG ${svgIndex + 1}`,
        title: svg.getAttribute('title') || '',
        description: svg.getAttribute('aria-description') || svg.getAttribute('aria-label') || `SVG inline ${svgIndex + 1}`,
      });
    } catch { /* ignored */ }
  });

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
