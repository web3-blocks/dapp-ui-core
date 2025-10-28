# @web3-blocks/dapp-ui

**A lightweight, framework-ready toolkit for seamless multi-chain dApps.**

`@web3-blocks/dapp-ui` provides a modular and type-safe React context and hooks to interact with Ethereum-compatible wallets, manage accounts, connect/disconnect, and switch networks. It’s designed for multi-chain dApps with a clean and extensible API.

## Changelog

- **v0.0.1** – Initial release

  - DappUiProvider context
  - Modular hooks
  - Network switching
  - Connect/disconnect logic
  - SSR-safe

## Features

- Connect and disconnect Ethereum wallets.
- Detect wallet availability (`window.ethereum`).
- Switch between multiple supported chains.
- Modular hooks: `useAccount`, `useConnect`, `useDisconnect`, `useSwitchNetwork`.
- Optional `useEthereum` wrapper hook for all-in-one access.
- SSR-safe (Next.js / React Server Components compatible).
- Fully typed with TypeScript.

## Installation

```bash
npm install @web3-blocks/dapp-ui
# or
yarn add @web3-blocks/dapp-ui
```

## Quick Start

### 1. Wrap your app with `DappUiProvider`

```tsx
"use client";

import { DappUiProvider } from "@web3-blocks/dapp-ui";
import { Chain } from "viem/chains";
import { ConnectWallet } from "./components/ConnectWallet";

const supportedChains: Chain[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    rpcUrls: {
      default: { http: ["https://mainnet.infura.io/v3/<YOUR_INFURA_ID>"] },
    },
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorers: {
      default: { name: "Etherscan", url: "https://etherscan.io" },
    },
  },
  // Add more chains here...
];

export default function App() {
  return (
    <DappUiProvider supportedChains={supportedChains}>
      <ConnectWallet />
    </DappUiProvider>
  );
}
```

### 2. Use modular hooks

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
import { useSwitchNetwork } from "@web3-blocks/dapp-ui";

const { switchNetwork, chains, isSwitchingNetwork } = useSwitchNetwork();

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

#### Optional: `useEthereum` (all-in-one)

```ts
import { useEthereum } from "@web3-blocks/dapp-ui";

const { account, connect, disconnect, network } = useEthereum();
```

### 3. ConnectWallet Example

```tsx title="ConnectWallet.tsx"
"use client";

import { useState, useEffect } from "react";
import { useEthereum } from "@web3-blocks/dapp-ui";
import { Button } from "./ui/button";

export function ConnectWallet() {
  const [mounted, setMounted] = useState(false);

  const {
    account: { account, isConnected, isSupportedChain },
    connect: { connect, isConnecting, isWalletAvailable },
    disconnect: { disconnect, isDisconnecting },
    network: { chains, isSwitchingNetwork, switchNetwork },
  } = useEthereum();

  // Only render after client mount
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (!isWalletAvailable) return <p>No wallet detected</p>;

  return (
    <div className="p-6 space-y-8">
      {!isConnected && (
        <Button onClick={connect} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}

      {isConnected && !isSupportedChain && (
        <div className="space-y-2">
          {chains.map((chain) => (
            <Button
              key={chain.id}
              onClick={() => switchNetwork(chain.id)}
              disabled={isSwitchingNetwork}
            >
              Switch to {chain.name}
            </Button>
          ))}
        </div>
      )}

      {isConnected && (
        <Button onClick={disconnect} disabled={isDisconnecting}>
          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
        </Button>
      )}

      <pre className="whitespace-pre-wrap">
        {JSON.stringify(account, null, 2)}
      </pre>
    </div>
  );
}
```

## Contributing

Feel free to fork, submit issues, and make pull requests. Please keep code modular and maintain SSR compatibility.

## License

MIT License

Copyright (c) 2025 Web3 Blocks

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
