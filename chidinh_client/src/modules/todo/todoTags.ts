function normalizeTag(value: string) {
  return value.trim().toLowerCase();
}

export function parseTagInput(value: string) {
  return value
    .split(",")
    .map((part) => normalizeTag(part))
    .filter(Boolean);
}

export function addUniqueTags(existing: string[], next: string[]) {
  const seen = new Set(existing);
  const merged = [...existing];
  for (const tag of next) {
    if (seen.has(tag)) {
      continue;
    }
    seen.add(tag);
    merged.push(tag);
  }
  return merged;
}
