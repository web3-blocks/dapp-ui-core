import { useAccount } from "@/hooks/useAccount";
import { useConnect } from "@/hooks/useConnect";
import { useDisconnect } from "@/hooks/useDisconnect";
import { useNetwork } from "@/hooks/useNetwork";
import type { UseEthereumResult } from "@/core/types";

/**
 * Combined hook for Ethereum functionality
 * Provides access to account, connection, disconnection, and network functionality
 */
export function useEthereum(): UseEthereumResult {
  const account = useAccount();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const network = useNetwork();

  return {
    account,
    connect,
    disconnect,
    network,
  };
}
