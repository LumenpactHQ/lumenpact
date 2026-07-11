# Testing guide

## Contract testing

The Rust contract test suite is executed with:

```bash
cd contracts
cargo test
```

## Frontend verification

The frontend build and lint checks should be run with:

```bash
cd frontend
npm run build
npm run lint
```

## Recommended practice

- add tests for new contract behavior,
- keep regression coverage for escrow and resolution flows,
- and verify UI changes with builds and linting where practical.
