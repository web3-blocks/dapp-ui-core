// types/index.ts

import type { Chain } from "viem/chains";

export type ViemChain = Chain;

export type WalletAccount = {
  address?: string | null;
  accounts?: (string | undefined)[];
  chainId?: string | null;
};
