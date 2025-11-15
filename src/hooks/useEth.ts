import { injected, useChainId } from "wagmi";
import { useEffect, useState } from "react";
import * as wallet from "@/networks/ethereum/hooks";

/**
 * Combined hook for Ethereum functionality
 * Provides access to account, connection, disconnection, and network functionality
 */
export function useEth() {
  const contract = wallet.useContract();
  const connect = wallet.useConnect();
  const disconnect = wallet.useDisconnect();
  const account = wallet.useAccount();
  const switchChain = wallet.useSwitchChain();
  const chainId = useChainId();

  const [isWalletAvailable, setIsWalletAvailable] = useState(false);

  useEffect(() => {
    setIsWalletAvailable(!!(window as any).ethereum);
  }, []);

  return {
    contract,
    connect,
    disconnect,
    account,
    switchChain,
    chainId,
    isWalletAvailable,
    injected: injected(),
  };
}
