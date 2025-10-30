import { useDisconnect as wagmiUseDisconnect } from "wagmi";
import type { DisconnectState } from "@/core/types";

export function useDisconnect(): DisconnectState {
  const { disconnect, isPending } = wagmiUseDisconnect();

  async function fn() {
    await disconnect();
  }

  return { fn, loading: isPending };
}
