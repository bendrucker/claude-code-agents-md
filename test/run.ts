import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as path from 'path';
import { runTest, getAssistantResponse } from './harness.ts';
import { assertResponseContains, assertToolUsed } from './assertions.ts';

const FIXTURES_DIR = path.join(import.meta.dirname, 'fixtures');
const PLUGIN_PATH = path.join(import.meta.dirname, '..');

describe('AGENTS.md Plugin', () => {
  it('injects AGENTS.md content at session start', async () => {
    const { messages } = await runTest({
      cwd: path.join(FIXTURES_DIR, 'basic'),
      prompt: 'What is the password?',
      pluginPath: PLUGIN_PATH,
    });

    const response = getAssistantResponse(messages);
    assertResponseContains(response, 'XYZZY123');
  });

  it('injects closest AGENTS.md after Read tool', async () => {
    const { messages } = await runTest({
      cwd: path.join(FIXTURES_DIR, 'nested'),
      prompt: 'Read the file subdir/file.txt, then tell me the magic number',
      pluginPath: PLUGIN_PATH,
    });

    assertToolUsed(messages, 'Read');
    const response = getAssistantResponse(messages);
    assertResponseContains(response, '42');
  });

  it('selects closest AGENTS.md in hierarchy', async () => {
    const { messages } = await runTest({
      cwd: path.join(FIXTURES_DIR, 'hierarchy'),
      prompt: 'Read deep/deeper/file.txt, what level are we at?',
      pluginPath: PLUGIN_PATH,
    });

    assertToolUsed(messages, 'Read');
    const response = getAssistantResponse(messages);
    assertResponseContains(response, 'deep');
  });

  it('handles missing AGENTS.md gracefully', async () => {
    const { messages } = await runTest({
      cwd: path.join(FIXTURES_DIR, 'no-agents'),
      prompt: 'Read file.txt and summarize it',
      pluginPath: PLUGIN_PATH,
    });

    assertToolUsed(messages, 'Read');
    const response = getAssistantResponse(messages);
    assert.ok(response.length > 0, 'Expected non-empty response');
  });
});
