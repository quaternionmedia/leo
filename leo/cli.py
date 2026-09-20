"""Command-line interface for Leo.

Provides consistent entry points for development workflows using uv.
"""
from __future__ import annotations

import os
import platform
import shutil
import subprocess
import re
from pathlib import Path
from typing import Iterable

import click

from leo.config import DB_URL
from leo.db import configure as configure_db
from leo.ireal import initDB
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

PROJECT_ROOT = Path(os.environ.get("LEO_PROJECT_ROOT", Path(__file__).resolve().parent.parent))
DEFAULT_APP_IMPORT = "leo.api:app"
PYPROJECT_PATH = PROJECT_ROOT / "pyproject.toml"


def _npm_cmd() -> str:
    """Return the npm command appropriate for the current platform."""
    return "npm.cmd" if platform.system() == "Windows" else "npm"


def _npx_cmd() -> str:
    """Return the npx command appropriate for the current platform."""
    return "npx.cmd" if platform.system() == "Windows" else "npx"


def ensure_npm_available() -> None:
    """Verify that npm is available on PATH."""
    if shutil.which(_npm_cmd()) is None:
        raise click.ClickException("npm is required for this command to run")


def ensure_frontend_dependencies(force: bool = False, prefer_ci: bool = True) -> None:
    """Install frontend dependencies when missing or when forced.
    
    Args:
        force: Always run install even if node_modules exists.
        prefer_ci: Use `npm ci` when lock file exists (faster, strict).
                   Set to False to always use `npm install` (updates lock file).
    """
    node_modules = PROJECT_ROOT / "node_modules"
    if not force and node_modules.exists():
        return

    package_lock = PROJECT_ROOT / "package-lock.json"
    npm = _npm_cmd()
    
    if prefer_ci and package_lock.exists():
        # Try npm ci first (faster, but fails if lock file is out of sync)
        try:
            call_subprocess([npm, "ci"], cwd=PROJECT_ROOT)
            return
        except click.ClickException:
            # Lock file out of sync, fall back to npm install
            click.echo("Lock file out of sync, running npm install instead...")
    
    call_subprocess([npm, "install"], cwd=PROJECT_ROOT)


def ensure_uv_available(command: str) -> None:
    """Ensure the uv executable is on PATH before running a uv command."""
    if shutil.which("uv") is None:
        raise click.ClickException(
            "uv is required for the '" + command + "' command. Install it from https://github.com/astral-sh/uv#installation."
        )


def call_subprocess(args: list[str], cwd: Path | None = None, env: dict[str, str] | None = None) -> None:
    """Run a subprocess and surface errors clearly."""
    try:
        subprocess.run(args, cwd=cwd, env=env, check=True)
    except subprocess.CalledProcessError as exc:  # pragma: no cover - pass-through error
        raise click.ClickException(
            f"Command failed with exit code {exc.returncode}: {' '.join(args)}"
        ) from exc


def _execute_or_echo(args: Iterable[str], *, dry_run: bool, cwd: Path | None = None, env: dict[str, str] | None = None) -> None:
    command = [str(part) for part in args]
    if dry_run:
        click.echo("Dry run: " + " ".join(command))
        return
    call_subprocess(command, cwd=cwd, env=env)


@click.group(context_settings={"help_option_names": ["-h", "--help"]})
@click.version_option()
def cli() -> None:
    """Developer utilities for the Leo platform."""


@cli.command()
@click.option("--host", default="0.0.0.0", show_default=True, help="Interface to bind.")
@click.option("--port", default=8000, show_default=True, type=int, help="Port for the ASGI server.")
@click.option("--reload/--no-reload", default=True, show_default=True, help="Enable autoreload for development.")
@click.option("--workers", default=1, show_default=True, type=int, help="Number of worker processes.")
def serve(host: str, port: int, reload: bool, workers: int) -> None:
    """Start the FastAPI application via uvicorn."""
    try:
        import uvicorn
    except ImportError as exc:  # pragma: no cover - import guard
        raise click.ClickException("uvicorn must be installed to run the server") from exc

    uvicorn.run(
        DEFAULT_APP_IMPORT,
        host=host,
        port=port,
        reload=reload,
        workers=workers,
    )


@cli.command(name="init-db")
@click.option("--db-url", default=None, help="Override the MongoDB connection URL.")
@click.option("--timeout", default=5000, show_default=True, type=int, help="Server selection timeout in milliseconds.")
def init_db(db_url: str | None, timeout: int) -> None:
    """Populate the Mongo song catalog from bundled iReal files."""
    target_url = db_url or DB_URL
    click.echo(f"Importing iReal books into Mongo ({target_url})...")
    try:
        configure_db(db_url=target_url, timeout_ms=timeout)
        initDB()
    except ServerSelectionTimeoutError as exc:  # pragma: no cover - exercised via tests
        raise click.ClickException(
            f"Unable to connect to MongoDB at {target_url}. Ensure the database is running or provide a reachable URI."
        ) from exc
    except PyMongoError as exc:  # pragma: no cover - exercised via tests
        raise click.ClickException(f"MongoDB error: {exc}") from exc
    click.echo("Done.")
