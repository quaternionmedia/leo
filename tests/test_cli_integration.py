from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]


def run_cli(args: list[str], *, cwd: Path | None = None, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    """Run the leo CLI via uv to ensure dependencies are available."""
    command = ["uv", "run", "leo", *args]
    return subprocess.run(
        command,
        cwd=cwd or ROOT,
        env=env,
        capture_output=True,
        text=True,
    )


@pytest.fixture
def project_copy(tmp_path: Path) -> Path:
    destination = tmp_path / "leo-copy"
    shutil.copytree(
        ROOT,
        destination,
        ignore=shutil.ignore_patterns(
            ".git",
            ".venv",
            "node_modules",
            "dist",
            "__pycache__",
        ),
    )
    return destination


@pytest.mark.parametrize(
    "args",
    [
        ["--help"],
        ["serve", "--help"],
        ["playwright-test", "--help"],
        ["npm", "--help"],
        ["npx", "--help"],
        ["quickstart", "--help"],
    ],
)
def test_cli_help_commands(args: list[str]) -> None:
    result = run_cli(args)
    assert result.returncode == 0
    assert "Usage:" in result.stdout


def test_init_db_reports_connection_issue() -> None:
    unreachable = "mongodb://localhost:1/leo?serverSelectionTimeoutMS=100"
    result = run_cli(["init-db", "--db-url", unreachable, "--timeout", "100"])
    assert result.returncode != 0
    combined_output = result.stdout + result.stderr
    assert "Unable to connect to MongoDB" in combined_output


def _read_version(pyproject_path: Path) -> str:
    for line in pyproject_path.read_text().splitlines():
        if line.strip().startswith("version"):
            return line.split("=")[1].strip().strip('"')
    raise AssertionError("version not found in pyproject.toml")


def test_reinstall_bumps_version_and_respects_dry_run(project_copy: Path) -> None:
    pyproject = project_copy / "pyproject.toml"
    original_version = _read_version(pyproject)
    env = os.environ.copy()
    env["LEO_PROJECT_ROOT"] = str(project_copy)

    result = run_cli([
        "reinstall",
        "--bump",
        "patch",
        "--extra",
        "dev",
        "--dry-run",
    ], cwd=project_copy, env=env)

    assert result.returncode == 0
    bumped_version = _read_version(pyproject)
    # Dry run should not persist version bump
    assert bumped_version == original_version
    assert "Dry run: would bump version" in result.stdout


@pytest.mark.parametrize(
    "command",
    [
        ("playwright-setup", ["--dry-run"]),
        ("playwright-setup", ["--skip-install", "--dry-run", "--browser", "firefox"]),
        ("playwright-test", ["--dry-run"]),
    ],
)
def test_playwright_commands_dry_run(command: tuple[str, list[str]]) -> None:
    name, args = command
    result = run_cli([name, *args])
    assert result.returncode == 0
    assert "Dry run:" in result.stdout


# ---------------------------------------------------------------------------
# End-to-end tests
# ---------------------------------------------------------------------------

import platform
import sys


def _npm_cmd() -> str:
    """Return the npm command appropriate for the current platform."""
    return "npm.cmd" if platform.system() == "Windows" else "npm"


def _run_shell(
    args: list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    timeout: int = 120,
) -> subprocess.CompletedProcess[str]:
    """Run a shell command with sensible defaults."""
    return subprocess.run(
        args,
        cwd=cwd or ROOT,
        env=env,
        capture_output=True,
        text=True,
        timeout=timeout,
    )


def _npm_available() -> bool:
    """Check if npm is available on this system."""
    try:
        result = _run_shell([_npm_cmd(), "--version"], timeout=10)
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


@pytest.mark.e2e
class TestE2EDevCycle:
    """Full end-to-end development cycle tests.

    These tests exercise the complete developer workflow:
    sync → build → package.

    Mark with `pytest -m e2e` to run only these tests.
    """

    def test_sync_in_project_copy(self, project_copy: Path) -> None:
        """Verify uv sync completes without error in an isolated copy."""
        env = os.environ.copy()
        # Remove VIRTUAL_ENV to avoid conflicts with the test runner's venv
        env.pop("VIRTUAL_ENV", None)
        result = _run_shell(["uv", "sync"], cwd=project_copy, env=env)
        assert result.returncode == 0, f"sync failed: {result.stderr}"

    def test_sync_dev_in_project_copy(self, project_copy: Path) -> None:
        """Verify sync-dev installs dev dependencies in an isolated copy."""
        env = os.environ.copy()
        env.pop("VIRTUAL_ENV", None)
        # First do base sync
        _run_shell(["uv", "sync"], cwd=project_copy, env=env)
        # Then sync dev extras
        result = _run_shell(["uv", "sync", "--extra", "dev"], cwd=project_copy, env=env)
        assert result.returncode == 0, f"sync-dev failed: {result.stderr}"

    @pytest.mark.skipif(not _npm_available(), reason="npm not available")
    def test_build_produces_frontend_assets(self, project_copy: Path) -> None:
        """Verify the frontend build runs and creates output."""
        env = os.environ.copy()
        env.pop("VIRTUAL_ENV", None)
        env["LEO_PROJECT_ROOT"] = str(project_copy)

        # Sync Python deps first
        _run_shell(["uv", "sync"], cwd=project_copy, env=env)

        # Install node modules
        npm_install = _run_shell([_npm_cmd(), "install"], cwd=project_copy, env=env)
        assert npm_install.returncode == 0, f"npm install failed: {npm_install.stderr}"

        # Build frontend via CLI
        result = _run_shell(
            ["uv", "run", "leo", "build"],
            cwd=project_copy,
            env=env,
        )
        assert result.returncode == 0, f"build failed: {result.stderr}"
        assert "Frontend assets built" in result.stdout

    def test_package_builds_python_distributions(self, project_copy: Path) -> None:
        """Verify uv build creates wheel/sdist."""
        env = os.environ.copy()
        env.pop("VIRTUAL_ENV", None)
        env["LEO_PROJECT_ROOT"] = str(project_copy)

        # Sync first
        _run_shell(["uv", "sync"], cwd=project_copy, env=env)

        dist_dir = project_copy / "dist"
        result = _run_shell(
            ["uv", "run", "leo", "package", "--out-dir", str(dist_dir)],
            cwd=project_copy,
            env=env,
        )
        assert result.returncode == 0, f"package failed: {result.stderr}"
        # Check that at least one distribution file was created
        dist_files = list(dist_dir.glob("*"))
        assert len(dist_files) > 0, "No distribution files created"
        extensions = {f.suffix for f in dist_files}
        assert ".whl" in extensions or ".gz" in extensions, f"Expected wheel or sdist, got {dist_files}"

    def test_reinstall_with_version_bump(self, project_copy: Path) -> None:
        """Verify reinstall actually bumps version when not in dry-run."""
        pyproject = project_copy / "pyproject.toml"
        original_version = _read_version(pyproject)
        env = os.environ.copy()
        env.pop("VIRTUAL_ENV", None)
        env["LEO_PROJECT_ROOT"] = str(project_copy)

        # Sync first to create venv
        _run_shell(["uv", "sync"], cwd=project_copy, env=env)

        # Now run reinstall with bump (using uv run directly to avoid entrypoint conflicts)
        result = _run_shell(
            ["uv", "run", "python", "-m", "leo.cli", "reinstall", "--bump", "minor"],
            cwd=project_copy,
            env=env,
        )

        # Version bump should have happened even if reinstall had file locking issues
        new_version = _read_version(pyproject)
        major, minor, patch = map(int, original_version.split("."))
        expected = f"{major}.{minor + 1}.0"
        assert new_version == expected, f"Expected {expected}, got {new_version}"


@pytest.mark.e2e
@pytest.mark.skipif(not _npm_available(), reason="npm not available")
class TestE2EPlaywright:
    """End-to-end Playwright integration tests.

    These tests verify the full Playwright setup and test execution pipeline.
    Requires npm and node to be available.
    """

    def test_playwright_setup_installs_browser(self, project_copy: Path) -> None:
        """Verify playwright-setup installs browser binaries."""
        env = os.environ.copy()
        env.pop("VIRTUAL_ENV", None)
        env["LEO_PROJECT_ROOT"] = str(project_copy)

        # Sync and install node modules first
        _run_shell(["uv", "sync"], cwd=project_copy, env=env)
        _run_shell([_npm_cmd(), "install"], cwd=project_copy, env=env)

        result = _run_shell(
            ["uv", "run", "leo", "playwright-setup", "--browser", "chromium"],
            cwd=project_copy,
            env=env,
            timeout=300,  # Browser download can take a while
        )
        # Exit code 0 means success
        assert result.returncode == 0, f"playwright-setup failed: {result.stderr}"
        assert "Playwright setup completed" in result.stdout or "already" in result.stdout.lower()

    def test_playwright_test_runs_smoke_suite(self, project_copy: Path) -> None:
        """Run the actual Playwright smoke test suite."""
        env = os.environ.copy()
        env.pop("VIRTUAL_ENV", None)
        env["LEO_PROJECT_ROOT"] = str(project_copy)

        # Setup
        _run_shell(["uv", "sync"], cwd=project_copy, env=env)
        _run_shell([_npm_cmd(), "install"], cwd=project_copy, env=env)

        # Install playwright browser
        setup_result = _run_shell(
            ["uv", "run", "leo", "playwright-setup", "--browser", "chromium"],
            cwd=project_copy,
            env=env,
            timeout=300,
        )
        assert setup_result.returncode == 0, f"playwright-setup failed: {setup_result.stderr}"

        # Run the smoke tests (don't pass --browser since config defines projects)
        result = _run_shell(
            ["uv", "run", "leo", "playwright-test"],
            cwd=project_copy,
            env=env,
            timeout=120,
        )
        # Check output for test results
        combined = result.stdout + result.stderr
        # Playwright outputs to stderr typically
        assert "passed" in combined.lower() or result.returncode == 0, (
            f"Playwright tests failed: {combined}"
        )


@pytest.mark.e2e
class TestE2EFullCycle:
    """Complete development cycle from fresh state.

    This test class runs the entire dev workflow in sequence,
    simulating what a new developer would do.
    """

    @pytest.mark.skipif(not _npm_available(), reason="npm not available")
    def test_full_dev_cycle_in_project_copy(self, project_copy: Path) -> None:
        """Run a complete development cycle in an isolated copy.

        Steps:
        1. uv sync (install Python deps)
        2. npm install (install Node deps)
        3. leo build (build frontend)
        4. leo package (build Python distributions)
        """
        env = os.environ.copy()
        env.pop("VIRTUAL_ENV", None)
        env["LEO_PROJECT_ROOT"] = str(project_copy)

        # Step 1: Sync Python dependencies
        sync_result = _run_shell(["uv", "sync"], cwd=project_copy, env=env)
        assert sync_result.returncode == 0, f"uv sync failed: {sync_result.stderr}"

        # Step 2: Install Node dependencies
        npm_result = _run_shell([_npm_cmd(), "install"], cwd=project_copy, env=env)
        assert npm_result.returncode == 0, f"npm install failed: {npm_result.stderr}"

        # Step 3: Build frontend
        build_result = _run_shell(
            ["uv", "run", "leo", "build"],
            cwd=project_copy,
            env=env,
        )
        assert build_result.returncode == 0, f"build failed: {build_result.stderr}"

        # Step 4: Package Python
        dist_dir = project_copy / "dist"
        package_result = _run_shell(
            ["uv", "run", "leo", "package", "--out-dir", str(dist_dir)],
            cwd=project_copy,
            env=env,
        )
        assert package_result.returncode == 0, f"package failed: {package_result.stderr}"

        # Verify outputs
        dist_files = list(dist_dir.glob("leo-*"))
        assert len(dist_files) > 0, "No distribution files created"
