import { useConnect as wagmiUseConnect } from "wagmi";

import { ConnectState } from "../types";

export function useConnect(): ConnectState {
  const result = wagmiUseConnect();

  return { ...result };
}
