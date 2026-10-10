# 04 — Following a hub

> **Runtime-bound: Node, Chromium and uv.** This page runs the real app under
> Vite, beside a fake hub, and drives it in Chromium through Playwright. Without
> them it fails; it does not skip.

In the performing family a hub fires cues, and each cue can ask leo for a song.
leo has no server of its own for a hub to push to, so a page in follow mode
pulls instead: it asks the hub `GET <hub>/family/members/leo` once a second
and shows the song the hub's last cue named. The page follows a hub when it is
opened with `?follow=<hub base url>`, or when the dev server that served it was
started with `leo serve --follow <hub base url>`.

This page runs `tests/playwright/follow.spec.js`. Its hub is a few lines of
Node answering that one route, so what is under test is leo, and every test is
asked for its own result, so a skipped test reads as `skipped` rather than
passing:

```python
>>> import json, os, shutil, subprocess, tempfile
>>> npx = shutil.which("npx")
>>> npx is not None
True
>>> report = os.path.join(tempfile.mkdtemp(), "follow.json")
>>> _ = subprocess.run(
...     [npx, "playwright", "test", "tests/playwright/follow.spec.js",
...      "--reporter=list,json"],
...     env={**os.environ, "PLAYWRIGHT_JSON_OUTPUT_FILE": report},
...     check=True,
... )
>>> with open(report, encoding="utf-8") as results:
...     specs = json.load(results)["suites"][0]["specs"]
>>> for spec in specs:
...     print([r["status"] for t in spec["tests"] for r in t["results"]], spec["title"])
['passed'] the chart follows the hub, cue by cue, without a reload
['passed'] a reader may leave the song, until the next cue
['passed'] a song in none of the books leaves the chart, and says so
['passed'] a hub that does not allow this origin cannot be read, and the badge says so
['passed'] `leo serve --follow` makes every page it serves follow the hub

```

The app runs on port 1234, or on `LEO_PORT`. The hub, and the dev server the
last test starts through `leo serve`, take ports the system picks, or ports
from `LEO_FOLLOW_PORTS=lo-hi` when that is set.

## What the hub answers, and what leo does with it

`{"cue": {"number": "3", "name": "Second tune", "fired_at": "..."}, "action":
{"song": "Blue Bossa"}}`. A new answer, which is a new cue or the same cue
fired again at a new time, sets the chart by the same update the song's deep
link makes: the song, in its own key, untransposed. The address becomes that
deep link, with `?follow=` kept, and the document is the same one; the first
test marks the document and finds the mark still there after two cues.

Between cues the reader is free: the same answer asked again changes nothing,
so a song picked from the menu stays until the hub fires the next cue.

`{"cue": null, "action": null}` is a hub no cue has asked leo for anything yet,
and the page stays on whatever it opened with.

## The badge

A badge in the bottom corner names the hub and what its last answer did:
waiting for a cue; the cue and the song it is showing; a song in none of the
books, with the chart left as it was; or that the hub cannot be read.

The page and the hub are on different origins, so the hub must answer
`/family/members/leo` with an `Access-Control-Allow-Origin` header the page's
origin passes. A hub without one receives the request and the browser
withholds the answer: the fourth test's hub counts the request arriving, and
the page says it cannot read the hub.
