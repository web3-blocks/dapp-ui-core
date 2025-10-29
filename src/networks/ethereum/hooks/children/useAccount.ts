import { useAppSelector } from "./useTypedHooks";

export function useAccount() {
  const account = useAppSelector((s) => s.wallet.account);
  const isConnected = Boolean(account?.address);

  // pending concept: if wallet.loading and no account yet -> pending
  const pending = useAppSelector((s) => s.wallet.loading && !isConnected);

  return {
    account,
    isConnected,
    pending,
  };
}
