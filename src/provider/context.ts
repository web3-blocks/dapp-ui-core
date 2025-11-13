import React, { createContext } from "react";
import { DAppUiContextType } from "@/constants";

export const DAppUiContext = createContext<DAppUiContextType | undefined>(
  undefined
);

export function useDAppContext() {
  const context = React.useContext(DAppUiContext);
  if (!context)
    throw new Error("useDAppContext must be used within DAppUiProvider");
  return context;
}
