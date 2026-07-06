export type WalletProvider = "freighter" | "xbull" | "albedo";

type WalletApi = {
  isConnected?: () => Promise<boolean>;
  getPublicKey?: () => Promise<string>;
  publicKey?: () => Promise<string>;
};

async function tryProvider(provider: WalletProvider): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const win = window as Window & {
    freighter?: WalletApi;
    xBull?: WalletApi;
    xbull?: WalletApi;
    albedo?: WalletApi;
  };

  let wallet: WalletApi | undefined;

  if (provider === "freighter") {
    wallet = win.freighter;
  } else if (provider === "xbull") {
    wallet = win.xBull ?? win.xbull;
  } else if (provider === "albedo") {
    wallet = win.albedo;
  }

  if (!wallet) {
    return null;
  }

  try {
    if (provider === "albedo") {
      const publicKey = await wallet.publicKey?.();
      return publicKey ?? null;
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
