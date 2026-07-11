# Development guide

## Prerequisites

- Node.js 20 or newer
- Rust stable toolchain
- Cargo
- access to a Stellar testnet wallet

## Initial setup

```bash
git clone https://github.com/LumenpactHQ/lumenpact.git
cd lumenpact
npm install
cd frontend && npm install
```

## Running the app

From the repository root:

```bash
npm run dev
```

The frontend should be available at http://localhost:3000.

## Working on the contract

```bash
cd contracts
cargo test
```

## Common tasks

- start the frontend locally,
- run contract tests,
- update documentation,
- and keep the Rust and TypeScript code aligned with the repository conventions.
