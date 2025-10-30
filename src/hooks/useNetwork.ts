import { useDappContext } from "@/core/context";
import type { NetworkState } from "@/core/types";

export function useNetwork(): NetworkState {
  const { networkImpl } = useDappContext();
  if (!networkImpl) {
    throw new Error(
      "useNetwork must be used within DappUiProvider with a loaded network implementation"
    );
  }
  return networkImpl.useNetwork();
}
