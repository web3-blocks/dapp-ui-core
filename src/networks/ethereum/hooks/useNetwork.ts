import { useChainId, useSwitchChain } from "wagmi";
import { useDappContext } from "@/core/context";
import type { NetworkState } from "@/core/types";
import {
  getSupportedChainById,
  getUnsupportedChainMessage,
  verifyChainMatch,
  normalizeChainId,
} from "@/utils/typeGuards";

export function useNetwork(): NetworkState {
  const { chains } = useDappContext();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const supportedChains = chains || [];

  const isSupportedChain = verifyChainMatch(chainId, supportedChains);

  function switchTo(targetChainId: number) {
    return switchChain({ chainId: targetChainId });
  }

  function getCurrentChain() {
    return getSupportedChainById(chainId, supportedChains);
  }

  function getUnsupportedMessage() {
    const normalized = normalizeChainId(chainId) ?? -1;
    return isSupportedChain
      ? undefined
      : getUnsupportedChainMessage(normalized, supportedChains);
  }

  function getSupportedChainNames() {
    return supportedChains.map((chain) => chain.name);
  }

  return {
    chainId,
    chains: supportedChains,
    isSupportedChain,
    switch: switchTo,
    loading: isPending,
    getCurrentChain,
    getUnsupportedMessage,
    getSupportedChainNames,
    error: isSupportedChain
      ? null
      : new Error(getUnsupportedMessage() || "Unsupported chain"),
  };
}
