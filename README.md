# Leo

Modern sheet music viewer for musicians. View chord charts, search thousands of standards, and practice with an advanced metronome - all in your browser.

## Features

- **🎼 iReal Pro Charts** - Professional chord chart display with thousands of standards
- **🔍 Smart Search** - Instant filtering by title, composer, style, and key
- **🎹 Transposition** - One-tap key changes, works in real-time
- **🎵 Advanced Metronome** - Custom patterns, 20-300 BPM, visual notation, background operation
- **🌗 Dark Mode** - Comfortable viewing in any lighting
- **📱 Cross-Platform** - Desktop, tablet, and mobile support
- **⚡ Fast & Offline** - No loading spinners, works without internet

See [Features.md](docs/Features.md) for details.

## 🚀 Demo

Try the live demo: **[quaternionmedia.github.io/leo](https://quaternionmedia.github.io/leo/)**

## 🏃 Quick Start

### For Users

Just visit the demo link above - no installation required!

### For Developers

```sh
git clone https://github.com/quaternionmedia/leo.git
cd leo
uv run leo quickstart  # install deps and start dev server at http://localhost:1234
```

**Requirements:**
- [Node.js](https://nodejs.org/) v18+
- [uv](https://github.com/astral-sh/uv) (Python package manager)

**Run tests:**

```sh
uv run leo test                # Python tests
uv run leo playwright-test     # E2E tests
```

## 📖 Documentation

- **[Features](docs/Features.md)** — Complete feature list with details
- **[Contributing Guide](docs/CONTRIBUTING.md)** — Development setup and workflow
- **[Architecture](docs/Technical.md)** — Technical design and architecture
- **[Requirements](docs/Requirements.md)** — Product requirements and planned features
- **[User Stories](docs/User%20Stories.md)** — Use cases and future collaboration features

## 🎹 The Leo CLI

Leo provides a unified CLI for all development tasks:

```sh
uv run leo --help
```

**Essential commands:**

| Command | Description |
|---------|-------------|
| `leo quickstart` | One-command setup: install deps + start dev server |
| `leo serve-frontend` | Start Vite dev server |
| `leo test` | Run test suite |
| `leo build` | Build for production |
| `leo playwright-test` | Run E2E tests |

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for the complete command reference.

## Use Cases

- **Solo Practice** - Charts with metronome in one app
- **Jam Sessions** - Fast lookup, instant transposition
- **Learning** - Study progressions, explore repertoire
- **Teaching** - Display and demonstrate concepts
- **Live Performance** - Reliable access, no internet required

## Why Leo

- Built by musicians for real workflow needs
- Fast and lightweight - instant response, no spinners
- Modern architecture - Mithril.js, TypeScript, Vite
- Well-tested - comprehensive test coverage
- Open source and free

## Roadmap

Planned features:
- **Collaboration** - Conductor/follower mode for band coordination
- **Annotations** - Draw and type notes on charts
- **Setlist Management** - Create and share custom setlists
- **Additional Tools** - Tuner, recording integration

See [Requirements](docs/Requirements.md) and [User Stories](docs/User%20Stories.md) for details.

## Contributing

Contributions welcome: bug reports, features, docs, code.

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) to get started.

## Community

- **Discord**: https://discord.gg/FycdT36
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and ideas

## License

Leo is open source software licensed under the MIT license.

---

**Named after Leonard Bernstein** - educator, composer, conductor, and champion of music. Leo aims to make sheet music accessible and practical for musicians everywhere. 🎼