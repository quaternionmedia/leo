# GitHub Actions Workflows

This document explains Leo's CI/CD strategy and the purpose of each workflow.

## Overview

Leo uses GitHub Actions for continuous integration, deployment, and maintenance. The workflow strategy emphasizes:

- **Fast feedback** - Tests run on every push and PR
- **Comprehensive coverage** - Python, TypeScript, and E2E tests
- **Automated deployment** - Main branch auto-deploys to GitHub Pages
- **Dependency management** - Automated updates via Dependabot

## Workflows

### 🧪 CI (`ci.yml`)

**Triggers:** Push to main/uv-refactor branches, pull requests, manual dispatch

The primary continuous integration workflow that validates all code changes.

**Jobs:**

1. **Python Tests** - Runs pytest across multiple Python versions (3.10, 3.11, 3.12)
   - Includes coverage reporting
   - Uses uv for fast dependency installation
   - Matrix strategy ensures compatibility

2. **E2E Tests** - Playwright end-to-end tests
   - Tests real browser interactions
   - Validates complete user workflows
   - Uploads failure reports as artifacts

3. **Lint** - Code quality checks
   - TypeScript linting via npm
   - Python formatting checks via ruff
   - Non-blocking to allow gradual improvements

4. **Build Check** - Validates production builds
   - Frontend build via Vite
   - Python package build via uv
   - Ensures deployable artifacts

**Strategy:** All jobs run in parallel for fast feedback. Matrix testing ensures cross-version compatibility.

---

### 🚀 Build and Deploy (`deploy.yml`)

**Triggers:** Push to main branch, manual dispatch

Builds the frontend and deploys to GitHub Pages for the live demo.

**Process:**
1. Install Node.js and uv
2. Install all dependencies (npm + Python)
3. Build production frontend
4. Deploy to GitHub Pages via JamesIves action

**Concurrency:** Uses `ci-${{ github.ref }}` to prevent concurrent deployments to the same branch.

**Note:** Only builds/deploys on main branch pushes. PR builds are validated in CI workflow but not deployed.

---

### 📦 Publish to NPM (`publish.yml`)

**Triggers:** GitHub release published, manual dispatch

Publishes Leo as an npm package when a new release is created.

**Process:**
1. Checkout code at release tag
2. Install dependencies
3. Build production assets
4. Publish to npm registry

**Authentication:** Requires `NPM_TOKEN` secret configured in repository settings.

**Usage:** Create a GitHub release to trigger automatic npm publication.

---

### 🏷️ Sync Labels (`labels.yml`)

**Triggers:** Manual dispatch only

Synchronizes GitHub issue/PR labels with a centralized label configuration.

**Purpose:** Maintains consistent labeling across repositories.

**Note:** This workflow references an external shared workflow. Manual trigger allows on-demand syncing.

---

## Dependabot Configuration

Leo uses Dependabot to automatically update dependencies across three ecosystems:

### GitHub Actions
- Updates workflow action versions
- Runs weekly
- Labeled: `⬆️ dependencies`

### npm (Node.js)
- Updates frontend dependencies
- Groups production and development updates separately
- Minor and patch updates grouped together
- Runs weekly

### pip (Python)
- Updates Python dependencies from pyproject.toml
- Groups minor and patch updates together
- Runs weekly
- Compatible with uv package manager

**Strategy:** Weekly schedule balances staying current with review overhead. Grouping reduces PR noise while maintaining security.

---

## Technology Stack

### Python Environment
- **uv** - Fast Python package manager and environment manager
- **pytest** - Test framework with coverage
- **ruff** - Fast Python linter

### Frontend Build
- **Node.js 20** - LTS version for stability
- **npm** - Package management with lockfile (npm ci)
- **Vite** - Build tool for production assets
- **Playwright** - Browser automation for E2E tests

### Caching Strategy
- npm cache via `actions/setup-node@v4`
- uv cache via `astral-sh/setup-uv@v4`
- Reduces workflow run times significantly

---

## Workflow Design Principles

### 1. Fast Feedback
- Parallel job execution
- Caching to reduce install times
- Early failure detection

### 2. Comprehensive Testing
- Multiple Python versions
- Real browser testing
- Build validation
- Linting for code quality

### 3. Reliability
- Concurrency controls prevent race conditions
- Artifact uploads preserve failure evidence
- Continue-on-error for non-critical checks

### 4. Developer Experience
- Clear job and step names
- Emoji indicators for quick scanning
- Detailed logs for debugging
- Manual dispatch options for flexibility

---

## Maintenance

### Adding a New Workflow

1. Create `.yml` file in `.github/workflows/`
2. Choose appropriate triggers
3. Use consistent naming conventions
4. Add emoji prefix to name/steps
5. Enable caching where applicable
6. Document in this file

### Updating Actions

Dependabot automatically proposes updates to GitHub Actions. Review and merge PRs regularly.

### Troubleshooting Failed Workflows

1. **Check job logs** - Click failed job for details
2. **Download artifacts** - Test reports available for 7 days
3. **Local reproduction** - Use `leo` CLI commands to reproduce locally:
   - `leo test` - Python tests
   - `leo playwright-test` - E2E tests
   - `leo build` - Frontend build

### Secrets Management

Required secrets:
- `NPM_TOKEN` - For npm publishing (publish workflow)
- `GITHUB_TOKEN` - Auto-provided for Pages deployment

Configure in: Settings → Secrets and variables → Actions

---

## Migration Notes

Leo's workflows were recently updated to leverage uv for Python package management. Key changes:

- **Before:** Python dependencies managed via pip
- **After:** uv for faster installation and better compatibility
- **Impact:** Significant reduction in workflow run times

All workflows now use `astral-sh/setup-uv@v4` action and `uv sync` for dependency installation.

---

## Best Practices

### When Adding Tests
- Add to appropriate job in `ci.yml`
- Ensure tests pass locally first: `leo test` or `leo playwright-test`
- Consider if cross-version testing is needed

### When Adding Dependencies
- npm: Add to `package.json`, Dependabot will track
- Python: Add to `pyproject.toml`, ensure in appropriate section (main vs dev extra)
- GitHub Actions: Pin major version (`@v4`), let Dependabot update

### When Debugging Workflows
- Use `workflow_dispatch` trigger for manual testing
- Add `continue-on-error: true` temporarily to investigate issues
- Check workflow run artifacts for detailed logs

---

## Related Documentation

- [Contributing Guide](CONTRIBUTING.md) - Local development workflow
- [Architecture](Technical.md) - Technical design and build system
- [CLI Reference](CONTRIBUTING.md#the-leo-cli) - Commands used in workflows