"use client";

import { useEffect, useState } from "react";
import type { Chain } from "viem/chains";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DappContext } from "@/core/context";
import { networkRegistry } from "@/core/registry";
import { validateChainConfig } from "@/utils/typeGuards";
import type { DappUiProviderProps, NetworkImpl } from "@/core/types";

// Create a client
const queryClient = new QueryClient();

export function DappUiProvider({
  network,
  chains = [],
  contract,
  children,
}: DappUiProviderProps) {
  const [networkImpl, setNetworkImpl] = useState<NetworkImpl | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Validate chains synchronously; provider must supply at least one
  let validatedChains: Chain[] = [];
  try {
    validatedChains = validateChainConfig(chains);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("DappUiProvider chain configuration error:", err.message);
    setError(err);
  }

  const wagmiConfig = createConfig({
    chains: validatedChains as [Chain, ...Chain[]],
    transports: Object.fromEntries(
      validatedChains.map((chain) => [chain.id, http()])
    ),
  });

  useEffect(() => {
    async function loadNetwork() {
      try {
        // Chains already validated; revalidate in case of prop changes
        const validatedChains = validateChainConfig(chains);

        // Get the network loader from registry
        const loader = (
          networkRegistry as Record<
            string,
            () => Promise<{
              default: NetworkImpl;
              createEthereumNetwork?: (chains?: Chain[]) => NetworkImpl;
            }>
          >
        )[network];

        if (!loader) throw new Error(`Unsupported network: ${network}`);

        const mod = await loader();

        // If the network supports custom chain configuration, use it
        if (
          network === "ethereum" &&
          mod.createEthereumNetwork &&
          validatedChains.length > 0
        ) {
          setNetworkImpl(mod.createEthereumNetwork(validatedChains));
        } else {
          // Fallback to default implementation
          setNetworkImpl(mod.default);
        }

        // Clear any previous errors
        setError(null);
      } catch (error) {
        console.error(`Failed to load network ${network}:`, error);
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    }

    loadNetwork();
  }, [network, chains]);

  // Show error state if there's an error
  if (error) {
    console.error("DappUiProvider Error:", error);
    return <div>Error loading network: {error.message}</div>;
  }

  // Show loading state while network implementation is loading
  if (!networkImpl) return <div>Loading network...</div>;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <DappContext.Provider
          value={{ network, networkImpl, contract, chains }}
        >
          {children}
        </DappContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
