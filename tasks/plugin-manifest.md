# Task Detail: Plugin Manifest

**Parent Milestone**: Core Implementation
**File**: `.claude-plugin/plugin.json`

## Purpose

Define the plugin's metadata and point to hook configuration.

## Specification

```json
{
  "name": "agents-md",
  "version": "1.0.0",
  "description": "Loads AGENTS.md files automatically into Claude Code sessions",
  "author": {
    "name": "Ben Drucker",
    "url": "https://github.com/bendrucker"
  },
  "hooks": "hooks.json"
}
```

## Field Descriptions

- `name`: Plugin identifier (used by Claude Code)
- `version`: Semantic version
- `description`: User-facing description
- `author`: Author metadata
- `hooks`: Path to hooks configuration (relative to `.claude-plugin/`)

## Validation Criteria

- [ ] Valid JSON syntax
- [ ] All required fields present
- [ ] `hooks` points to `hooks.json`
- [ ] Name matches repository/plugin name
- [ ] Description is concise and accurate
