import {
  rpc,
  TransactionBuilder,
  Operation,
  xdr,
  Address as SdkAddress,
  Account,
  Asset,
  Keypair,
  Networks,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";
import { appConfig } from "./config";

export const NETWORK_PASSPHRASE =
  appConfig.network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

export const RPC_URL = appConfig.sorobanRpcUrl;
export const CONTRACT_ID = appConfig.commitmentEscrowContractId;

/** Stellar Asset Contract address for native XLM on the active network. */
export const XLM_CONTRACT_ID = Asset.native().contractId(NETWORK_PASSPHRASE);

/** Canonical, provably-unspendable burn address (matches the contract). */
export const BURN_ADDRESS =
  "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

const server = new rpc.Server(RPC_URL, { allowHttp: false });

// ── ScVal encoders ──────────────────────────────────────────────
export function toAddressScVal(addr: string): xdr.ScVal {
  return new SdkAddress(addr).toScVal();
}

export function toI128(value: bigint | number): xdr.ScVal {
  return nativeToScVal(BigInt(value), { type: "i128" });
}

export function toU64(value: number): xdr.ScVal {
  return nativeToScVal(BigInt(value), { type: "u64" });
}

export function toStr(value: string): xdr.ScVal {
  return nativeToScVal(value, { type: "string" });
}

export function toBool(value: boolean): xdr.ScVal {
  return nativeToScVal(value);
}

export function toEnum(name: string): xdr.ScVal {
  return xdr.ScVal.scvVec([xdr.ScVal.scvSymbol(name)]);
}

export async function readOnly(
  fn: string,
  args: xdr.ScVal[]
): Promise<xdr.ScVal | null> {
  const source = new Account(Keypair.random().publicKey(), "0");
  const tx = new TransactionBuilder(source, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: CONTRACT_ID,
        function: fn,
        args,
      })
    )
    .setTimeout(30)
    .build();

  const sim = (await server.simulateTransaction(
    tx as never
  )) as unknown as SimResult;

  if (sim.error) {
    throw new Error(`Read failed: ${sim.error}`);
  }

  const retval =
    sim.result?.retval ?? sim.results?.[0]?.retval ?? null;
  return retval as xdr.ScVal | null;
}

// ── Write invocation (simulate → sign → send → poll) ────────────
export async function sendTx(
  fn: string,
  args: xdr.ScVal[],
  sourceAddress: string,
  sign: (xdr: string) => Promise<string>
): Promise<rpc.Api.GetTransactionResponse> {
  const source = await server.getAccount(sourceAddress);

  const tx = new TransactionBuilder(source, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: CONTRACT_ID,
        function: fn,
        args,
      })
    )
    .setTimeout(60)
    .build();

  const sim = (await server.simulateTransaction(
    tx as never
  )) as SimResult;

  if (sim.error) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  // Attach the simulated footprint/auth, then sign and submit.
  const prepared = rpc.assembleTransaction(tx as never, sim as never);
  const signedXdr = await sign(prepared.build().toXDR());
  const signed = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );

  const sendRes = await server.sendTransaction(signed as never);
  if (sendRes.status === "ERROR") {
    throw new Error("Transaction was rejected by the network.");
  }

  return pollTransaction(sendRes.hash);
}

async function pollTransaction(hash: string): Promise<rpc.Api.GetTransactionResponse> {
  for (let i = 0; i < 15; i++) {
    const res = await server.getTransaction(hash);
    if (res.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return res;
    }
    if (res.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain.");
    }
    if (res.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Transaction confirmation timed out.");
}

// ── Minimal structural types for the simulation result ──────────
interface SimResult {
  error?: string;
  result?: { retval?: xdr.ScVal };
  results?: { retval?: xdr.ScVal }[];
}

export { scValToNative };
