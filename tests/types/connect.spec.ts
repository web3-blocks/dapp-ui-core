import { describe, it, expectTypeOf } from "vitest";
import type { Connector } from "wagmi";
import type {
  AccountState,
  ConnectState,
  DisconnectState,
  NetworkState,
  UseEthereumResult,
} from "@web3-blocks/dapp-ui";

describe("Type definitions: Connect component and hooks", () => {
  it("UseEthereumResult slices are correctly typed", () => {
    expectTypeOf<UseEthereumResult>()
      .toHaveProperty("account")
      .toMatchTypeOf<AccountState>();
    expectTypeOf<UseEthereumResult>()
      .toHaveProperty("connect")
      .toMatchTypeOf<ConnectState>();
    expectTypeOf<UseEthereumResult>()
      .toHaveProperty("disconnect")
      .toMatchTypeOf<DisconnectState>();
    expectTypeOf<UseEthereumResult>()
      .toHaveProperty("network")
      .toMatchTypeOf<NetworkState>();
  });

  it("ConnectState has isWalletAvailable boolean and fn signature", () => {
    expectTypeOf<ConnectState>()
      .toHaveProperty("isWalletAvailable")
      .toMatchTypeOf<boolean>();
    expectTypeOf<ConnectState>()
      .toHaveProperty("fn")
      .parameter(0)
      .toMatchTypeOf<Connector | undefined>();
  });

  it("NetworkState switch accepts numeric chain id", () => {
    expectTypeOf<NetworkState>()
      .toHaveProperty("switch")
      .parameter(0)
      .toMatchTypeOf<number>();
  });
});
