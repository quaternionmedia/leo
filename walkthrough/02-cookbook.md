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

`leo serve --host H --port P --state DIR` and `leo check --url U --shots DIR`
are the performing family's demo contract, which the qm corpus declares once
for every member. `serve` binds exactly the port it is given; `check` runs the
walkthrough spec against a dev server that is already up, with `LEO_BASE_URL`
keeping Playwright from starting one, and writes its pictures to DIR.

## Following a hub

| To | Do |
| --- | --- |
| Make one page follow a hub | Open it with `?follow=<hub base url>`, before the `#!`: `http://localhost:1234/?follow=http://127.0.0.1:8000` |
| Make every page served follow a hub | `uv run leo serve --host H --port P --state DIR --follow <hub base url>` |
| Run the follow mode's browser tests | `LEO_FOLLOW_PORTS=18341-18349 npx playwright test tests/playwright/follow.spec.js` |

A following page asks `GET <hub>/family/members/leo` once a second. The hub
answers `{"cue": {...}, "action": {"song": "<title>"}}`, or `{"cue": null,
"action": null}` before any cue has asked leo for anything. A new answer
changes the chart in place, without a reload, exactly as the song's own deep
link would show it, and rewrites the address to that link. `"playlist"` in the
action picks among books that share a title; without it the first in book
order is shown. A badge in the bottom corner names the hub and what its last
answer did. The hub is on another origin, so it must answer that route with
`Access-Control-Allow-Origin`; without it the browser withholds the answer and
the badge says it cannot read the hub. `04-following-a-hub.md` runs it.

`serve --follow` reaches the page as `VITE_LEO_FOLLOW`, and a page's own
`?follow=` wins over it:

```python
>>> from click.testing import CliRunner
>>> from leo import cli
>>> serve = CliRunner().invoke(cli.cli, ["serve", "--help"]).output
>>> "--follow HUB" in serve
True

```

## Every command

`uv run leo <command>`. This list is the CLI's own, so a command added without
appearing here fails this page:

```python
>>> from leo import cli
>>> for name, command in sorted(cli.cli.commands.items()):
...     print(f"{name:17}{command.get_short_help_str(80)}")
build            Build the web frontend using npm inside uv's Python context.
check            Run the walkthrough's browser spec against the dev server at URL.
npm              Run an arbitrary npm command.
npx              Run an arbitrary npx command.
package          Build Python distributions via uv.
playwright-setup Install Playwright dependencies and browser binaries.
playwright-test  Run Playwright end-to-end tests via npx.
quickstart       Install all dependencies and start the frontend dev server.
reinstall        Force reinstall of dependencies via uv, optionally bumping the project version.
run              Run an arbitrary command within a uv-managed environment.
serve            Run the dev server on exactly the address given, installing nothing.
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
