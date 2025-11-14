import { useMemo } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import type { Chain } from "wagmi/chains";
import { useDAppContext } from "@/provider/context";

export type SwitchChainHook = ReturnType<typeof useSwitchChain> & {
  currentChainId: number | null;
  targetChainId: number;
  isCorrectChain: boolean;
};

export function useSwitchChainHook(): SwitchChainHook {
  const chainId = useChainId();
  const { contract } = useDAppContext();
  const targetChainId = useMemo(() => contract.defaultChain.id, [contract]);
  const result = useSwitchChain();

  const isCorrectChain = Number(chainId) === Number(targetChainId);

  return {
    ...result,
    currentChainId: chainId ?? null,
    targetChainId,
    isCorrectChain,
  };
}

