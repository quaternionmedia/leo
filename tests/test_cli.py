from __future__ import annotations

from click.testing import CliRunner
from pymongo.errors import ServerSelectionTimeoutError

import leo.cli as cli


def test_ensure_frontend_dependencies_prefers_npm_ci(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)

    (tmp_path / "package-lock.json").write_text("{}")

    calls: list[tuple[tuple[str, ...], str]] = []

    def fake_call_subprocess(args, cwd=None, env=None):
        calls.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "call_subprocess", fake_call_subprocess)

    cli.ensure_frontend_dependencies(force=False)

    npm = cli._npm_cmd()
    assert calls == [((npm, 'ci'), str(tmp_path))]


def test_build_command_runs_npm_build(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli, "PYPROJECT_PATH", tmp_path / "pyproject.toml")
    monkeypatch.setattr(cli, "ensure_uv_available", lambda *_: None)
    monkeypatch.setattr(cli.shutil, "which", lambda _: "/usr/bin/npm")

    deps_calls: list[bool] = []
    build_calls: list[tuple[tuple[str, ...], str, dict[str, str] | None]] = []

    def fake_ensure_frontend_dependencies(force=False):
        deps_calls.append(force)

    def fake_call_subprocess(args, cwd=None, env=None):
        build_calls.append((tuple(args), str(cwd), env))

    monkeypatch.setattr(cli, "ensure_frontend_dependencies", fake_ensure_frontend_dependencies)
    monkeypatch.setattr(cli, "call_subprocess", fake_call_subprocess)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["build"])

    assert result.exit_code == 0
    assert deps_calls == [True]

    assert build_calls, "Expected at least one subprocess call"
    args, cwd, env = build_calls[-1]
    npm = cli._npm_cmd()
    assert args == (npm, 'run', 'build')
    assert cwd == str(tmp_path)
    assert env is not None and env.get("NODE_ENV") == "production"


def test_serve_frontend_command_runs_vite(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli, "PYPROJECT_PATH", tmp_path / "pyproject.toml")
    monkeypatch.setattr(cli, "ensure_uv_available", lambda *_: None)
    monkeypatch.setattr(cli.shutil, "which", lambda _: "/usr/bin/npm")

    deps_calls: list[bool] = []
    recorded: list[tuple[tuple[str, ...], str]] = []

    def fake_ensure_frontend_dependencies(force=False):
        deps_calls.append(force)

    def fake_call_subprocess(args, cwd=None, env=None):
        recorded.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "ensure_frontend_dependencies", fake_ensure_frontend_dependencies)
    monkeypatch.setattr(cli, "call_subprocess", fake_call_subprocess)

    runner = CliRunner()
    result = runner.invoke(
        cli.cli,
        ["serve-frontend", "--host", "127.0.0.1", "--port", "9999"],
    )

    npm = cli._npm_cmd()
    assert result.exit_code == 0
    assert deps_calls == [False]
    assert recorded == [
        ((
            npm,
            'run',
            'dev',
            '--',
            '--host',
            '127.0.0.1',
            '--port',
            '9999',
        ), str(tmp_path))
    ]


def test_sync_dev_runs_base_and_extra(monkeypatch):
    calls: list[tuple[tuple[str, ...], str]] = []

    def fake_call(args, cwd=None, env=None):
        calls.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "ensure_uv_available", lambda *_: None)
    monkeypatch.setattr(cli, "call_subprocess", fake_call)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["sync-dev"])


def test_quickstart_installs_deps_and_starts_server(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli, "ensure_uv_available", lambda *_: None)
    monkeypatch.setattr(cli.shutil, "which", lambda _: "/usr/bin/npm")

    deps_calls: list[bool] = []
    recorded: list[tuple[tuple[str, ...], str]] = []

    def fake_ensure_frontend_dependencies(force=False):
        deps_calls.append(force)

    def fake_call_subprocess(args, cwd=None, env=None):
        recorded.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "ensure_frontend_dependencies", fake_ensure_frontend_dependencies)
    monkeypatch.setattr(cli, "call_subprocess", fake_call_subprocess)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["quickstart"])

    npm = cli._npm_cmd()
    assert result.exit_code == 0
    # Should have synced Python deps
    assert (("uv", "sync", "--extra", "dev"), str(tmp_path)) in recorded
    # Should have called ensure_frontend_dependencies with force=True
    assert deps_calls == [True]
    # Should start the dev server
    assert recorded[-1] == ((
        npm,
        'run',
        'dev',
        '--',
        '--host',
        '0.0.0.0',
        '--port',
        '1234',
    ), str(tmp_path))


