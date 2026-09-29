/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BlockchainNetwork =
  | 'ethereum'
  | 'bitcoin'
  | 'tron'
  | 'bsc'
  | 'solana'
  | 'polygon'
  | 'arbitrum';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type AttributionStatus = 'known' | 'associated' | 'unidentified';

export type NodeRole = 'source' | 'intermediate' | 'destination' | 'mixer' | 'smart_contract';

export type InvestigationStatus = 'running' | 'completed' | 'requires_review' | 'archived';

export type EntityType = 
  | 'Virtual Asset Service (VASP)' 
  | 'Exchange' 
  | 'Custodian' 
  | 'Payment Service' 
  | 'Mixer / Privacy Protocol' 
  | 'DeFi Protocol' 
  | 'Sanctioned Entity' 
  | 'Merchant' 
  | 'Other Known Entity' 
  | 'Unknown';

export type WalletClassification =
  | 'Unknown / Unattributed'
  | 'Personal / Private Wallet'
  | 'Exchange Cluster'
  | 'Exchange Hot Wallet'
  | 'Exchange Deposit Wallet'
  | 'Custodial Wallet Service'
  | 'Mixer / Tumbler'
  | 'DeFi Bridge'
  | 'Cross-Chain Swap Service'
  | 'Other Known Service'
  | 'Known VASP';

export interface RiskIndicator {
  code: string;
  category:
    | 'MIXER_EXPOSURE'
    | 'RAPID_DISPERSION'
    | 'SANCTIONED_OFAC'
    | 'HIGH_VELOCITY'
    | 'CROSS_CHAIN_JUMP'
    | 'UNHOSTED_PEEL'
    | 'HIGH_VALUE_CONSOLIDATION';
  label: string;
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MEDIUM' | 'LOW';
  weight: number;
  description: string;
  evidenceTxHash?: string;
  hop?: number;
}

export interface RiskScoreBreakdown {
  totalScore: number; // 0 to 100
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW';
  primaryRiskSummary: string;
  indicators: RiskIndicator[];
  legalDisclaimer: string;
}

export interface ConfidenceScoreFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface ConfidenceScoreDetail {
  score: number; // 0 to 100
  level: ConfidenceLevel; // 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
  explanation: string;
  interpretation: string; // e.g. "Strong supporting evidence"
  factors: ConfidenceScoreFactor[];
}

export interface NearestVaspFinding {
  identified: boolean;
  vaspName?: string;
  vaspType?: EntityType;
  walletClassification?: WalletClassification;
  address?: string;
  hopsAway?: number;
  isDirectDeposit?: boolean; // true if direct 1-hop deposit
  confidence?: ConfidenceLevel;
  confidenceScore?: number; // 0 to 100 numeric score
  confidenceExplanation?: string;
  confidenceInterpretation?: string;
  confidenceReasoning?: string[];
  evidenceSource?: string;
  evidenceReference?: string;
  transactionHash?: string;
  amountReceived?: string;
  asset?: string;
  timestamp?: string;
}

export interface CrossChainTransfer {
  sourceNetwork: BlockchainNetwork;
  destinationNetwork: BlockchainNetwork;
  bridgeService: string;
  sourceTxHash: string;
  destinationTxHash?: string;
  status: 'CONFIRMED' | 'UNRESOLVED' | 'PENDING';
  amount: string;
  asset: string;
  confidence: ConfidenceLevel;
  evidence: string;
}

export interface WalletNode {
  id: string; // address
  address: string;
  network: BlockchainNetwork;
  label?: string;
  role: NodeRole;
  hop: number;
  attributionStatus: AttributionStatus;
  walletClassification?: WalletClassification;
  entityId?: string;
  entityName?: string;
  entityType?: EntityType;
  confidence?: ConfidenceLevel;
  confidenceScore?: number; // 0 to 100 numeric score
  confidenceExplanation?: string;
  confidenceInterpretation?: string;
  confidenceReasoning?: string[];
  riskScore?: number;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW';
  isDirectDepositVasp?: boolean;
  balance: string;
  asset: string;
  incomingVolume: string;
  outgoingVolume: string;
  txCount: number;
  firstSeen: string;
  lastSeen: string;
  isSuspicious?: boolean;
  notes?: string;
  x?: number;
  y?: number;
}

export interface TransactionEdge {
  id: string; // tx hash
  txHash: string;
  network: BlockchainNetwork;
  from: string;
  to: string;
  amount: string;
  asset: string;
  timestamp: string;
  hop: number;
  blockNumber: number;
  fee?: string;
  usdValueEstimate?: string;
  isPrimaryPath?: boolean;
  isCrossChain?: boolean;
  bridgeService?: string;
}

export interface VaspEntity {
  id: string;
  name: string;
  legalName?: string;
  jurisdiction: string;
  vaspCategory: 'Exchange' | 'Custodian' | 'P2P' | 'Payment Gateway' | 'Mixer' | 'DeFi Protocol';
  vaspRegistered: boolean;
  regulatoryIdentifier?: string;
  officialWebsite?: string;
}

