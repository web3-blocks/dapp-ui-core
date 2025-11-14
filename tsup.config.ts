import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/index.ts"],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  external: [
    "react",
    "react-dom",
    "wagmi",
    "viem",
    "ethers",
    "@tanstack/react-query",
  ],
  clean: true,
});
