import { useDisconnect as wagmiUseDisconnect } from "wagmi";
import { DisconnectState } from "../types";

export function useDisconnect(): DisconnectState {
  const result = wagmiUseDisconnect();

  return { ...result };
}
