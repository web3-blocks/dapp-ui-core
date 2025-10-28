import { Chain } from "viem/chains";

export type DappUiWalletStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type DappUiWalletAccount = {
  address?: string | null;
  accounts?: string[] | null;
  chainId?: string | number | null;
  isSupportedChain?: boolean;
  status: DappUiWalletStatus;
};

export interface DappUiContextValue {
  supportedChains: Chain[];
  isEthObjAvailable: boolean;
  account: DappUiWalletAccount | null;

  // state slices
  isConnecting: boolean;
  isDisconnecting: boolean;
  isSwitchingNetwork: boolean;

  // actions
  handleConnect: () => Promise<void>;
  handleDisconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
}
