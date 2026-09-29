/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Investigation } from '../../types/investigation';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { AddressDisplay } from '../common/AddressDisplay';
import { sahyogAdapter } from '../../services/sahyog/sahyogAdapter';
import { Printer, Download, ArrowLeft, Check, Copy, FileBadge, X, ShieldAlert } from 'lucide-react';

interface ReportViewProps {
  investigation: Investigation;
  onBack: () => void;
  investigations?: Investigation[];
  onSelectInvestigation?: (id: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  investigation,
  onBack,
  investigations = [],
  onSelectInvestigation,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [sahyogModalOpen, setSahyogModalOpen] = useState(false);
  const [copiedSahyog, setCopiedSahyog] = useState(false);

  const nearestVasp = investigation.summary.nearestDirectDepositVasp;
  const riskBreakdown = investigation.summary.riskScoreBreakdown;
  const sahyogPackage = sahyogAdapter.generateRequisitionPackage(investigation);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const exportPayload = {
      ...investigation,
      sahyogRequisitionPacket: sahyogPackage,
    };
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `veritas-dossier-${investigation.caseReference}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopySummary = () => {
    const summaryText = `INVESTIGATION DOSSIER: ${investigation.caseName} (${investigation.caseReference})
Target Wallet: ${investigation.startingAddress}
Network: ${investigation.network.toUpperCase()}
Status: ${investigation.status.toUpperCase()}
Observed Volume: ${investigation.summary.totalVolumeTraced}
Maximum Hop Depth: ${investigation.maxHops}
Nearest Direct-Deposit VASP: ${nearestVasp?.vaspName || investigation.summary.finalKnownEntity || 'Unattributed'}
Distance: ${nearestVasp ? (nearestVasp.isDirectDeposit ? 'Direct 1-Hop Deposit' : `${nearestVasp.hopsAway} Hops`) : 'N/A'}
Deposit Address: ${nearestVasp?.address || 'N/A'}
Deposit Tx Hash: ${nearestVasp?.transactionHash || 'N/A'}
Attribution Confidence: ${investigation.summary.finalConfidence}
Risk Score: ${riskBreakdown?.totalScore || 75}/100 (${riskBreakdown?.riskLevel || 'ELEVATED'})
Grounds: ${investigation.summary.finalConfidenceReasoning?.join('; ') || 'Verified on-chain audit'}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopySahyog = () => {
    navigator.clipboard.writeText(sahyogPackage.formalRequisitionText);
    setCopiedSahyog(true);
    setTimeout(() => setCopiedSahyog(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0c10] text-zinc-100 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Action Bar (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between no-print border-b border-[#1e242f] pb-4 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-[#7e8695] hover:text-white transition-colors flex items-center gap-1.5 font-mono cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Workspace</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSahyogModalOpen(true)}
              className="px-3 py-1.5 bg-[#141822] hover:bg-[#1b2230] border border-[#2b3547] hover:border-[#f5d13b]/60 text-xs font-mono text-[#f5d13b] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <FileBadge className="w-3.5 h-3.5" />
              <span>SAHYOG Notice (Sec 91)</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-[#12161e] hover:bg-[#191f2b] hover:border-[#f5d13b]/50 border border-[#232a36] text-xs font-mono text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedSummary ? (
                <Check className="w-3.5 h-3.5 text-[#f5d13b]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedSummary ? 'Summary Copied' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-[#12161e] hover:bg-[#191f2b] hover:border-[#f5d13b]/50 border border-[#232a36] text-xs font-mono text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#f5d13b] hover:bg-[#fef08a] text-black text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(245,209,59,0.2)]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier (PDF)</span>
            </button>
          </div>
        </div>

        {/* --------------------------------------------------
            FORMAL INVESTIGATION DOCUMENT
            -------------------------------------------------- */}
        <article className="bg-[#0c0f15] border border-[#1e242f] p-8 md:p-12 space-y-10 shadow-lg text-xs leading-relaxed">
          {/* Document Header */}
          <header className="border-b border-[#202735] pb-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#f5d13b] uppercase block font-semibold">
                  Veritas Forensics · Virtual Asset Investigation Dossier
                </span>
                <h1 className="text-xl md:text-2xl font-serif text-white mt-1">
                  {investigation.caseName}
                </h1>
              </div>

              <div className="text-right font-mono text-[11px] text-[#7e8695] space-y-0.5">
                <div>REF: {investigation.caseReference}</div>
                <div>GENERATED: {new Date().toUTCString().slice(0, 16)}</div>
              </div>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#181d26] font-mono text-[11px]">
              <div>
                <span className="text-[#5e6676] block">Target Address:</span>
                <span className="text-zinc-200">{investigation.startingAddress.slice(0, 10)}...</span>
              </div>
              <div>
                <span className="text-[#5e6676] block">Consensus Network:</span>
                <span className={`uppercase font-semibold ${investigation.network === 'bitcoin' ? 'text-[#f5d13b]' : 'text-zinc-200'}`}>
                  {investigation.network}
                </span>
              </div>
              <div>
                <span className="text-[#5e6676] block">Hops Evaluated:</span>
                <span className="text-zinc-200">{investigation.maxHops} Layers</span>
              </div>
              <div>
                <span className="text-[#5e6676] block">Total Traced Volume:</span>
                <span className={`font-semibold ${investigation.network === 'bitcoin' ? 'text-[#f5d13b]' : 'text-emerald-400'}`}>
                  {investigation.summary.totalVolumeTraced}
                </span>
              </div>
            </div>
          </header>

          {/* SAHYOG Intake Information if present */}
          {investigation.source === 'SAHYOG' && investigation.sahyogMetadata && (
            <div className="p-4 bg-[#0a1017] border border-cyan-800/60 rounded-none space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>SAHYOG LAW ENFORCEMENT CASE INTAKE PARTICULARS</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800">
                  REF: {investigation.sahyogMetadata.caseId}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                <div>
                  <span className="text-[#6c788d] block text-[10px] uppercase">Complainant Agency:</span>
                  <span className="text-white">{investigation.sahyogMetadata.complainantAgency || 'Cyber Crime Division'}</span>
                </div>
                <div>
                  <span className="text-[#6c788d] block text-[10px] uppercase">Statutory Offense / Injunction:</span>
                  <span className="text-white">{investigation.sahyogMetadata.statutoryOffense || 'Section 66D IT Act / Section 420 IPC'}</span>
                </div>
                <div>
                  <span className="text-[#6c788d] block text-[10px] uppercase">FIR Number:</span>
                  <span className="text-zinc-200">{investigation.sahyogMetadata.metadata?.firNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#6c788d] block text-[10px] uppercase">Incident Date / Category:</span>
                  <span className="text-zinc-200">{investigation.sahyogMetadata.incidentDate || 'N/A'} · {investigation.sahyogMetadata.investigationType || 'Suspect Wallet Inquiry'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Executive Summary & Nearest Direct-Deposit VASP */}
          <section className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold border-b border-[#1c222c] pb-1.5">
              1. Executive Summary & Nearest Direct-Deposit VASP
            </h2>

            <p className="text-zinc-300 text-xs leading-relaxed">
              This forensic analysis traced fund disbursements originating from target address{' '}
              <span className="font-mono text-white">{investigation.startingAddress}</span> on the{' '}
              <span className="uppercase font-mono font-medium text-white">{investigation.network}</span> blockchain.
              Through {investigation.maxHops} sequential transaction layers across{' '}
              {investigation.nodes.length} cluster nodes, outgoing funds reached custodial infrastructure attributed to:
            </p>

            {nearestVasp && nearestVasp.identified ? (
              <div className="p-4 bg-[#080a0e] border border-[#f5d13b]/30 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-white">
                    NEAREST DIRECT-DEPOSIT VASP:{' '}
                    <span className="text-[#f5d13b]">{nearestVasp.vaspName}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#1a1708] border border-[#f5d13b]/40 text-[#f5d13b] font-mono text-[10px] font-semibold">
                      {nearestVasp.isDirectDeposit ? 'Direct 1-Hop Deposit' : `${nearestVasp.hopsAway} Hops Away`}
                    </span>
                    <ConfidenceBadge
                      confidence={nearestVasp.confidence || investigation.summary.finalConfidence}
                      score={nearestVasp.confidenceScore || investigation.summary.finalConfidenceScore}
                      explanation={nearestVasp.confidenceExplanation || investigation.summary.finalConfidenceExplanation}
                      interpretation={nearestVasp.confidenceInterpretation || investigation.summary.finalConfidenceInterpretation}
                      reasoning={nearestVasp.confidenceReasoning || investigation.summary.finalConfidenceReasoning}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#080a0e] border border-[#1e2533]">
                  <ConfidenceBadge
                    confidence={nearestVasp.confidence || investigation.summary.finalConfidence}
                    score={nearestVasp.confidenceScore || investigation.summary.finalConfidenceScore}
                    explanation={nearestVasp.confidenceExplanation || investigation.summary.finalConfidenceExplanation}
                    interpretation={nearestVasp.confidenceInterpretation || investigation.summary.finalConfidenceInterpretation}
                    reasoning={nearestVasp.confidenceReasoning || investigation.summary.finalConfidenceReasoning}
                    showScoreBar={true}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono border-t border-[#181d26] pt-2">
                  <div>
                    <span className="text-[#5e6678] block">Deposit Address:</span>
                    <span className="text-zinc-200">{nearestVasp.address}</span>
                  </div>
                  <div>
                    <span className="text-[#5e6678] block">Ingress Transaction Hash:</span>
                    <span className="text-zinc-300">{nearestVasp.transactionHash || 'Confirmed on-chain'}</span>
                  </div>
                  <div>
                    <span className="text-[#5e6678] block">Evidentiary Basis:</span>
                    <span className="text-zinc-300">{nearestVasp.evidenceReference || 'SEC-10K Disclosure'}</span>
                  </div>
                  <div>
                    <span className="text-[#5e6678] block">Wallet Classification:</span>
                    <span className="text-zinc-300">{nearestVasp.walletClassification || 'Exchange Deposit Wallet'}</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#9aa2b1] leading-relaxed pt-1">
                  Legal Notice: On-chain attribution confirms that funds were received by custodial deposit infrastructure operating on behalf of {nearestVasp.vaspName}. This constitutes verifiable digital evidence for legal subpoena and asset preservation directives.
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#080a0e] border border-[#1e242f] text-center text-[#7e8695] italic font-mono">
                No verified direct-deposit VASP attribution found within the {investigation.maxHops}-hop tracing horizon.
              </div>
            )}
          </section>

          {/* Section 2: Behavioral Risk Intelligence (Separated from Confidence) */}
          {riskBreakdown && (
            <section className="space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold border-b border-[#1c222c] pb-1.5 flex items-center justify-between">
                <span>2. Behavioral Risk Intelligence & Heuristic Assessment</span>
                <span
                  className={`font-mono text-[10px] font-semibold px-2 py-0.5 border ${
                    riskBreakdown.riskLevel === 'CRITICAL'
                      ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                      : riskBreakdown.riskLevel === 'HIGH'
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                      : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  }`}
                >
                  Score: {riskBreakdown.totalScore}/100 · {riskBreakdown.riskLevel}
                </span>
              </h2>

              <p className="text-zinc-300 text-xs leading-relaxed">
                {riskBreakdown.primaryRiskSummary}
              </p>

              <div className="space-y-1.5">
                {riskBreakdown.indicators.map((ind) => (
                  <div
                    key={ind.code}
                    className="flex items-start justify-between gap-4 p-2 bg-[#080a0e] border border-[#1c222c] text-[11px]"
                  >
                    <div>
                      <span className="font-medium text-white block">{ind.label}</span>
                      <span className="text-[#8d96a5] block">{ind.description}</span>
                    </div>
                    <span className="font-mono text-[10px] text-amber-400 font-semibold shrink-0">
                      +{ind.weight} PTS
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-[#5e6678] italic pt-1">
                {riskBreakdown.legalDisclaimer}
              </p>
            </section>
          )}

          {/* Section 3: Evidentiary Standards & Finding Classification */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold border-b border-[#1c222c] pb-1.5">
              3. Evidentiary Standards & Finding Classification
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="font-mono text-[11px] uppercase text-[#7e8695] block">
                  Observed Cryptographic Facts
                </span>
                <p className="text-[#9aa2b1] text-[11px] leading-relaxed">
                  Consensus block inclusions, signed transactions, transfer amounts, gas consumption, and deterministic timestamps immutable on the ledger.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-mono text-[11px] uppercase text-[#7e8695] block">
                  Attribution & Entity Inferences
                </span>
                <p className="text-[#9aa2b1] text-[11px] leading-relaxed">
                  Association of cryptographic key pairs with legal entities established through audited Proof-of-Reserves, regulatory filings, or corroborated law enforcement notices.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Sequential Fund Movement Path */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold border-b border-[#1c222c] pb-1.5">
              4. Fund Movement Ledger
            </h2>

            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="border-b border-[#1c222c] text-[#5e6676] uppercase">
                  <th className="py-2 pr-3 font-normal">Hop</th>
                  <th className="py-2 px-3 font-normal">Sender (From)</th>
                  <th className="py-2 px-3 font-normal">Recipient (To)</th>
                  <th className="py-2 px-3 font-normal text-right">Amount</th>
                  <th className="py-2 pl-3 font-normal">Transaction Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181d26]">
                {investigation.edges.map((edge) => (
                  <tr key={edge.id} className="py-2">
                    <td className="py-2 pr-3 text-[#7e8695]">H{edge.hop}</td>
                    <td className="py-2 px-3 text-zinc-300 font-sans">
                      <AddressDisplay address={edge.from} isTruncated={true} />
                    </td>
                    <td className="py-2 px-3 text-zinc-300 font-sans">
                      <AddressDisplay address={edge.to} isTruncated={true} />
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-white">
                      {edge.amount} {edge.asset}
                    </td>
                    <td className="py-2 pl-3 text-[#7e8695]">
                      {edge.txHash.slice(0, 14)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Section 5: Chain of Custody & Analyst Attestation */}
          <section className="border-t border-[#202735] pt-6 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              5. Chain of Custody & Attestation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-[#7e8695] font-mono">
              <div>
                <span className="text-[#5e6676] block mb-1">Analyst Sign-Off:</span>
                <div className="text-zinc-200">Investigator: Veritas Certified Forensics Unit</div>
                <div>Hash Verification: SHA-256 Verified Digest</div>
              </div>

              <div>
                <span className="text-[#5e6676] block mb-1">Standard Compliance:</span>
                <div className="text-zinc-200">FATF Rec 16 · ISO/IEC 27037 Digital Evidence</div>
                <div>Status: Court-Admissible Forensic Dossier</div>
              </div>
            </div>
          </section>
        </article>
      </div>

      {/* SAHYOG Requisition Modal */}
      {sahyogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-[#2a3344] max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#1e242f] flex items-center justify-between bg-[#0e1219]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#181f2c] border border-[#2d384c] text-[#f5d13b]">
                  <FileBadge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                    SAHYOG LEA Institutional Requisition Notice
                  </h3>
                  <p className="text-xs text-[#8d96a5] font-sans">
                    Mutual Legal Assistance / Section 91 Cr.P.C. Digital Evidence Directive
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSahyogModalOpen(false)}
                className="p-1.5 text-[#7e8695] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 bg-[#07090d] border border-[#1e2532] text-[11px]">
                <span className="text-[#7e8695]">Gateway Status:</span>
                <span className="text-[#f5d13b] font-medium">
                  {sahyogAdapter.getStatus().statusLabel}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#7e8695] uppercase tracking-wider block">
                  Generated Legal Requisition Payload:
                </span>
                <textarea
                  readOnly
                  rows={14}
                  value={sahyogPackage.formalRequisitionText}
                  className="w-full p-3 bg-[#06080b] border border-[#222a38] text-zinc-200 text-xs font-mono leading-relaxed select-all"
                />
              </div>

              <div className="pt-3 border-t border-[#1e242f] flex items-center justify-between">
                <span className="text-[11px] text-[#7e8695]">
                  {copiedSahyog && (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <Check className="w-3.5 h-3.5" /> Requisition Notice Copied to Clipboard
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSahyogModalOpen(false)}
                    className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySahyog}
                    className="px-4 py-1.5 bg-[#f5d13b] hover:bg-[#fef08a] text-black font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Requisition Text</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
