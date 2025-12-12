# Task Detail: hook.ts Implementation

**Parent Task**: Task #1 in `tasks/README.md`

## Overview

Implement the main hook script that processes SessionStart and PostToolUse events to inject AGENTS.md content into Claude Code sessions.

## Technical Specifications

### File Structure

```typescript
#!/usr/bin/env node

// 1. Imports (Node.js built-ins only)
// 2. TypeScript interfaces
// 3. State management functions
// 4. Helper functions
// 5. Hook handlers
// 6. Main entry point

// Example imports:
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
```

### Required Interfaces

```typescript
interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  source?: string;                    // SessionStart only
  tool_name?: string;                 // PostToolUse only
  tool_input?: Record<string, unknown>; // PostToolUse only
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
```

### State Management Functions

#### `getStateFilePath(sessionId: string): string`

Returns the path to the session state file in OS temp directory.

**Logic**:
- Get temp directory from `os.tmpdir()`
- Return `${tmpdir}/claude-agents-md-${sessionId}.json`
- Example: `/tmp/claude-agents-md-abc123def456.json`

**Benefits**:
- OS automatically cleans up temp files (no infinite accumulation)
- Session-scoped (unique filename per session_id)
- No need to create directories (tmpdir always exists)

#### `loadInjectedPaths(sessionId: string): Set<string>`

Loads the set of already-injected AGENTS.md paths from the state file.

**Logic**:
- Get state file path
- Try to read and parse JSON
- Return Set of paths
- If file doesn't exist or invalid JSON, return empty Set
- Never throw errors

#### `saveInjectedPath(sessionId: string, agentsPath: string): void`

Adds a new path to the state and persists to disk.

**Logic**:
- Load existing injected paths
- Add new path to Set
- Write JSON with indentation (2 spaces) directly to temp file
- Never throw errors (log to stderr if needed)

#### `isAlreadyInjected(sessionId: string, agentsPath: string): boolean`

Checks if a path has already been injected in this session.

**Logic**:
- Load injected paths
- Check if Set contains the path
- Return boolean

### Helper Functions

#### `findClosestAgentsMd(filePath: string, projectRoot: string): string | null`

Walks up from a file's directory to find the closest AGENTS.md.

**Logic**:
1. Start from `path.dirname(path.resolve(filePath))`
2. Resolve `projectRoot` to absolute path
3. Loop:
   - Check if `{currentDir}/AGENTS.md` exists
   - If exists, return the path
   - If `currentDir === projectRoot`, break
   - If `currentDir === path.dirname(currentDir)` (filesystem root), break
   - Move to parent: `currentDir = path.dirname(currentDir)`
4. Return null if not found

**Edge Cases**:
- Handle symlinks (Node.js follows them by default)
- Stop at project root, never escape
- Stop at filesystem root as safety

#### `outputContext(eventName: string, content: string): void`

Outputs the hook response JSON and exits.

**Logic**:
- Construct HookOutput object
- `JSON.stringify()` with no formatting
- Write to stdout via `console.log()`
- Exit with code 0 via `process.exit(0)`

### Hook Handlers

#### `handleSessionStart(input: HookInput): void`

Handles SessionStart hook events.

**Logic**:
1. Extract `session_id`, `cwd`, `source` from input
2. If source is not in `['startup', 'clear', 'compact']`, exit silently
3. Construct path: `{cwd}/AGENTS.md`
4. If file doesn't exist, exit silently
5. If already injected (check via `isAlreadyInjected`), exit silently
6. Read file content (UTF-8)
7. Save path to state
8. Output context with event name 'SessionStart'

**Exit Points**:
- Wrong matcher (source): `process.exit(0)`
- File doesn't exist: `process.exit(0)`
- Already injected: `process.exit(0)`
- Success: `outputContext()` calls `process.exit(0)`

#### `handlePostToolUse(input: HookInput): void`

Handles PostToolUse hook events.

