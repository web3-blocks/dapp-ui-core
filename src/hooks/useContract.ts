import { useDappContext } from "@/core/context";

export function useContract() {
  const { networkImpl } = useDappContext();
  return networkImpl?.useContract();
}
