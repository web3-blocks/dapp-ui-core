import { describe, it, expect } from "vitest";
import { NETWORK_IDS } from "../../src/core/networkIds";
import fs from "fs";
import path from "path";
// Type-level assertions
import type { NetworkId } from "../../src/core/networkIds";
import type { DappUiProviderProps } from "../../src/core/types";

describe("Network type generation", () => {
  it("includes directories from src/networks", () => {
    const networksDir = path.join(process.cwd(), "src", "networks");
    const dirs = fs
      .readdirSync(networksDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    expect(NETWORK_IDS.slice().sort()).toEqual(dirs);
  });

  it("exposes strongly-typed NetworkId", () => {
    const sample: NetworkId = "ethereum";
    // @ts-expect-error invalid network should error
    const invalid: NetworkId = "solana";
    expect(sample).toBe("ethereum");
  });

  it("types DappUiProviderProps.network as NetworkId", () => {
    const props: Pick<DappUiProviderProps, "network"> = {
      network: "ethereum" as NetworkId,
    };
    expect(props.network).toBe("ethereum");
  });
});
