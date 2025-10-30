import * as hooks from "./hooks";
import { createEthereumConfig } from "./config";
import type { Chain } from "viem/chains";

// Create a function to initialize the Ethereum network with custom chains
export const createEthereumNetwork = (chains?: Chain[]) => {
  const { config, publicClient, walletClient } = createEthereumConfig(chains);

  // Return the network implementation with the configured clients
  return {
    ...hooks,
    config,
    publicClient,
    walletClient,
  };
};

// Default export for backward compatibility
export default {
  ...hooks,
};
