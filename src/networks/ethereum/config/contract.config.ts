import { Address } from "viem";
import type { Chain } from "wagmi/chains";
import { Interface, InterfaceAbi } from "ethers";

export type ContractConfig = {
  address: Address;
  abi: Interface | InterfaceAbi;
  defaultChain: Chain;
  chains: Chain[];
  rpcUrl?: string;
};
