# Task Detail: End-to-End Tests

**Parent Milestone**: Test Infrastructure

## Purpose

Define the behavioral contract for the plugin through end-to-end tests. These tests should be written FIRST, before implementation, to establish what "correct" looks like.

## Test-Driven Development Workflow

1. Write test case defining expected behavior
2. Run test - it should fail (no implementation yet)
3. Implement minimum code to make test pass
4. Verify test passes
5. Repeat for next behavior

## Test Strategy

### Primary Test: Question Answering

**Setup**: AGENTS.md contains information Claude wouldn't otherwise know
**Test**: Ask question, verify correct answer using AGENTS.md content
**Assertion**: Response contains expected information

This proves:
- Hook executed
- AGENTS.md loaded into context
- Claude used the injected information

### Test Cases

#### Test 1: Basic SessionStart Injection

**Fixture**: `test/fixtures/basic/`

`AGENTS.md`:
```markdown
# Secret Information

The password is: XYZZY123
```

**Prompt**: "What is the password?"

**Expected**:
- SessionStart hook executes
- AGENTS.md injected into context
- Response contains "XYZZY123"

**Assertions**:
```typescript
await assertHookExecuted(stream, 'SessionStart');
await assertContextInjected(stream, 'The password is: XYZZY123');
await assertResponseContains(response, 'XYZZY123');
```

---

#### Test 2: PostToolUse (Read) Injection

**Fixture**: `test/fixtures/nested/`

```
nested/
├── AGENTS.md (Contains: "Root level")
└── subdir/
    ├── AGENTS.md (Contains: "The magic number is 42")
    └── file.txt
```

**Prompt**: "Read the file subdir/file.txt, then tell me the magic number"

**Expected**:
- Read tool executes on `subdir/file.txt`
- PostToolUse hook executes
- `subdir/AGENTS.md` injected (not root)
- Response contains "42"

**Assertions**:
```typescript
await assertToolExecuted(stream, 'Read', {file_path: /subdir\/file\.txt/});
await assertHookExecuted(stream, 'PostToolUse');
await assertContextInjected(stream, 'magic number is 42');
await assertResponseContains(response, '42');
```

---

#### Test 3: Deduplication

**Fixture**: Same as Test 1

**Prompts**:
1. "What is the password?" (first time)
2. "/clear"
3. "What is the password?" (after clear)

**Expected**:
- First: SessionStart hook runs, AGENTS.md injected
- Clear: SessionStart hook runs again, AGENTS.md re-injected
- Both responses contain "XYZZY123"

**Assertions**:
```typescript
// First session
await assertHookExecuted(firstStream, 'SessionStart');
await assertResponseContains(firstResponse, 'XYZZY123');

// After clear
await assertHookExecuted(clearedStream, 'SessionStart');
await assertResponseContains(clearedResponse, 'XYZZY123');

// Verify state file tracking
const stateFile = getSessionStateFile(sessionId);
const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
assert(state.injected_paths.length > 0);
```

---

#### Test 4: Closest AGENTS.md Wins

**Fixture**: `test/fixtures/hierarchy/`

```
hierarchy/
├── AGENTS.md (Contains: "Level: root")
└── deep/
    ├── AGENTS.md (Contains: "Level: deep")
    └── deeper/
        └── file.txt
```

**Prompt**: "Read deep/deeper/file.txt, what level are we at?"

**Expected**:
- Reads `deep/deeper/file.txt`
- Walks up to find closest AGENTS.md
- Injects `deep/AGENTS.md` (not root)
- Response contains "deep"

---

#### Test 5: No AGENTS.md - Graceful Handling

**Fixture**: `test/fixtures/no-agents/`

```
no-agents/
└── file.txt
```

**Prompt**: "Read file.txt and summarize it"

**Expected**:
- Read tool executes
- PostToolUse hook runs but finds no AGENTS.md
- Hook exits gracefully (no error)
- Claude responds normally without injected context

**Assertions**:
```typescript
await assertToolExecuted(stream, 'Read');
await assertHookExecuted(stream, 'PostToolUse');
await assertNoContextInjected(stream); // Hook ran but injected nothing
await assertResponseSuccess(response); // Claude continues normally
```

---

## Test File Structure

### `test/run.ts`

Main test runner:
```typescript
import { runTest } from './harness';
import * as tests from './cases';

async function main() {
  const results = [];

  for (const [name, test] of Object.entries(tests)) {
    console.log(`Running: ${name}`);
    const result = await runTest(test);
    results.push({ name, ...result });
  }

  printResults(results);
  process.exit(results.every(r => r.passed) ? 0 : 1);
}

main();
```

### `test/cases/basic.ts`

Individual test case:
```typescript
import { TestCase } from '../harness';

export const basicInjection: TestCase = {
  name: 'Basic SessionStart Injection',
  fixture: 'basic',

  async run({ session, assert }) {
    const stream = await session.start();
    await assert.hookExecuted(stream, 'SessionStart');

    const response = await session.ask('What is the password?');
    await assert.responseContains(response, 'XYZZY123');
  }
};
```

## Light Unit Testing

In addition to E2E tests, add minimal unit tests for critical functions:

### `test/unit/directory-walking.test.ts`

Test `findClosestAgentsMd()` in isolation:
```typescript
import { findClosestAgentsMd } from '../../hook';

// Mock filesystem, test walking logic
test('walks up from nested file to find AGENTS.md', () => {
  const result = findClosestAgentsMd('/project/src/deep/file.ts', '/project');
  assert.equal(result, '/project/src/AGENTS.md');
});

test('stops at project root', () => {
  const result = findClosestAgentsMd('/project/file.ts', '/project');
  assert.equal(result, null); // No AGENTS.md in /project
});
```

## Implementation Order

1. Create test fixtures (basic, nested, hierarchy, no-agents)
2. Implement basic E2E test (Test 1)
3. Verify test infrastructure works end-to-end
4. Add remaining E2E tests (Tests 2-5)
5. Add light unit tests for directory walking

## Validation Criteria

- [ ] All test fixtures created
- [ ] Test 1 (Basic injection) passes
- [ ] Test 2 (PostToolUse) passes
- [ ] Test 3 (Deduplication) passes
- [ ] Test 4 (Closest AGENTS.md) passes
- [ ] Test 5 (No AGENTS.md) passes
- [ ] Unit tests for directory walking pass
- [ ] All tests run via `npm test`
- [ ] Tests fail appropriately when plugin is broken
