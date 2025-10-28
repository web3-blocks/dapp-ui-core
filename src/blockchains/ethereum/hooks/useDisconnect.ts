import { useContext } from "react";
import { DappUiContext } from "../context/wallet.provider";

export function useDisconnect() {
  const ctx = useContext(DappUiContext);
  if (!ctx) throw new Error("useDisconnect must be inside DappUiProvider");

  return {
    disconnect: ctx.handleDisconnect,
    isDisconnecting: ctx.isDisconnecting,
  };
}