def _load_current_version() -> str:
    pyproject_text = PYPROJECT_PATH.read_text()
    match = re.search(r'^version\s*=\s*"(?P<version>\d+\.\d+\.\d+)"', pyproject_text, re.MULTILINE)
    if not match:
        raise click.ClickException("Unable to find project version in pyproject.toml")
    return match.group("version")


def _write_new_version(new_version: str) -> None:
    pyproject_text = PYPROJECT_PATH.read_text()
    updated_text = re.sub(
        r'^(version\s*=\s*")\d+\.\d+\.\d+("\s*)$',
        rf"\g<1>{new_version}\2",
        pyproject_text,
        flags=re.MULTILINE,
        count=1,
    )
    if pyproject_text == updated_text:
        raise click.ClickException("Failed to update version in pyproject.toml")
    PYPROJECT_PATH.write_text(updated_text)


def _calculate_bumped_version(current_version: str, bump: str) -> str:
    major, minor, patch = map(int, current_version.split("."))
    if bump == "major":
        major += 1
        minor = 0
        patch = 0
    elif bump == "minor":
        minor += 1
        patch = 0
    elif bump == "patch":
        patch += 1
    else:
        raise click.ClickException(f"Unknown bump target: {bump}")
    return f"{major}.{minor}.{patch}"


@cli.command()
@click.argument("args", nargs=-1, type=click.UNPROCESSED)
def run(args: tuple[str, ...]) -> None:
    """Run an arbitrary command within a uv-managed environment."""
    ensure_uv_available("run")
    cmd = ["uv", "run"] + list(args)
    if not args:
        raise click.ClickException("Provide a command to run, e.g. leo run -- python -m http.server")
    call_subprocess(cmd, cwd=PROJECT_ROOT)


@cli.command()
@click.option("--install/--no-install", default=True, show_default=True, help="Ensure node_modules are installed first.")
@click.argument("args", nargs=-1, type=click.UNPROCESSED)
def npm(install: bool, args: tuple[str, ...]) -> None:
    """Run an arbitrary npm command."""
    ensure_npm_available()
    if install:
        ensure_frontend_dependencies()
    if not args:
        raise click.ClickException("Provide an npm command to run, e.g. leo npm -- run build")
    call_subprocess([_npm_cmd()] + list(args), cwd=PROJECT_ROOT)


@cli.command()
@click.option("--install/--no-install", default=True, show_default=True, help="Ensure node_modules are installed first.")
@click.argument("args", nargs=-1, type=click.UNPROCESSED)
def npx(install: bool, args: tuple[str, ...]) -> None:
    """Run an arbitrary npx command."""
    ensure_npm_available()
    if install:
        ensure_frontend_dependencies()
    if not args:
        raise click.ClickException("Provide an npx command to run, e.g. leo npx -- playwright test")
    call_subprocess([_npx_cmd()] + list(args), cwd=PROJECT_ROOT)


@cli.command()
def sync() -> None:
    """Install Python dependencies using uv."""
    ensure_uv_available("sync")
    call_subprocess(["uv", "sync"], cwd=PROJECT_ROOT)


@cli.command(name="sync-dev")
def sync_dev() -> None:
    """Install base and development (extra) dependencies via uv."""
    ensure_uv_available("sync")
    call_subprocess(["uv", "sync"], cwd=PROJECT_ROOT)
    call_subprocess(["uv", "sync", "--extra", "dev"], cwd=PROJECT_ROOT)


@cli.command()
@click.option("--host", default="0.0.0.0", show_default=True, help="Interface to bind.")
@click.option("--port", default=1234, show_default=True, type=int, help="Port for the Vite dev server.")
@click.option("--skip-install", is_flag=True, help="Skip dependency installation.")
def quickstart(host: str, port: int, skip_install: bool) -> None:
    """Install all dependencies and start the frontend dev server.

    This is the fastest way to get a local development environment running.
    Equivalent to: npm install && uv sync --extra dev && leo serve-frontend
    """
    if not skip_install:
        ensure_uv_available("sync")
        click.echo("Installing Python dependencies...")
        call_subprocess(["uv", "sync", "--extra", "dev"], cwd=PROJECT_ROOT)

        ensure_npm_available()
        click.echo("Installing Node dependencies...")
        ensure_frontend_dependencies(force=True)

    click.echo(f"Starting dev server at http://{host}:{port}")
    call_subprocess([
        _npm_cmd(),
        "run",
        "dev",
        "--",
        "--host",
        host,
        "--port",
        str(port),
    ], cwd=PROJECT_ROOT)


