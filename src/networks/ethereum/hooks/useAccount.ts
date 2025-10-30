import { useAccount as wagmiUseAccount } from "wagmi";
import type { AccountState } from "@/core/types";

export function useAccount(): AccountState {
  const account = wagmiUseAccount();
  return {
    address: account.address,
    isConnected: account.isConnected,
    isConnecting: account.isConnecting,
    isDisconnected: account.isDisconnected,
    status: account.status,
    connector: account.connector ?? null,
    chainId: account.chainId,
  };
}
