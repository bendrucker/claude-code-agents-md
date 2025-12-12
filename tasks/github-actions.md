# Task Detail: GitHub Actions CI

**Parent Milestone**: CI Configuration

## Purpose

Create GitHub Actions workflow to run all tests automatically on every push and pull request, ensuring the plugin continues working correctly.

## Workflow File

**File**: `.github/workflows/test.yml`

## Specification

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          CLAUDE_OAUTH_TOKEN: ${{ secrets.CLAUDE_OAUTH_TOKEN }}
```

## Key Elements

### Triggers
- **Push to main**: Run tests on every commit to main branch
- **Pull requests**: Run tests on all PRs to any branch

### Matrix Testing
Test on multiple Node.js versions:
- Node 18.x (LTS)
- Node 20.x (Current LTS)

Ensures compatibility across Node versions.

### Steps

1. **Checkout**: Get repository code
2. **Setup Node**: Install specified Node.js version with npm cache
3. **Install dependencies**: `npm ci` for reproducible installs
4. **Run tests**: Execute `npm test` command

### Secrets

**Required**: `CLAUDE_OAUTH_TOKEN` for running Claude Code in tests with your subscription

Add to repository secrets:
1. Go to Settings → Secrets and variables → Actions
2. Add `CLAUDE_OAUTH_TOKEN` secret
3. Use valid OAuth token from Claude Code subscription

## Test Execution in CI

The workflow runs the same tests developed locally:
- Test harness spawns Claude Code processes
- Executes end-to-end tests with fixtures
- Parses JSON stream output
- Verifies hook behavior

All 5+ test cases from `e2e-testing.md` should pass.

## CI Badge

Add to README.md:
```markdown
![Test](https://github.com/bendrucker/claude-code-agents-md/actions/workflows/test.yml/badge.svg)
```

Shows build status on repository page.

## Future Enhancements

Consider adding later:
- Type checking step (`tsc --noEmit`)
- Linting step (if linter added)
- Code coverage reporting
- Release automation

For v1.0, focus on test execution only.

## Validation Criteria

- [ ] Workflow file created at `.github/workflows/test.yml`
- [ ] Valid YAML syntax
- [ ] Tests run on push to main
- [ ] Tests run on pull requests
- [ ] Matrix includes Node 18.x and 20.x
- [ ] `CLAUDE_OAUTH_TOKEN` secret configured in repository
- [ ] All tests pass in CI
- [ ] CI badge added to README
