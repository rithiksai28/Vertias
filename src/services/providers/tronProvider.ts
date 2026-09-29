/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlockchainProviderAdapter, NormalizedTransaction, ProviderQueryResult } from './types';

export class TronProviderAdapter implements BlockchainProviderAdapter {
  network = 'tron' as const;
  name = 'TRON Grid API Gateway';
  endpoint = 'https://api.trongrid.io';
  status = 'REQUIRES_CONFIG' as const;
  authRequired = true;
  indexerRequired = true;
  indexerConfigHelp = 'TronGrid API key (TRONGRID_API_KEY) required to query TRC-20 USDT and TRX ledger transactions.';
  notes = 'TRON protocol indexer for TRC-20 USDT and TRX flows. Requires TronGrid API key for live queries.';

  validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    // Standard TRON base58 address starting with T
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address.trim());
  }

  async fetchBalance(address: string): Promise<{ balance: string; asset: string }> {
    return { balance: '0.00 TRX', asset: 'TRX' };
  }

  async fetchTransactions(
    address: string,
    options?: { maxTxs?: number; timeRangePreset?: string }
  ): Promise<NormalizedTransaction[]> {
    const res = await this.fetchTransactionsWithStatus(address, options);
    return res.transactions;
  }

  async fetchTransactionsWithStatus(
    address: string,
    options?: { maxTxs?: number; timeRangePreset?: string }
  ): Promise<ProviderQueryResult> {
    return {
      transactions: [],
      hasLiveIndexing: false,
      indexerRequired: true,
      statusMessage: 'TRON live transaction history requires TRONGRID_API_KEY. Public gateway authentication is unconfigured.',
    };
  }
}
