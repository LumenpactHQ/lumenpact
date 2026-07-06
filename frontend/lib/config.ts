export const appConfig = {
  network: process.env.NEXT_PUBLIC_NETWORK ?? "testnet",
  commitmentEscrowContractId:
    process.env.NEXT_PUBLIC_COMMITMENT_ESCROW_CONTRACT_ID ?? "",
  sorobanRpcUrl:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org",
  horizonUrl:
    process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org",
};
