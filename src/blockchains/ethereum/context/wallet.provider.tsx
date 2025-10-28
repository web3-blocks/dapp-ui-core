"use client";

import React from "react";
import { Chain } from "viem/chains";
import { DappUiContextValue, DappUiWalletAccount } from "../types";
import { errorHandler } from "../utils";

export const DappUiContext = React.createContext<DappUiContextValue | null>(
  null
);

export const DappUiProvider: React.FC<{
  children: React.ReactNode;
  supportedChains: Chain[];
}> = ({ children, supportedChains }) => {
  const ethereumObj =
    typeof window !== "undefined" ? (window as any).ethereum : null;

  const [account, setAccount] = React.useState<DappUiWalletAccount | null>(
    null
  );
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = React.useState(false);
  const [isEthObjAvailable, setIsEthObjAvailable] = React.useState<boolean>(
    !!ethereumObj
  );

  // init listeners
  React.useEffect(() => {
    if (!ethereumObj) return;

    setAccount((prev) => ({
      ...(prev ?? {}),
      status: "connecting",
    }));

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount((prev) => ({
        ...(prev ?? {}),
        accounts,
        status: accounts.length ? "connected" : "disconnected",
        address: accounts[0] ?? null,
      }));
    };

    const handleChainChanged = (chainId: string) => {
      setAccount((prev) => ({
        ...(prev ?? {}),
        chainId,
        status: "connected",
        isSupportedChain: supportedChains.some((c) => c.id === Number(chainId)),
      }));
    };

    const setupEthereum = async () => {
      setAccount((prev) => ({
        ...(prev ?? {}),
        status: "connecting",
      }));
      try {
        const accounts = (await ethereumObj.request({
          method: "eth_accounts",
        })) as string[];
        setAccount((prev) => ({
          ...(prev ?? {}),
          accounts,
          address: accounts[0] ?? null,
          status: accounts.length ? "connected" : "disconnected",
        }));

        const chainId = (await ethereumObj.request({
          method: "eth_chainId",
        })) as string;
        setAccount((prev) => ({
          ...(prev ?? {}),
          chainId,
          isSupportedChain: supportedChains.some(
            (c) => c.id === Number(chainId)
          ),
          status: accounts.length ? "connected" : "disconnected",
        }));
      } catch (error: any) {
        console.error(error);
        setAccount((prev) => ({
          ...(prev ?? {}),
          status: "error",
        }));
      }

      // Set up listeners AFTER initial data fetching
      ethereumObj.on("accountsChanged", handleAccountsChanged);
      ethereumObj.on("chainChanged", handleChainChanged);
    };

    setupEthereum();

    return () => {
      ethereumObj.removeListener("accountsChanged", handleAccountsChanged);
      ethereumObj.removeListener("chainChanged", handleChainChanged);
    };
  }, [ethereumObj, supportedChains]);

  // Connect wallet
  const handleConnect = React.useCallback(async () => {
    if (!ethereumObj) return;

    setIsConnecting(true);
    try {
      const accounts = (await ethereumObj.request({
        method: "eth_requestAccounts",
      })) as string[];
      const chainId = (await ethereumObj.request({
        method: "eth_chainId",
      })) as string;

      setAccount({
        address: accounts[0] ?? null,
        accounts,
        chainId,
        isSupportedChain: supportedChains.some((c) => c.id === Number(chainId)),
        status: accounts.length ? "connected" : "disconnected",
      });
    } catch (err) {
      errorHandler(err, "Connect failed");
    } finally {
      setIsConnecting(false);
    }
  }, [ethereumObj, supportedChains]);

  // Disconnect wallet
  const handleDisconnect = React.useCallback(async () => {
    if (!ethereumObj) return;

    setIsDisconnecting(true);
    try {
      // Revoking permissions; some wallets may not support this
      try {
        await ethereumObj.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch {
        // Ignores errors if wallet doesn't support revokePermissions
      }

      setAccount({
        status: "disconnected",
        accounts: [],
        address: null,
        chainId: null,
        isSupportedChain: true,
      });
    } catch (err) {
      errorHandler(err, "Disconnect failed");
    } finally {
      setIsDisconnecting(false);
    }
  }, [ethereumObj]);

  // Switch network
  const switchNetwork = React.useCallback(
    async (chainId: number) => {
      if (!ethereumObj) return;
      setIsSwitchingNetwork(true);

      const hexChainId = "0x" + chainId.toString(16);
      try {
        await ethereumObj.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId }],
        });
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code: number }).code === 4902
        ) {
          // Network not added; try to add it
          const chain = supportedChains.find((c) => c.id === chainId);
          if (!chain) return;
          try {
            await ethereumObj.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: hexChainId,
                  chainName: chain.name,
                  rpcUrls: chain.rpcUrls.default.http,
                  nativeCurrency: chain.nativeCurrency,
                  blockExplorerUrls: chain.blockExplorers
                    ? [chain.blockExplorers.default.url]
                    : [],
                },
              ],
            });
            await ethereumObj.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: hexChainId }],
            });
          } catch (addErr) {
            errorHandler(addErr, "Add network failed");
          }
        } else {
          errorHandler(error, "Switch network failed");
        }
      } finally {
        setIsSwitchingNetwork(false);
      }
    },
    [ethereumObj, supportedChains]
  );

  const value: DappUiContextValue = React.useMemo(
    () => ({
      account,
      supportedChains,
      isEthObjAvailable,
      isConnecting,
      isDisconnecting,
      isSwitchingNetwork,
      handleConnect,
      handleDisconnect,
      switchNetwork,
    }),
    [
      account,
      supportedChains,
      isEthObjAvailable,
      isConnecting,
      isDisconnecting,
      isSwitchingNetwork,
      handleConnect,
      handleDisconnect,
      switchNetwork,
    ]
  );

  return (
    <DappUiContext.Provider value={value}>{children}</DappUiContext.Provider>
  );
};
