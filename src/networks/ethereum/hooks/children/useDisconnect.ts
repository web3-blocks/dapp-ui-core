import { disconnectWallet } from "../../store/thucks/wallet.thuck";
import { useAppDispatch, useAppSelector } from "./useTypedHooks";

export function useDisconnect() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.wallet.loading);

  return {
    fn: () => dispatch(disconnectWallet() as any),
    loading,
  };
}
