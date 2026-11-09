const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_PATTERN = /^mona-[0-9a-zA-Z]{4}$/;

export function normalizeUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('Enter a URL to save.');
  }

  const input = value.trim();
  const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(input)
    ? input
    : `https://${input}`;
  const url = new URL(withProtocol);

  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
    throw new Error('Enter a valid HTTP or HTTPS URL.');
  }

  return url.href;
}

export function loadBookmarks(serialized) {
  if (typeof serialized !== 'string' || serialized === '') return [];

  try {
    const parsed = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];

    const bookmarks = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object' ||
          typeof item.url !== 'string' ||
          typeof item.slug !== 'string' ||
          !SLUG_PATTERN.test(item.slug)) {
        continue;
      }

      try {
        bookmarks.push({ url: normalizeUrl(item.url), slug: item.slug });
      } catch {
        // Discard entries that do not contain a valid web URL.
      }
    }
    return bookmarks;
  } catch {
    return [];
  }
}

export function formatBookmark(bookmark) {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

export function createSlug() {
  const randomValues = new Uint8Array(4);
  globalThis.crypto.getRandomValues(randomValues);
  return `mona-${Array.from(randomValues, (value) => BASE62[value % BASE62.length]).join('')}`;
}
