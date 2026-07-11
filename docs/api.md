# API and integration notes

The frontend currently interacts with the Soroban contract through a small TypeScript integration layer.

## Contract-facing operations

The app uses the contract to:

- create commitments,
- resolve commitments,
- cancel commitments,
- and read commitment data.

## Integration shape

The current integration layer is organized around a small set of helper functions that wrap contract calls and decode the resulting Soroban values into the frontend model.

## Future improvements

A fuller API layer could eventually include:

- typed API endpoints for external clients,
- richer error translation,
- and caching or indexing for larger commitment histories.