**Logic**:
1. Extract `session_id`, `cwd`, `tool_name`, `tool_input` from input
2. If `tool_name !== 'Read'`, exit silently
3. Extract `file_path` from `tool_input`
4. If no file_path, exit silently
5. Find closest AGENTS.md via `findClosestAgentsMd(file_path, cwd)`
6. If no AGENTS.md found, exit silently
7. If already injected, exit silently
8. Read file content (UTF-8)
9. Save path to state
10. Output context with event name 'PostToolUse'

**Exit Points**:
- Wrong tool name: `process.exit(0)`
- No file_path in input: `process.exit(0)`
- No AGENTS.md found: `process.exit(0)`
- Already injected: `process.exit(0)`
- Success: `outputContext()` calls `process.exit(0)`

### Main Entry Point

#### `main(): void`

Entry point that routes hook events.

**Logic**:
1. Wrap everything in try-catch
2. Read stdin synchronously: `fs.readFileSync(0, 'utf-8')`
3. Parse JSON as HookInput
4. Route based on `hook_event_name`:
   - `'SessionStart'` → `handleSessionStart(input)`
   - `'PostToolUse'` → `handlePostToolUse(input)`
   - Other → exit silently
5. Default exit: `process.exit(0)`
6. On error:
   - Log to stderr: `console.error('[agents-md] Error: {message}')`
   - Exit cleanly: `process.exit(0)` (never crash)

**Error Handling**:
- Never exit with non-zero unless intentionally blocking
- Always exit cleanly to avoid disrupting Claude Code
- Log errors to stderr for debugging
- Handle: invalid JSON, missing fields, file read errors, etc.

### Eraseable TypeScript Constraints

**Allowed**:
- Type annotations on variables, parameters, return types
- Interfaces and type aliases
- `as` type assertions
- Import statements for built-in modules (`import * as fs from 'fs'`)

**Not Allowed** (will break at runtime):
- Enums
- Namespaces
- Decorators
- Abstract classes
- Parameter properties

**Example of Eraseable Code**:
```typescript
// ✅ Good - erases to valid JavaScript
import * as fs from 'fs';
const x: string = 'hello';
function foo(a: number): number { return a + 1; }
interface Bar { x: number; }

// ❌ Bad - not eraseable
enum Status { Active, Inactive }
namespace Utils { export const x = 1; }
```

## Implementation Checklist

Within the implementation of hook.ts:

- [ ] Add shebang: `#!/usr/bin/env node`
- [ ] Import only Node.js built-ins: `fs`, `path`, `os`
- [ ] Define all required interfaces
- [ ] Implement `getStateFilePath()` using `os.tmpdir()`
- [ ] Implement `loadInjectedPaths()`
- [ ] Implement `saveInjectedPath()`
- [ ] Implement `isAlreadyInjected()`
- [ ] Implement `findClosestAgentsMd()`
- [ ] Implement `outputContext()`
- [ ] Implement `handleSessionStart()`
- [ ] Implement `handlePostToolUse()`
- [ ] Implement `main()` with try-catch
- [ ] Call `main()` at end of file
- [ ] Test that file runs via `node hook.ts`
- [ ] Verify no TypeScript compilation errors
- [ ] Verify only eraseable syntax used

## Testing Hooks Locally

You can test the hook script directly:

```bash
# Test SessionStart
echo '{"session_id":"test","cwd":"'$(pwd)'","hook_event_name":"SessionStart","source":"startup"}' | node hook.ts

# Test PostToolUse
echo '{"session_id":"test","cwd":"'$(pwd)'","hook_event_name":"PostToolUse","tool_name":"Read","tool_input":{"file_path":"'$(pwd)'/examples/nested/deeply/file.txt"}}' | node hook.ts

# Check state file
cat ~/.claude/session-env/test/agents-md-injected.json
```

## Line Count Estimate

Approximately 180-220 lines including:
- ~30 lines: Imports, shebang, interfaces
- ~80 lines: State management + helper functions
- ~60 lines: Hook handlers
- ~20 lines: Main entry point
- ~10 lines: Comments and whitespace
