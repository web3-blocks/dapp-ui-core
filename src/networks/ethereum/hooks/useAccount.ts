import { useAccount as wagmiUseAccount } from "wagmi";
import { useMemo } from "react";
import { AccountState } from "../types";

export type EnhancedAccountState = AccountState & {
  statusMessage?: string;
};

export function useAccount(): EnhancedAccountState {
  const result = wagmiUseAccount();

  const statusMessage = useMemo(() => {
    if (result.isConnecting) return "Connecting to wallet...";
    if (result.isDisconnected) return "Wallet not connected.";
    if (result.isConnected) return "Wallet connected.";
    return undefined;
  }, [result.isConnecting, result.isDisconnected, result.isConnected]);

  return { ...result, statusMessage };
}
