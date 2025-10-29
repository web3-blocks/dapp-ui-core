import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./slices/wallet.slice";
import networkReducer from "./slices/network.slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      wallet: walletReducer,
      network: networkReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