export interface AttributionRecord {
  id: string;
  address: string;
  network: BlockchainNetwork;
  entityId: string;
  entityName: string;
  entityType: EntityType;
  associationType: 
    | 'Officially Published Address' 
    | 'Custodial Deposit Cluster' 
    | 'Hot Wallet Liquidity Pool' 
    | 'Smart Contract Router' 
    | 'Sanctioned Address Designated' 
    | 'Sub-Account Cluster' 
    | 'Heuristic Association';
  confidence: ConfidenceLevel;
  confidenceScore?: number; // 0 to 100 numeric score
  confidenceExplanation?: string;
  confidenceInterpretation?: string;
  confidenceReasoning: string[];
  status: 'active' | 'outdated' | 'under_review' | 'conflicting';
  firstVerified: string;
  lastVerified: string;
  notes: string;
  evidenceSource: string;
  evidenceReference: string;
  evidenceDate: string;
}

export interface EvidenceRecord {
  id: string;
  attributionId?: string;
  investigationId?: string;
  title: string;
  finding: string;
  evidenceType: 
    | 'Official Disclosure' 
    | 'Regulatory Public Filing' 
    | 'On-Chain Cryptographic Proof' 
    | 'Law Enforcement Notice' 
    | 'Verified Intelligence Record' 
    | 'Deposit Slip Cross-Match';
  source: string;
  sourceUrl?: string;
  reference: string;
  evidenceDate: string;
  confidence: ConfidenceLevel;
  verificationStatus: 'VERIFIED' | 'COMMUNITY_CONFIRMED' | 'PROVISIONAL';
  notes: string;
}

export interface InvestigationFinding {
  id: string;
  investigationId: string;
  type: 
    | 'PEELING_CHAIN' 
    | 'RAPID_DISPERSION' 
    | 'VASP_CASHOUT' 
    | 'MIXER_INVOLVEMENT' 
    | 'CIRCULAR_ROUTING' 
    | 'INTERMEDIATE_LAYER';
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'INFORMATIONAL';
  title: string;
  description: string;
  address?: string;
  hop?: number;
  confidence: ConfidenceLevel;
  supportingEvidence: string;
}

export interface InvestigationSummary {
  suspiciousAddress: string;
  network: BlockchainNetwork;
  totalTransactionsFound: number;
  walletsTracedCount: number;
  entitiesMatchedCount: number;
  unattributedCount?: number;
  finalKnownEntity?: string;
  finalConfidence: ConfidenceLevel;
  finalConfidenceScore?: number; // 0 to 100 numeric score
  finalConfidenceExplanation?: string;
  finalConfidenceInterpretation?: string;
  finalConfidenceReasoning: string[];
  nearestDirectDepositVasp?: NearestVaspFinding;
  riskScoreBreakdown?: RiskScoreBreakdown;
  crossChainTransfers?: CrossChainTransfer[];
  isDirectTransfer?: boolean;
  totalVolumeTraced: string;
  hopsExplored: number;
  primaryPath: string[]; // List of addresses from start to final VASP
}

export type InvestigationSource = 'MANUAL' | 'SAHYOG';

export interface SahyogIntakePayload {
  source: 'SAHYOG';
  caseId: string;
  walletAddress: string;
  network: BlockchainNetwork;
  investigationType?: string;
  complainantAgency?: string;
  incidentDate?: string;
  statutoryOffense?: string;
  metadata?: Record<string, any>;
  isDemo?: boolean;
}

export interface CommonInvestigationRequest {
  source: InvestigationSource;
  startingAddress: string;
  network: BlockchainNetwork;
  caseName: string;
  caseReference: string;
  maxHops: number;
  mode: 'DEMO' | 'LIVE';
  timeRangePreset?: 'all' | '24h' | '7d' | '30d' | '90d';
  sahyogMetadata?: SahyogIntakePayload;
}

export interface Investigation {
  id: string;
  caseName: string;
  caseReference: string;
  startingAddress: string;
  network: BlockchainNetwork;
  status: InvestigationStatus;
  maxHops: number;
  mode: 'DEMO' | 'LIVE';
  dataMode?: 'LIVE' | 'DEMO';
  source?: InvestigationSource;
  sahyogMetadata?: SahyogIntakePayload;
  tracingDiagnostic?: string;
  timeRangePreset?: 'all' | '24h' | '7d' | '30d' | '90d';
  notes: Array<{
    id: string;
    author: string;
    timestamp: string;
    text: string;
  }>;
  createdAt: string;
  updatedAt: string;
  summary: InvestigationSummary;
  nodes: WalletNode[];
  edges: TransactionEdge[];
  findings: InvestigationFinding[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  investigationId: string;
  actor: string;
  action: string;
  details: string;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  category: 'Blockchain Data' | 'Attribution Data' | 'External Intelligence';
  type: string;
  status: 'ONLINE' | 'STANDBY' | 'REQUIRES_CONFIG' | 'MOCK_ADAPTER';
  lastChecked: string;
  endpoint: string;
  authRequired: boolean;
  notes: string;
}
