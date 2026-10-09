"""The walkthrough's pages and pictures agree with each other."""

import re
from pathlib import Path

WALKTHROUGH = Path(__file__).resolve().parent.parent / "walkthrough"


def pages():
    return sorted(WALKTHROUGH.glob("[0-9][0-9]-*.md"))


def test_every_page_says_what_it_needs_to_run():
    for page in pages():
        opening = " ".join(page.read_text(encoding="utf-8").splitlines()[:4])
        assert "Runtime" in opening, f"{page.name} does not declare its runtime"


def test_every_picture_shown_is_drawn_and_every_picture_drawn_is_shown():
    shown = set()
    for page in pages():
        shown.update(re.findall(r"\]\(media/([^)]+)\)", page.read_text(encoding="utf-8")))
    drawn = {path.name for path in (WALKTHROUGH / "media").glob("*")}
    assert shown == drawn
