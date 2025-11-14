import { Contract, ethers } from "ethers";
import { getSigner } from "../utils/typeGuards";
import { useDAppContext } from "@/provider/context";

export function useContract() {
  const { contract } = useDAppContext();

  async function getContract(): Promise<Contract> {
    try {
      const signer = await getSigner(contract.rpcUrl);
      return new ethers.Contract(contract.address, contract.abi, signer);
    } catch (e) {
      reportError(e);
      throw new Error("Failed to initialize the Task contract.");
    }
  }

  async function readFn(fnName: string, args?: any[]) {
    try {
      const instance = await getContract();
      return await (instance as any)[fnName](...(args || []));
    } catch (e) {
      reportError(e);
      throw e;
    }
  }

  return { readFn };
}
