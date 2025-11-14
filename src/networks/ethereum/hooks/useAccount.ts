import { useAccount as wagmiUseAccount } from "wagmi";
import { AccountState } from "../types";

export function useAccount(): AccountState {
  const result = wagmiUseAccount();

  return { ...result };
}
