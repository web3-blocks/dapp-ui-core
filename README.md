# @web3-blocks/dapp-ui

The **Universal and TypeScript-first Web3 abstraction layer** that provides a unified provider, modular network hooks, and chain-specific utilities for building decentralized applications. It powers the logic of <a href="https://dappui.vercel.app" target="_blank" rel="noopener noreferrer"><strong>dApp/ui</strong></a>, the component library built on top of <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer"><strong>shadcn/ui</strong></a> — but can be used independently.

## Installation

- Install with your package manager of choice

```bash
npm add @web3-blocks/dapp-ui
```

### Peer Dependencies

Install required peers that your app must provide. The SDK treats these as externals to prevent duplicate bundles and version conflicts:

- `react`: ^18 || ^19
- `react-dom`: ^18 || ^19
- `viem`: ^2
- `wagmi`: ^2
- `ethers`: ^6
- `@tanstack/react-query`: ^4 || ^5

Example:

```bash
npm add react react-dom viem wagmi ethers @tanstack/react-query @web3-blocks/dapp-ui
```

### React 19 Compatibility (Suppressing Peer Warnings)

Some transitive dependencies of `wagmi` may emit a peer warning for React 19 (via `use-sync-external-store`). To silence the warning without affecting functionality, add an override/resolution in your app:

- pnpm (`package.json`):

```json
{
  "pnpm": {
    "overrides": {
      "use-sync-external-store": "^1.6.0"
    }
  }
}
```

- npm (`package.json`):

```json
{
  "overrides": {
    "use-sync-external-store": "^1.6.0"
  }
}
```

- yarn (`package.json`):

```json
{
  "resolutions": {
    "use-sync-external-store": "^1.6.0"
  }
}
```

This does not change runtime behavior; it only removes the install-time warning when using React 19.

## Quick Start

Minimal React/Next.js setup for Ethereum (EVM) with built-in provider:

```tsx
import React from "react";
import { DAppUiProvider, useEth, Chains } from "@web3-blocks/dapp-ui";

function App() {
  const { connect, disconnect, account, switchChainRes, chainId } = useEth();

  const { address, isConnected } = account;
  const { connectSafe, isPending } = connect;

  return (
    <div>
      <p>Connected: {isConnected ? address : "-"}</p>
      <p>Chain ID: {chainId ?? "?"}</p>

      <button
        disabled={isPending}
        onClick={() =>
          isConnected
            ? disconnect.disconnect()
            : connectSafe({ connector: connect.injected })
        }
      >
        {isPending ? "Connecting..." : isConnected ? "Disconnect" : "Connect"}
      </button>

      <div>
        <p>Available chains:</p>
        {switchChainRes.chains?.map((c) => (
          <button
            key={c.id}
            onClick={() => switchChainRes.switchChain({ chainId: c.id })}
            disabled={switchChainRes.isPending}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Root() {
  return (
    <DAppUiProvider
      network="ethereum"
      contract={{
        address: "0x0000000000000000000000000000000000000000",
        abi: [],
        chains: [Chains.optimismSepolia],
        defaultChain: Chains.optimismSepolia,
        // Optional: rpcUrl for single-chain setups. Multi-chain uses default transports.
      }}
    >
      <App />
    </DAppUiProvider>
  );
}
```

### Transactions with Lifecycle Callbacks

```tsx
const { contract } = useEth();

async function addTask(content: string) {
  await contract
    .writeFn("addTask", [content], {
      onSwitching: (msg) => console.log(msg),
      onSwitched: (msg) => console.log(msg),
      onSubmitted: (hash) => console.log("Tx submitted:", hash),
      onConfirmed: (receipt) =>
        console.log("Confirmed:", receipt.transactionHash),
    })
    .catch((err) => console.error("Transaction error:", err.message));
}
```

### Subscribe to Contract Events

```tsx
const { contract } = useEth();

useEffect(() => {
  const offAdded = contract.eventFn("TaskAdded", (user, id, content) => {
    console.log("TaskAdded", { user, id: Number(id), content });
  });

  const offToggled = contract.eventFn("TaskToggled", (user, id, completed) => {
    console.log("TaskToggled", {
      user,
      id: Number(id),
      completed: Boolean(completed),
    });
  });

  return () => {
    offAdded?.();
    offToggled?.();
  };
}, [contract]);
```

### Exports

- Provider: `DAppUiProvider`
- Context: `useDAppContext`
- Types: `DAppUiProps`, `NETWORK_TYPES`, `DAppUiContextType`
- Ethereum (EVM):
  - `useEth` (combined convenience hook exposing `account`, `connect`, `disconnect`, `contract`, `switchNetwork`, `switchChainRes`, `chainId`)
  - Individual hooks: `useConnect`, `useDisconnect`, `useAccount`
  - Network hooks: `useSwitchChain` (Wagmi), `useSwitchNetwork` (utility)
  - Chains: `Chains` (from `viem/chains`)
  - Config: `createEthereumConfig` (internal provider usage; returns Wagmi config if you need it externally)

Hooks mirror `wagmi` behavior. `useConnect` includes a convenience flag `isWalletAvailable` in addition to wagmi’s return.

## Contributing

This project is open-source and welcomes contributions. The system is type-first and relies on a small contract config per network. Below is the complete flow, detailed to help you succeed.

### Adding Networks

1. Create `src/networks/<network>/config/contract.config.ts` (use lowercase for `<network>`, e.g., `ethereum`, `sui`).
2. Define and export `type ContractConfig` in that file.
3. In `src/networks/<network>/index.ts`, type re-export the contract config:

