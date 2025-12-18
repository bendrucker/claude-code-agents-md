# claude-code-agents-md

[![tests](https://github.com/bendrucker/claude-code-agents-md/actions/workflows/test.yml/badge.svg)](https://github.com/bendrucker/claude-code-agents-md/actions/workflows/test.yml)

> Claude Code plugin for reading [AGENTS.md](https://agents.md) files.

Loads project instructions from `AGENTS.md` files automatically, enabling Claude Code to work with projects using this open standard.

## Requirements

- Node.js 22.18.0 or later (for native TypeScript support)

## Install

### Direct Install

```bash
claude plugin install github:bendrucker/claude-code-agents-md
```

### Via Marketplace

Add the marketplace, then install the plugin:

```bash
claude plugin marketplace add bendrucker/claude-code-agents-md
claude plugin install agents-md
```

## Known Issue

Due to [a bug in Claude Code](https://github.com/anthropics/claude-code/issues/11509), plugin hooks are not registered. Until this is fixed, you must manually add the hooks to your user settings (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/plugins/cache/agents-md-marketplace/agents-md/1.0.0/agents-md-marketplace/.claude-plugin/hook.ts"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/plugins/cache/agents-md-marketplace/agents-md/1.0.0/agents-md-marketplace/.claude-plugin/hook.ts"
          }
        ]
      }
    ]
  }
}
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

See the [AGENTS.md standard](https://agents.md) for guidance on file contents.

## `AGENTS.md` vs `CLAUDE.md`

Claude Code natively supports `CLAUDE.md` files for project instructions. This plugin adds support for `AGENTS.md`, an open standard.

| Behavior | `CLAUDE.md` | `AGENTS.md` |
|----------|-------------|-------------|
| Loads nearest file in directory tree | ✓ | ✓ |
| Loads all ancestor files to project root | ✓ | ✗ |
| `@` file imports | ✓ | ✗ |

Use `AGENTS.md` for portable project instructions across AI coding tools. Use `CLAUDE.md` for richer Claude Code-specific features.

## License

[MIT © Ben Drucker](LICENSE)
