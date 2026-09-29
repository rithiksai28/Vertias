/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Investigation,
  AttributionRecord,
  DataSourceStatus,
  BlockchainNetwork,
} from './types/investigation';
import { apiClient } from './services/api';
import { DashboardView } from './components/dashboard/DashboardView';
import { StartInvestigationView } from './components/investigation-setup/StartInvestigationView';
import { InvestigationWorkspace } from './components/workspace/InvestigationWorkspace';
import { AttributionDatabaseView } from './components/attribution/AttributionDatabaseView';
import { HistoryView } from './components/history/HistoryView';
import { ReportView } from './components/reports/ReportView';
import { DataSourcesView } from './components/datasources/DataSourcesView';
import {
  Menu,
  X,
  LayoutDashboard,
  FolderGit2,
  GitFork,
  Database,
  FileText,
  Server,
  Plus,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

type SectionKey = 'overview' | 'investigations' | 'workspace' | 'start' | 'attribution' | 'reports' | 'datasources';

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [activeInvestigationId, setActiveInvestigationId] = useState<string | null>(null);
  const [attributions, setAttributions] = useState<AttributionRecord[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([]);
  const [reportInvestigation, setReportInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [invs, attrs, sources] = await Promise.all([
          apiClient.getInvestigations(),
          apiClient.getAttributions(),
          apiClient.getDataSources(),
        ]);
        setInvestigations(invs);
        setAttributions(attrs);
        setDataSources(sources);
        if (invs.length > 0 && !activeInvestigationId) {
          setActiveInvestigationId(invs[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeInvestigation =
    investigations.find((i) => i.id === activeInvestigationId) ||
    investigations[0] ||
    null;

  // Handlers
  const handleOpenInvestigation = (id: string) => {
    setActiveInvestigationId(id);
    setActiveSection('workspace');
  };

  const handleQuickStart = async (
    address: string,
    network: BlockchainNetwork
  ) => {
    const inv = await apiClient.createInvestigation({
      caseName: `Investigation ${address.slice(0, 8)}...`,
      caseReference: `CASE-2026-${Date.now().toString().slice(-4)}`,
      startingAddress: address,
      network,
      maxHops: 4,
      mode: 'DEMO',
      timeRangePreset: '30d',
    });
    setInvestigations((prev) => [inv, ...prev]);
    setActiveInvestigationId(inv.id);
    setActiveSection('workspace');
  };

  const handleCreateInvestigation = async (params: {
    caseName: string;
    caseReference: string;
    startingAddress: string;
    network: BlockchainNetwork;
    maxHops: number;
    mode: 'DEMO' | 'LIVE';
    timeRangePreset?: 'all' | '24h' | '7d' | '30d' | '90d';
    source?: 'MANUAL' | 'SAHYOG';
    sahyogMetadata?: any;
  }) => {
    const inv = await apiClient.createInvestigation(params);
    setInvestigations((prev) => [inv, ...prev]);
    setActiveInvestigationId(inv.id);
    setActiveSection('workspace');
  };

  const handleDuplicateInvestigation = async (inv: Investigation) => {
    const duplicate = await apiClient.createInvestigation({
      caseName: `${inv.caseName} (Copy)`,
      caseReference: `CASE-DUP-${Date.now().toString().slice(-4)}`,
      startingAddress: inv.startingAddress,
      network: inv.network,
      maxHops: inv.maxHops,
      mode: inv.mode,
    });
    setInvestigations((prev) => [duplicate, ...prev]);
    setActiveInvestigationId(duplicate.id);
    setActiveSection('workspace');
  };

  const handleDeleteInvestigation = async (id: string) => {
    await apiClient.deleteInvestigation(id);
    setInvestigations((prev) => prev.filter((i) => i.id !== id));
    if (activeInvestigationId === id) {
      const remaining = investigations.filter((i) => i.id !== id);
      setActiveInvestigationId(remaining[0]?.id || null);
      if (remaining.length === 0) setActiveSection('overview');
    }
  };

  const handleAddNote = async (text: string, author: string) => {
    if (!activeInvestigation) return;
    await apiClient.addNote(activeInvestigation.id, text, author);
    const updated = await apiClient.getInvestigationById(activeInvestigation.id);
    if (updated) {
      setInvestigations((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i))
      );
    }
  };

  const handleAddAttribution = async (
    record: Omit<AttributionRecord, 'id' | 'firstVerified' | 'lastVerified'>
  ) => {
    const newRecord = await apiClient.addAttribution(record);
    setAttributions((prev) => [newRecord, ...prev]);
  };

  const handleUpdateAttribution = async (
    id: string,
    updates: Partial<AttributionRecord>
  ) => {
    const updated = await apiClient.updateAttribution(id, updates);
    if (updated) {
      setAttributions((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
    }
  };

  const handleGenerateReport = (inv?: Investigation) => {
    const target = inv || activeInvestigation;
    if (target) {
      setReportInvestigation(target);
      setActiveSection('reports');
    }
  };

  const handleResetDefaults = () => {
    apiClient.resetDefaults();
    Promise.all([
      apiClient.getInvestigations(),
      apiClient.getAttributions(),
      apiClient.getDataSources(),
    ]).then(([i, a, s]) => {
      setInvestigations(i);
      setAttributions(a);
      setDataSources(s);
      setActiveInvestigationId(i[0]?.id || null);
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#080a0e] text-zinc-100 font-mono text-xs">
        <div className="w-7 h-7 border-2 border-[#f5d13b] border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(245,209,59,0.25)]" />
        <p className="text-[#f5d13b] uppercase tracking-widest text-[11px] font-medium">
          Veritas Forensics · Initializing Consensus Graph...
        </p>
      </div>
    );
  }

  const isNavActive = (key: string) => {
    if (key === 'overview') return activeSection === 'overview';
    if (key === 'investigations') return activeSection === 'investigations' || activeSection === 'workspace';
    if (key === 'attribution') return activeSection === 'attribution';
    if (key === 'reports') return activeSection === 'reports';
    if (key === 'datasources') return activeSection === 'datasources';
    return false;
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080a0e] text-zinc-100 overflow-hidden font-sans">
      {/* --------------------------------------------------
          TOP NAVIGATION BAR (Restrained, elegant, typographic)
          -------------------------------------------------- */}
      <header className="h-13 bg-[#0d1015] border-b border-[#1c222c] px-6 flex items-center justify-between z-30 shrink-0 select-none no-print">
        {/* Brand identity */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveSection('overview')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-6 h-6 bg-[#f5d13b] text-black font-mono font-bold flex items-center justify-center text-xs shadow-[0_0_10px_rgba(245,209,59,0.35)] shrink-0">
              ₿
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-sm tracking-wider text-white group-hover:text-[#fef08a] transition-colors">
                VERITAS
              </span>
              <span className="hidden sm:inline text-[10px] font-mono text-[#f5d13b] px-1.5 py-0.5 bg-[#f5d13b]/10 border border-[#f5d13b]/30">
                FORENSICS
              </span>
            </div>
          </button>

          {/* Primary Navigation Items: Restrained, text-first with Bitcoin accent */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium tracking-tight">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`transition-colors cursor-pointer py-1 ${
                isNavActive('overview')
                  ? 'text-[#f5d13b] font-semibold border-b-2 border-[#f5d13b]'
                  : 'text-[#7e8695] hover:text-zinc-200'
              }`}
            >
              Overview
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeInvestigation && activeSection !== 'workspace') {
                  setActiveSection('workspace');
                } else {
                  setActiveSection('investigations');
                }
              }}
              className={`transition-colors cursor-pointer flex items-center gap-1.5 py-1 ${
                isNavActive('investigations')
                  ? 'text-[#f5d13b] font-semibold border-b-2 border-[#f5d13b]'
                  : 'text-[#7e8695] hover:text-zinc-200'
              }`}
            >
              <span>Investigations</span>
              {activeSection === 'workspace' && activeInvestigation && (
                <span className="text-[10px] font-mono text-[#f5d13b] bg-[#f5d13b]/15 border border-[#f5d13b]/30 px-1.5 py-0.2">
                  Active
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('attribution')}
              className={`transition-colors cursor-pointer py-1 ${
                isNavActive('attribution')
                  ? 'text-[#f5d13b] font-semibold border-b-2 border-[#f5d13b]'
                  : 'text-[#7e8695] hover:text-zinc-200'
              }`}
            >
              Attribution
            </button>

            <button
              type="button"
              onClick={() => {
                setReportInvestigation(activeInvestigation || investigations[0]);
                setActiveSection('reports');
              }}
              className={`transition-colors cursor-pointer py-1 ${
                isNavActive('reports')
                  ? 'text-[#f5d13b] font-semibold border-b-2 border-[#f5d13b]'
                  : 'text-[#7e8695] hover:text-zinc-200'
              }`}
            >
              Reports
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('datasources')}
              className={`transition-colors cursor-pointer py-1 ${
                isNavActive('datasources')
                  ? 'text-[#f5d13b] font-semibold border-b-2 border-[#f5d13b]'
                  : 'text-[#7e8695] hover:text-zinc-200'
              }`}
            >
              Data Sources
            </button>
          </nav>
        </div>

        {/* Action on Right: Obvious, disciplined, calm */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              setActiveSection('start');
              setMobileMenuOpen(false);
            }}
            className="h-8 px-2.5 sm:px-4 bg-[#f5d13b] hover:bg-[#fef08a] text-black font-semibold text-xs tracking-tight rounded-none transition-all cursor-pointer shadow-[0_0_15px_rgba(245,209,59,0.22)] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Investigation</span>
            <span className="sm:hidden">Trace</span>
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-zinc-300 hover:text-white bg-[#12161f] border border-[#232a36] hover:border-[#f5d13b]/60 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-[#f5d13b]" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* --------------------------------------------------
          MOBILE NAVIGATION DRAWER OVERLAY
          -------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-13 z-40 bg-black/85 backdrop-blur-md flex flex-col animate-in fade-in duration-150">
          <div className="p-4 bg-[#0d1016] border-b border-[#1f2733] space-y-2">
            <span className="font-mono text-[10px] uppercase text-[#7e8695] tracking-wider block">
              Forensic Navigation
            </span>

            <div className="grid grid-cols-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('overview');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer border ${
                  activeSection === 'overview'
                    ? 'bg-[#1a1708] border-[#f5d13b]/60 text-[#f5d13b]'
                    : 'bg-[#10141b] border-[#1e2531] text-zinc-200 hover:bg-[#151a24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <div>
                    <div className="text-xs font-medium">Overview & Quick Trace</div>
                    <div className="text-[10px] text-[#7e8695]">High-level triage and network metrics</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#7e8695]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection('investigations');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer border ${
                  activeSection === 'investigations'
                    ? 'bg-[#1a1708] border-[#f5d13b]/60 text-[#f5d13b]'
                    : 'bg-[#10141b] border-[#1e2531] text-zinc-200 hover:bg-[#151a24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderGit2 className="w-4 h-4" />
                  <div>
                    <div className="text-xs font-medium">Investigations Library</div>
                    <div className="text-[10px] text-[#7e8695]">Case records, status & audit archives</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#1b222e] text-[#f5d13b] border border-[#2b3547]">
                    {investigations.length} cases
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#7e8695]" />
                </div>
              </button>

              {activeInvestigation && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('workspace');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer border ${
                    activeSection === 'workspace'
                      ? 'bg-[#1a1708] border-[#f5d13b]/60 text-[#f5d13b]'
                      : 'bg-[#10141b] border-[#1e2531] text-zinc-200 hover:bg-[#151a24]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GitFork className="w-4 h-4 text-[#f5d13b]" />
                    <div>
                      <div className="text-xs font-medium text-white flex items-center gap-1.5">
                        <span>Active Case Workspace</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 bg-[#f5d13b]/20 text-[#f5d13b] border border-[#f5d13b]/40">
                          CURRENT
                        </span>
                      </div>
                      <div className="text-[10px] text-[#7e8695] truncate max-w-[200px]">
                        {activeInvestigation.caseName}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#7e8695]" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveSection('attribution');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer border ${
                  activeSection === 'attribution'
                    ? 'bg-[#1a1708] border-[#f5d13b]/60 text-[#f5d13b]'
                    : 'bg-[#10141b] border-[#1e2531] text-zinc-200 hover:bg-[#151a24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4" />
                  <div>
                    <div className="text-xs font-medium">Attribution Registry</div>
                    <div className="text-[10px] text-[#7e8695]">VASP Proof-of-Reserves & OFAC database</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#1b222e] text-[#9aa2b1] border border-[#2b3547]">
                    {attributions.length} entities
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#7e8695]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportInvestigation(activeInvestigation || investigations[0]);
                  setActiveSection('reports');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer border ${
                  activeSection === 'reports'
                    ? 'bg-[#1a1708] border-[#f5d13b]/60 text-[#f5d13b]'
                    : 'bg-[#10141b] border-[#1e2531] text-zinc-200 hover:bg-[#151a24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <div>
                    <div className="text-xs font-medium">Reports & Subpoena Dossiers</div>
                    <div className="text-[10px] text-[#7e8695]">Court-admissible evidentiary exports</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#7e8695]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection('datasources');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer border ${
                  activeSection === 'datasources'
                    ? 'bg-[#1a1708] border-[#f5d13b]/60 text-[#f5d13b]'
                    : 'bg-[#10141b] border-[#1e2531] text-zinc-200 hover:bg-[#151a24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4 text-[#f5d13b]" />
                  <div>
                    <div className="text-xs font-medium">Data Sources & SAHYOG</div>
                    <div className="text-[10px] text-[#7e8695]">Consensus RPCs, LEA bridge & credentials</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    Adapters
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#7e8695]" />
                </div>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('start');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#f5d13b] hover:bg-[#fef08a] text-black font-semibold text-xs text-center flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start New Blockchain Trace</span>
              </button>
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* --------------------------------------------------
          VIEW ROUTER
          -------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden pb-14 md:pb-0">
        {activeSection === 'overview' && (
          <DashboardView
            investigations={investigations}
            onOpenInvestigation={handleOpenInvestigation}
            onNavigateStart={() => setActiveSection('start')}
            onQuickStart={handleQuickStart}
          />
        )}

        {activeSection === 'start' && (
          <StartInvestigationView
            onBack={() => setActiveSection('overview')}
            onSubmit={handleCreateInvestigation}
          />
        )}

        {activeSection === 'workspace' && activeInvestigation && (
          <InvestigationWorkspace
            investigation={activeInvestigation}
            onExportReport={() => handleGenerateReport(activeInvestigation)}
            onAddNote={handleAddNote}
            onOpenAttributionModal={() => setActiveSection('attribution')}
          />
        )}

        {activeSection === 'investigations' && (
          <HistoryView
            investigations={investigations}
            onOpenInvestigation={handleOpenInvestigation}
            onDuplicateInvestigation={handleDuplicateInvestigation}
            onDeleteInvestigation={handleDeleteInvestigation}
            onGenerateReport={handleGenerateReport}
            onNavigateStart={() => setActiveSection('start')}
          />
        )}

        {activeSection === 'attribution' && (
          <AttributionDatabaseView
            attributions={attributions}
            onAddAttribution={handleAddAttribution}
            onUpdateAttribution={handleUpdateAttribution}
          />
        )}

        {activeSection === 'reports' && (
          <ReportView
            investigation={reportInvestigation || activeInvestigation || investigations[0]}
            onBack={() => setActiveSection('workspace')}
            investigations={investigations}
            onSelectInvestigation={(id) => {
              const inv = investigations.find((i) => i.id === id);
              if (inv) setReportInvestigation(inv);
            }}
          />
        )}

        {activeSection === 'datasources' && (
          <DataSourcesView
            dataSources={dataSources}
            onResetDefaults={handleResetDefaults}
          />
        )}
      </main>

      {/* --------------------------------------------------
          MOBILE BOTTOM NAVIGATION DOCK (1-Tap Thumb Access)
          -------------------------------------------------- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0d13]/95 backdrop-blur-md border-t border-[#1e2532] px-2 py-1.5 flex items-center justify-around select-none no-print">
        <button
          type="button"
          onClick={() => {
            setActiveSection('overview');
            setMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer transition-colors ${
            activeSection === 'overview'
              ? 'text-[#f5d13b]'
              : 'text-[#7e8695] hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] font-mono tracking-tight">Overview</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSection('investigations');
            setMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer transition-colors relative ${
            activeSection === 'investigations'
              ? 'text-[#f5d13b]'
              : 'text-[#7e8695] hover:text-zinc-200'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span className="text-[10px] font-mono tracking-tight">Cases</span>
          {investigations.length > 0 && (
            <span className="absolute top-0 right-2 w-1.5 h-1.5 rounded-full bg-[#f5d13b]" />
          )}
        </button>

        {activeInvestigation && (
          <button
            type="button"
            onClick={() => {
              setActiveSection('workspace');
              setMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer transition-colors ${
              activeSection === 'workspace'
                ? 'text-[#f5d13b]'
                : 'text-[#7e8695] hover:text-zinc-200'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span className="text-[10px] font-mono tracking-tight">Graph</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setActiveSection('datasources');
            setMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer transition-colors ${
            activeSection === 'datasources'
              ? 'text-[#f5d13b]'
              : 'text-[#7e8695] hover:text-zinc-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span className="text-[10px] font-mono tracking-tight">Sources</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer transition-colors ${
            mobileMenuOpen
              ? 'text-[#f5d13b]'
              : 'text-[#7e8695] hover:text-zinc-200'
          }`}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="text-[10px] font-mono tracking-tight">More</span>
        </button>
      </nav>
    </div>
  );
}
