# Task Detail: Hooks Configuration

**Parent Milestone**: Core Implementation
**File**: `hooks/hooks.json`

## Purpose

Declare SessionStart and PostToolUse hooks that invoke `hook.ts`.

## Specification

```json
{
  "description": "Automatic AGENTS.md file loading",
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/hook.ts\""
          }
        ]
      },
      {
        "matcher": "clear",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/hook.ts\""
          }
        ]
      },
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/hook.ts\""
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
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/hook.ts\""
          }
        ]
      }
    ]
  }
}
```

## Key Elements

### SessionStart Matchers
- `startup`: Session started from `claude` command
- `clear`: User ran `/clear` command
- `compact`: Session compacted (auto or manual)

### PostToolUse Matcher
- `Read`: Matches the Read tool (case-sensitive)

### Command Template
- Uses `${CLAUDE_PLUGIN_ROOT}` for portability
- Quotes path for spaces
- Invokes via `node` (not direct execution)

## Validation Criteria

- [ ] Valid JSON syntax
- [ ] Three SessionStart hooks declared (startup, clear, compact)
- [ ] One PostToolUse hook declared (Read)
- [ ] All hooks use correct command template
- [ ] Uses `${CLAUDE_PLUGIN_ROOT}` variable
- [ ] Command paths are quoted
