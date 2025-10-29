// store/thucks/network.thuck.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethereum } from "../../constants";
import { ViemChain } from "../../types";

/**
 * switchNetwork - thunk that switches or adds chain
 */
export const switchNetwork = createAsyncThunk<
  { chainId: number; isSupported: boolean },
  number,
  { rejectValue: string; state: any }
>("network/switch", async (chainId: number, thunkAPI) => {
  if (!ethereum) return thunkAPI.rejectWithValue("No wallet provider");

  const hexChainId = "0x" + chainId.toString(16);
  // read supportedChains from state (if provided by provider)
  const supportedChains: ViemChain[] =
    thunkAPI.getState().network?.supportedChains ?? [];

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
    return {
      chainId,
      isSupported: supportedChains.some((c) => c.id === chainId),
    };
  } catch (err: any) {
    // if chain not added, try to add using chain config
    if (err?.code === 4902) {
      const chain = supportedChains.find((c) => c.id === chainId);
      if (!chain)
        return thunkAPI.rejectWithValue(
          "Chain not configured in supportedChains"
        );

      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChainId,
              chainName: chain.name,
              rpcUrls: chain.rpcUrls?.default?.http ?? [],
              nativeCurrency: chain.nativeCurrency,
              blockExplorerUrls: chain.blockExplorers
                ? [chain.blockExplorers.default.url]
                : [],
            },
          ],
        });
        return { chainId, isSupported: true };
      } catch (addErr: any) {
        return thunkAPI.rejectWithValue(addErr?.message ?? "Add chain failed");
      }
    }
    return thunkAPI.rejectWithValue(err?.message ?? "Switch chain failed");
  }
});
