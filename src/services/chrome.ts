import type { CollectedImage } from '../types';

export async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export function executeInTab<T>(
  tabId: number,
  func: () => T,
): Promise<chrome.scripting.InjectionResult<Awaited<T>>[]> {
  return chrome.scripting.executeScript({ target: { tabId, allFrames: true }, func }) as any;
}

export function executeInTabIsolated<T>(
  tabId: number,
  func: () => T,
): Promise<chrome.scripting.InjectionResult<Awaited<T>>[]> {
  return chrome.scripting.executeScript({
    target: { tabId },
    func,
    world: 'ISOLATED',
  }) as any;
}

export function executeInTabWithArgs<T, Args extends unknown[]>(
  tabId: number,
  args: Args,
  func: (...args: Args) => T,
): Promise<chrome.scripting.InjectionResult<Awaited<T>>[]> {
  return chrome.scripting.executeScript({ target: { tabId, allFrames: true }, args, func }) as any;
}

export async function downloadUrl(url: string, filename: string, saveAs: boolean): Promise<void> {
  await chrome.downloads.download({ url, filename, saveAs });
}

export function getStorage(key: string): Promise<Record<string, unknown>> {
  return chrome.storage.local.get(key);
}

export function setStorage(data: Record<string, unknown>): Promise<void> {
  return chrome.storage.local.set(data);
}

export function sendMessage(message: unknown): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

export function openPanelOnAction(): Promise<void> {
  return chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}

export function createObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}
