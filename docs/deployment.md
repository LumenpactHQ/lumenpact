# Deployment guide

## Frontend deployment

The repository contains Vercel deployment configuration and a frontend build script. The web application can be deployed using standard Vercel project settings.

## Contract deployment

Soroban contract deployment should be done with the appropriate Stellar testnet or mainnet tooling. The deployed contract ID should be configured in the frontend environment variables before building the app.

## Environment variables

The frontend expects the following values:

- NEXT_PUBLIC_COMMITMENT_ESCROW_CONTRACT_ID
- NEXT_PUBLIC_SOROBAN_RPC_URL
- NEXT_PUBLIC_HORIZON_URL
- NEXT_PUBLIC_NETWORK

These values should be set in the deployment environment and not committed to source control.
