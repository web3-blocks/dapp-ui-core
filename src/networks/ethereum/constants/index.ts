import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export const ethereum =
  typeof window !== "undefined" ? window.ethereum : undefined;
