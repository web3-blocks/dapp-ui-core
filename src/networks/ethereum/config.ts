import { mainnet } from "viem/chains";
import { injected } from "@wagmi/connectors";
import { createConfig, http } from "@wagmi/core";
import { createPublicClient, createWalletClient, custom } from "viem";
import type { Chain } from "viem/chains";

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Default to mainnet if no chains are provided
const defaultChains = [mainnet];

export const createEthereumConfig = (chains?: Chain[]) => {
  const configChains = chains && chains.length > 0 ? chains : defaultChains;
  const primaryChain = configChains[0];

  // Create transports object dynamically based on provided chains
  const transports: Record<number, ReturnType<typeof http>> = {};
  configChains.forEach((chain) => {
    transports[chain.id] = http();
  });

  const config = createConfig({
    chains: configChains as unknown as readonly [Chain, ...Chain[]],
    connectors: [injected()],
    transports,
  });

  const publicClient = createPublicClient({
    chain: primaryChain,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: primaryChain,
    transport:
      typeof window !== "undefined" && window.ethereum
        ? custom(window.ethereum)
        : http(),
  });

  return { config, publicClient, walletClient };
};

// For backward compatibility
export const wagmiConfig = createEthereumConfig().config;
export const publicClient = createEthereumConfig().publicClient;
export const walletClient = createEthereumConfig().walletClient;
