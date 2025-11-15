import { createConfig, http } from "wagmi";
import type { Config } from "wagmi";
import { Chain } from "wagmi/chains";
import * as wagmiConnector from "wagmi/connectors";

export function createEthereumConfig(
  chains?: Array<Chain>,
  rpcUrl?: string
): { config: Config } {
  if (!chains || chains.length === 0) {
    throw new Error("No chains provided. Configure at least one chain.");
  }
  const configChains = chains;

  // Build transports map per chain.
  // If only one chain is configured and an rpcUrl is provided, use it for that chain.
  // Otherwise, use default http() for each chain to respect per-chain RPCs.
  const firstChainId = configChains[0]?.id;
  const transports = Object.fromEntries(
    configChains.map((c) => {
      if (rpcUrl && c.id === firstChainId) {
        return [c.id, http(rpcUrl)];
      }
      return [c.id, http()];
    })
  );

  const config = createConfig({
    chains: configChains as unknown as readonly [Chain, ...Chain[]],
    connectors: [wagmiConnector.injected(), wagmiConnector.metaMask()],
    transports,
  });

  return { config };
}

export {};
