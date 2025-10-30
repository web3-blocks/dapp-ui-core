export { DappUiProvider } from "@/core/provider";
export { useAccount } from "@/hooks/useAccount";
export { useConnect } from "@/hooks/useConnect";
export { useDisconnect } from "@/hooks/useDisconnect";
export { useNetwork } from "@/hooks/useNetwork";
export { useContract } from "@/hooks/useContract";
export { useEthereum } from "@/hooks/useEthereum";
// Network IDs
export type { NetworkId } from "@/core/networkIds";
export { NETWORK_IDS } from "@/core/networkIds";
// Chain validation utilities
export {
  isChainSupported,
  getSupportedChainById,
  getUnsupportedChainMessage,
  getCurrentChainInfo,
  verifyChainMatch,
  normalizeChainId,
} from "@/utils/typeGuards";
// Types
export type {
  AccountState,
  ConnectState,
  DisconnectState,
  NetworkState,
  UseEthereumResult,
  Address,
} from "@/core/types";
