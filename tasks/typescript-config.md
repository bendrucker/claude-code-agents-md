# Task Detail: TypeScript Configuration

**Parent Milestone**: Core Implementation
**File**: `tsconfig.json`

## Purpose

Provide TypeScript editor support and enable type checking for hook.ts and test files, without requiring compilation (eraseable TypeScript).

## Specification

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noEmit": true
  },
  "include": [
    "hook.ts",
    "test/**/*.ts"
  ]
}
```

## Key Settings

- `noEmit: true` - Never compile, files run via `node` directly
- `strict: true` - Maximum type safety
- `module: "commonjs"` - Match Node.js default
- `target: "ES2020"` - Modern JavaScript features
- `include` - Hook script and test files only

## Validation Criteria

- [ ] Valid JSON syntax
- [ ] `noEmit` set to true (no compilation)
- [ ] Strict mode enabled
- [ ] Includes hook.ts and test files
- [ ] Editor provides IntelliSense for hook.ts
