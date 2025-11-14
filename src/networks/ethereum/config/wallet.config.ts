import { createClient } from "viem";
import { createConfig, http } from "wagmi";
import { Chain, mainnet } from "wagmi/chains";
import * as wagmiConnector from "wagmi/connectors";

const defaultChains = [mainnet];

export function createEthereumConfig(chains?: Array<Chain>, rpcUrl?: string) {
  const configChains = chains && chains.length > 0 ? chains : defaultChains;

  const config = createConfig({
    chains: configChains as unknown as readonly [Chain, ...Chain[]],
    connectors: [wagmiConnector.injected(), wagmiConnector.metaMask()],
    client({ chain }) {
      return createClient({
        chain,
        transport: rpcUrl ? http(rpcUrl) : http(),
      });
    },
  });

  return { config };
}

// For backward compatibility
export const wagmiConfig = createEthereumConfig().config;
