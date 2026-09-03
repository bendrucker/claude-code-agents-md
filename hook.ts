#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { pathToFileURL } from 'url';

interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  source?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  [key: string]: unknown;
}

interface HookOutput {
  hookSpecificOutput: {
    hookEventName: string;
    additionalContext: string;
  };
}

interface StateFile {
  injected_paths: string[];
}

function getStateFilePath(sessionId: string): string {
  return path.join(os.tmpdir(), `claude-agents-md-${sessionId}.json`);
}

function loadInjectedPaths(sessionId: string): Set<string> {
  try {
    const stateFilePath = getStateFilePath(sessionId);
    const content = fs.readFileSync(stateFilePath, 'utf-8');
    const state = JSON.parse(content) as StateFile;
    return new Set(state.injected_paths);
  } catch {
    return new Set();
  }
}

function saveInjectedPath(sessionId: string, agentsPath: string): void {
  try {
    const paths = loadInjectedPaths(sessionId);
    paths.add(agentsPath);
    const state: StateFile = { injected_paths: Array.from(paths) };
    fs.writeFileSync(getStateFilePath(sessionId), JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('[agents-md] Failed to save state:', err);
  }
}

function isAlreadyInjected(sessionId: string, agentsPath: string): boolean {
  return loadInjectedPaths(sessionId).has(agentsPath);
}

function findClosestAgentsMd(filePath: string, projectRoot: string): string | null {
  let currentDir = path.dirname(path.resolve(filePath));
  const resolvedRoot = path.resolve(projectRoot);

  while (true) {
    const agentsPath = path.join(currentDir, 'AGENTS.md');
    if (fs.existsSync(agentsPath)) {
      return agentsPath;
    }

    if (currentDir === resolvedRoot) {
      break;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return null;
}

const DEFAULT_MAX_CHARS = 8000;

function getMaxChars(): number {
  const configured = Number(process.env.AGENTS_MD_MAX_CHARS);
  return Number.isInteger(configured) && configured > 0 ? configured : DEFAULT_MAX_CHARS;
}

// Cuts at the last paragraph or heading break before maxChars so we don't
// truncate mid-sentence, then appends a notice pointing at the full file.
// The notice's own length comes out of the budget so the result still fits maxChars.
function capContent(content: string, maxChars: number, filePath: string): string {
  if (content.length <= maxChars) {
    return content;
  }

  const notice = `\n\n[AGENTS.md truncated at ${maxChars} characters. Read the full file at ${filePath}]`;
  const budget = Math.max(maxChars - notice.length, 0);
  const head = content.slice(0, budget);
  const boundary = Math.max(head.lastIndexOf('\n\n'), head.lastIndexOf('\n#'));
  const cut = boundary > 0 ? boundary : budget;
  const truncated = content.slice(0, cut).trimEnd();

  return `${truncated}${notice}`;
}

function outputContext(eventName: string, content: string): void {
  const output: HookOutput = {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: content,
    },
  };
  process.stdout.write(JSON.stringify(output));
  process.exit(0);
}

function handleSessionStart(input: HookInput): void {
  const { session_id, cwd, source } = input;

  if (!['startup', 'clear', 'compact'].includes(source as string)) {
    process.exit(0);
  }

  const agentsPath = path.join(cwd, 'AGENTS.md');
  if (!fs.existsSync(agentsPath)) {
    process.exit(0);
  }

  if (isAlreadyInjected(session_id, agentsPath)) {
    process.exit(0);
  }

  const content = fs.readFileSync(agentsPath, 'utf-8');
  saveInjectedPath(session_id, agentsPath);
  outputContext('SessionStart', capContent(content, getMaxChars(), agentsPath));
}

function handlePostToolUse(input: HookInput): void {
  const { session_id, cwd, tool_name, tool_input } = input;

  if (tool_name !== 'Read') {
    process.exit(0);
  }

  const filePath = tool_input?.file_path as string | undefined;
  if (!filePath) {
    process.exit(0);
  }

  const agentsPath = findClosestAgentsMd(filePath, cwd);
  if (!agentsPath) {
    process.exit(0);
  }

  if (isAlreadyInjected(session_id, agentsPath)) {
    process.exit(0);
  }

  const content = fs.readFileSync(agentsPath, 'utf-8');
  saveInjectedPath(session_id, agentsPath);
  outputContext('PostToolUse', capContent(content, getMaxChars(), agentsPath));
}

function main(): void {
  try {
    const stdin = fs.readFileSync(0, 'utf-8');
    const input = JSON.parse(stdin) as HookInput;

    switch (input.hook_event_name) {
      case 'SessionStart':
        handleSessionStart(input);
        break;
      case 'PostToolUse':
        handlePostToolUse(input);
        break;
      default:
        process.exit(0);
    }

    process.exit(0);
  } catch (err) {
    console.error('[agents-md] Error:', (err as Error).message);
    process.exit(0);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { capContent, getMaxChars, DEFAULT_MAX_CHARS };
