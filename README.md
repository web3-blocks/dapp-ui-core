# @web3-blocks/dapp-ui

`@web3-blocks/dapp-ui` provides a modular and type-safe React toolkit built on Redux Toolkit for robust state management, it's designed for multi-chain dApps with a clean and extensible API.

## Changelog

- **v0.0.3** – Enhanced release

  - Added `autoConnect` option to `DappUiProvider`
  - Improved persistent connection handling
  - Better state separation and modular Redux hooks
  - Documentation updates

## Features

- Connect and disconnect Ethereum wallets.
- Detect wallet availability (`window.ethereum`).
- Switch between multiple supported chains.
- `useEthereum` wrapper hook for all-in-one access.
- Modular hooks: `useAccount`, `useConnect`, `useDisconnect`, `useNetwork`.
- Redux Toolkit powered state management.
- Separate wallet and network state slices for better organization.
- SSR-safe (Next.js / React Server Components compatible).
- Fully typed with TypeScript.

## Installation

```shell
npm install @web3-blocks/dapp-ui@latest
```

## Quick Start

### 1. Wrap your app with `DappUiProvider`

```tsx
"use client";

import { mainnet, sepolia } from "viem/chains";
import { DappUiProvider } from "@web3-blocks/dapp-ui";
import { ConnectWallet } from "./components/ConnectWallet";

const supportedChains: Chain[] = [
  mainnet,
  sepolia,
  // { ... custom chain ... },
];

export default function App() {
  return (
    <DappUiProvider supportedChains={supportedChains} autoConnect>
      <ConnectWallet />
    </DappUiProvider>
  );
}
```

### 2. Use modular hooks

#### `useEthereum` (all-in-one)

```ts
import { useEthereum } from "@web3-blocks/dapp-ui";

const {
  account,
  connect: { fn: connect, loading: isConnecting, isWalletAvailable },
  disconnect: { fn: disconnect, loading: isDisconnecting },
  network: {
    chains,
    isSupportedChain,
    switch: switchNetwork,
    loading: isSwitchingNetwork,
  },
} = useEthereum();
```

#### `useAccount`

```ts
import { useAccount } from "@web3-blocks/dapp-ui";

const { account, isConnected, isSupportedChain } = useAccount();

console.log(account, isConnected, isSupportedChain);
```

#### `useConnect`

```ts
import { useConnect } from "@web3-blocks/dapp-ui";

const { connect, isConnecting, isWalletAvailable } = useConnect();

<button onClick={connect} disabled={!isWalletAvailable || isConnecting}>
  {isConnecting ? "Connecting..." : "Connect Wallet"}
</button>;
```

#### `useDisconnect`

```ts
import { useDisconnect } from "@web3-blocks/dapp-ui";

const { disconnect, isDisconnecting } = useDisconnect();

<button onClick={disconnect} disabled={isDisconnecting}>
  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
</button>;
```

#### `useSwitchNetwork`

```ts
import { useNetwork } from "@web3-blocks/dapp-ui";

const {
  switch: switchNetwork,
  chains,
  loading: isSwitchingNetwork,
  isSupportedChain,
} = useNetwork();

chains.map((chain) => (
  <button
    key={chain.id}
    onClick={() => switchNetwork(chain.id)}
    disabled={isSwitchingNetwork}
  >
    Switch to {chain.name}
  </button>
));
```

## Contributing

Feel free to fork, submit issues, and make pull requests. Please keep code modular and maintain SSR compatibility.

## License

MIT License
