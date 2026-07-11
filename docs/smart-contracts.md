# Smart contracts

The current contract implementation is centered on a single Soroban escrow contract: commitment_escrow.

## Responsibilities

The contract is responsible for:

- validating initialization and input parameters,
- locking stake from the creator,
- storing commitment metadata,
- tracking creator and judge relationships,
- resolving outcomes as pass or fail,
- canceling unresolved commitments after the grace period,
- and exposing read APIs for commitment lookups.

## Core lifecycle

### Create

The creator submits a transaction that includes the judge, amount, deadline, description, penalty destination, and penalty type. The contract transfers the stake into escrow and records the commitment.

### Resolve

The designated judge can resolve the commitment after the deadline. The contract checks authorization, deadline status, and then transfers the stake back to the creator or to the penalty destination.

### Cancel

If the judge never resolves the commitment, the creator can cancel after the grace period. The escrow is refunded to the creator.

## Notes

The contract currently favors clarity over complexity. That makes it more approachable for contributors and suitable for early testnet work.
