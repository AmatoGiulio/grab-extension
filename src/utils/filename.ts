export function uniqueFilename(raw: string, usedNames: Map<string, number>): string {
  const safe = raw.replace(/[\\/:*?"<>|]/g, '-');
  const count = usedNames.get(safe) ?? 0;
  usedNames.set(safe, count + 1);
  if (count === 0) return safe;
  const dot = safe.lastIndexOf('.');
  return dot > 0
    ? `${safe.slice(0, dot)}-${count + 1}${safe.slice(dot)}`
    : `${safe}-${count + 1}`;
}
