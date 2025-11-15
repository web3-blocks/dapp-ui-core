import { Chain } from "viem";
import { ethers } from "ethers";
import type { ContractConfig } from "../config/contract.config";

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

/**
 * Returns the current chainId from the wallet/provider.
 */
export async function getCurrentChainId(): Promise<number | null> {
  try {
    await ensureEthereumAvailable();
    const hex = await ethereumProvider!.request({ method: "eth_chainId" });
    // MetaMask returns hex string like "0x1"
    const id = typeof hex === "string" ? parseInt(hex, 16) : Number(hex);
    return Number.isFinite(id) ? id : null;
  } catch (e) {
    reportError(e);
    return null;
  }
}

export type ChainValidationResult = {
  ok: boolean;
  error?: string;
  expectedChainId?: number;
  currentChainId?: number | null;
};

/**
 * Validate if current wallet chain matches the default chain.
 * Also ensures current chain is one of the supported chains.
 */
export async function validateActiveChain(
  config: ContractConfig
): Promise<ChainValidationResult> {
  const currentChainId = await getCurrentChainId();
  const expectedChainId = config.defaultChain.id;

  if (currentChainId == null) {
    return {
      ok: false,
      expectedChainId,
      currentChainId,
      error:
        "Unable to determine current network. Ensure your wallet is connected.",
    };
  }

  const supportedIds = (config.chains || []).map((c) => c.id);
  if (!supportedIds.includes(currentChainId)) {
    return {
      ok: false,
      expectedChainId,
      currentChainId,
      error:
        "You are connected to an unsupported network. Switch to a supported chain.",
    };
  }

  if (currentChainId !== expectedChainId) {
    return {
      ok: false,
      expectedChainId,
      currentChainId,
      error: "Connected network does not match the app’s default network.",
    };
  }

  return { ok: true, expectedChainId, currentChainId };
}

/**
 * Attempt to switch the wallet to the provided chain.
 * Falls back to adding the chain if it’s not known.
 */
export async function switchToChain(
  chain: Chain,
  rpcUrl?: string
): Promise<void> {
  await ensureEthereumAvailable();
  const params = { chainId: `0x${chain.id.toString(16)}` };
  try {
    await ethereumProvider!.request({
      method: "wallet_switchEthereumChain",
      params: [params],
    });
  } catch (e: any) {
    // 4902: Unrecognized chain
    if (e && (e.code === 4902 || `${e?.message}`.includes("Unrecognized"))) {
      try {
        await ethereumProvider!.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: params.chainId,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: chain.rpcUrls?.default?.http?.length
                ? chain.rpcUrls.default.http
                : rpcUrl
                ? [rpcUrl]
                : [],
              blockExplorerUrls: chain.blockExplorers?.default?.url
                ? [chain.blockExplorers.default.url]
                : [],
            },
          ],
        });
        await ethereumProvider!.request({
          method: "wallet_switchEthereumChain",
          params: [params],
        });
      } catch (addErr) {
        reportError(addErr);
        throw new Error(
          "Failed to add and switch to the required network in your wallet."
        );
      }
    } else {
      reportError(e);
      throw new Error(
        "Network switch was rejected or failed. Please approve the request in your wallet."
      );
    }
  }
}
