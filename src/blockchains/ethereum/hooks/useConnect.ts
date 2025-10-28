import { useContext } from "react";
import { DappUiContext } from "../context/wallet.provider";

export function useConnect() {
  const ctx = useContext(DappUiContext);
  if (!ctx) throw new Error("useConnect must be inside DappUiProvider");

  return {
    connect: ctx.handleConnect,
    isConnecting: ctx.isConnecting,
    isWalletAvailable: ctx.isEthObjAvailable,
  };
}
