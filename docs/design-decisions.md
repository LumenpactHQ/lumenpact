# Design decisions

## Trusted judge model

The current product uses a trusted judge as the primary resolution mechanism. This was chosen because it provides a practical and understandable experience without requiring proof infrastructure.

## Escrow-first architecture

The contract is designed around direct escrow management rather than layered abstractions. That keeps the implementation understandable and easier to audit.

## Incremental evolution

The contract and frontend are structured to support future upgrades such as evidence submission, stronger verification, and richer user experiences without forcing a full redesign.
