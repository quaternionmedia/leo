# Contributing to Leo

Quick guide to get up and running for local development.

## Prerequisites

- [Node.js](https://nodejs.org/) (for frontend tooling)
- [uv](https://github.com/astral-sh/uv) (Python package manager)

## Setup & Run

```sh
git clone https://github.com/quaternionmedia/leo.git
cd leo
uv run leo quickstart
```

This installs all dependencies and starts the dev server at http://localhost:1234.

To skip installation on subsequent runs:

```sh
uv run leo quickstart --skip-install
```

## Run Tests

```sh
uv run leo test
```

All tests should pass. Pass additional pytest flags after `--`:

```sh
uv run leo test -- -v -k "cli"
```

## CLI Overview

```sh
uv run leo --help
```

Key commands:

| Command | Description |
|---------|-------------|
| `leo quickstart` | Install deps and start dev server |
| `leo test` | Run pytest suite |
| `leo serve-frontend` | Start Vite dev server |
| `leo serve` | Start FastAPI backend |
| `leo build` | Build frontend for production |
| `leo npm -- <args>` | Run npm commands |
| `leo npx -- <args>` | Run npx commands |

## Code Style

- Python: Follow existing patterns; tests live in `tests/`
- TypeScript/JS: Frontend code in `src/`

## Submitting Changes

1. Create a feature branch
2. Make changes and ensure tests pass
3. Open a pull request

Questions? Join our Discord: https://discord.gg/FycdT36
