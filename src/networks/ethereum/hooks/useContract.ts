import { useDappContext } from "@/core/context";
import { createEthereumConfig } from "@/networks/ethereum/config";

export function useContract() {
  const { contract, chains } = useDappContext();
  if (!contract) throw new Error("No contract data found in provider");

  // Create clients with the chains from context
  const { publicClient, walletClient } = createEthereumConfig(chains);

  async function readFn(functionName: string, args: any[] = []) {
    try {
      return await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName,
        args,
      });
    } catch (error) {
      console.error(`Error reading contract function ${functionName}:`, error);
      throw error;
    }
  }

  async function writeFn(functionName: string, args: any[] = []) {
    try {
      return await walletClient.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName,
        args,
        account: null,
      });
    } catch (error) {
      console.error(
        `Error writing to contract function ${functionName}:`,
        error
      );
      throw error;
    }
  }

  async function eventFn(eventName: string, callback: Function) {
    try {
      publicClient.watchContractEvent({
        address: contract.address,
        abi: contract.abi,
        eventName,
        onLogs: (logs) => callback(logs),
      });
    } catch (error) {
      console.error(`Error watching contract event ${eventName}:`, error);
      throw error;
    }
  }

  return { readFn, writeFn, eventFn };
}
