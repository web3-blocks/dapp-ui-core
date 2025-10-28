import { useContext } from "react";
import { DappUiContext } from "../context/wallet.provider";

export function useSwitchNetwork() {
  const ctx = useContext(DappUiContext);
  if (!ctx) throw new Error("useSwitchNetwork must be inside DappUiProvider");

  return {
    switchNetwork: ctx.switchNetwork,
    isSwitchingNetwork: ctx.isSwitchingNetwork,
    chains: ctx.supportedChains,
  };
}
