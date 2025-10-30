# @web3-blocks/dapp-ui

The Universal Web3 package manager, a clean wrapper around wagmi and viem, designed to simplify connection, network, and contract handling for any blockchain.

## Features

- Simple provider-based architecture
- Unified hooks for account, connection, and contract interactions
- Support for multiple networks (Ethereum, Sui, etc.)
- **Flexible chain configuration system**

## Installation

```bash
npm install @web3-blocks/dapp-ui
```

## Contributing

- Clone the repo and install dependencies: `npm install`
- Build the package: `npm run build` (auto-generates network types and registry)
- Run tests: `npm run test`
- Prefer small, focused PRs with clear descriptions and updated docs.

## Network Implementation Pattern

- Location: `src/networks/<network>` (folder name becomes the `NetworkId`)
- Structure:
- `index.ts`: default export implementing `NetworkImpl` (hooks wiring)
- `hooks/`: `useAccount`, `useConnect`, `useDisconnect`, `useNetwork`, `useContract`
- `config.ts`: network-specific `wagmi`/`viem` config, clients, connectors
- `clients/`: optional helpers and client builders
- Types: Use shared types from `src/core/types` (`AccountState`, `ConnectState`, `DisconnectState`, `NetworkState`). Avoid `any`.
- Runtime guards: Use utilities from `src/utils/typeGuards` (EIP‑1193 detection, chain helpers).
- Chain support logic:
- `isSupportedChain` must check current `chainId` against `DappUiProvider` `chains`
- When unsupported, set `NetworkState.error` and return a descriptive `getUnsupportedMessage()`
- Wrap `switch(chainId: number)` to switch to supported chains by id

## Type Generation & Registry

- Auto-generated at build time:
- `src/core/networkIds.ts` — `export type NetworkId = '...'` and `NETWORK_IDS`
- `src/core/registry.ts` — dynamic imports mapping for available networks
- How it works:
- Script scans folder names under `src/networks/*`
- Runs on `prebuild` and via `npm run generate:networks`
- Naming conventions:
- Use lowercase folder names, optionally `kebab-case`
- Folder name is the canonical `NetworkId` used in `DappUiProvider`

## Adding a New Network

1. Create `src/networks/<your-network>/`
2. Implement `index.ts` exporting a `default` `NetworkImpl`
3. Add hooks in `hooks/` (shape must match shared types)
4. Provide network `config.ts` for clients/connectors if applicable
5. Run `npm run build` to generate types/registry
6. Use in app: `<DappUiProvider network="<your-network>" ... />`

## Testing

- Unit tests: add scenarios under `tests/network/` for validation behavior
- Type tests: add assertions under `tests/types/` using `vitest`
- Suggested areas:
- Unsupported chain detection (`isChainSupported` false with mismatched ids)
- Supported chain detection (`isChainSupported` true)
- Type generation correctness (`NETWORK_IDS` equals folder names)
- Provider typing (`DappUiProviderProps.network` is `NetworkId`)

## Developer Experience & Backward Compatibility

- IDE autocompletion: `NetworkId` and `NETWORK_IDS` exported for visibility
- Auto-inclusion: New network folders are detected at build — no manual registry edits needed
- Migration: Replace string `network` with typed `NetworkId`; the folder name you add is the value you use
- Error UX: Use `network.getUnsupportedMessage()` and check `network.error` when mismatched

## Release Checklist

- Build succeeds: `npm run build`
- Tests pass: `npm run test`
- Documentation updated: README includes usage and contributor guidance
- No `any` types introduced; hooks and components use shared interfaces

## Usage

### Basic Setup

```jsx
import { DappUiProvider, useAccount, useConnect } from '@web3-blocks/dapp-ui';
import { mainnet } from 'viem/chains';

function App() {
  return (
    <DappUiProvider
      network="ethereum"
      contract={{
        address: '0x1234567890123456789012345678901234567890',
        abi: [...],
      }}
    >
      <YourApp />
    </DappUiProvider>
  );
}
```

### Custom Chain Configuration

You can now provide custom chains to the DappUiProvider:

```jsx
import { DappUiProvider } from '@web3-blocks/dapp-ui';
import { mainnet, sepolia, optimism } from 'viem/chains';

function App() {
  return (
    <DappUiProvider
      network="ethereum"
      chains={[mainnet, sepolia, optimism]} // Custom chain configuration
      contract={{
        address: '0x1234567890123456789012345678901234567890',
        abi: [...],
      }}
    >
      <YourApp />
    </DappUiProvider>
  );
}
```

