import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { capContent, getMaxChars } from '../hook.ts';

const NOTICE = '[AGENTS.md truncated';

describe('capContent', () => {
  const cases = [
    {
      name: 'injects the whole file when under cap',
      content: 'short content',
      maxChars: 8000,
      expectTruncated: false,
    },
    {
      name: 'truncates at a paragraph boundary when over cap',
      content: `${'a'.repeat(50)}\n\n${'b'.repeat(300)}`,
      maxChars: 200,
      expectTruncated: true,
      expectBoundary: 'a'.repeat(50),
    },
    {
      name: 'truncates at a heading boundary when over cap',
      content: `${'a'.repeat(50)}\n# Next section\n${'b'.repeat(300)}`,
      maxChars: 200,
      expectTruncated: true,
      expectBoundary: 'a'.repeat(50),
    },
  ];

  for (const testCase of cases) {
    it(testCase.name, () => {
      const result = capContent(testCase.content, testCase.maxChars, '/tmp/AGENTS.md');

      if (!testCase.expectTruncated) {
        assert.strictEqual(result, testCase.content);
        return;
      }

      assert.ok(result.includes(NOTICE), 'expected truncation notice');
      assert.ok(result.includes('/tmp/AGENTS.md'), 'expected notice to point at the file');
      assert.ok(result.startsWith(testCase.expectBoundary as string), 'expected cut at boundary');
      assert.ok(!result.includes('bbb'), 'expected content past the boundary to be dropped');
      assert.ok(result.length <= testCase.maxChars, 'expected result to fit within the cap');
    });
  }

  it('fits within the cap even when the notice alone would overflow it', () => {
    const longPath = `/very/long/path/${'segment/'.repeat(20)}AGENTS.md`;
    const result = capContent('a'.repeat(500), 40, longPath);

    assert.ok(result.length <= 40, 'expected result to fit within the cap');
  });
});

describe('getMaxChars', () => {
  it('floors a configured value too small to leave room for content and the notice', () => {
    const original = process.env.AGENTS_MD_MAX_CHARS;
    process.env.AGENTS_MD_MAX_CHARS = '1';

    try {
      assert.ok(getMaxChars() >= 500, 'expected a floor above the pathological low value');
    } finally {
      if (original === undefined) {
        delete process.env.AGENTS_MD_MAX_CHARS;
      } else {
        process.env.AGENTS_MD_MAX_CHARS = original;
      }
    }
  });
});
