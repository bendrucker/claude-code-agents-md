# claude-code-agents-md

[![tests](https://github.com/bendrucker/claude-code-agents-md/actions/workflows/test.yml/badge.svg)](https://github.com/bendrucker/claude-code-agents-md/actions/workflows/test.yml)

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

See the [AGENTS.md standard](https://agents.md) for guidance on file contents.

## AGENTS.md vs CLAUDE.md

Claude Code natively supports `CLAUDE.md` files for project instructions. This plugin adds support for `AGENTS.md`, an open standard.

| Feature | CLAUDE.md | AGENTS.md |
|---------|-----------|-----------|
| Built into Claude Code | Yes | Via plugin |
| Works with other AI tools | No | Yes |
| Hierarchical loading | Yes | Yes |
| Injected at session start | Yes | Yes |
| Injected on file read | No | Yes |

Use `AGENTS.md` if you work with multiple AI coding tools and want portable project instructions. Use `CLAUDE.md` if you only use Claude Code and prefer zero configuration.

## License

[MIT © Ben Drucker](LICENSE)
