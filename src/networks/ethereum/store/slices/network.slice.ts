// store/slices/network.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { switchNetwork } from "../thucks/network.thuck";
import type { SerializedChain } from "../../utils/serializeChain";

type NetworkState = {
  supportedChains: SerializedChain[];
  chainId?: string | null;
  isSupportedChain: boolean;
  loading: boolean;
  error?: string | null;
};

const initialState: NetworkState = {
  supportedChains: [],
  chainId: null,
  isSupportedChain: false,
  loading: false,
  error: null,
};

/**
 * setSupportedChains - synchronous action to store the chains
 */
export const setSupportedChains = (chains: SerializedChain[]) => ({
  type: "network/setSupportedChains",
  payload: chains,
});

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    // inside createSlice reducers
    setSupportedChainsReducer(state, action: PayloadAction<SerializedChain[]>) {
      state.supportedChains = action.payload;
    },
    setChainId(state, action: PayloadAction<string | null>) {
      state.chainId = action.payload;
      state.isSupportedChain = state.supportedChains.some(
        (c) => "0x" + c.id.toString(16) === action.payload
      );
    },
  },
  extraReducers(builder) {
    builder
      .addCase(switchNetwork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(switchNetwork.fulfilled, (state, action) => {
        state.loading = false;
        state.chainId = "0x" + action.payload.chainId.toString(16);
        state.isSupportedChain = action.payload.isSupported;
      })
      .addCase(switchNetwork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? "Switch failed";
      });
  },
});

export const { setSupportedChainsReducer, setChainId } = networkSlice.actions;
export default networkSlice.reducer;
