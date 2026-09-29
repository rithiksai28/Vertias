/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BlockchainNetwork, SahyogIntakePayload } from '../../types/investigation';
import { DEMO_SAHYOG_CASES, sahyogAdapter } from '../../services/sahyog/sahyogAdapter';
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Server,
  FileBadge,
  CheckCircle2,
  Building2,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface StartInvestigationViewProps {
  onBack: () => void;
  onSubmit: (params: {
    caseName: string;
    caseReference: string;
    startingAddress: string;
    network: BlockchainNetwork;
    maxHops: number;
    mode: 'DEMO' | 'LIVE';
    timeRangePreset?: 'all' | '24h' | '7d' | '30d' | '90d';
    source?: 'MANUAL' | 'SAHYOG';
    sahyogMetadata?: SahyogIntakePayload;
  }) => void;
}

export const StartInvestigationView: React.FC<StartInvestigationViewProps> = ({
  onBack,
  onSubmit,
}) => {
  const [investigationSource, setInvestigationSource] = useState<'MANUAL' | 'SAHYOG'>('MANUAL');

  // Mode 1: Manual States
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<BlockchainNetwork>('ethereum');
  const [caseName, setCaseName] = useState('');
  const [caseReference, setCaseReference] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | '24h' | '7d' | '30d' | '90d'>('30d');
  const [maxHops, setMaxHops] = useState(4);
  const [mode, setMode] = useState<'DEMO' | 'LIVE'>('DEMO');

  // Mode 2: SAHYOG Intake States
  const [selectedSahyogCase, setSelectedSahyogCase] = useState<SahyogIntakePayload>(DEMO_SAHYOG_CASES[0]);
  const [sahyogMaxHops, setSahyogMaxHops] = useState(4);
  const [sahyogMode, setSahyogMode] = useState<'DEMO' | 'LIVE'>('DEMO');

  const sahyogStatus = sahyogAdapter.getStatus();

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    const finalCaseName = caseName.trim() || `Investigation ${address.slice(0, 8)}...`;
    const finalRef = caseReference.trim() || `CASE-2026-${Date.now().toString().slice(-4)}`;

    onSubmit({
      source: 'MANUAL',
      caseName: finalCaseName,
      caseReference: finalRef,
      startingAddress: address.trim(),
      network,
      maxHops,
      mode,
      timeRangePreset: timeRange,
    });
  };

  const handleSahyogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSahyogCase) return;

    const normalized = sahyogAdapter.normalizeSahyogIntake(selectedSahyogCase, {
      maxHops: sahyogMaxHops,
      mode: sahyogMode,
    });

    onSubmit({
      source: 'SAHYOG',
      caseName: normalized.caseName,
      caseReference: normalized.caseReference,
      startingAddress: normalized.startingAddress,
      network: normalized.network,
      maxHops: normalized.maxHops,
      mode: normalized.mode,
      timeRangePreset: '30d',
      sahyogMetadata: selectedSahyogCase,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Back Link */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-[#7e8695] hover:text-white transition-colors flex items-center gap-1.5 font-mono cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="border-b border-[#1e242f] pb-6 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-white">
            Start Investigation
          </h1>
          <p className="text-sm text-[#9aa2b1] leading-relaxed max-w-2xl">
            Initialize an investigation via direct wallet forensic analysis or import suspect intake records from the SAHYOG Law Enforcement Portal. Both paths route into the same consensus tracing and attribution pipeline.
          </p>
        </div>

        {/* =========================================================================
            INVESTIGATION MODE SELECTOR (MODE 1 VS MODE 2)
            ========================================================================= */}
        <div className="space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7e8695] font-medium block">
            Select Investigation Intake Mode
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode 1 Button */}
            <button
              type="button"
              onClick={() => setInvestigationSource('MANUAL')}
              className={`p-4 border text-left cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                investigationSource === 'MANUAL'
                  ? 'border-[#f5d13b] bg-[#1a1708] text-white shadow-[0_0_15px_rgba(245,209,59,0.12)]'
                  : 'border-[#1e242f] bg-[#0c0e12] text-[#7e8695] hover:border-[#2a3444] hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className={investigationSource === 'MANUAL' ? 'text-[#f5d13b]' : ''}>01</span>
                  <span>Manual Wallet Trace</span>
                </span>
                {investigationSource === 'MANUAL' && (
                  <span className="w-2 h-2 rounded-full bg-[#f5d13b]" />
                )}
              </div>
              <p className="text-xs text-[#9aa2b1] leading-normal font-sans">
                Directly investigate any suspect unhosted address across Bitcoin, Ethereum, TRON, or EVM chains.
              </p>
              <span className="text-[10px] font-mono text-[#f5d13b]">
                Standard Investigator Mode
              </span>
            </button>

            {/* Mode 2 Button */}
            <button
              type="button"
              onClick={() => setInvestigationSource('SAHYOG')}
              className={`p-4 border text-left cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                investigationSource === 'SAHYOG'
                  ? 'border-cyan-400 bg-cyan-950/20 text-white shadow-[0_0_15px_rgba(34,211,238,0.12)]'
                  : 'border-[#1e242f] bg-[#0c0e12] text-[#7e8695] hover:border-[#2a3444] hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className={investigationSource === 'SAHYOG' ? 'text-cyan-400' : ''}>02</span>
                  <span>SAHYOG Case Intake</span>
                </span>
                {investigationSource === 'SAHYOG' && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </div>
              <p className="text-xs text-[#9aa2b1] leading-normal font-sans">
                Import suspect wallet dossiers and FIR statutory references from the SAHYOG / I4C LEA integration portal.
              </p>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                <span>🛡️</span>
                <span>Law Enforcement Gateway</span>
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            MODE 1: MANUAL WALLET INVESTIGATION FORM
            ========================================================================= */}
        {investigationSource === 'MANUAL' && (
          <form onSubmit={handleManualSubmit} className="space-y-8 animate-in fade-in duration-200">
            {/* Primary Field: Wallet Address */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium block">
                  Target Cryptocurrency Address *
                </label>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-[#5e6676]">Quick Fill:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAddress('3J8zVhsHR9QsAz2zPZHZsebKC1MmZGxGaq');
                      setNetwork('bitcoin');
                      setCaseName('Operation Silk-Vector Bitcoin Ransomware');
                      setCaseReference('BTC-LEA-2026-8802');
                    }}
                    className="text-[#f5d13b] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <span>₿ Bitcoin Live</span>
                  </button>
                  <span className="text-[#3b4252]">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAddress('0x71C63B7282b0e6d6DE7d383921B0721Eb7118491');
                      setNetwork('ethereum');
                      setCaseName('Silver-Fox Ransomware Drainage');
                      setCaseReference('CRIM-2026-US-0842');
                    }}
                    className="text-[#9aa2b1] hover:text-white hover:underline cursor-pointer"
                  >
                    Ethereum Sample
                  </button>
                  <span className="text-[#3b4252]">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAddress('TNDrfcrC96gS4HhGj5oZ6Y7B5Kz9uFqJ2e');
                      setNetwork('tron');
                      setCaseName('Operation Cyber-Bridge TRON Laundering');
                      setCaseReference('TRX-LEA-2026-4491');
                    }}
                    className="text-cyan-400 hover:underline cursor-pointer"
                  >
                    TRON Sample
                  </button>
                </div>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. 3J8zVhs... (Bitcoin) or 0x71C6... (Ethereum) or TNDrfcr... (TRON)"
                value={address}
                onChange={(e) => {
                  const val = e.target.value;
                  setAddress(val);
                  const trimmed = val.trim();
                  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/i.test(trimmed)) {
                    setNetwork('bitcoin');
                  } else if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
                    setNetwork('tron');
                  } else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed) && !trimmed.startsWith('0x') && !trimmed.startsWith('bc1')) {
                    setNetwork('solana');
                  } else if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
                    if (network !== 'polygon' && network !== 'bsc') {
                      setNetwork('ethereum');
                    }
                  }
                }}
                className="w-full h-11 px-4 bg-[#0c0f14] border border-[#232a36] text-sm font-mono text-white placeholder-[#5e6676] focus:outline-none focus:border-[#f5d13b] transition-colors"
              />
              <p className="text-[11px] text-[#7e8695] font-mono">
                Target unhosted address to reconstruct multi-hop transaction flows and determine recipient VASP custody.
              </p>
            </div>

            {/* Secondary Field: Network */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium block">
                Blockchain Network *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'bitcoin', name: 'Bitcoin (BTC)', icon: '₿', status: 'Live Ready' },
                  { id: 'ethereum', name: 'Ethereum (ETH)', icon: 'Ξ', status: 'Live Ready' },
                  { id: 'tron', name: 'TRON (TRX)', icon: 'TRX', status: 'Adapter Ready' },
                  { id: 'bsc', name: 'BNB Chain (BSC)', icon: 'BNB', status: 'Live Ready' },
                  { id: 'solana', name: 'Solana (SOL)', icon: 'SOL', status: 'Standby RPC' },
                  { id: 'polygon', name: 'Polygon (POL)', icon: '⬡', status: 'Live Ready' },
                ].map((net) => {
                  const isSelected = network === net.id;
                  const isBtc = net.id === 'bitcoin';
                  return (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setNetwork(net.id as BlockchainNetwork)}
                      className={`h-12 px-3 border text-xs font-mono transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? isBtc
                            ? 'border-[#f5d13b] bg-[#1a1708] text-[#f5d13b] font-semibold shadow-[0_0_10px_rgba(245,209,59,0.15)]'
                            : 'border-white bg-[#141820] text-white font-medium'
                          : 'border-[#1e242f] bg-[#0c0e12] text-[#7e8695] hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5">
                          <span className={isBtc ? 'text-[#f5d13b] font-bold' : ''}>{net.icon}</span>
                          <span>{net.name}</span>
                        </span>
                        <span className="text-[9px] text-[#5e6676] mt-0.5">{net.status}</span>
                      </div>
                      {isSelected && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isBtc ? 'bg-[#f5d13b]' : 'bg-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Fields */}
            <div className="border-t border-[#1e242f] pt-6 space-y-6">
              <div className="text-xs font-mono uppercase tracking-wider text-[#5e6676]">
                Optional Case Parameters
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-300 font-medium block">
                    Case Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Operation Silver-Fox Drainage"
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0f1217] border border-[#232a36] text-xs text-white placeholder-[#5e6676] focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-zinc-300 font-medium block">
                    Reference ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CRIM-2026-US-0842"
                    value={caseReference}
                    onChange={(e) => setCaseReference(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0f1217] border border-[#232a36] text-xs font-mono text-white placeholder-[#5e6676] focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-300 font-medium block">
                    Time Range
                  </label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="w-full h-10 px-3 bg-[#0f1217] border border-[#232a36] text-xs text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="24h">Past 24 Hours</option>
                    <option value="7d">Past 7 Days</option>
                    <option value="30d">Past 30 Days (Recommended)</option>
                    <option value="90d">Past 90 Days</option>
                    <option value="all">All Available Ledger History</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-zinc-300 font-medium">
                      Maximum Hops: <span className="font-mono text-white">{maxHops} layers</span>
                    </label>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={maxHops}
                    onChange={(e) => setMaxHops(Number(e.target.value))}
                    className="w-full accent-[#f5d13b] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#7e8695]">
                    <span>1 Hop (Direct)</span>
                    <span className="text-[#f5d13b] font-medium">4 Hops (Standard)</span>
                    <span>6 Hops (Deep)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-300 font-medium block">
                  Execution Mode
                </label>
                <div className="flex border border-[#232a36] bg-[#0c0e12] w-fit">
                  <button
                    type="button"
                    onClick={() => setMode('DEMO')}
                    className={`px-4 py-2 text-xs font-mono transition-colors cursor-pointer ${
                      mode === 'DEMO'
                        ? 'bg-[#1a212e] text-[#f5d13b] font-semibold border-b border-[#f5d13b]'
                        : 'text-[#7e8695] hover:text-zinc-200'
                    }`}
                  >
                    Demo Mode (Verified Seeds)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('LIVE')}
                    className={`px-4 py-2 text-xs font-mono transition-colors cursor-pointer border-l border-[#232a36] ${
                      mode === 'LIVE'
                        ? 'bg-[#1a212e] text-[#f5d13b] font-semibold border-b border-[#f5d13b]'
                        : 'text-[#7e8695] hover:text-zinc-200'
                    }`}
                  >
                    Live Consensus RPC
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-[#1e242f] pt-6 flex justify-end">
              <button
                type="submit"
                disabled={!address.trim()}
                className="h-11 px-7 bg-[#f5d13b] hover:bg-[#fef08a] disabled:opacity-40 text-black font-semibold text-xs tracking-tight rounded-none transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,209,59,0.22)]"
              >
                <span>Initialize Investigation</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            MODE 2: SAHYOG INVESTIGATION INTAKE FORM
            ========================================================================= */}
        {investigationSource === 'SAHYOG' && (
          <form onSubmit={handleSahyogSubmit} className="space-y-8 animate-in fade-in duration-200">
            {/* SAHYOG Connection Status Banner */}
            <div className="p-4 bg-[#0d121c] border border-cyan-900/60 rounded-none space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-semibold text-cyan-300">
                    SAHYOG Official LEA Gateway Adapter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800">
                    {sahyogStatus.statusLabel}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#8e9ab0] leading-relaxed">
                Production connectivity requires agency-issued mTLS client credentials. Currently operating via the{' '}
                <span className="text-zinc-200 font-medium">Demo SAHYOG Case Connector</span> to simulate live intake of cyber crime and ransomware incident requisitions.
              </p>
            </div>

            {/* Select Intake Case */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium block">
                  Select Incident Case Dossier from SAHYOG Queue
                </label>
                <span className="text-[10px] font-mono text-cyan-400">
                  {DEMO_SAHYOG_CASES.length} Cases Available
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {DEMO_SAHYOG_CASES.map((sCase) => {
                  const isSelected = selectedSahyogCase.caseId === sCase.caseId;
                  return (
                    <button
                      key={sCase.caseId}
                      type="button"
                      onClick={() => setSelectedSahyogCase(sCase)}
                      className={`p-3.5 border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-[#0e1724] text-white shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                          : 'border-[#1e242f] bg-[#0c0e12] text-[#7e8695] hover:border-[#2a3444] hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileBadge className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-[#7e8695]'}`} />
                          <span className="font-mono text-xs font-semibold text-white">
                            {sCase.caseId}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                            DEMO SAHYOG CASE
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-[#8e9ab0] uppercase">
                          {sCase.network}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-300 mt-1 font-medium">
                        {sCase.investigationType}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#7e8695] font-mono mt-2">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-zinc-400" />
                          <span>{sCase.complainantAgency}</span>
                        </span>
                        <span>·</span>
                        <span className="text-[#a4afc1] truncate max-w-xs">
                          Suspect: {sCase.walletAddress}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Case Particulars Summary Card */}
            {selectedSahyogCase && (
              <div className="p-5 bg-[#0e131b] border border-[#232a36] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1b222f] pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs text-white font-semibold">
                      Normalized SAHYOG Intake Payload: {selectedSahyogCase.caseId}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-800/40">
                    Ready for Auto-Trace
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#7e8695] block text-[10px] uppercase">Suspect Wallet Address:</span>
                    <span className="text-white break-all font-semibold">
                      {selectedSahyogCase.walletAddress}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7e8695] block text-[10px] uppercase">Ledger Network:</span>
                    <span className="text-cyan-400 uppercase font-bold">
                      {selectedSahyogCase.network}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7e8695] block text-[10px] uppercase">Complainant Law Enforcement Agency:</span>
                    <span className="text-zinc-200">
                      {selectedSahyogCase.complainantAgency}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7e8695] block text-[10px] uppercase">FIR Number &amp; Statutory Offense:</span>
                    <span className="text-zinc-200">
                      {selectedSahyogCase.metadata?.firNumber} · {selectedSahyogCase.statutoryOffense}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1b222f] flex items-center gap-2 text-[11px] text-cyan-300/80 font-mono">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    No manual copy-pasting required. The common investigation engine will directly load this suspect wallet into the multi-hop forensic pipeline.
                  </span>
                </div>
              </div>
            )}

            {/* Tracing Depth & Mode Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-zinc-300 font-medium">
                    Max Tracing Depth: <span className="font-mono text-cyan-400">{sahyogMaxHops} layers</span>
                  </label>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={sahyogMaxHops}
                  onChange={(e) => setSahyogMaxHops(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#7e8695]">
                  <span>1 Hop (Direct)</span>
                  <span className="text-cyan-400 font-medium">4 Hops (Standard)</span>
                  <span>6 Hops (Deep)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-300 font-medium block">
                  Intake Tracing Engine Mode
                </label>
                <div className="flex border border-[#232a36] bg-[#0c0e12] w-fit">
                  <button
                    type="button"
                    onClick={() => setSahyogMode('DEMO')}
                    className={`px-4 py-2 text-xs font-mono transition-colors cursor-pointer ${
                      sahyogMode === 'DEMO'
                        ? 'bg-cyan-950/60 text-cyan-300 font-semibold border-b border-cyan-400'
                        : 'text-[#7e8695] hover:text-zinc-200'
                    }`}
                  >
                    Demo Dataset
                  </button>
                  <button
                    type="button"
                    onClick={() => setSahyogMode('LIVE')}
                    className={`px-4 py-2 text-xs font-mono transition-colors cursor-pointer border-l border-[#232a36] ${
                      sahyogMode === 'LIVE'
                        ? 'bg-cyan-950/60 text-cyan-300 font-semibold border-b border-cyan-400'
                        : 'text-[#7e8695] hover:text-zinc-200'
                    }`}
                  >
                    Live Consensus RPC
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="border-t border-[#1e242f] pt-6 flex justify-end">
              <button
                type="submit"
                className="h-11 px-7 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs tracking-tight rounded-none transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.25)]"
              >
                <span>Import &amp; Launch Common Investigation</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
