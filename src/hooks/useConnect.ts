import { useDappContext } from "@/core/context";
import type { ConnectState } from "@/core/types";
import { getWalletAvailability } from "@/utils/typeGuards";

export function useConnect(): ConnectState {
  const { networkImpl } = useDappContext();
  if (!networkImpl) {
    throw new Error(
      "useConnect must be used within DappUiProvider with a loaded network implementation"
    );
  }

  const connectState = networkImpl.useConnect();
  const isWalletAvailable = getWalletAvailability();

  return { ...connectState, isWalletAvailable };
}
