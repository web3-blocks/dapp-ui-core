import type { Chain, Abi } from "viem";

export type ContractConfig = {
  address: string;
  abi: Abi;
  chains?: Chain[];
};
