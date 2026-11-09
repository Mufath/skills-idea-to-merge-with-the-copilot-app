import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlug, formatBookmark, loadBookmarks, normalizeUrl } from './bookmarks.js';

test('URLs with and without https normalize to the same saved value', () => {
  assert.equal(normalizeUrl('https://www.example.com'), normalizeUrl('www.example.com'));
  assert.equal(normalizeUrl('www.example.com'), 'https://www.example.com/');
});

test('empty, corrupted, legacy, and non-array storage values recover as an empty list', () => {
  for (const value of ['', '{broken json', '["https://example.com"]', '{"url":"https://example.com"}']) {
    assert.deepEqual(loadBookmarks(value), []);
  }
  assert.deepEqual(loadBookmarks(null), []);
});

test('loading keeps valid entries and drops malformed stored entries', () => {
  assert.deepEqual(
    loadBookmarks(JSON.stringify([
      { url: 'www.example.com', slug: 'mona-7fk2' },
      { url: 'not a url', slug: 'mona-1234' },
      { url: 'https://bad-slug.example', slug: 'mona-!' },
      null,
    ])),
    [{ url: 'https://www.example.com/', slug: 'mona-7fk2' }],
  );
});

test('a saved bookmark uses the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com/', slug: 'mona-7fk2' }),
    'https://www.example.com/ :: mona-7fk2',
  );
});

test('generated slugs use the mona prefix and four base62 characters', () => {
  assert.match(createSlug(), /^mona-[0-9a-zA-Z]{4}$/);
});
