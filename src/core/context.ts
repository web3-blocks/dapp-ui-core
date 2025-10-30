import * as React from "react";
import type { ContractData, NetworkImpl } from "@/core/types";
import type { Chain } from "viem/chains";

interface DappContextState {
  network: string;
  networkImpl?: NetworkImpl;
  contract: ContractData;
  chains?: Chain[];
}

export const DappContext = React.createContext<DappContextState | null>(null);

export function useDappContext() {
  const ctx = React.useContext(DappContext);
  if (!ctx)
    throw new Error("useDappContext must be used within DappUiProvider");
  return ctx;
}
