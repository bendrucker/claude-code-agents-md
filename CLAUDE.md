# claude-code-agents-md

Claude Code plugin that loads `AGENTS.md` files using hooks.

## Architecture

### Hooks

**Always** use JSON Output mode. Use `hookSpecificOutput.additionalContext` to inject `AGENTS.md` content into Claude Code sessions.

#### `SessionStart`

- Injects root `AGENTS.md` content at session start
- Uses `startup`, `clear`, and `compact` matchers

#### `PostToolUse` (`Read`)

- Walks upwards from path to project root, injecting the closest `AGENTS.md`
- Tracks files already injected to avoid context duplication

> The closest AGENTS.md to the edited file wins; explicit user chat prompts override everything.

## Development

### Plugin Structure

- `hook.ts`: Hook script that finds and reads `AGENTS.md`
  - Use only eraseable TypeScript syntax to allow execution via `node`
- `plugin.json`: Plugin manifest declaring the hook

## References

- [AGENTS.md standard](https://agents.md)
- [Claude Code hooks reference](https://code.claude.com/docs/en/hooks.md)
