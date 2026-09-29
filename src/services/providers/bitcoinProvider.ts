/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlockchainProviderAdapter, NormalizedTransaction, ProviderQueryResult, ProviderQueryOptions } from './types';

export class BitcoinProviderAdapter implements BlockchainProviderAdapter {
  network = 'bitcoin' as const;
  name = 'Bitcoin Core UTXO Indexer (Mempool.space)';
  endpoint = 'https://mempool.space/api';
  status = 'ONLINE' as const;
  authRequired = false;
  indexerRequired = false;
  notes = 'Native Electrum/REST gateway for UTXO peeling chains, fees (sat/vB), and SegWit addresses.';

  validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    const trimmed = address.trim();
    // Bech32 / SegWit (bc1q, bc1p)
    if (/^bc1[a-z0-9]{25,65}$/i.test(trimmed)) return true;
    // P2SH (3...)
    if (/^3[a-km-zA-HJ-NP-Z1-9]{26,35}$/.test(trimmed)) return true;
    // Legacy P2PKH (1...)
    if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) return true;
    return false;
  }

  async fetchBalance(address: string): Promise<{ balance: string; asset: string }> {
    try {
      const res = await fetch(`https://mempool.space/api/address/${encodeURIComponent(address.trim())}`, {
        headers: { 'User-Agent': 'VeritasForensics/1.0' },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const funded = (data.chain_stats?.funded_txo_sum || 0) - (data.chain_stats?.spent_txo_sum || 0);
      const btc = (funded / 100000000).toFixed(4);
      return { balance: `${btc} BTC`, asset: 'BTC' };
    } catch {
      return { balance: '0.0000 BTC', asset: 'BTC' };
    }
  }

  async fetchTransactions(
    address: string,
    options?: ProviderQueryOptions
  ): Promise<NormalizedTransaction[]> {
    const res = await this.fetchTransactionsWithStatus(address, options);
    return res.transactions;
  }

  async fetchTransactionsWithStatus(
    address: string,
    options?: ProviderQueryOptions
  ): Promise<ProviderQueryResult> {
    const cleanAddress = address.trim();
    const limit = options?.maxTxs || 15;
    const direction = options?.direction || 'all';

    try {
      const res = await fetch(`https://mempool.space/api/address/${encodeURIComponent(cleanAddress)}/txs`, {
        headers: { 'User-Agent': 'VeritasForensics/1.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const txs = await res.json();

      if (!Array.isArray(txs)) {
        return {
          transactions: [],
          hasLiveIndexing: true,
          statusMessage: 'No transactions found on ledger for this address.',
        };
      }

      const normalized: NormalizedTransaction[] = [];

      for (const tx of txs) {
        // Find if target address is a sender in any input
        const isSender = tx.vin?.some(
          (vin: any) => vin.prevout?.scriptpubkey_address?.toLowerCase() === cleanAddress.toLowerCase()
        );

        // Direction filter
        if (direction === 'outgoing' && !isSender) continue;
        if (direction === 'incoming' && isSender) continue;

        let fromAddr = cleanAddress;
        let toAddr = 'Unparsed_Script_Output';
        let btcAmount = '0.0000';

        if (isSender) {
          // Outgoing: find recipient outputs (excluding change sent back to cleanAddress)
          const recipientOutputs = tx.vout?.filter(
            (vout: any) =>
              vout.scriptpubkey_address &&
              vout.scriptpubkey_address.toLowerCase() !== cleanAddress.toLowerCase()
          ) || [];

          // Sort by value descending so largest transfer is primary recipient
          recipientOutputs.sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

          const primaryRecipient = recipientOutputs[0] || tx.vout?.[0];
          toAddr = primaryRecipient?.scriptpubkey_address || 'Unparsed_Script_Output';
          const satoshis = primaryRecipient?.value || 0;
          btcAmount = (satoshis / 100000000).toFixed(4);
        } else {
          // Incoming: find sender from vin
          fromAddr = tx.vin?.[0]?.prevout?.scriptpubkey_address || 'Coinbase_Mining_Reward';
          toAddr = cleanAddress;
          // Find output destined to cleanAddress
          const selfOutput = tx.vout?.find(
            (vout: any) => vout.scriptpubkey_address?.toLowerCase() === cleanAddress.toLowerCase()
          );
          const satoshis = selfOutput?.value || tx.vout?.[0]?.value || 0;
          btcAmount = (satoshis / 100000000).toFixed(4);
        }

        const feeSat = tx.fee || 0;
        const feeBtc = (feeSat / 100000000).toFixed(6);

        normalized.push({
          hash: tx.txid,
          network: 'bitcoin',
          from: fromAddr,
          to: toAddr,
          amount: btcAmount,
          asset: 'BTC',
          timestamp: tx.status?.block_time
            ? new Date(tx.status.block_time * 1000).toISOString()
            : new Date().toISOString(),
          blockNumber: tx.status?.block_height || 0,
          status: tx.status?.confirmed ? 'confirmed' : 'pending',
          fee: `${feeBtc} BTC (${Math.round(feeSat / (tx.vsize || 140))} sat/vB)`,
        });

        if (normalized.length >= limit) break;
      }

      return {
        transactions: normalized,
        hasLiveIndexing: true,
        statusMessage: `Retrieved ${normalized.length} confirmed transactions via Mempool.space.`,
      };
    } catch (err: any) {
      console.warn(`[BitcoinProvider] Live query failed for ${cleanAddress}:`, err);
      return {
        transactions: [],
        hasLiveIndexing: false,
        statusMessage: `Live query failed: ${err?.message || 'Network error / rate limit'}.`,
      };
    }
  }
}
