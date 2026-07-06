# Vercel deployment checklist

## 1. Project settings
- Import the repository into Vercel.
- Set the Root Directory to `frontend`.
- Framework preset: Next.js.
- Build command: `npm run build`.
- Output directory: `.next`.

## 2. Environment variables
Add these in Vercel Project Settings → Environment Variables:
- `NEXT_PUBLIC_NETWORK=testnet`
- `NEXT_PUBLIC_COMMITMENT_ESCROW_CONTRACT_ID=your_contract_id_here`
- `NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org`
- `NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org`

## 3. Notes
- The frontend now includes a basic wallet connection component for Freighter-style wallets.
- Real Soroban contract calls are still pending and must be wired up to make the app fully functional.
- The app can be previewed and tested on Vercel once the environment variables are configured.
