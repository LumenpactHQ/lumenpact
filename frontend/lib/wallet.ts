export async function connectWallet() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!(window as Window & { freighter?: { isConnected?: () => Promise<boolean>; getPublicKey?: () => Promise<string> } }).freighter) {
    return null;
  }

  try {
    const freighter = (window as Window & { freighter?: { isConnected?: () => Promise<boolean>; getPublicKey?: () => Promise<string> } }).freighter;
    if (!freighter) {
      return null;
    }

    const connected = (await freighter.isConnected?.()) ?? false;
    if (!connected) {
      return null;
    }

    const publicKey = await freighter.getPublicKey?.();
    return publicKey ?? null;
  } catch {
    return null;
  }
}
