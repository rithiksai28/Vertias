/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Investigation,
  AttributionRecord,
  DataSourceStatus,
  BlockchainNetwork,
} from '../types/investigation';
import { forensicStorage } from './storage';
import { sahyogAdapter, SahyogRequisitionPacket } from './sahyog/sahyogAdapter';

export const apiClient = {
  async getInvestigations(): Promise<Investigation[]> {
    return forensicStorage.getInvestigations();
  },

  async getInvestigationById(id: string): Promise<Investigation | null> {
    return forensicStorage.getInvestigationById(id);
  },

  async createInvestigation(params: {
    caseName?: string;
    caseReference?: string;
    startingAddress: string;
    network: BlockchainNetwork;
    maxHops: number;
    mode: 'DEMO' | 'LIVE';
    timeRangePreset?: 'all' | '24h' | '7d' | '30d' | '90d';
    source?: 'MANUAL' | 'SAHYOG';
    sahyogMetadata?: any;
  }): Promise<Investigation> {
    return forensicStorage.createInvestigation(params);
  },

  async deleteInvestigation(id: string): Promise<void> {
    forensicStorage.deleteInvestigation(id);
  },

  async addNote(investigationId: string, text: string, author: string): Promise<void> {
    forensicStorage.addNote(investigationId, text, author);
  },

  async getAttributions(): Promise<AttributionRecord[]> {
    return forensicStorage.getAttributions();
  },

  async addAttribution(
    record: Omit<AttributionRecord, 'id' | 'firstVerified' | 'lastVerified'>
  ): Promise<AttributionRecord> {
    return forensicStorage.addAttribution(record);
  },

  async updateAttribution(
    id: string,
    updates: Partial<AttributionRecord>
  ): Promise<AttributionRecord | null> {
    return forensicStorage.updateAttribution(id, updates);
  },

  async getDataSources(): Promise<DataSourceStatus[]> {
    return forensicStorage.getDataSources();
  },

  generateSahyogRequisition(
    investigation: Investigation,
    requestType?: 'INFORMATION_DISCLOSURE' | 'ASSET_FREEZING_INJUNCTION'
  ): SahyogRequisitionPacket {
    return sahyogAdapter.generateRequisitionPackage(investigation, requestType);
  },

  getSahyogStatus() {
    return sahyogAdapter.getStatus();
  },

  resetDefaults(): void {
    forensicStorage.resetToDefaults();
  },
};

