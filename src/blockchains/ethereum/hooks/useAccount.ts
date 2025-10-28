import { useContext } from "react";
import { DappUiContext } from "../context/wallet.provider";

export function useAccount() {
  const ctx = useContext(DappUiContext);
  if (!ctx) throw new Error("useAccount must be inside DappUiProvider");

  return {
    account: ctx.account,
    isConnected: !!ctx.account?.address,
    isSupportedChain: ctx.account?.isSupportedChain ?? false,
  };
}
