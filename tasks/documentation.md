# Task Detail: Documentation

**Parent Milestone**: Documentation

## Purpose

Update README.md with comprehensive user-facing documentation after implementation and testing are complete.

## Required Sections

### Installation

How to install the plugin:
- Using `claude code plugin install` (if published)
- Manual installation (symlinking/copying to `~/.claude/plugins/`)
- Prerequisites (Claude Code installed, Node.js available)

### How It Works

Clear explanation of:
- SessionStart hook behavior (root AGENTS.md injection)
- PostToolUse hook behavior (closest AGENTS.md wins)
- Session-level deduplication
- Directory walking logic

### Usage

Practical guidance:
- Creating AGENTS.md files
- Where to place them
- What content to include
- Link to AGENTS.md standard (https://agents.md)

### Example AGENTS.md

Show a real example with explanations:
```markdown
# Project Instructions

## Build
...

## Code Style
...
```

### Troubleshooting

Common issues and solutions:
- Plugin not loading
- AGENTS.md not being injected
- How to debug (verbose mode, state file location)
- Checking hook registration

### Technical Details

For advanced users:
- State file location (`~/.claude/session-env/{session_id}/`)
- Hook implementation details
- Performance characteristics

## Tone and Style

- Clear and concise (per user's global CLAUDE.md preferences)
- Minimal unnecessary explanation
- Use code blocks for examples
- Wrap filenames in backticks
- Prefer meaningful descriptions over superlatives

## Validation Criteria

- [ ] Installation instructions are clear
- [ ] How it works is explained concisely
- [ ] Usage examples provided
- [ ] Troubleshooting covers common issues
- [ ] Links to AGENTS.md standard included
- [ ] Technical details for advanced users
- [ ] No unnecessary verbosity
- [ ] Code examples are accurate
