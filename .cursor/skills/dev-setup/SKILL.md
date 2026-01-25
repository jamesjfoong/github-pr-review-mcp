---
name: dev-setup
description: "Set up development environment and run builds. Use for initial setup or testing changes."
---

# Development Setup

## When to Use

- First time setup
- After cloning repository
- Testing changes

## Quick Setup

```bash
./scripts/setup.sh
```

Checks Node.js, installs deps, builds, creates `.env`.

## Manual Setup

```bash
npm install
cp .env.example .env
# Add GITHUB_TOKEN to .env
npm run build
```

## Development Mode

```bash
npm run dev
```

Hot reload enabled - changes auto-recompile.

## Production Build

```bash
npm run build
npm start
```

## Environment Variables

Required:

- `GITHUB_TOKEN` - GitHub PAT with `repo` and `read:user` scopes

Optional:

- `DEBUG=true` - Enable debug logging

## Node.js Version

Requires 20.19.0+ (or 22.12.0+, 23.0.0+)
