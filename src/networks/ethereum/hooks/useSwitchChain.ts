import { useMemo } from "react";
import { useChainId, useSwitchChain as wagmiSwitchChain } from "wagmi";
import { useDAppContext } from "@/provider/context";

export type SwitchChainHook = ReturnType<typeof wagmiSwitchChain> & {
  currentChainId: number | null;
  targetChainId: number;
  isCorrectChain: boolean;
};

export function useSwitchChain(): SwitchChainHook {
  const chainId = useChainId();
  const { contract } = useDAppContext();
  const targetChainId = useMemo(() => contract.defaultChain.id, [contract]);
  const result = wagmiSwitchChain();

  const isCorrectChain = Number(chainId) === Number(targetChainId);

  return {
    ...result,
    currentChainId: chainId ?? null,
    targetChainId,
    isCorrectChain,
  };
}
