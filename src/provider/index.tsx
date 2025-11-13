"use client";

import React from "react";
import { DAppUiContext } from "./context";
import { DAppUiProps, NETWORK_TYPES } from "@/constants";

export function DAppUiProvider<N extends NETWORK_TYPES>({
  children,
  network,
  contract,
}: DAppUiProps<N> & { children: React.ReactNode }) {
  return (
    <DAppUiContext.Provider value={{ network, contract }}>
      {children}
    </DAppUiContext.Provider>
  );
}

const Game = () => {
  return (
    <DAppUiProvider
      network="ethereum"
      contract={{
        address: "0x12345678901234567890123456789012",
        abi: [],
      }}
    >
      <p>Hi</p>
    </DAppUiProvider>
  );
};
