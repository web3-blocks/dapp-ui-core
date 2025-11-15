import { Contract, ethers } from "ethers";
import {
  getSigner,
  reportError,
  validateActiveChain,
  switchToChain,
  getRpcProvider,
} from "../utils/typeGuards";
import { ethereumProvider } from "../utils/typeGuards";
import { useDAppContext } from "@/provider/context";
import type { Chain } from "wagmi/chains";

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
      const validation = await validateActiveChain(contract);
      if (!validation.ok) {
        throw new Error(
          `Wrong network: connected chainId=${
            validation.currentChainId ?? "?"
          }, expected chainId=${validation.expectedChainId}. ${
            validation.error ?? "Switch to the default chain."
          }`
        );
      }
      const instance = await getContract();
      return await (instance as any)[fnName](...(args || []));
    } catch (e) {
      reportError(e);
      throw e instanceof Error
        ? e
        : new Error("Read failed. Check network and retry.");
    }
  }

  async function writeFn(
    fnName: string,
    args?: any[],
    options?: {
      onSwitching?: (msg: string) => void;
      onSwitched?: (msg: string) => void;
      onSubmitted?: (txHash: string) => void;
      onConfirmed?: (receipt: ethers.TransactionReceipt) => void;
    }
  ) {
    try {
      // Pre-transaction chain validation
      const validation = await validateActiveChain(contract);
      if (!validation.ok) {
        options?.onSwitching?.(
          "Wrong network detected. Attempting to switch to the default chain..."
        );
        await switchToChain(contract.defaultChain as Chain, contract.rpcUrl);
        options?.onSwitched?.("Switched to the default chain successfully.");
      }

      const instance = await getContract();
      const result = await (instance as any)[fnName](...(args || []));

      // If this is a transaction, await confirmation
      if (
        result &&
        typeof result === "object" &&
        typeof result.wait === "function"
      ) {
        const txHash = (result.hash ?? result?.transactionHash) as
          | string
          | undefined;
        if (txHash) options?.onSubmitted?.(txHash);
        const receipt = await result.wait();
        options?.onConfirmed?.(receipt);
        return receipt;
      }

      // Otherwise return the direct result (e.g., view or boolean)
      return result;
    } catch (e) {
      reportError(e);
      const msg = `${e instanceof Error ? e.message : String(e)}`;
      // Handle 'missing revert data' CALL_EXCEPTION gracefully
      if (
        typeof e === "object" &&
        e !== null &&
        (e as any).code === "CALL_EXCEPTION" &&
        (msg.includes("missing revert data") ||
          (e as any).reason === "missing revert data")
      ) {
        throw new Error(
          "Transaction reverted or contract not deployed on this network. Switch to the default chain and retry."
        );
      }

      throw e instanceof Error
        ? e
        : new Error(
            "Transaction failed. Please retry after switching network."
          );
    }
  }

  /**
   * Subscribe to contract events. Returns an unsubscribe function.
   */
  function eventFn<EventArgs extends any[]>(
    eventName: string,
    listener: (...args: EventArgs) => void
  ): () => void {
    try {
      let provider: ethers.Provider;
      // Prefer the user's wallet provider in-browser to avoid public RPC CORS/rate limits
      if (ethereumProvider) {
        provider = new ethers.BrowserProvider(ethereumProvider);
      } else {
        provider = getRpcProvider(contract.rpcUrl);
      }
      const readContract = new ethers.Contract(
        contract.address,
        contract.abi,
        provider
      );
      readContract.on(eventName, listener as any);
      return () => {
        try {
          readContract.off(eventName, listener as any);
        } catch (e) {
          reportError(e);
        }
      };
    } catch (e) {
      reportError(e);
      return () => void 0;
    }
  }

  return { readFn, writeFn, eventFn };
}
