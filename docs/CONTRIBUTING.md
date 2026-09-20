# Contributing to Leo

Thanks for your interest in contributing to Leo! This guide will help you get set up and explain the development workflow.

## Quick Start

### Prerequisites

You'll need:
- [Node.js](https://nodejs.org/) v18+ (for frontend tooling)
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- Git

### Get Running in 30 Seconds

```sh
git clone https://github.com/quaternionmedia/leo.git
cd leo
uv run leo quickstart
```

This command:
1. Installs Python dependencies via uv
2. Installs Node dependencies via npm
3. Starts the Vite dev server at http://localhost:1234

The dev server will auto-reload when you edit files in `src/`.

To skip dependency installation on subsequent runs:

```sh
uv run leo quickstart --skip-install
```

## Development Workflow

### Project Structure

```
leo/
├── src/                    # Frontend TypeScript/JavaScript
│   ├── index.ts           # App entry point
│   ├── State.ts           # Type definitions
│   ├── MetronomeService.ts # Metronome logic
│   ├── ireal.ts           # Chart rendering
│   ├── components/        # UI components
│   └── styles/            # CSS files
├── leo/                    # Backend Python
│   ├── cli.py             # CLI implementation
│   ├── api.py             # FastAPI endpoints
│   ├── db.py              # MongoDB setup
│   └── ireal.py           # iReal parsing
├── tests/                  # Python tests
│   ├── test_cli.py
│   └── playwright/         # E2E tests
├── docs/                   # Documentation
├── package.json            # Node dependencies
├── pyproject.toml          # Python dependencies
├── vite.config.js          # Vite configuration
└── playwright.config.js    # Playwright configuration
```

### The Leo CLI

All development tasks go through the `leo` CLI. Run any command with `uv run leo <command>`.

#### Essential Commands

| Command | Description |
|---------|-------------|
| `leo quickstart` | One-command setup: install deps + start dev server |
| `leo serve-frontend` | Start Vite dev server (frontend only) |
| `leo serve` | Start FastAPI backend (optional) |
| `leo test` | Run Python test suite (pytest) |
| `leo playwright-test` | Run E2E tests |
| `leo build` | Build production frontend |

#### Dependency Management

| Command | Description |
|---------|-------------|
| `leo sync` | Install Python base dependencies |
| `leo sync-dev` | Install Python dev dependencies |
| `leo npm -- install` | Install Node dependencies |
| `leo npm -- <args>` | Run arbitrary npm commands |
| `leo npx -- <args>` | Run npx commands (e.g., Playwright) |

#### Testing Commands

| Command | Description |
|---------|-------------|
| `leo test` | Run all Python tests |
| `leo test -- -v` | Verbose test output |
| `leo test -- -k "cli"` | Run specific test by keyword |
| `leo playwright-setup` | Install Playwright browsers |
| `leo playwright-test` | Run E2E tests |
| `leo playwright-test --headed` | Run tests with visible browser |

#### Utility Commands

| Command | Description |
|---------|-------------|
| `leo --help` | Show all available commands |
| `leo run -- <cmd>` | Run arbitrary command in uv environment |
| `leo init-db` | Populate MongoDB with song library (optional) |
| `leo package` | Build Python wheel/sdist |
| `leo reinstall --bump patch` | Bump version and reinstall deps |

### Making Changes

#### Frontend Changes

Frontend code lives in `src/`. The stack is:
- **Mithril.js** for UI components
- **TypeScript** for type safety
- **Meiosis** pattern for state management
- **Vite** for dev server and builds

Example workflow:

```sh
# Start dev server
uv run leo serve-frontend

# Edit files in src/
# Browser auto-reloads

# Run E2E tests
uv run leo playwright-test
```

**Key files to understand:**
- [src/index.ts](../src/index.ts) - App initialization, routing, services
- [src/State.ts](../src/State.ts) - Central state type definitions
- [src/MetronomeService.ts](../src/MetronomeService.ts) - Metronome singleton
- [src/ireal.ts](../src/ireal.ts) - Chart rendering components

#### Backend Changes (Optional)

Backend code lives in `leo/`. The stack is:
- **FastAPI** for REST API
- **MongoDB** for persistence
- **pyRealParser** for iReal format parsing

The backend is **optional** - the frontend works standalone.

Example workflow:

```sh
# Start backend
uv run leo serve

# Backend runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

#### Python CLI Changes

The CLI is defined in [leo/cli.py](../leo/cli.py). It's built with Click.

When adding commands:
1. Add function decorated with `@cli.command()`
2. Add tests in [tests/test_cli.py](../tests/test_cli.py)
3. Update this documentation

### Testing

#### Python Tests

```sh
# Run all tests
uv run leo test

# Run with coverage
uv run leo test -- --cov=leo --cov-report=html

# Run specific test
uv run leo test -- -k "test_quickstart"

# Verbose output
uv run leo test -- -v
```

Tests use **pytest** and cover:
- CLI command behavior
- Integration between commands
- Error handling

#### E2E Tests

```sh
# Setup (first time only)
uv run leo playwright-setup

# Run tests
uv run leo playwright-test

# Run in headed mode (see browser)
uv run leo playwright-test --headed

# Run specific test file
uv run leo playwright-test tests/playwright/metronome.spec.js
```

E2E tests use **Playwright** and cover:
- Core sheet music rendering
- Metronome functionality
- Search and navigation
- Accessibility
- Responsive layout

Test files in [tests/playwright/](../tests/playwright/):
- `core.spec.js` - Basic functionality
- `metronome.spec.js` - Metronome features
- `accessibility.spec.js` - A11y compliance
- `layout.spec.js` - Responsive design
- `components.spec.js` - UI components

### Code Style

#### TypeScript/JavaScript

- Use TypeScript for new files
- Follow existing Mithril patterns (components with `view` functions)
- Extract reusable logic into services (like `MetronomeService`)
- Use CSS modules in `src/styles/`
- Prefer functional style

Example component:

```typescript
import m from 'mithril'

interface MyComponentAttrs {
  title: string
  onClick: () => void
}

export const MyComponent: m.Component<MyComponentAttrs> = {
  view: ({ attrs }) => 
    m('button', { onclick: attrs.onClick }, attrs.title)
}
```

#### Python

- Follow PEP 8
- Use type hints
- Add docstrings to public functions
- Keep CLI functions focused and single-purpose
- Tests in `tests/` with `test_` prefix

Example:

```python
def my_function(arg: str) -> bool:
    """Short description of what this does.
    
    Args:
        arg: Description of argument.
        
    Returns:
        Description of return value.
    """
    return True
```

### Submitting Changes

1. **Create a feature branch**
   ```sh
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Write clear, focused commits
   - Add tests for new functionality
   - Update docs if needed

3. **Run tests**
   ```sh
   uv run leo test
   uv run leo playwright-test
   ```

4. **Push and open PR**
   ```sh
   git push origin feature/my-feature
   ```
   - Open a pull request on GitHub
   - Describe your changes clearly
   - Reference any related issues

### Development Tips

#### Hot Reload

Vite dev server auto-reloads on file changes. If something seems stuck:
```sh
# Stop server (Ctrl+C)
# Clear node_modules if needed
rm -rf node_modules
uv run leo quickstart
```

#### Debugging

**Frontend:**
- Browser DevTools (`F12`)
- `console.log()` statements
- React DevTools (for Meiosis state inspection)
- Debug panel (toggle via UI)

**Backend:**
- Add `breakpoint()` in Python code
- Check FastAPI auto-docs at `/docs`
- MongoDB client for database inspection

**Metronome:**
- Console logs show timing information
- Use sync offset to adjust visual/audio alignment
- Check Web Audio API context state

#### Common Issues

**"npm not found":**
- Install Node.js from nodejs.org

**"uv not found":**
- Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`

**"Port 1234 already in use":**
- Stop other dev servers or use `leo serve-frontend --port 5000`

**Tests failing:**
- Run `uv run leo sync-dev` to ensure dev dependencies are installed
- For Playwright: `uv run leo playwright-setup`

**Metro/Metronome timing issues:**
- Try adjusting sync offset in metronome UI
- Check browser audio permissions
- Ensure no other audio is using Web Audio API

## Project Architecture

See [Technical.md](Technical.md) for detailed architecture documentation.

## Feature Requests & Bugs

- **Bug reports**: Open an issue with reproduction steps
- **Feature requests**: Open an issue describing the use case
- **Questions**: Join our Discord or open a discussion

## Community

- **Discord**: https://discord.gg/FycdT36
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion

## License

Leo is open source under the MIT license. By contributing, you agree to license your contributions under the same terms.

---

Thank you for contributing to Leo! 🎵
