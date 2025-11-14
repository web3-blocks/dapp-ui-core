import { useCallback, useEffect, useMemo, useState } from "react";
import { useChainId } from "wagmi";
import type { Chain } from "wagmi/chains";

import { useDAppContext } from "@/provider/context";
import {
  ChainValidationResult,
  reportError,
  switchToChain,
  validateActiveChain,
} from "@/networks/ethereum/utils/typeGuards";

export type SwitchNetworkState = {
  isCorrectChain: boolean;
  currentChainId: number | null;
  targetChainId: number;
  isSwitching: boolean;
  error?: string;
  message?: string;
  switchToDefault: () => Promise<void>;
  validate: () => Promise<ChainValidationResult>;
};

export function useSwitchNetwork(): SwitchNetworkState {
  const chainId = useChainId();
  const { contract } = useDAppContext();

  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();

  const targetChainId = useMemo(() => contract.defaultChain.id, [contract]);

  const validate = useCallback(async (): Promise<ChainValidationResult> => {
    const result = await validateActiveChain(contract);
    setError(result.ok ? undefined : result.error);
    return result;
  }, [contract]);

  const switchToDefault = useCallback(async () => {
    setError(undefined);
    setMessage("Switching network to the app’s default chain...");
    setIsSwitching(true);
    try {
      await switchToChain(contract.defaultChain as Chain, contract.rpcUrl);
      setMessage("Network switched successfully.");
    } catch (e) {
      reportError(e);
      setError(
        e instanceof Error
          ? e.message
          : "Network switching failed. Please try again."
      );
    } finally {
      setIsSwitching(false);
    }
  }, [contract]);

  useEffect(() => {
    // Update validation when chainId changes
    (async () => {
      const result = await validate();
      if (!result.ok && result.currentChainId !== null) {
        setMessage(
          "Connected to the wrong network. Switch to the default chain."
        );
      } else {
        setMessage(undefined);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  const isCorrectChain = Number(chainId) === Number(targetChainId);

  return {
    isCorrectChain,
    currentChainId: chainId ?? null,
    targetChainId,
    isSwitching,
    error,
    message,
    switchToDefault,
    validate,
  };
}
