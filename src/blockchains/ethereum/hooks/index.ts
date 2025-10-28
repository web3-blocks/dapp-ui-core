import { useAccount } from "./useAccount";
import { useConnect } from "./useConnect";
import { useDisconnect } from "./useDisconnect";
import { useSwitchNetwork } from "./useSwitchNetwork";

export function useEthereum() {
  const account = useAccount();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const network = useSwitchNetwork();

  return {
    account,
    connect,
    disconnect,
    network,
  };
}
