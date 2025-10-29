// store/slices/wallet.slice.ts
import { createSlice } from "@reduxjs/toolkit";
import { WalletAccount } from "../../types";
import { ethereum } from "../../constants";
import { connectWallet, disconnectWallet } from "../thucks/wallet.thuck";

type WalletState = {
  account: WalletAccount | null;
  loading: boolean;
  error?: string | null;
  isWalletAvailable: boolean;
};

const initialState: WalletState = {
  account: null,
  loading: false,
  error: null,
  isWalletAvailable: typeof window !== "undefined" && !!ethereum,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    // sync setter used by listeners
    setAccount(state, action: { payload: WalletAccount | null }) {
      state.account = action.payload;
    },
    setWalletAvailability(state, action: { payload: boolean }) {
      state.isWalletAvailable = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Connect failed";
      })
      .addCase(disconnectWallet.pending, (state) => {
        state.loading = true;
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.loading = false;
        state.account = null;
      })
      .addCase(disconnectWallet.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Disconnect failed";
        // still clear account to ensure UI resets
        state.account = null;
      });
  },
});

export const { setAccount, setWalletAvailability } = walletSlice.actions;
export default walletSlice.reducer;
