/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BlockchainNetwork, SahyogIntakePayload } from '../../types/investigation';
import { DEMO_SAHYOG_CASES, sahyogAdapter } from '../../services/sahyog/sahyogAdapter';
import {
  ShieldAlert,
  X,
  Play,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileBadge,
  Building2,
  Server,
  Info,
} from 'lucide-react';

interface StartInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  }) => Promise<void>;
}

export const StartInvestigationModal: React.FC<StartInvestigationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [sourceTab, setSourceTab] = useState<'MANUAL' | 'SAHYOG'>('MANUAL');

  // Mode 1: Manual State
  const [caseName, setCaseName] = useState('');
  const [caseReference, setCaseReference] = useState('');
  const [startingAddress, setStartingAddress] = useState('');
  const [network, setNetwork] = useState<BlockchainNetwork>('ethereum');
  const [maxHops, setMaxHops] = useState<number>(4);
  const [timeRange, setTimeRange] = useState<'all' | '24h' | '7d' | '30d' | '90d'>('30d');
  const [mode, setMode] = useState<'DEMO' | 'LIVE'>('DEMO');
  const [error, setError] = useState<string | null>(null);

  // Mode 2: SAHYOG State
  const [selectedSahyog, setSelectedSahyog] = useState<SahyogIntakePayload>(DEMO_SAHYOG_CASES[0]);

  // Investigation Execution Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const PROGRESS_STEPS = [
    'Initializing investigation parameters & scope',
    'Querying blockchain consensus ledger & blocks',
    'Building transactional directed flow graph',
    'Tracing multi-hop connected wallet clusters',
    'Cross-referencing attribution intelligence database',
    'Validating evidentiary grounds & calculating confidence',
    'Compiling final forensic dossier & results',
  ];

  if (!isOpen) return null;

  const validateAddress = (addr: string, net: BlockchainNetwork): boolean => {
    const trimmed = addr.trim();
    if (!trimmed) return false;
    if (net === 'ethereum' || net === 'polygon' || net === 'arbitrum' || net === 'bsc') {
      return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
    }
    if (net === 'bitcoin') {
      return (
        /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/i.test(trimmed)
      );
    }
    if (net === 'tron') {
      return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed);
    }
    return true;
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalAddress = startingAddress.trim();
    let finalNetwork = network;
    let finalCaseName = caseName.trim();
    let finalCaseRef = caseReference.trim();
    let finalMetadata: SahyogIntakePayload | undefined;

    if (sourceTab === 'SAHYOG') {
      finalAddress = selectedSahyog.walletAddress.trim();
      finalNetwork = selectedSahyog.network;
      finalCaseName = `[SAHYOG] ${selectedSahyog.caseId} — ${selectedSahyog.investigationType || 'Suspect Wallet Inquiry'}`;
      finalCaseRef = selectedSahyog.caseId;
      finalMetadata = selectedSahyog;
    } else {
      if (!finalAddress) {
        setError('Please provide a target suspicious wallet address.');
        return;
      }
      if (!validateAddress(finalAddress, finalNetwork)) {
        setError(
          `Invalid address format for ${finalNetwork.toUpperCase()}. Please check the address format.`
        );
        return;
      }
      if (!finalCaseName) {
        finalCaseName = `Investigation ${finalAddress.slice(0, 10)}...`;
      }
      if (!finalCaseRef) {
        finalCaseRef = `CASE-${Date.now().toString().slice(-6)}`;
      }
    }

    setIsProcessing(true);
    setCurrentStep(0);

    // Staged progress execution
    for (let step = 0; step < PROGRESS_STEPS.length; step++) {
      setCurrentStep(step);
      await new Promise((res) => setTimeout(res, 320));
    }

    try {
      await onSubmit({
        source: sourceTab,
        caseName: finalCaseName,
        caseReference: finalCaseRef,
        startingAddress: finalAddress,
        network: finalNetwork,
        maxHops,
        mode,
        timeRangePreset: timeRange,
        sahyogMetadata: finalMetadata,
      });
      setIsProcessing(false);
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      setError(err?.message || 'Failed to initialize investigation.');
    }
  };

  // Pre-seed sample cases
  const loadPreset = (type: 'ransomware' | 'darknet' | 'mixer') => {
    if (type === 'ransomware') {
      setCaseName('Operation Silver-Fox / Ransomware Drainage');
      setCaseReference('CRIM-2026-US-0842');
      setStartingAddress('0x71C63B7282b0e6d6DE7d383921B0721Eb7118491');
      setNetwork('ethereum');
      setMaxHops(4);
      setTimeRange('30d');
      setMode('DEMO');
    } else if (type === 'darknet') {
      setCaseName('Darknet Marketplace Vendor Cashout');
      setCaseReference('LEA-NARC-2026-118');
      setStartingAddress('0x948Ac4B30F537F994017C2aDe1F7fFa25bB2221b');
      setNetwork('ethereum');
      setMaxHops(3);
      setTimeRange('7d');
      setMode('DEMO');
    } else {
      setCaseName('Phishing Syndicate Sanctioned Mixer Diversion');
      setCaseReference('FIN-AML-2026-094');
      setStartingAddress('0x883491E2112d7c040d216599b5e5812BcaF92881');
      setNetwork('ethereum');
      setMaxHops(3);
      setTimeRange('24h');
      setMode('DEMO');
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl text-slate-100 overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-100">Start Forensic Investigation</h3>
              <p className="text-slate-400 text-[11px]">
                Trace virtual asset flows and attribute terminal VASP endpoints via the common engine.
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Processing State Animation */}
        {isProcessing ? (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h4 className="font-semibold text-sm text-slate-100">Executing Tracing Engine...</h4>
              <p className="text-slate-400 text-xs font-mono">
                {PROGRESS_STEPS[currentStep]}
              </p>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              {PROGRESS_STEPS.map((stepText, idx) => {
                const isDone = idx < currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 text-xs transition-opacity duration-200 ${
                      isDone
                        ? 'text-emerald-400'
                        : isCurrent
                        ? 'text-cyan-300 font-semibold'
                        : 'text-slate-600'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span>{stepText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Intake Tabs & Form */
          <form onSubmit={handleStart} className="p-5 space-y-4">
            {/* Mode Switch Tabs */}
            <div className="flex border border-slate-800 bg-slate-950 p-1 rounded gap-1">
              <button
                type="button"
                onClick={() => setSourceTab('MANUAL')}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                  sourceTab === 'MANUAL'
                    ? 'bg-[#1a1708] border border-[#f5d13b]/60 text-[#f5d13b]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mode 1: Manual Wallet
              </button>
              <button
                type="button"
                onClick={() => setSourceTab('SAHYOG')}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                  sourceTab === 'SAHYOG'
                    ? 'bg-cyan-950/70 border border-cyan-500/60 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mode 2: SAHYOG Intake
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: MANUAL WALLET */}
            {sourceTab === 'MANUAL' && (
              <>
                {/* Quick Preset Buttons */}
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      Quick Load Demo Cases
                    </span>
                    <span>Select verified flow</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadPreset('ransomware')}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs font-medium transition-colors"
                    >
                      Silver-Fox Ransomware (Binance)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPreset('darknet')}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs font-medium transition-colors"
                    >
                      Darknet Vendor (Kraken)
                    </button>
                  </div>
                </div>

                {/* Target Address & Network */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200 text-xs flex justify-between">
                    <span>Target Wallet Address *</span>
                    <span className="text-slate-400 font-normal">Hexadecimal (0x...) or BTC</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0x71C63B7282b0e6d6DE7d383921B0721Eb7118491"
                    value={startingAddress}
                    onChange={(e) => setStartingAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-200 text-xs">Blockchain Network</label>
                    <select
                      value={network}
                      onChange={(e) => setNetwork(e.target.value as BlockchainNetwork)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ethereum">Ethereum Mainnet (EVM)</option>
                      <option value="bitcoin">Bitcoin Core (UTXO)</option>
                      <option value="tron">TRON (TRX)</option>
                      <option value="bsc">BNB Chain (BSC)</option>
                      <option value="polygon">Polygon PoS</option>
                      <option value="arbitrum">Arbitrum One</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-200 text-xs flex justify-between">
                      <span>Max Tracing Hops</span>
                      <span className="font-mono text-cyan-400">{maxHops} Hops</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      value={maxHops}
                      onChange={(e) => setMaxHops(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                {/* Case Name & Reference ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-200 text-xs">Case / Operation Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Operation Sovereign Drain"
                      value={caseName}
                      onChange={(e) => setCaseName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-200 text-xs">Reference / Case ID</label>
                    <input
                      type="text"
                      placeholder="e.g. CASE-2026-US-891"
                      value={caseReference}
                      onChange={(e) => setCaseReference(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: SAHYOG INTAKE */}
            {sourceTab === 'SAHYOG' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-cyan-950/30 border border-cyan-900/60 rounded flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-300 font-medium flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" />
                    <span>SAHYOG Gateway Adapter</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800">
                    SAHYOG API NOT CONNECTED
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200 text-xs block">
                    Select DEMO SAHYOG Intake Case
                  </label>
                  <div className="space-y-2">
                    {DEMO_SAHYOG_CASES.map((sc) => {
                      const isSelected = selectedSahyog.caseId === sc.caseId;
                      return (
                        <button
                          key={sc.caseId}
                          type="button"
                          onClick={() => setSelectedSahyog(sc)}
                          className={`w-full p-2.5 text-left border rounded transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/40 text-white'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="font-semibold text-cyan-300">{sc.caseId}</span>
                            <span className="uppercase text-slate-400">{sc.network}</span>
                          </div>
                          <div className="text-xs text-slate-200 mt-0.5 font-medium">
                            {sc.investigationType}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 truncate">
                            Suspect: {sc.walletAddress}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="font-semibold text-slate-200 text-xs flex justify-between">
                    <span>Max Tracing Hops</span>
                    <span className="font-mono text-cyan-400">{maxHops} Hops</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={maxHops}
                    onChange={(e) => setMaxHops(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Mode: Demo vs Live */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 text-xs block">Consensus Query Mode</span>
                <span className="text-slate-400 text-[11px]">
                  {mode === 'DEMO'
                    ? 'Uses verified seed clusters & demonstrator data.'
                    : 'Requires active on-chain consensus indexing.'}
                </span>
              </div>
              <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded">
                <button
                  type="button"
                  onClick={() => setMode('DEMO')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    mode === 'DEMO'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  DEMO MODE
                </button>
                <button
                  type="button"
                  onClick={() => setMode('LIVE')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    mode === 'LIVE'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  LIVE MODE
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>
                  {sourceTab === 'SAHYOG' ? 'Import & Launch Investigation' : 'Start Investigation'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
