"use client";

import { Chain, http } from "viem";
import React, { useMemo, useState } from "react";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DAppUiContext } from "./context";
import { DAppUiProps, NETWORK_TYPES } from "@/constants";
import { validateChainConfig } from "@/networks/ethereum/utils/typeGuards";
import { createEthereumConfig } from "@/networks/ethereum/config/wallet.config";

export function DAppUiProvider<N extends NETWORK_TYPES>({
  children,
  network,
  contract,
}: DAppUiProps<N> & { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  if (network === "ethereum") {
    // Validate chains and create network implementation synchronously
    const { wagmiConfig } = useMemo(() => {
      try {
        // Validate chains synchronously; provider must supply at least one
        const validatedChains = validateChainConfig(contract.chains);
        const { config: wagmiConfig } = createEthereumConfig(
          validatedChains,
          contract.rpcUrl
        );

        return { wagmiConfig };
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.error("DappUiProvider configuration error:", err.message);

        // Return fallback values for error state
        return {
          wagmiConfig: createConfig({
            chains: [] as unknown as [Chain, ...Chain[]],
            transports: {},
          }),
        };
      }
    }, [network]);

    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DAppUiContext.Provider value={{ network, contract }}>
            {children}
          </DAppUiContext.Provider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  return (
    <DAppUiContext.Provider value={{ network, contract }}>
      {children}
    </DAppUiContext.Provider>
  );
}
