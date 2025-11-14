import { useConnect as wagmiUseConnect } from "wagmi";
import { useState, useMemo } from "react";

import { ConnectState } from "../types";
import { reportError } from "@/networks/ethereum/utils/typeGuards";

export type EnhancedConnectState = ConnectState & {
  errorMessage?: string;
  statusMessage?: string;
  connectSafe: ConnectState["connect"];
};

export function useConnect(): EnhancedConnectState {
  const result = wagmiUseConnect();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  const connectSafe = useMemo(() => {
    return async (args: Parameters<typeof result.connect>[0]) => {
      setErrorMessage(undefined);
      setStatusMessage("Connecting to wallet...");
      try {
        await result.connect(args);
        setStatusMessage("Wallet connected.");
      } catch (e) {
        // Log error but keep UI responsive; do not block future connections
        reportError(e);
        setErrorMessage(
          e instanceof Error
            ? e.message
            : "Wallet connection encountered an error. Please try again."
        );
        setStatusMessage(undefined);
      }
    };
  }, [result]);

  return { ...result, errorMessage, statusMessage, connectSafe };
}
