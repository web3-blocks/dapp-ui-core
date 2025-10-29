import { connectWallet } from "../../store/thucks/wallet.thuck";
import { useAppDispatch, useAppSelector } from "./useTypedHooks";

export function useConnect() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.wallet.loading);
  const isWalletAvailable = useAppSelector((s) => s.wallet.isWalletAvailable);
  const account = useAppSelector((s) => s.wallet.account);

  return {
    fn: () => dispatch(connectWallet() as any),
    loading,
    isWalletAvailable,
    account,
  };
}
