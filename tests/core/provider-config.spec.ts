import { describe, it, expect, vi } from "vitest";
import { validateChainConfig } from "../../src/utils/typeGuards";
import type { Chain } from "viem/chains";

const makeChain = (id: number, name: string): Chain => ({
  id,
  name,
  nativeCurrency: { name: "Test", symbol: "T", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
    public: { http: ["http://localhost:8545"] },
  },
});

describe("Provider chain configuration validation", () => {
  it("throws and warns when chains is undefined", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => validateChainConfig(undefined)).toThrowError();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("throws and warns when chains is an empty array", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => validateChainConfig([])).toThrowError();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("returns chains when a valid array is provided", () => {
    const chains: Chain[] = [makeChain(1, "Mainnet")];
    const validated = validateChainConfig(chains);
    expect(validated).toEqual(chains);
  });
});