```ts
// src/networks/<network>/index.ts
export type { ContractConfig } from "./config/contract.config";
```

Example (EVM):

```ts
// src/networks/ethereum/config/contract.config.ts
import type { Chain, Abi } from "viem";

export type ContractConfig = {
  address: string; // EVM address for your contract
  abi: Abi; // ABI describing callable functions and events
  chains?: Chain[]; // Optional: supported chains (e.g., mainnet, sepolia)
};
```

```ts
// src/networks/ethereum/index.ts
export type { ContractConfig } from "./config/contract.config";
```

### Type Generation (What Happens and Why)

- Run the generator:

```bash
npm run genotype
```

- Don't ask me why I called is `genotype` 😑
- The generator scans `src/networks`, validates folder names and ensures each network exports `type ContractConfig`.
- The generator scans `src/networks`, validates folder names and ensures each network’s `index.ts` exports `type ContractConfig` (either a direct alias or a type re-export).
- It then regenerates `src/constants/index.ts`, which contains:
  - `NETWORK_TYPES`: a union of all network keys (e.g., `"ethereum" | "sui"`).
  - `NETWORK_TYPES_ARRAY`: a readonly array form, useful for iteration and validation.
  - `REGISTRIES`: dynamic import map so the app can lazy-load network modules (code-splitting).
  - `NETWORK_CONTRACT_MAP`: compile-time mapping from network → its `ContractConfig` type.
  - `DAppUiProps` and `DAppUiContextType`: canonical provider and context types tied to the selected network.

Why dynamic imports? It avoids bundling every network’s code and lets consumers load only what they need.

### Validation & Hooks

- A pre-commit hook runs the generator. If `src/constants/index.ts` changes and isn’t staged, the commit fails with instructions.
- The generator enforces:
  - Lowercase-only folder names.
  - Presence of `export type ContractConfig` in each network’s `index.ts` (alias or type re-export).

### Troubleshooting

- Missing `index.ts` or missing `ContractConfig` export → add the file and export the type exactly as shown.
- Invalid folder name (uppercase or symbols) → rename the folder to lowercase letters only.
- TypeScript errors mentioning `NETWORK_CONTRACT_MAP[NETWORK_TYPES]` → ensure your `ContractConfig` matches the fields used by your provider and hooks.

#### Network Switching & Chain ID

- Ensure your `chains` include all networks you want to support (e.g., Optimism Sepolia and Arbitrum). If only one chain is configured with `rpcUrl`, the provider uses it; multi-chain setups use default transports per chain.
- `chainId` comes from Wagmi and updates when MetaMask switches networks. Connect the wallet to reflect connector chain changes.

#### Transactions Failing with “Failed to fetch” (-32603)

- This usually indicates the wallet’s RPC endpoint is unreachable or blocked (ad-blockers or corporate proxies). Try disabling blockers on localhost and confirm MetaMask is connected to the intended chain.
- If the contract call reverts without a reason or the contract isn’t deployed on the active chain, `writeFn` throws a clear message instead of a raw `CALL_EXCEPTION`.

## Dependency Management (SDK Consumers)

- The SDK externalizes peers (`react`, `react-dom`, `wagmi`, `viem`, `ethers`, `@tanstack/react-query`) to avoid duplicate installations and reduce bundle bloat.
- Use consistent version ranges in your app. Recommended:
  - `react`, `react-dom`: `^18 || ^19`
  - `wagmi`: `^2`
  - `viem`: `^2`
  - `ethers`: `^6`
  - `@tanstack/react-query`: `^4 || ^5`
- If you are missing a required peer, install it explicitly. The library does not bundle peers by design.
- If you encounter peer version warnings, set `overrides`/`resolutions`:

  - pnpm (`package.json`):

  ```json
  {
    "pnpm": {
      "overrides": {
        "use-sync-external-store": "^1.6.0",
        "react": "^19",
        "react-dom": "^19"
      }
    }
  }
  ```

  - npm (`package.json`):

  ```json
  {
    "overrides": {
      "use-sync-external-store": "^1.6.0",
      "react": "^19",
      "react-dom": "^19"
    }
  }
  ```

  - yarn (`package.json`):

  ```json
  {
    "resolutions": {
      "use-sync-external-store": "^1.6.0",
      "react": "^19",
      "react-dom": "^19"
    }
  }
  ```

## License

- MIT © <a href="https://x.com/dapp_ui" target="_blank" rel="noopener noreferrer"><strong>dApp/ui</strong></a>
- React 19 peer warning: `use-sync-external-store`

If you see a peer warning like:

```
✕ unmet peer react@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.x
```

This comes from a transitive dependency chain (`wagmi` → WalletConnect stack → `valtio` → `use-sync-external-store@1.2.0`) that only declares React up to 18.

To silence the warning and stay compatible with React 19, override `use-sync-external-store` to a React-19-compatible release (≥ 1.6.0):

- npm (`package.json`):

```json
{
  "overrides": {
    "use-sync-external-store": "^1.6.0"
  }
}
```

- pnpm (`package.json`):

```json
{
  "pnpm": {
    "overrides": {
      "use-sync-external-store": "^1.6.0"
    }
  }
}
```

- yarn (`package.json`):

```json
{
  "resolutions": {
    "use-sync-external-store": "^1.6.0"
  }
}
```

Alternatively (Yarn Berry), extend the peer range without changing versions:

```yaml
packageExtensions:
  use-sync-external-store@*:
    peerDependencies:
      react: ">=16.8.0 <21"
```
