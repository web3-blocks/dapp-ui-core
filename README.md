# @web3-blocks/dapp-ui

The **Universal and TypeScript-first Web3 abstraction layer** that provides a unified provider, modular network hooks, and chain-specific utilities for building decentralized applications. It powers the logic of <a href="https://dappui.vercel.app" target="_blank" rel="noopener noreferrer"><strong>dApp/ui</strong></a>, the component library built on top of <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer"><strong>shadcn/ui</strong></a> — but can be used independently.

## Installation

- Install with your package manager of choice (pnpm recommended):

```bash
pnpm add @web3-blocks/dapp-ui
```

## Getting Started

This section is documented on the website. Please refer to <a href="https://dappui.vercel.app/docs/installation" target="_blank" rel="noopener noreferrer"><strong>dApp/ui docs</strong></a> for application integration and usage examples.

## Contributing

This project is open-source and welcomes contributions. The system is type-first and relies on a small contract config per network. Below is the complete flow, detailed to help you succeed.

### Adding Networks

1. Create `src/networks/<network>/index.ts` (use lowercase for `<network>`, e.g., `ethereum`, `sui`).
2. Export `type ContractConfig` that describes that network’s contract shape.

```ts
// src/networks/ethereum/index.ts
import type { Chain, Abi } from "viem";

export type ContractConfig = {
  address: string; // EVM address for your contract
  abi: Abi; // ABI describing callable functions and events
  chains?: Chain[]; // Optional: supported chains (e.g., mainnet, sepolia)
};
```

```ts
// src/networks/sui/index.ts
export type ContractConfig = {
  packageId: string; // Sui package identifier
  moduleName: string; // Sui module name inside the package
};
```

### Type Generation (What Happens and Why)

- Run the generator:

```bash
pnpm run genotype
```

- Don't ask me why I called is `genotype` 😑
- The generator scans `src/networks`, validates folder names and ensures each network exports `type ContractConfig`.
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
  - Presence of `export type ContractConfig = ...` in each network’s `index.ts`.

### Troubleshooting

- Missing `index.ts` or missing `ContractConfig` export → add the file and export the type exactly as shown.
- Invalid folder name (uppercase or symbols) → rename the folder to lowercase letters only.
- TypeScript errors mentioning `NETWORK_CONTRACT_MAP[NETWORK_TYPES]` → ensure your `ContractConfig` matches the fields used by your provider and hooks.

## License

- MIT © <a href="https://x.com/dapp_ui" target="_blank" rel="noopener noreferrer"><strong>dApp/ui</strong></a>
