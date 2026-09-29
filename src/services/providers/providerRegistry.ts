/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlockchainNetwork } from '../../types/investigation';
import { BlockchainProviderAdapter, NormalizedTransaction, ProviderQueryResult, ProviderQueryOptions } from './types';
import { BitcoinProviderAdapter } from './bitcoinProvider';
import { EthereumProviderAdapter } from './ethereumProvider';
import { TronProviderAdapter } from './tronProvider';
import { SolanaProviderAdapter } from './solanaProvider';
import { BscProviderAdapter } from './bscProvider';
import { PolygonProviderAdapter } from './polygonProvider';

export class BlockchainProviderRegistry {
  private adapters: Map<BlockchainNetwork, BlockchainProviderAdapter> = new Map();

  constructor() {
    this.register(new BitcoinProviderAdapter());
    this.register(new EthereumProviderAdapter());
    this.register(new TronProviderAdapter());
    this.register(new SolanaProviderAdapter());
    this.register(new BscProviderAdapter());
    this.register(new PolygonProviderAdapter());
  }

  public register(adapter: BlockchainProviderAdapter) {
    this.adapters.set(adapter.network, adapter);
  }

  public getAdapter(network: BlockchainNetwork): BlockchainProviderAdapter | undefined {
    return this.adapters.get(network);
  }

  public getAllAdapters(): BlockchainProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  public validateAddress(network: BlockchainNetwork, address: string): boolean {
    const adapter = this.adapters.get(network);
    return adapter ? adapter.validateAddress(address) : false;
  }

  public detectNetworkFromAddress(address: string): BlockchainNetwork | null {
    const trimmed = address.trim();
    if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/i.test(trimmed)) {
      return 'bitcoin';
    }
    if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
      return 'tron';
    }
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed) && !trimmed.startsWith('0x') && !trimmed.startsWith('bc1')) {
      return 'solana';
    }
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return 'ethereum';
    }
    return null;
  }

  public async fetchTransactions(
    network: BlockchainNetwork,
    address: string,
    options?: ProviderQueryOptions
  ): Promise<NormalizedTransaction[]> {
    const adapter = this.adapters.get(network);
    if (!adapter) return [];
    return adapter.fetchTransactions(address, options);
  }

  public async fetchTransactionsWithStatus(
    network: BlockchainNetwork,
    address: string,
    options?: ProviderQueryOptions
  ): Promise<ProviderQueryResult> {
    const adapter = this.adapters.get(network);
    if (!adapter) {
      return {
        transactions: [],
        hasLiveIndexing: false,
        statusMessage: `No adapter registered for network ${network}`,
      };
    }
    if (adapter.fetchTransactionsWithStatus) {
      return adapter.fetchTransactionsWithStatus(address, options);
    }
    const txs = await adapter.fetchTransactions(address, options);
    return {
      transactions: txs,
      hasLiveIndexing: txs.length > 0,
      statusMessage: txs.length > 0 ? `Retrieved ${txs.length} transactions.` : 'No transactions returned.',
    };
  }

  public async fetchBalance(
    network: BlockchainNetwork,
    address: string
  ): Promise<{ balance: string; asset: string }> {
    const adapter = this.adapters.get(network);
    if (!adapter) return { balance: '0.00', asset: network.toUpperCase() };
    return adapter.fetchBalance(address);
  }
}

export const providerRegistry = new BlockchainProviderRegistry();
