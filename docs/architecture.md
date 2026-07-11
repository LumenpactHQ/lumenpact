# Architecture

Lumenpact is structured as a layered system with a clear separation between on-chain escrow logic and the web application experience.

## System layers

- Smart contract layer: Soroban contract logic for escrow, status transitions, and fund movement.
- Application layer: Next.js frontend and wallet integration.
- Developer tooling: Rust, Node.js, and GitHub Actions for validation and maintenance.

## Runtime flow

1. A creator connects a Stellar wallet.
2. The frontend submits a transaction to the Soroban contract to create a commitment.
3. The contract locks the stake and stores the commitment record.
4. A judge reviews the commitment after the deadline.
5. The judge resolves the commitment as pass or fail.
6. The contract transfers the escrow funds accordingly.
7. If no resolution occurs, the creator can cancel after the grace period.

## Design principles

- Keep the core contract small and explicit.
- Keep the user flow understandable for non-crypto users.
- Favor auditable state changes over complex orchestration.
- Leave room for future proof-based verification.
