import { useEffect } from 'react';

export function useChromeEvents(
  scan: (options?: { silent?: boolean }) => void,
  downloading: boolean,
) {
  useEffect(() => {
    const onActivated = () => scan({ silent: false });
    const onUpdated = (_tabId: number, change: { status?: string }) => {
      if (change.status === 'complete') scan({ silent: false });
    };
    const onMessage = (message: unknown, _sender: chrome.runtime.MessageSender) => {
      const typed = message as { type?: string };
      if (typed?.type === 'grab:page-change' && !downloading) {
        scan({ silent: true });
      }
    };

    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.runtime.onMessage.addListener(onMessage);

    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, [scan, downloading]);
}
