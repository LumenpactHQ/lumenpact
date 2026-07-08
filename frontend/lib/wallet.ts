export type WalletProvider = "freighter" | "xbull" | "albedo";

export const NETWORK_PASSPHRASE = "Testnet Network ; September 2015";

type WalletApi = {
  isConnected?: () => Promise<boolean>;
  getPublicKey?: () => Promise<string>;
  publicKey?: () => Promise<string>;
  signTransaction?: (xdr: string, opts?: { networkPassphrase?: string }) => Promise<string>;
};

type XBullApi = {
  signTransaction?: (xdr: string) => Promise<string | { xdr?: string; signedXdr?: string }>;
};

type AlbedoApi = {
  publicKey?: (opts?: {}) => Promise<{ pubkey: string }>;
  tx?: (opts: { xdr: string; network?: string }) => Promise<{ xdr: string }>;
};

type WalletWindow = Window & {
  freighter?: WalletApi;
  xBull?: XBullApi;
  xbull?: XBullApi;
  xBullSDK?: XBullApi;
  albedo?: AlbedoApi;
};

async function tryProvider(provider: WalletProvider): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const win = window as WalletWindow;

  let wallet: WalletApi | undefined;

  if (provider === "freighter") {
    wallet = win.freighter;
  } else if (provider === "xbull") {
    wallet = (win.xBull ?? win.xbull ?? win.xBullSDK) as WalletApi | undefined;
  } else if (provider === "albedo") {
    wallet = win.albedo as WalletApi | undefined;
  }

  if (!wallet) {
    return null;
  }

  try {
    if (provider === "albedo") {
      const pubkey = await (win.albedo as AlbedoApi)?.publicKey?.({});
      return (pubkey?.pubkey as string) ?? null;
    }

    const connected = wallet.isConnected ? await wallet.isConnected() : true;
    if (!connected) {
      return null;
    }

    const publicKey = await wallet.getPublicKey?.();
    return publicKey ?? null;
  } catch {
    return null;
  }
}

export async function connectWallet(provider?: WalletProvider) {
  const providers: WalletProvider[] = provider ? [provider] : ["freighter", "xbull", "albedo"];

  for (const candidate of providers) {
    const publicKey = await tryProvider(candidate);
    if (publicKey) {
      return publicKey;
    }
  }

  return null;
}

/**
 * Ask the connected wallet to sign a transaction XDR. Returns the signed
 * XDR string. `provider` must match the wallet the user connected with.
 */
export async function signTransaction(
  provider: WalletProvider,
  xdr: string
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Wallet signing is only available in the browser.");
  }

  const win = window as WalletWindow;

  if (provider === "freighter") {
    const w = win.freighter;
    if (!w?.signTransaction) throw new Error("Freighter is not available.");
    return w.signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
  }

  if (provider === "xbull") {
    const x = win.xBull ?? win.xbull ?? win.xBullSDK;
    if (!x?.signTransaction) throw new Error("xBull is not available.");
    const res = await x.signTransaction(xdr);
    if (typeof res === "string") return res;
    const signed = res?.xdr ?? res?.signedXdr;
    if (!signed) throw new Error("xBull returned an unexpected response.");
    return signed;
  }

  if (provider === "albedo") {
    const a = win.albedo;
    if (!a?.tx) throw new Error("Albedo is not available.");
    const res = await a.tx({ xdr, network: "testnet" });
    return res.xdr;
  }

  throw new Error("Unknown wallet provider.");
}
