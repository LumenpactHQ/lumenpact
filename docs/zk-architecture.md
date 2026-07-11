# Zero-knowledge and verification architecture

The current implementation does not rely on zero-knowledge proofs. Instead, it uses a human judge to resolve commitments.

## Why this is the current choice

A zero-knowledge system would add complexity around proving the truth of an event, selecting the prover, and validating that data off-chain. The current release prioritizes simplicity and clarity over cryptographic proof.

## Planned direction

Future iterations may introduce:

- evidence submission,
- signed oracle attestations,
- or stronger verification layers for specific goal types.

These extensions can be layered on top of the existing commitment contract without replacing the core escrow model.
