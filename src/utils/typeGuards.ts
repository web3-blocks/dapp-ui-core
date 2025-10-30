import type { Chain } from "viem/chains";

// Minimal EIP-1193 provider shape for type guard
export interface Eip1193Provider {
  request: (args: {
    method: string;
    params?: unknown[] | object;
  }) => Promise<unknown>;
}

export function hasEthereumProvider(value: unknown): value is Eip1193Provider {
  return (
    typeof value === "object" &&
    value !== null &&
    "request" in (value as Record<string, unknown>) &&
    typeof (value as { request?: unknown }).request === "function"
  );
}

export function getWalletAvailability(): boolean {
  if (typeof window === "undefined") return false;
  const eth = (window as any).ethereum;
  return hasEthereumProvider(eth);
}

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

// Chain validation utilities
export function isChainSupported(
  chainId: number,
  supportedChains: Chain[]
): boolean {
  return supportedChains.some((chain) => chain.id === chainId);
}

/**
 * Normalize a chain id that may be a number or string (hex or decimal) into a number.
 * Returns null when the value is undefined, null, or not parsable.
 */
export function normalizeChainId(chainId: unknown): number | null {
  if (typeof chainId === "number")
    return Number.isFinite(chainId) ? chainId : null;
  if (typeof chainId === "string") {
    const trimmed = chainId.trim();
    if (trimmed.length === 0) return null;
    // Hex string like 0x2105
    if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
      const parsed = parseInt(trimmed, 16);
      return Number.isFinite(parsed) ? parsed : null;
    }
    // Decimal string
    const parsedDec = parseInt(trimmed, 10);
    return Number.isFinite(parsedDec) ? parsedDec : null;
  }
  return null;
}

/**
 * Verifies that the current wallet chain matches one of the provider-supported chains.
 * - Returns true only if a normalized chain id equals one of providerChains ids.
 * - Returns false for undefined/invalid inputs and logs useful warnings.
 * - O(n) complexity over providerChains.
 */
export function verifyChainMatch(
  currentChain: unknown,
  providerChains: Chain[]
): boolean {
  const normalized = normalizeChainId(currentChain);
  if (normalized === null) {
    console.warn(
      "[DappUi] Chain verification: currentChain is undefined/invalid. Returning false."
    );
    return false;
  }

  if (!Array.isArray(providerChains) || providerChains.length === 0) {
    console.warn(
      "[DappUi] Chain verification: providerChains is empty or invalid. Returning false."
    );
    return false;
  }

  return providerChains.some(
    (c) => c && typeof c.id === "number" && c.id === normalized
  );
}

export function getSupportedChainById(
  chainId: number,
  supportedChains: Chain[]
): Chain | undefined {
  return supportedChains.find((chain) => chain.id === chainId);
}

export function getUnsupportedChainMessage(
  chainId: number,
  supportedChains: Chain[]
): string {
  const supportedNames = supportedChains.map((chain) => chain.name).join(", ");
  return `Chain ID ${chainId} is not supported. Supported chains: ${supportedNames}`;
}

export function getCurrentChainInfo(
  chainId: number,
  supportedChains: Chain[]
): {
  isSupported: boolean;
  chain?: Chain;
  message?: string;
} {
  const chain = getSupportedChainById(chainId, supportedChains);
  const isSupported = !!chain;

  return {
    isSupported,
    chain,
    message: isSupported
      ? undefined
      : getUnsupportedChainMessage(chainId, supportedChains),
  };
}