The `chains` prop accepts an array of chain objects from `viem/chains`. If not provided, the library will default to using `mainnet`.

## API Reference

### DappUiProvider

The main provider component that sets up the Web3 context.

Props:

- `network` (`NetworkId`): Strongly-typed network identifier (e.g., `"ethereum"`, `"sui"`). IDE autocompletes based on folders in `src/networks`.
- `chains` (Chain[], required): At least one chain must be supplied (recommended default: `mainnet` from `viem/chains`).
- `contract` (ContractData): The contract data (address and ABI)
- `children` (ReactNode): Child components

### Hooks

- `useAccount()`: Get the current account information
- `useConnect()`: Connect to a wallet
- `useDisconnect()`: Disconnect from a wallet
- `useNetwork()`: Get network information
- `useContract()`: Interact with the configured contract

## Error Handling

The library includes comprehensive error handling for chain configuration:

- Invalid chain configurations will throw descriptive errors
- The provider includes error state handling
- All contract interactions include proper error handling

## Type Safety

All components and hooks are fully typed with TypeScript, ensuring type safety throughout your application.

### Connect Component Types

The `useEthereum()` hook returns a `UseEthereumResult` with strictly typed slices:

- `account: AccountState`
- `connect: ConnectState`
- `disconnect: DisconnectState`
- `network: NetworkState`

Key fields:

- `connect.isWalletAvailable: boolean` — detected via a runtime EIP‑1193 provider check
- `connect.fn(connector?: Connector): Promise<void>` — initiates wallet connection
- `disconnect.fn(): Promise<void>` — disconnects the current wallet
- `network.switch(chainId: number)` — switches to a supported chain by id

### Type Guards

- `hasEthereumProvider(value): value is Eip1193Provider` — verifies a minimal EIP‑1193 provider shape.
- `getWalletAvailability(): boolean` — uses the guard to detect wallet availability at runtime.
- `isChainSupported(chainId, chains): boolean` — returns whether current chain id is in provider-supported chains.
- `getSupportedChainById(chainId, chains): Chain | undefined` — returns the chain object if supported.
- `getUnsupportedChainMessage(chainId, chains): string` — user-friendly message for mismatch.
- `getCurrentChainInfo(chainId, chains): { isSupported, chain?, message? }` — consolidated helper.

## Chain Configuration Requirements

- Mandatory: Provide at least one chain in the `chains` prop.
- Recommended: Use `mainnet` from `viem/chains` as your default.
- Validation: Initialization throws an error if `chains` is missing or empty.
- Console warnings:
  - When no chains are provided
  - When chain verification fails for the current wallet chain

### Proper Configuration Examples

```tsx
import { DappUiProvider } from '@web3-blocks/dapp-ui';
import { mainnet, base, liskSepolia } from 'viem/chains';

function App() {
  return (
    <DappUiProvider
      network="ethereum"
      chains={[mainnet, base]} // At least one chain required
    >
      <YourApp />
    </DappUiProvider>
  );
}
```

```tsx
// Single-chain setup (recommended default mainnet)
<DappUiProvider network="ethereum" chains={[mainnet]}>
  <YourApp />
</DappUiProvider>
```

## Chain Verification Behavior

- Compares the user's current wallet chain to `chains` provided to the provider.
- Returns `true` only if the current chain matches one of the configured chains.
- Returns `false` when:
  - The current chain is not in the list
  - The current chain value is undefined or invalid
  - Formats differ (hex vs decimal) — normalization is applied before comparison
- Utilities:
  - `verifyChainMatch(currentChain, providerChains): boolean`
  - `normalizeChainId(chainId): number | null`
  - `isChainSupported(chainId, chains): boolean`

## Generated Network Types & Registry

- During build, a script scans `src/networks/*` and generates:
  - `src/core/networkIds.ts` — `export type NetworkId = '...'` and `NETWORK_IDS` array
  - `src/core/registry.ts` — `export const networkRegistry = { ... }` with dynamic imports
- This enables IDE autocompletion for `network`, and automatically incorporates new networks when contributors add folders.

### Add a New Network

1. Create a folder under `src/networks/<your-network>` with its implementation.
2. Run `npm run build` (or `npm run generate:networks`) to regenerate types and registry.
3. Use in provider: `network="<your-network>"`.

## Quality Assurance

- All network operations are compile-time checked via `NetworkId`.
- Clear error messages for unsupported networks through `network.error` and `getUnsupportedMessage()`.
- Type generation occurs only during build (`prebuild`), minimizing runtime overhead.
