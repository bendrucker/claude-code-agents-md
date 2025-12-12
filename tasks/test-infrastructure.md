# Task Detail: Test Infrastructure

**Parent Milestone**: Testing

## Purpose

Set up infrastructure for programmatic end-to-end testing using Claude Code's verbose JSON stream mode and the Claude Agent SDK.

## Architecture

### Test Execution Flow

1. Create test fixture (directory with AGENTS.md)
2. Start Claude Code session with plugin loaded
3. Send prompt via Claude Agent SDK
4. Observe JSON stream output
5. Assert expected behavior

### Key Components

#### Test Harness

Use TypeScript + Claude Agent SDK to:
- Spawn Claude Code processes
- Parse JSON stream output
- Track hook executions
- Assert on results

#### Fixture Management

Test fixtures in `test/fixtures/`:
```
test/fixtures/
├── basic/
│   ├── AGENTS.md          # Contains secret answer
│   └── question.txt       # Trigger file
├── nested/
│   ├── AGENTS.md
│   └── subdir/
│       ├── AGENTS.md
│       └── file.txt
└── no-agents/
    └── file.txt
```

#### Dependencies

Add `package.json` for test dependencies:
```json
{
  "name": "claude-code-agents-md",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "node test/run.ts"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Test Infrastructure Files

### `test/harness.ts`

Test harness utilities:
- `spawnClaude(cwd, options)` - Start Claude Code with verbose JSON
- `parseJsonStream(stream)` - Parse line-delimited JSON
- `waitForHook(stream, hookName)` - Wait for specific hook execution
- `sendPrompt(session, prompt)` - Send user message
- `getResponse(stream)` - Extract assistant response

### `test/fixtures.ts`

Fixture helpers:
- `createFixture(name, files)` - Create temp test directory
- `cleanupFixture(path)` - Remove test directory

### `test/assertions.ts`

Custom assertions:
- `assertHookExecuted(stream, hookName)` - Verify hook ran
- `assertContextInjected(stream, content)` - Verify AGENTS.md injected
- `assertResponseContains(response, text)` - Check answer

## Verbose JSON Stream Format

Claude Code with `--json-stream` outputs:
```json
{"type":"hook","event":"SessionStart","output":{...}}
{"type":"tool","name":"Read","input":{...}}
{"type":"tool","name":"Read","output":{...}}
{"type":"message","role":"assistant","content":"..."}
```

Parse this to verify:
- Hook executions
- Tool calls
- Context injection
- Assistant responses

## Implementation Steps

1. Create `package.json` with test dependencies
2. Implement `test/harness.ts` - Claude spawning and JSON parsing
3. Implement `test/fixtures.ts` - Fixture management
4. Implement `test/assertions.ts` - Test helpers
5. Create basic fixture: `test/fixtures/basic/`

## Validation Criteria

- [ ] `package.json` created with test dependencies
- [ ] Test harness can spawn Claude Code processes
- [ ] JSON stream parser works correctly
- [ ] Fixture helpers create/cleanup test directories
- [ ] Assertion helpers validate hook behavior
- [ ] Basic fixture exists and is well-structured
