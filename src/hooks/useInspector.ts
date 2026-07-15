import { useCallback, useEffect, useRef, useState } from 'react';
import { getActiveTab, executeInTabIsolated } from '../services/chrome';
import { installInspector, uninstallInspector } from '../inspector';

export function useInspector(images: { id: string; url: string }[]) {
  const [active, setActive] = useState(false);
  const [inspectedImageId, setInspectedImageId] = useState<string | null>(null);
  const activeRef = useRef(false);

  const activate = useCallback(async () => {
    setActive(true);
    activeRef.current = true;
    setInspectedImageId(null);
    try {
      const tab = await getActiveTab();
      if (!tab.id) return;
      await executeInTabIsolated(tab.id, installInspector);
    } catch { /* ignore */ }
  }, []);

  const deactivate = useCallback(async (keepImageId = false) => {
    setActive(false);
    activeRef.current = false;
    if (!keepImageId) setInspectedImageId(null);
    try {
      const tab = await getActiveTab();
      if (!tab.id) return;
      await executeInTabIsolated(tab.id, uninstallInspector);
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    if (activeRef.current) {
      void deactivate();
    } else {
      void activate();
    }
  }, [activate, deactivate]);

  useEffect(() => {
    const onMessage = (message: unknown) => {
      const msg = message as { type: string; url: string; width?: number; height?: number; alt?: string } | undefined;
      if (msg?.type === 'grab:inspector-dismissed') {
        setActive(false);
        activeRef.current = false;
        return;
      }
      if (!msg || msg.type !== 'grab:inspect-image' || !msg.url) return;

      const match = images.find(
        (img) =>
          img.url === msg.url ||
          img.url.replace(/^https:/i, 'http:') === msg.url.replace(/^https:/i, 'http:'),
      );
      if (match) {
        setInspectedImageId(match.id);
      }

      deactivate(true);
    };

    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, [images, deactivate]);

  return { active, inspectedImageId, setInspectedImageId, activate, deactivate, toggle };
}
