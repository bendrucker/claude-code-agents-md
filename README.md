# claude-code-agents-md

[![Test](https://github.com/bendrucker/claude-code-agents-md/actions/workflows/test.yml/badge.svg)](https://github.com/bendrucker/claude-code-agents-md/actions/workflows/test.yml)

> Claude Code plugin for reading [AGENTS.md](https://agents.md) files.

Loads project instructions from `AGENTS.md` files automatically, enabling Claude Code to work with projects using this open standard.

## Install

```bash
claude plugin install github:bendrucker/claude-code-agents-md
```

## How It Works

The plugin uses two hooks to inject `AGENTS.md` content into Claude Code sessions:

**SessionStart**: At session start (or after `/clear`, `/compact`), injects the root `AGENTS.md` from the project directory.

**PostToolUse (Read)**: After any file read, walks up the directory tree from the read file to find the closest `AGENTS.md` and injects it. This allows subdirectories to have their own context.

Each `AGENTS.md` is injected only once per session to avoid context duplication.

## Usage

Create `AGENTS.md` files in your project to provide context to Claude Code:

```
project/
├── AGENTS.md           # Root instructions (injected at session start)
├── src/
│   ├── api/
│   │   └── AGENTS.md   # API-specific instructions
│   └── utils/
└── tests/
    └── AGENTS.md       # Testing instructions
```

When Claude reads a file in `src/api/`, it receives the `src/api/AGENTS.md` content. The closest `AGENTS.md` to the file being read wins.

### Example AGENTS.md

```markdown
# API Module

## Conventions

- All endpoints return JSON
- Use `snake_case` for field names
- Errors use RFC 7807 format

## Testing

Run `npm test -- --grep api` to test this module.
```

See the [AGENTS.md standard](https://agents.md) for more guidance.

## Troubleshooting

**Plugin not loading**: Verify installation with `claude plugin list`. The plugin should appear as `agents-md`.

**AGENTS.md not injected**: Check that the file is named exactly `AGENTS.md` (case-sensitive). The plugin only looks for this exact filename.

**State file location**: Session state is stored in `/tmp/claude-agents-md-{session_id}.json`. This tracks which files have been injected to prevent duplicates.

## License

[MIT © Ben Drucker](LICENSE)