@cli.command()
@click.option(
    "--bump",
    type=click.Choice(["major", "minor", "patch"]),
    help="Apply a semantic version bump before reinstalling.",
)
@click.option(
    "--extra",
    "extras",
    multiple=True,
    help="Optional dependency extras to reinstall alongside the base environment.",
)
@click.option("--dry-run", is_flag=True, help="Print commands without executing them.")
def reinstall(bump: str | None, extras: tuple[str, ...], dry_run: bool) -> None:
    """Force reinstall of dependencies via uv, optionally bumping the project version."""
    ensure_uv_available("sync")
    if bump:
        current_version = _load_current_version()
        new_version = _calculate_bumped_version(current_version, bump)
        if dry_run:
            click.echo(f"Dry run: would bump version from {current_version} to {new_version}")
        else:
            _write_new_version(new_version)
            click.echo(f"Version bumped to {new_version}")
    cmd = ["uv", "sync", "--reinstall"]
    for extra in extras:
        cmd.extend(["--extra", extra])
    _execute_or_echo(cmd, dry_run=dry_run, cwd=PROJECT_ROOT)
    if not dry_run:
        click.echo("Reinstall complete.")


@cli.command()
@click.option("--out", "out_dir", default="dist", show_default=True, help="Directory for frontend build output.")
def build(out_dir: str) -> None:
    """Build the web frontend using npm inside uv's Python context."""
    ensure_npm_available()
    # Ensure dependencies are installed before building
    ensure_frontend_dependencies(force=True)
    env = os.environ.copy()
    env.setdefault("NODE_ENV", "production")
    call_subprocess([_npm_cmd(), "run", "build"], cwd=PROJECT_ROOT, env=env)
    click.echo(f"Frontend assets built into {out_dir}.")


@cli.command(name="serve-frontend")
@click.option("--host", default="0.0.0.0", show_default=True, help="Interface to bind.")
@click.option("--port", default=1234, show_default=True, type=int, help="Port for the Vite dev server.")
def serve_frontend(host: str, port: int) -> None:
    """Run the Vite development server through npm."""
    ensure_npm_available()
    ensure_frontend_dependencies()
    call_subprocess([
        _npm_cmd(),
        "run",
        "dev",
        "--",
        "--host",
        host,
        "--port",
        str(port),
    ], cwd=PROJECT_ROOT)


@cli.command()
@click.option("--out-dir", "out_dir", default="dist", show_default=True, help="Wheel/Sdist output directory.")
def package(out_dir: str) -> None:
    """Build Python distributions via uv."""
    ensure_uv_available("package")
    env = os.environ.copy()
    env["UV_BUILD_OUTPUT"] = out_dir
    call_subprocess(["uv", "build", "--out-dir", out_dir], cwd=PROJECT_ROOT, env=env)


@cli.command(name="playwright-setup")
@click.option("--browser", default="chromium", show_default=True, help="Browser to install for Playwright.")
@click.option("--skip-install", is_flag=True, help="Skip npm install and only run Playwright install.")
@click.option("--dry-run", is_flag=True, help="Print commands without executing them.")
def playwright_setup(browser: str, skip_install: bool, dry_run: bool) -> None:
    """Install Playwright dependencies and browser binaries."""
    ensure_npm_available()
    if not skip_install:
        if dry_run:
            click.echo("Dry run: ensuring frontend dependencies (npm install)")
        else:
            ensure_frontend_dependencies(force=True)
    pw_install = [_npx_cmd(), "playwright", "install", browser]
    _execute_or_echo(pw_install, dry_run=dry_run, cwd=PROJECT_ROOT)
    if not dry_run:
        click.echo(f"Playwright setup completed for {browser}.")


@cli.command(name="playwright-test")
@click.option("--project", default=None, help="Run tests for a specific project defined in playwright.config.js.")
@click.option("--headed", is_flag=True, help="Run Playwright tests in headed mode.")
@click.option("--dry-run", is_flag=True, help="Print commands without executing them.")
@click.argument("test_args", nargs=-1, type=click.UNPROCESSED)
def playwright_test(project: str | None, headed: bool, dry_run: bool, test_args: tuple[str, ...]) -> None:
    """Run Playwright end-to-end tests via npx."""
    if not dry_run:
        ensure_npm_available()
        ensure_frontend_dependencies()
    cmd: list[str] = [_npx_cmd(), "playwright", "test"]
    if project:
        cmd.extend(["--project", project])
    if headed:
        cmd.append("--headed")
    cmd.extend(test_args)
    _execute_or_echo(cmd, dry_run=dry_run, cwd=PROJECT_ROOT)


@cli.command()
@click.option(
    "--extra",
    "extras",
    multiple=True,
    default=("dev",),
    show_default=True,
    help="Optional dependency extras to install before testing (defaults to 'dev').",
)
@click.argument("pytest_args", nargs=-1, type=click.UNPROCESSED)
def test(extras: tuple[str, ...], pytest_args: tuple[str, ...]) -> None:
    """Run the pytest suite inside uv, ensuring requested extras are installed."""
    ensure_uv_available("run")
    call_subprocess(["uv", "sync"], cwd=PROJECT_ROOT)
    for extra in extras:
        call_subprocess(["uv", "sync", "--extra", extra], cwd=PROJECT_ROOT)

    run_cmd = ["uv", "run"]
    for extra in extras:
        run_cmd += ["--extra", extra]
    run_cmd += ["pytest"] + list(pytest_args)
    call_subprocess(run_cmd, cwd=PROJECT_ROOT)


def main() -> None:
    cli()


if __name__ == "__main__":  # pragma: no cover - CLI entrypoint
    main()
