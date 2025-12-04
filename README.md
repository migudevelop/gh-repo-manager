# gh-repo-manager

![GitHub release (latest by date)](https://img.shields.io/github/v/release/migudevelop/gh-repo-manager)
![License](https://img.shields.io/github/license/migudevelop/gh-repo-manager)

Node.js CLI tool to list and delete GitHub repositories using the official GitHub REST API (Octokit).

## Status

Experimental — use with caution (requires a GitHub token).

## Table of Contents

- [Status](#status)
- [Key features](#key-features)
- [Requirements](#requirements)
- [Quick links](#quick-links)
- [What the project does](#what-the-project-does)
- [Why this is useful](#why-this-is-useful)
- [Installation](#installation)
- [Usage](#usage)
- [Environment & configuration](#environment--configuration)
- [Troubleshooting](#troubleshooting)
- [Maintainers & Contributing](#maintainers--contributing)

## Key features

- List repositories for the authenticated user.
- Interactively select repositories to delete.
- Batch deletion with concurrency control.

## Requirements

- Node.js >= 20
- A GitHub personal access token with `repo` scope (for private repos) or appropriate scopes for public-only operations.

## Quick links

- License: `LICENSE`
- Repository: `package.json`

## What the project does

This small CLI helps you inspect and remove GitHub repositories from the command line. It uses `@octokit/rest` for API calls and `@clack/prompts` for interactive selection and confirmation.

## Why this is useful

- Fast way to clean up outdated or unused repositories.
- Interactive selection reduces risk of accidental deletions.
- Programmatic primitives allow integration into scripts or automation.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/migudevelop/gh-repo-manager.git
cd gh-repo-manager
pnpm install
```

Run in development mode:

```bash
pnpm run start:dev
```

You can also run the CLI directly with Node (this repository uses ESM):

```bash
gh-repo-manager --help
```

**Usage (CLI)**
- List repositories (default):

```bash
# Uses GITHUB_TOKEN environment variable, or provide --token
GITHUB_TOKEN=ghp_xxx 
# or
gh-repo-manager --token <your_token>
```

- Delete repositories (interactive):

```bash
node src/index.js --delete --token <your_token>
```

Global usage (when the package is installed globally or run via the published binary):

```bash
# After publishing/installing globally
npm install -g gh-repo-manager
pnpm install -g gh-repo-manager
```

Then use the CLI:

```bash

# Short option (token):
gh-repo-manager -t <your_token>

# Long option (token):
gh-repo-manager --token <your_token>

# Delete interactively using short or long form:
gh-repo-manager -d -t <your_token>
gh-repo-manager --delete --token <your_token>

# You can also run via npx without global install:
npx gh-repo-manager --token <your_token>
```

Notes:
- If you install the package globally (when published) the binary is `gh-repo-manager`.
- The CLI will prompt you to select repositories and ask for confirmation before deletion.

**Environment & configuration**
- `GITHUB_TOKEN` — preferred way to provide your GitHub token.
- `--token <token>` — CLI option to override environment variable.

**Troubleshooting**
- Ensure your token has the required scopes (e.g., `repo` for private repository deletion).
- Node version must be >= 20.0.0 as declared in `package.json`.

**Maintainers & Contributing**
- Maintainer: Miguel Martínez
- License: MIT (see `LICENSE`)