def test_quickstart_skip_install_flag(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli.shutil, "which", lambda _: "/usr/bin/npm")

    deps_calls: list[bool] = []
    recorded: list[tuple[tuple[str, ...], str]] = []

    def fake_ensure_frontend_dependencies(force=False):
        deps_calls.append(force)

    def fake_call_subprocess(args, cwd=None, env=None):
        recorded.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "ensure_frontend_dependencies", fake_ensure_frontend_dependencies)
    monkeypatch.setattr(cli, "call_subprocess", fake_call_subprocess)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["quickstart", "--skip-install"])

    npm = cli._npm_cmd()
    assert result.exit_code == 0
    # Should NOT have called uv sync
    assert not any("uv" in call[0] for call in recorded)
    # Should NOT have called ensure_frontend_dependencies
    assert deps_calls == []
    # Should still start the dev server
    assert recorded == [((
        npm,
        'run',
        'dev',
        '--',
        '--host',
        '0.0.0.0',
        '--port',
        '1234',
    ), str(tmp_path))]


def test_test_command_defaults_to_dev_extra(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli, "PYPROJECT_PATH", tmp_path / "pyproject.toml")

    calls: list[tuple[tuple[str, ...], str]] = []

    def fake_call(args, cwd=None, env=None):
        calls.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "ensure_uv_available", lambda *_: None)
    monkeypatch.setattr(cli, "call_subprocess", fake_call)
    runner = CliRunner()
    result = runner.invoke(cli.cli, ["test"])

    assert result.exit_code == 0
    assert calls == [
        (("uv", "sync"), str(tmp_path)),
        (("uv", "sync", "--extra", "dev"), str(tmp_path)),
        (("uv", "run", "--extra", "dev", "pytest"), str(tmp_path)),
    ]


def test_test_command_supports_custom_extras(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli, "PYPROJECT_PATH", tmp_path / "pyproject.toml")

    calls: list[tuple[tuple[str, ...], str]] = []

    def fake_call(args, cwd=None, env=None):
        calls.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "ensure_uv_available", lambda *_: None)
    monkeypatch.setattr(cli, "call_subprocess", fake_call)
    runner = CliRunner()
    result = runner.invoke(cli.cli, ["test", "--extra", "foo", "--extra", "bar", "--", "-k", "cli"])

    assert result.exit_code == 0
    assert calls == [
        (("uv", "sync"), str(tmp_path)),
        (("uv", "sync", "--extra", "foo"), str(tmp_path)),
        (("uv", "sync", "--extra", "bar"), str(tmp_path)),
        (
            (
                "uv",
                "run",
                "--extra",
                "foo",
                "--extra",
                "bar",
                "pytest",
                "-k",
                "cli",
            ),
            str(tmp_path),
        ),
    ]


def test_reinstall_runs_reinstall_command(tmp_path, monkeypatch):
    pyproject = tmp_path / "pyproject.toml"
    pyproject.write_text('version = "0.1.0"\n')

    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli, "PYPROJECT_PATH", pyproject)
    monkeypatch.setattr(cli, "ensure_uv_available", lambda *_: None)

    calls: list[tuple[tuple[str, ...], str]] = []

    def fake_call(args, cwd=None, env=None):
        calls.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "call_subprocess", fake_call)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["reinstall"])

    assert result.exit_code == 0
    assert pyproject.read_text() == 'version = "0.1.0"\n'
    assert calls == [(("uv", "sync", "--reinstall"), str(tmp_path))]


def test_reinstall_bumps_version_and_handles_extras(tmp_path, monkeypatch):
    pyproject = tmp_path / "pyproject.toml"
    pyproject.write_text('version = "1.2.3"\n')

    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli, "PYPROJECT_PATH", pyproject)
    monkeypatch.setattr(cli, "ensure_uv_available", lambda *_: None)

    calls: list[tuple[tuple[str, ...], str]] = []

    def fake_call(args, cwd=None, env=None):
        calls.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "call_subprocess", fake_call)

    runner = CliRunner()
    result = runner.invoke(
        cli.cli,
        ["reinstall", "--bump", "patch", "--extra", "dev", "--extra", "docs"],
    )

    assert result.exit_code == 0
    assert pyproject.read_text() == 'version = "1.2.4"\n'
    assert calls == [
        (("uv", "sync", "--reinstall", "--extra", "dev", "--extra", "docs"), str(tmp_path))
    ]


