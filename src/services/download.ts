import { createObjectUrl, revokeObjectUrl } from './chrome';

export async function triggerBlobDownload(
  blob: Blob,
  filename: string,
  saveAs: boolean,
): Promise<void> {
  const objectUrl = createObjectUrl(blob);

  try {
    const downloadId = await chrome.downloads.download({ url: objectUrl, filename, saveAs });

    const onChanged = (delta: chrome.downloads.DownloadDelta) => {
      if (delta.id !== downloadId) return;
      if (delta.state?.current === 'complete' || delta.state?.current === 'interrupted') {
        chrome.downloads.onChanged.removeListener(onChanged);
        revokeObjectUrl(objectUrl);
      }
    };

    chrome.downloads.onChanged.addListener(onChanged);

    setTimeout(() => {
      chrome.downloads.onChanged.removeListener(onChanged);
      revokeObjectUrl(objectUrl);
    }, 120_000);
  } catch (e) {
    revokeObjectUrl(objectUrl);
    throw e;
  }
}
