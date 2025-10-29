import { switchNetwork } from "../../store/thucks/network.thuck";
import { useAppDispatch, useAppSelector } from "./useTypedHooks";

export function useNetwork() {
  const dispatch = useAppDispatch();
  const chains = useAppSelector((s) => s.network.supportedChains);
  const isSupportedChain = useAppSelector((s) => s.network.isSupportedChain);
  const chainId = useAppSelector((s) => s.network.chainId);
  const loading = useAppSelector((s) => s.network.loading);

  return {
    chains,
    isSupportedChain,
    chainId,
    loading,
    // expose action as .fn for consistency
    switch: (id: number) => dispatch(switchNetwork(id) as any),
  };
}