def test_init_db_reports_connection_issue(monkeypatch):
    def fake_init_db():
        raise ServerSelectionTimeoutError("mongo", [])

    monkeypatch.setattr(cli, "initDB", fake_init_db)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["init-db"])

    assert result.exit_code != 0
    assert "Unable to connect to MongoDB" in result.output


def test_npm_command_runs_npm_with_args(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli.shutil, "which", lambda _: "/usr/bin/npm")

    deps_calls: list[bool] = []
    recorded: list[tuple[tuple[str, ...], str]] = []

    def fake_ensure_frontend_dependencies(force=False):
        deps_calls.append(force)

    def fake_call_subprocess(args, cwd=None, env=None):
        recorded.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "ensure_frontend_dependencies", fake_ensure_frontend_dependencies)
    monkeypatch.setattr(cli, "call_subprocess", fake_call_subprocess)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["npm", "--", "run", "lint"])

    npm = cli._npm_cmd()
    assert result.exit_code == 0
    assert deps_calls == [False]  # --install is default True but ensure_frontend_dependencies checks node_modules
    assert recorded == [((npm, "run", "lint"), str(tmp_path))]


def test_npm_command_skips_install_with_no_install_flag(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli.shutil, "which", lambda _: "/usr/bin/npm")

    deps_calls: list[bool] = []
    recorded: list[tuple[tuple[str, ...], str]] = []

    def fake_ensure_frontend_dependencies(force=False):
        deps_calls.append(force)

    def fake_call_subprocess(args, cwd=None, env=None):
        recorded.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "ensure_frontend_dependencies", fake_ensure_frontend_dependencies)
    monkeypatch.setattr(cli, "call_subprocess", fake_call_subprocess)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["npm", "--no-install", "--", "run", "test"])

    npm = cli._npm_cmd()
    assert result.exit_code == 0
    assert deps_calls == []  # Should not have called ensure_frontend_dependencies
    assert recorded == [((npm, "run", "test"), str(tmp_path))]


def test_npx_command_runs_npx_with_args(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli.shutil, "which", lambda _: "/usr/bin/npx")

    deps_calls: list[bool] = []
    recorded: list[tuple[tuple[str, ...], str]] = []

    def fake_ensure_frontend_dependencies(force=False):
        deps_calls.append(force)

    def fake_call_subprocess(args, cwd=None, env=None):
        recorded.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "ensure_frontend_dependencies", fake_ensure_frontend_dependencies)
    monkeypatch.setattr(cli, "call_subprocess", fake_call_subprocess)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["npx", "--", "playwright", "test"])

    npx = cli._npx_cmd()
    assert result.exit_code == 0
    assert deps_calls == [False]
    assert recorded == [((npx, "playwright", "test"), str(tmp_path))]


def test_npx_command_skips_install_with_no_install_flag(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli.shutil, "which", lambda _: "/usr/bin/npx")

    deps_calls: list[bool] = []
    recorded: list[tuple[tuple[str, ...], str]] = []

    def fake_ensure_frontend_dependencies(force=False):
        deps_calls.append(force)

    def fake_call_subprocess(args, cwd=None, env=None):
        recorded.append((tuple(args), str(cwd)))

    monkeypatch.setattr(cli, "ensure_frontend_dependencies", fake_ensure_frontend_dependencies)
    monkeypatch.setattr(cli, "call_subprocess", fake_call_subprocess)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["npx", "--no-install", "--", "eslint", "."])

    npx = cli._npx_cmd()
    assert result.exit_code == 0
    assert deps_calls == []
    assert recorded == [((npx, "eslint", "."), str(tmp_path))]


def test_npm_command_errors_without_args(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli.shutil, "which", lambda _: "/usr/bin/npm")
    monkeypatch.setattr(cli, "ensure_frontend_dependencies", lambda force=False: None)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["npm"])

    assert result.exit_code != 0
    assert "Provide an npm command" in result.output


def test_npx_command_errors_without_args(tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "PROJECT_ROOT", tmp_path)
    monkeypatch.setattr(cli.shutil, "which", lambda _: "/usr/bin/npx")
    monkeypatch.setattr(cli, "ensure_frontend_dependencies", lambda force=False: None)

    runner = CliRunner()
    result = runner.invoke(cli.cli, ["npx"])

    assert result.exit_code != 0
    assert "Provide an npx command" in result.output
