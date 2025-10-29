import { useAccount } from "./children/useAccount";
import { useConnect } from "./children/useConnect";
import { useDisconnect } from "./children/useDisconnect";
import { useNetwork } from "./children/useNetwork";

/**
 * Wrapper: returns grouped objects consistent with your requested API:
 * { account, connect: { fn, loading, isWalletAvailable }, disconnect: { fn, loading }, network: { chains, isSupportedChain, switch, loading } }
 */
export function useEthereum() {
  const account = useAccount();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const network = useNetwork();

  return {
    account,
    connect: {
      fn: connect.fn,
      loading: connect.loading,
      isWalletAvailable: connect.isWalletAvailable,
      account: connect.account,
    },
    disconnect: {
      fn: disconnect.fn,
      loading: disconnect.loading,
    },
    network: {
      chains: network.chains,
      isSupportedChain: network.isSupportedChain,
      chainId: network.chainId,
      loading: network.loading,
      switch: network.switch,
    },
  };
}
