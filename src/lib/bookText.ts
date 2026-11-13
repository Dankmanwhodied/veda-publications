function normalizeBookText(value: string) {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function hasDistinctSynopsis(abstract?: string, synopsis?: string) {
  if (!synopsis?.trim()) return false;
  if (!abstract?.trim()) return true;

  const normalizedAbstract = normalizeBookText(abstract);
  const normalizedSynopsis = normalizeBookText(synopsis);

  if (normalizedAbstract === normalizedSynopsis) return false;
  if (Math.min(normalizedAbstract.length, normalizedSynopsis.length) < 40) return true;

  return !(
    normalizedAbstract.includes(normalizedSynopsis) ||
    normalizedSynopsis.includes(normalizedAbstract)
  );
}
