import type { Chain as ViemChain } from "viem/chains";

/**
 * Minimal serializable shape we keep in Redux.
 * Keep only plain values (no functions).
 */
export type SerializedChain = {
  id: number;
  name: string;
  rpcUrls: {
    default: { http: string[] };
  };
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  } | null;
  blockExplorers?: {
    default?: { name?: string; url?: string } | null;
  } | null;
};

/** Convert a viem Chain to the minimal serializable shape. */
export function serializeChain(chain: ViemChain): SerializedChain {
  return {
    id: chain.id,
    name: chain.name ?? String(chain.id),
    rpcUrls: {
      default: {
        // some viem chains use strings or arrays — normalize to string[]
        http:
          // try common paths safely
          (chain.rpcUrls?.default?.http as unknown as string[]) ??
          (Array.isArray(chain.rpcUrls)
            ? (chain.rpcUrls as unknown as string[])
            : []) ??
          [],
      },
    },
    nativeCurrency:
      chain.nativeCurrency != null
        ? {
            name: chain.nativeCurrency.name,
            symbol: chain.nativeCurrency.symbol,
            decimals: chain.nativeCurrency.decimals,
          }
        : null,
    blockExplorers: chain.blockExplorers
      ? {
          default: chain.blockExplorers.default
            ? {
                name: chain.blockExplorers.default.name,
                url: chain.blockExplorers.default.url,
              }
            : null,
        }
      : null,
  };
}
