# 01 — Onboarding

> **Runtime: hermetic.** No port, no network, no browser. If this page passes,
> your checkout is built.

Leo is a sheet music viewer: iReal Pro chord charts, search, setlists and a
metronome, in the browser. The app is a Vite frontend. Python is here only for
the developer CLI, which drives npm, Vite and Playwright through uv. This page
is the first build, and the test command executes it, so the examples below
ran on your machine.

## What you need

[uv](https://github.com/astral-sh/uv), which provides a Python the project
accepts:

```python
>>> import sys
>>> sys.version_info >= (3, 11)
True

```

And Node.js, at the version Vite asks for, which is newer than "v18+":

```python
>>> import json
>>> from pathlib import Path
>>> lock = json.loads(Path("package-lock.json").read_text(encoding="utf-8"))
>>> lock["packages"]["node_modules/vite"]["engines"]["node"]
'^20.19.0 || >=22.12.0'

```

An older Node prints `Vite requires Node.js version 20.19+ or 22.12+` when the
dev server starts. Upgrade rather than rely on it running anyway.

## The first build

```sh
uv sync --extra dev                # the CLI, and pytest
npm ci                             # the app
npx playwright install chromium    # the browser 03-in-the-browser.md drives
```

## Proving it worked

The CLI imports and answers:

```python
>>> from click.testing import CliRunner
>>> from leo import cli
>>> result = CliRunner().invoke(cli.cli, ["--help"])
>>> result.exit_code, "quickstart" in result.output
(0, True)

```

## Running it

```sh
uv run leo quickstart
```

It installs both sides again and starts the dev server on port 1234, bound to
every interface (`0.0.0.0`) so a phone or tablet on the same network can open
it. On this machine, open `http://localhost:1234`. The bare address opens a
random song.

## Running the tests

```sh
uv run leo test
```

With no arguments that runs the suite and these pages:

```python
>>> cli.DEFAULT_PYTEST_ARGS
('tests', 'walkthrough', '--doctest-glob=*.md')

```

Both paths are named on purpose: pytest ignores `testpaths` as soon as it is
given a path, so pages wired that way would be collected by nobody. Arguments
you pass replace them.

That includes `03-in-the-browser.md` and `04-following-a-hub.md`, which need
Node and Chromium and fail without them rather than skipping. The same run redraws its pictures; if
`git status` shows one changed after a change of yours, the screen changed, so
commit the picture with the change.
