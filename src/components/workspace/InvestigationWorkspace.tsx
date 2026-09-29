/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Investigation,
  WalletNode,
  TransactionEdge,
} from '../../types/investigation';
import { FundFlowGraph } from './FundFlowGraph';
import { NodeDetailPanel } from './NodeDetailPanel';
import { EdgeDetailPanel } from './EdgeDetailPanel';
import { TransactionTable } from './TransactionTable';
import { TimelineView } from './TimelineView';
import { FindingsEvidenceView } from './FindingsEvidenceView';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { ArrowRight, Share2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface InvestigationWorkspaceProps {
  investigation: Investigation;
  onExportReport: () => void;
  onAddNote: (text: string, author: string) => void;
  onOpenAttributionModal: (address?: string) => void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  investigation,
  onExportReport,
  onAddNote,
  onOpenAttributionModal,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    investigation.nodes[0]?.id || null
  );
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<
    'transactions' | 'evidence' | 'timeline' | 'notes'
  >('transactions');
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedNode =
    investigation.nodes.find(
      (n) => n.id.toLowerCase() === (selectedNodeId || '').toLowerCase()
    ) || null;

  const selectedEdge =
    investigation.edges.find((e) => e.id === selectedEdgeId) || null;

  const handleSelectNode = (node: WalletNode) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  };

  const handleSelectEdge = (edge: TransactionEdge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  };

  const handleSelectAddress = (address: string) => {
    const node = investigation.nodes.find(
      (n) => n.address.toLowerCase() === address.toLowerCase()
    );
    if (node) {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const summary = investigation.summary;
  const terminalEntity = summary.finalKnownEntity || 'Unattributed Service';

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0c10] text-zinc-100 overflow-hidden font-sans">
      {/* --------------------------------------------------
          1. HEADER (Compact, dignified, restrained)
          -------------------------------------------------- */}
      <div className="px-6 py-3 bg-[#0d1015] border-b border-[#1c222c] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              {investigation.network === 'bitcoin' && (
                <span className="w-5 h-5 bg-[#f5d13b] text-black font-mono font-bold flex items-center justify-center text-xs shadow-[0_0_8px_rgba(245,209,59,0.3)]">
                  ₿
                </span>
              )}
              <h2 className="text-base font-normal tracking-tight text-white font-serif">
                {investigation.caseName}
              </h2>
              {investigation.mode === 'DEMO' && (
                <span className="font-mono text-[10px] text-amber-400 bg-amber-950/30 px-1.5 py-0.5 border border-amber-900/40">
                  DEMO DATASET
                </span>
              )}
              {investigation.mode === 'LIVE' && (
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 border border-emerald-900/40">
                  LIVE ON-CHAIN
                </span>
              )}
              {investigation.source === 'SAHYOG' && (
                <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/50 px-2 py-0.5 border border-cyan-800/70 flex items-center gap-1">
                  <span>🛡️</span>
                  <span>{investigation.sahyogMetadata?.isDemo ? 'DEMO SAHYOG INTAKE' : 'SAHYOG CASE'}</span>
                  {investigation.sahyogMetadata?.metadata?.firNumber && (
                    <span className="text-zinc-400 hidden sm:inline">({investigation.sahyogMetadata.metadata.firNumber})</span>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#7e8695] font-mono mt-0.5">
              <span>{investigation.caseReference}</span>
              <span>·</span>
              {investigation.network === 'bitcoin' ? (
                <span className="text-[#f5d13b] font-medium uppercase">Bitcoin Core Mainnet</span>
              ) : (
                <span className="uppercase">{investigation.network}</span>
              )}
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-sans capitalize">{investigation.status.replace('_', ' ')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="text-xs text-[#7e8695] hover:text-[#f5d13b] transition-colors cursor-pointer flex items-center gap-1.5 font-mono"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={onExportReport}
            className="h-8 px-3.5 bg-[#f5d13b] hover:bg-[#fef08a] text-black font-semibold text-xs tracking-tight rounded-none transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(245,209,59,0.2)]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------
          2. KEY FINDING (Strong, restrained typographic emphasis)
          -------------------------------------------------- */}
      <div className="px-6 py-3 bg-[#080a0e] border-b border-[#1c222c] shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#f5d13b] block font-medium">
              Attribution Verdict
            </span>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-semibold text-white">
                ASSOCIATED SERVICE: <span className="text-[#f5d13b]">{terminalEntity}</span>
              </span>
              {summary.nearestDirectDepositVasp?.identified && (
                <span className="text-xs font-mono text-[#f5d13b] px-1.5 py-0.5 bg-[#f5d13b]/10 border border-[#f5d13b]/30">
                  Nearest VASP: {summary.nearestDirectDepositVasp.vaspName} ({summary.nearestDirectDepositVasp.isDirectDeposit ? 'Direct 1-Hop' : `${summary.nearestDirectDepositVasp.hopsAway} Hops`})
                </span>
              )}
              <span className="text-xs text-[#9aa2b1]">
                {summary.totalVolumeTraced} across {summary.hopsExplored} hops.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0">
            {summary.riskScoreBreakdown && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#7e8695]">Risk:</span>
                <span
                  className={`font-mono text-[10px] font-semibold px-2 py-0.5 border ${
                    summary.riskScoreBreakdown.riskLevel === 'CRITICAL'
                      ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                      : summary.riskScoreBreakdown.riskLevel === 'HIGH'
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                      : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  }`}
                >
                  {summary.riskScoreBreakdown.riskLevel} ({summary.riskScoreBreakdown.totalScore}/100)
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <ConfidenceBadge
                confidence={summary.finalConfidence}
                score={summary.finalConfidenceScore}
                explanation={summary.finalConfidenceExplanation}
                interpretation={summary.finalConfidenceInterpretation}
                reasoning={summary.finalConfidenceReasoning}
                size="sm"
                showFullText={true}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveBottomTab('evidence');
                setIsBottomCollapsed(false);
              }}
              className="text-xs text-[#f5d13b] hover:text-[#fef08a] transition-colors underline-offset-2 hover:underline flex items-center gap-1 cursor-pointer font-medium font-mono"
            >
              <span>View evidence</span>
              <ArrowRight className="w-3 h-3 text-[#f5d13b]" />
            </button>
          </div>
        </div>

        {/* Tracing Diagnostic & SAHYOG Intake Particulars Bar */}
        {(investigation.tracingDiagnostic || (investigation.source === 'SAHYOG' && investigation.sahyogMetadata)) && (
          <div className="mt-2.5 pt-2 border-t border-[#181d26] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            {investigation.source === 'SAHYOG' && investigation.sahyogMetadata && (
              <div className="flex items-center gap-2 text-cyan-300/90">
                <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 border border-cyan-800/60">
                  SAHYOG INTAKE
                </span>
                <span>Agency: {investigation.sahyogMetadata.complainantAgency || 'Cyber Crime Division'}</span>
                <span>·</span>
                <span>Offense: {investigation.sahyogMetadata.statutoryOffense || 'IT Act / IPC'}</span>
              </div>
            )}
            {investigation.tracingDiagnostic && (
              <div className="flex items-center gap-2 text-amber-300/90">
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.2 border border-amber-800/60">
                  LEDGER STATUS
                </span>
                <span>{investigation.tracingDiagnostic}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --------------------------------------------------
          3. MAIN INVESTIGATION AREA
          Left: Fund Flow Graph (Centerpiece)
          Right: Restrained Inspector Panel
          -------------------------------------------------- */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Visual Centerpiece: Fund Flow */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Section Header directly above graph */}
          <div className="px-6 py-2 bg-[#0c0e12] border-b border-[#1c222c] flex items-baseline justify-between shrink-0">
            <div>
              <span className="text-xs font-semibold tracking-wide text-zinc-200 uppercase font-mono">
                Fund Flow
              </span>
              <span className="text-[11px] text-[#7e8695] ml-2 font-mono">
                Movement of funds from {summary.suspiciousAddress.slice(0, 8)}... ({summary.totalVolumeTraced} across {investigation.maxHops} hops)
              </span>
            </div>
          </div>

          <div className="flex-1 h-full min-h-[300px] relative">
            <FundFlowGraph
              nodes={investigation.nodes}
              edges={investigation.edges}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              onSelectNode={handleSelectNode}
              onSelectEdge={handleSelectEdge}
              primaryPath={summary.primaryPath}
            />
          </div>
        </div>

        {/* Right-Side Details Panel */}
        <div className="w-full md:w-80 lg:w-92 shrink-0 h-64 md:h-full border-t md:border-t-0 md:border-l border-[#1c222c]">
          {selectedEdge ? (
            <EdgeDetailPanel
              edge={selectedEdge}
              onClose={() => setSelectedEdgeId(null)}
              onSelectAddress={handleSelectAddress}
            />
          ) : (
            <NodeDetailPanel
              node={selectedNode}
              edges={investigation.edges}
              onClose={() => setSelectedNodeId(null)}
              onSelectAddress={handleSelectAddress}
              onOpenAttributionModal={onOpenAttributionModal}
            />
          )}
        </div>
      </div>

      {/* --------------------------------------------------
          4. LOWER RESEARCH AREA (Detailed Transactions, Evidence, Timeline)
          -------------------------------------------------- */}
      <div
        className={`bg-[#0a0c10] border-t border-[#1c222c] flex flex-col shrink-0 transition-all duration-200 ${
          isBottomCollapsed ? 'h-9' : 'h-64 sm:h-72'
        }`}
      >
        {/* Clean tab strip with subtle rules */}
        <div className="flex items-center justify-between px-6 bg-[#0c0f15] border-b border-[#1c222c] h-9 shrink-0 text-xs font-mono">
          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                setActiveBottomTab('transactions');
                setIsBottomCollapsed(false);
              }}
              className={`py-1.5 transition-colors cursor-pointer border-b-2 ${
                activeBottomTab === 'transactions' && !isBottomCollapsed
                  ? 'border-[#f5d13b] text-[#f5d13b] font-semibold'
                  : 'border-transparent text-[#7e8695] hover:text-zinc-300'
              }`}
            >
              Transactions ({investigation.edges.length})
            </button>

            <button
              onClick={() => {
                setActiveBottomTab('evidence');
                setIsBottomCollapsed(false);
              }}
              className={`py-1.5 transition-colors cursor-pointer border-b-2 ${
                activeBottomTab === 'evidence' && !isBottomCollapsed
                  ? 'border-[#f5d13b] text-[#f5d13b] font-semibold'
                  : 'border-transparent text-[#7e8695] hover:text-zinc-300'
              }`}
            >
              Attribution Evidence
            </button>

            <button
              onClick={() => {
                setActiveBottomTab('timeline');
                setIsBottomCollapsed(false);
              }}
              className={`py-1.5 transition-colors cursor-pointer border-b-2 ${
                activeBottomTab === 'timeline' && !isBottomCollapsed
                  ? 'border-[#f5d13b] text-[#f5d13b] font-semibold'
                  : 'border-transparent text-[#7e8695] hover:text-zinc-300'
              }`}
            >
              Chronological Timeline
            </button>

            <button
              onClick={() => {
                setActiveBottomTab('notes');
                setIsBottomCollapsed(false);
              }}
              className={`py-1.5 transition-colors cursor-pointer border-b-2 ${
                activeBottomTab === 'notes' && !isBottomCollapsed
                  ? 'border-[#f5d13b] text-[#f5d13b] font-semibold'
                  : 'border-transparent text-[#7e8695] hover:text-zinc-300'
              }`}
            >
              Notes ({investigation.notes.length})
            </button>
          </div>

          <button
            onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
            className="text-[#7e8695] hover:text-[#f5d13b] p-0.5 cursor-pointer transition-colors"
            title={isBottomCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            {isBottomCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Tab Body */}
        {!isBottomCollapsed && (
          <div className="flex-1 overflow-hidden">
            {activeBottomTab === 'transactions' && (
              <TransactionTable
                edges={investigation.edges}
                selectedEdgeId={selectedEdgeId}
                onSelectEdge={handleSelectEdge}
                onSelectAddress={handleSelectAddress}
              />
            )}

            {activeBottomTab === 'evidence' && (
              <FindingsEvidenceView
                findings={investigation.findings}
                evidence={[]}
                nodes={investigation.nodes}
                nearestVasp={investigation.summary.nearestDirectDepositVasp}
                riskBreakdown={investigation.summary.riskScoreBreakdown}
                onSelectAddress={handleSelectAddress}
              />
            )}

            {activeBottomTab === 'timeline' && (
              <TimelineView
                edges={investigation.edges}
                nodes={investigation.nodes}
                onSelectAddress={handleSelectAddress}
                onSelectEdge={handleSelectEdge}
              />
            )}

            {activeBottomTab === 'notes' && (
              <div className="h-full p-6 overflow-y-auto bg-[#0a0c10] text-xs max-w-3xl space-y-4">
                <div className="border-b border-[#1e242f] pb-2">
                  <span className="font-mono text-xs text-zinc-300 uppercase block">
                    Investigative Case Notes
                  </span>
                </div>

                <div className="space-y-3">
                  {investigation.notes.map((n) => (
                    <div key={n.id} className="py-2 border-b border-[#181d26] space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-[#7e8695]">
                        <span className="text-zinc-300 font-medium">{n.author}</span>
                        <span>{new Date(n.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-zinc-300 text-xs leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
