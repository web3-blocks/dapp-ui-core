// store/thucks/wallet.thuck.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { WalletAccount } from "../../types";
import { ethereum } from "../../constants";

/**
 * connectWallet - asks the wallet to connect and returns account+chainId
 */
export const connectWallet = createAsyncThunk<
  WalletAccount,
  void,
  { rejectValue: string }
>("wallet/connect", async (_, thunkAPI) => {
  try {
    if (!ethereum) throw new Error("No wallet found");
    const accounts = (await ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];
    const chainId = (await ethereum.request({
      method: "eth_chainId",
    })) as string;
    return {
      address: accounts[0] ?? null,
      accounts,
      chainId,
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message ?? "Connect failed");
  }
});

/**
 * disconnectWallet - tries to revoke permissions (if supported),
 * but always clears local state.
 */
export const disconnectWallet = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("wallet/disconnect", async (_, thunkAPI) => {
  try {
    if (ethereum) {
      try {
        await ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch {
        // ignore if unsupported
      }
    }
    // nothing to return; the reducer will clear state
    return;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message ?? "Disconnect failed");
  }
});
