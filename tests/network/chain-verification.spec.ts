import { describe, it, expect, vi } from "vitest";
import { verifyChainMatch, normalizeChainId } from "../../src/utils/typeGuards";
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

describe("Chain verification utility", () => {
  it("returns true when current chain matches provider chains", () => {
    const supported: Chain[] = [
      makeChain(8453, "Base"),
      makeChain(11155111, "Sepolia"),
    ];
    expect(verifyChainMatch(8453, supported)).toBe(true);
  });

  it("normalizes hex chain id strings before comparison", () => {
    const supported: Chain[] = [makeChain(8453, "Base")];
    expect(verifyChainMatch("0x2105", supported)).toBe(true); // 0x2105 === 8453
  });

  it("returns false for non-matching chain", () => {
    const supported: Chain[] = [makeChain(11155111, "Sepolia")];
    expect(verifyChainMatch(8453, supported)).toBe(false);
  });

  it("returns false and warns for undefined currentChain", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const supported: Chain[] = [makeChain(1, "Mainnet")];
    expect(verifyChainMatch(undefined, supported)).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("normalizeChainId handles decimal and hex strings", () => {
    expect(normalizeChainId("1")).toBe(1);
    expect(normalizeChainId("0x1")).toBe(1);
    expect(normalizeChainId("")).toBeNull();
    expect(normalizeChainId("abc")).toBeNull();
  });
});
