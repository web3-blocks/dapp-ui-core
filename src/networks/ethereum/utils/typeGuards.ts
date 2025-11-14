import { Chain } from "viem";
import { ethers } from "ethers";

/**
 * Type guard to check if the provided value is a valid Chain array
 * @param chains - The value to check
 * @returns True if the value is a valid Chain array
 */
export function isValidChainArray(chains: unknown): chains is Chain[] {
  if (!Array.isArray(chains)) return false;
  if (chains.length === 0) return true;

  return chains.every(
    (chain) =>
      typeof chain === "object" &&
      chain !== null &&
      "id" in chain &&
      typeof chain.id === "number" &&
      "name" in chain &&
      typeof chain.name === "string"
  );
}

/**
 * Validates chain configuration and throws descriptive errors if invalid
 * @param chains - The chain configuration to validate
 */
export function validateChainConfig(chains: unknown): Chain[] {
  if (!chains) {
    console.warn(
      "[DappUi] No chains provided to DappUiProvider. You must supply at least one Chain (e.g., viem's mainnet)."
    );
    throw new Error(
      "DappUiProvider requires at least one Chain in the 'chains' prop."
    );
  }

  if (!isValidChainArray(chains)) {
    throw new Error(
      "Invalid chain configuration. Chains must be an array of valid Chain objects from viem/chains."
    );
  }

  if ((chains as Chain[]).length === 0) {
    console.warn(
      "[DappUi] Empty chains array provided. Please provide at least one Chain (e.g., mainnet)."
    );
    throw new Error(
      "DappUiProvider requires at least one Chain; an empty array is not allowed."
    );
  }

  return chains as Chain[];
}

export const ethereumProvider =
  typeof window !== "undefined" ? window.ethereum : null;

export function isRateLimitError(e: unknown): boolean {
  if (typeof e !== "object" || e === null) return false;
  const err = e as any;
  if (err.code === -32002) return true;
  if (typeof err.message === "string" && err.message.includes("too many")) {
    return true;
  }
  return false;
}

export function reportError(e: unknown) {
  if (isRateLimitError(e)) {
    console.error("RPC endpoint rate limited. Provide a different RPC URL.");
    return;
  }
  console.error(e);
}

export async function ensureEthereumAvailable(): Promise<void> {
  if (!ethereumProvider) {
    throw new Error(
      "No Ethereum provider found. Please install an EVM wallet (e.g., MetaMask)."
    );
  }

  if (typeof ethereumProvider.request !== "function") {
    throw new Error(
      "Ethereum provider does not support 'request' method. Ensure MetaMask is up to date."
    );
  }
}

export async function getSigner(rpcUrl?: string): Promise<ethers.Signer> {
  await ensureEthereumAvailable();

  try {
    const accounts: string[] = await ethereumProvider.request({
      method: "eth_accounts",
    });

    if (accounts && accounts.length > 0) {
      const provider = new ethers.BrowserProvider(ethereumProvider);
      return provider.getSigner();
    }

    const fallbackProvider = getRpcProvider(rpcUrl);
    const randomWallet = ethers.Wallet.createRandom();
    return randomWallet.connect(fallbackProvider);
  } catch (e) {
    if (isRateLimitError(e)) {
      console.error("Your RPC endpoint is rate limited.");
      throw new Error("RPC endpoint rate limited. Use a different RPC URL.");
    }

    console.error("Error getting signer:", e);
    throw new Error("Failed to retrieve a signer.");
  }
}

export function getRpcProvider(rpcUrl?: string): ethers.JsonRpcProvider {
  try {
    if (rpcUrl && typeof rpcUrl === "string" && rpcUrl.length > 0) {
      return new ethers.JsonRpcProvider(rpcUrl);
    }
    return new ethers.JsonRpcProvider();
  } catch (e) {
    if (isRateLimitError(e)) {
      throw new Error("RPC endpoint rate limited. Provide a healthy RPC URL.");
    }
    throw e;
  }
}
