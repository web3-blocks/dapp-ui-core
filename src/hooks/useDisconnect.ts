import { useDappContext } from "@/core/context";
import type { DisconnectState } from "@/core/types";

export function useDisconnect(): DisconnectState {
  const { networkImpl } = useDappContext();
  if (!networkImpl) {
    throw new Error(
      "useDisconnect must be used within DappUiProvider with a loaded network implementation"
    );
  }
  return networkImpl.useDisconnect();
}
