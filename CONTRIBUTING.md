# Contributing to Lumenpact

Thank you for considering a contribution to Lumenpact. This project is intentionally small enough to be approachable, but it is also an infrastructure-style repository that benefits from careful review and clear communication.

## Ways to contribute

You can contribute by:

- improving documentation,
- fixing bugs,
- improving tests,
- refining the frontend experience,
- strengthening the smart contract implementation,
- or proposing architectural changes.

## Before you start

1. Fork the repository and create a feature branch.
2. Read the relevant documentation in this repository.
3. Ensure your local environment matches the setup instructions.
4. Open an issue if your change is substantial or uncertain.

## Development workflow

### 1. Install dependencies

```bash
npm install
cd frontend && npm install
```

### 2. Run the local app

```bash
npm run dev
```

### 3. Run tests and checks

```bash
cd contracts
cargo test

cd ../frontend
npm run build
npm run lint
```

## Coding standards

- Prefer small, focused changes.
- Keep Rust contracts explicit and auditable.
- Preserve existing naming patterns unless the change is clearly justified.
- Add or update tests when behavior changes.
- Write documentation for user-facing changes.

## Commit conventions

Use clear, descriptive commit messages. A good convention is:

- `feat: add judge inbox filtering`
- `fix: prevent invalid deadline creation`
- `docs: expand contributor onboarding`

## Pull request expectations

Before opening a pull request:

- ensure the relevant tests pass,
- describe the motivation for the change,
- summarize the behavioral impact,
- and note any follow-up work.

## Community expectations

Please be respectful, constructive, and patient. We value thoughtful review over rapid iteration.
