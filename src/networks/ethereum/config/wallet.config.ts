import { createConfig, http } from "wagmi";
import { Chain, mainnet } from "wagmi/chains";
import * as wagmiConnector from "wagmi/connectors";

const defaultChains = [mainnet];

export function createEthereumConfig(chains?: Array<Chain>, rpcUrl?: string) {
  const configChains = chains && chains.length > 0 ? chains : defaultChains;

  // Build transports map per chain.
  // If only one chain is configured and an rpcUrl is provided, use it for that chain.
  // Otherwise, use default http() for each chain to respect per-chain RPCs.
  const transports = Object.fromEntries(
    configChains.map((c) => {
      if (rpcUrl && configChains.length === 1) {
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

// For backward compatibility
export const wagmiConfig = createEthereumConfig().config;
