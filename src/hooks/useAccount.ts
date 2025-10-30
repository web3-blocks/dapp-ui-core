import { useDappContext } from "@/core/context";
import type { AccountState } from "@/core/types";

export function useAccount(): AccountState {
  const { networkImpl } = useDappContext();
  if (!networkImpl) {
    throw new Error(
      "useAccount must be used within DappUiProvider with a loaded network implementation"
    );
  }
  return networkImpl.useAccount();
}
