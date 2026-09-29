/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlockchainNetwork } from '../../types/investigation';

export interface NormalizedTransaction {
  hash: string;
  network: BlockchainNetwork;
  from: string;
  to: string;
  amount: string;
  asset: string;
  timestamp: string;
  blockNumber: number;
  status: 'confirmed' | 'pending' | 'failed';
  fee?: string;
  contractAddress?: string;
  tokenSymbol?: string;
  isContractCall?: boolean;
}

export type ProviderConnectionStatus = 'ONLINE' | 'STANDBY' | 'REQUIRES_CONFIG' | 'UNSUPPORTED';

export interface ProviderQueryResult {
  transactions: NormalizedTransaction[];
  hasLiveIndexing: boolean;
  statusMessage?: string;
  indexerRequired?: boolean;
}

export interface ProviderQueryOptions {
  maxTxs?: number;
  timeRangePreset?: string;
  direction?: 'outgoing' | 'incoming' | 'all';
}

export interface BlockchainProviderAdapter {
  network: BlockchainNetwork;
  name: string;
  endpoint: string;
  status: ProviderConnectionStatus;
  authRequired: boolean;
  notes: string;
  indexerRequired?: boolean;
  indexerConfigHelp?: string;
  validateAddress(address: string): boolean;
  fetchTransactions(
    address: string,
    options?: ProviderQueryOptions
  ): Promise<NormalizedTransaction[]>;
  fetchTransactionsWithStatus?(
    address: string,
    options?: ProviderQueryOptions
  ): Promise<ProviderQueryResult>;
  fetchBalance(address: string): Promise<{ balance: string; asset: string }>;
}
