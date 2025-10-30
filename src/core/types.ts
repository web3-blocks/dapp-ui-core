import * as React from "react";
import type { Abi } from "viem";
import type { Chain } from "viem/chains";
import type { NetworkId } from "@/core/networkIds";
import type { Connector } from "wagmi";

export type Address = `0x${string}`;

export interface ContractData {
  address: `0x${string}`;
  abi: Abi;
}

// Account state returned by useAccount
export interface AccountState {
  address?: Address;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  status: "connecting" | "reconnecting" | "connected" | "disconnected";
  connector?: Connector | null;
  chainId?: number;
}

// Connect state and actions returned by useConnect
export interface ConnectState {
  fn: (connector?: Connector) => Promise<void>;
  connectors: Connector[];
  error?: Error | null;
  loading: boolean;
  pendingConnector?: Connector | null;
  isWalletAvailable: boolean;
}

// Disconnect state and actions returned by useDisconnect
export interface DisconnectState {
  fn: () => Promise<void>;
  loading: boolean;
}

// Network state returned by useNetwork
export interface NetworkState {
  chainId: number;
  chains: Chain[];
  isSupportedChain: boolean;
  switch: (chainId: number) => void | Promise<void>;
  loading: boolean;
  // Additional chain utilities
  getCurrentChain: () => Chain | undefined;
  getUnsupportedMessage: () => string | undefined;
  getSupportedChainNames: () => string[];
  error?: Error | null;
}

// Combined hook result for Ethereum
export interface UseEthereumResult {
  account: AccountState;
  connect: ConnectState;
  disconnect: DisconnectState;
  network: NetworkState;
}

export interface NetworkImpl {
  useAccount: () => AccountState;
  useConnect: () => ConnectState;
  useDisconnect: () => DisconnectState;
  useNetwork: () => NetworkState;
  useContract: () => any;
}

export interface DappUiProviderProps {
  network: NetworkId;
  chains?: Chain[];
  contract: ContractData;
  children: React.ReactNode;
}
