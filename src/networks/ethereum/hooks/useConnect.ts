import { Connector, useConnect as wagmiUseConnect } from "wagmi";
import type { ConnectState } from "@/core/types";

export function useConnect(): ConnectState {
  const { connect, connectors, error, isPending } = wagmiUseConnect();

  async function fn(connector = connectors[0]) {
    await connect({ connector });
  }

  const isWalletAvailable =
    typeof window !== "undefined" && !!(window as any).ethereum;

  return {
    fn,
    connectors: connectors as Connector[],
    error: error ?? null,
    loading: isPending,
    isWalletAvailable,
  };
}
