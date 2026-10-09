"""A page whose opening line says it is runtime-bound is an `e2e` item.

CI's Python job runs `-m "not e2e"` on a machine with no browser; the
walkthrough job provisions Node and Chromium and runs every page, and so does
`leo test`. Keyed on the page's own declaration, so there is no second list of
pages to keep in step.
"""

import pytest


@pytest.hookimpl(tryfirst=True)
def pytest_collection_modifyitems(items):
    for item in items:
        page = item.path
        if page.suffix == ".md" and "Runtime-bound" in page.read_text(encoding="utf-8")[:400]:
            item.add_marker(pytest.mark.e2e)
