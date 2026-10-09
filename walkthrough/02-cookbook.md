# 02 — Cookbook

> **Runtime: hermetic.** No port, no browser. Reads the CLI's own command list.

For somebody already set up. `01-onboarding.md` is the first build, and the two
stay separate on purpose.

## Everyday

| To | Run |
| --- | --- |
| Start the dev server on port 1234 | `uv run leo serve-frontend` |
| Run the tests and the walkthrough | `uv run leo test` |
| Run one page | `uv run leo test -- walkthrough/02-cookbook.md --doctest-glob=*.md` |
| Run the browser suite | `uv run leo playwright-test` |
| Redraw the walkthrough's pictures | `npx playwright test tests/playwright/walkthrough.spec.js` |
| Build the site into `dist/` | `uv run leo build` |

Outside CI the browser suite reuses a server already listening on its port, so
with `leo serve-frontend` running from another checkout it would test that
checkout. `LEO_PORT` gives the suite a port of its own:

```sh
LEO_PORT=1235 npx playwright test
```

## Every command

`uv run leo <command>`. This list is the CLI's own, so a command added without
appearing here fails this page:

```python
>>> from leo import cli
>>> for name, command in sorted(cli.cli.commands.items()):
...     print(f"{name:17}{command.get_short_help_str(80)}")
build            Build the web frontend using npm inside uv's Python context.
npm              Run an arbitrary npm command.
npx              Run an arbitrary npx command.
package          Build Python distributions via uv.
playwright-setup Install Playwright dependencies and browser binaries.
playwright-test  Run Playwright end-to-end tests via npx.
quickstart       Install all dependencies and start the frontend dev server.
reinstall        Force reinstall of dependencies via uv, optionally bumping the project version.
run              Run an arbitrary command within a uv-managed environment.
serve-frontend   Run the Vite development server through npm.
sync             Install Python dependencies using uv.
sync-dev         Install base and development (extra) dependencies via uv.
test             Run the tests and the walkthrough inside uv, with the requested extras.

```

Each runs a command you could type yourself, and some print it instead with
`--dry-run`:

```python
>>> from click.testing import CliRunner
>>> spec = "tests/playwright/walkthrough.spec.js"
>>> print(CliRunner().invoke(cli.cli, ["playwright-test", "--dry-run", spec]).output)
Dry run: npx... playwright test tests/playwright/walkthrough.spec.js

```

(`npx.cmd` on Windows.)
