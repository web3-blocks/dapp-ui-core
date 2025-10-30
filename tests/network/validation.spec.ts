import { describe, it, expect } from 'vitest';
import { isChainSupported } from '../../src/utils/typeGuards';
import type { Chain } from 'viem/chains';

const makeChain = (id: number, name: string): Chain => ({
  id,
  name,
  nativeCurrency: { name: 'Test', symbol: 'T', decimals: 18 },
  rpcUrls: { default: { http: ['http://localhost:8545'] }, public: { http: ['http://localhost:8545'] } },
});

describe('Network validation logic', () => {
  it('returns false when current chain is not in supported list', () => {
    const supported: Chain[] = [makeChain(4202, 'Lisk Sepolia'), makeChain(1135, 'Lisk')];
    const currentBaseId = 8453; // Base mainnet
    expect(isChainSupported(currentBaseId, supported)).toBe(false);
  });

  it('returns true when current chain is in supported list', () => {
    const supported: Chain[] = [makeChain(11155111, 'Sepolia')];
    const currentSepolia = 11155111;
    expect(isChainSupported(currentSepolia, supported)).toBe(true);
  });
});

