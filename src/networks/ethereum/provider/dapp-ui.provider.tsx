"use client";

import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { makeStore, AppStore } from "../store/store";
import { ViemChain } from "../types";
import { setSupportedChainsReducer } from "../store/slices/network.slice";
import {
  setAccount,
  setWalletAvailability,
} from "../store/slices/wallet.slice";
import { serializeChain } from "../utils/serializeChain";

interface Props {
  children: React.ReactNode;
  supportedChains: ViemChain[];
  autoConnect?: boolean;
}

/**
 * DappUiProvider: creates a fresh store per client session (useMemo)
 * - dispatches supportedChains into network slice
 * - sets initial wallet availability
 * - registers events on window.ethereum to keep redux updated
 */
export function DappUiProvider({
  children,
  supportedChains,
  autoConnect = false,
}: Props) {
  const store = React.useMemo<AppStore>(() => makeStore(), []);

  React.useEffect(() => {
    const serialized = (supportedChains ?? []).map(serializeChain);
    store.dispatch(setSupportedChainsReducer(serialized));

    const isAvailable =
      typeof window !== "undefined" && !!(window as any).ethereum;
    store.dispatch(setWalletAvailability(isAvailable));

    const ethereum = (window as any)?.ethereum;
    if (!ethereum) return;

    // auto-reconnect if user previously approved
    const restoreWallet = async () => {
      if (!autoConnect) return;
      try {
        const accounts: string[] = await ethereum.request({
          method: "eth_accounts",
        });

        if (accounts?.length) {
          const chainId = await ethereum.request({ method: "eth_chainId" });

          store.dispatch(
            setAccount({
              address: accounts[0],
              accounts,
              chainId,
            })
          );

          store.dispatch({ type: "network/setChainId", payload: chainId });
        }
      } catch (err) {
        console.warn("wallet auto-connect failed:", err);
      }
    };

    restoreWallet();

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts.length)
        return store.dispatch({ type: "wallet/disconnectWallet/fulfilled" });
      store.dispatch(
        setAccount({
          address: accounts[0],
          accounts,
          chainId: store.getState().wallet.account?.chainId,
        })
      );
    };

    const handleChainChanged = (chainIdHex: string) => {
      const prev = store.getState().wallet.account ?? {};
      store.dispatch(
        setAccount({
          ...prev,
          chainId: chainIdHex,
        } as any)
      );
      store.dispatch({ type: "network/setChainId", payload: chainIdHex });
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [store, supportedChains]);

  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}
