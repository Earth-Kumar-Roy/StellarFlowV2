import { STELLAR_CONFIG } from '../config/stellar';
import { 
  ExternalLink, 
  Code2, 
  GitMerge, 
  Zap,
  ArrowRight,
  Database,
  Layers,
  Cpu,
  ShieldCheck,
  Terminal,
  Clock,
  Users
} from 'lucide-react';

export const DocsPage = () => {
  const demoUrl = 'https://drive.google.com/file/d/1O3dk2ECn6y7M0LR0811sXVriUs0NWygM/view?usp=drive_link';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
      
      {/* Hero / Short Description */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Soroban Smart Escrow Architecture v2.0</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            StellarFlow Documentation & System Architecture
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            StellarFlow is a non-custodial, milestone-based escrow platform built on Stellar's Soroban smart contract framework. It features cryptographically locked funds, 2-of-3 multi-sig governance for high-value agreements (&gt;5,000 XLM), client inactivity auto-payout protection, and automated PDF settlement invoice generation.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-sans font-bold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Watch Live Demo Presentation</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${STELLAR_CONFIG.contractId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-sans font-bold text-xs px-5 py-3.5 rounded-xl border border-slate-700 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify On-Chain Contract ({STELLAR_CONFIG.contractId.substring(0, 6)}...{STELLAR_CONFIG.contractId.substring(STELLAR_CONFIG.contractId.length - 4)})</span>
            </a>
          </div>
        </div>
      </div>

      {/* System Architecture & Operational Diagram */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-white flex items-center justify-center space-x-2 text-center">
          <Layers className="w-6 h-6 text-indigo-400" />
          <span>System Architecture & Governance Flow</span>
        </h2>

        {/* Centered Architecture Flow Box */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-3xl p-6 sm:p-8 font-mono text-xs shadow-2xl space-y-6 flex flex-col items-center justify-center text-center">
          <div className="border-b border-slate-800 pb-3 text-slate-400 flex flex-col sm:flex-row justify-between items-center w-full gap-2">
            <span className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Soroban V2 Multi-Sig & Inactivity Protocol Flow</span>
            </span>
            <span className="text-[10px] text-indigo-400 font-bold">2-of-3 Multi-Sig Threshold (&gt;5k XLM)</span>
          </div>

          <div className="w-full overflow-x-auto flex justify-center py-2">
            <pre className="text-indigo-300 leading-relaxed font-mono text-left inline-block">
{`   ┌───────────────────┐    Locks Tokens (>5k XLM)  ┌────────────────────────┐
   │   Client Wallet   │ ──────────────────────────►│  Soroban Escrow Vault  │
   └─────────┬─────────┘                            └───────────┬────────────┘
             │                                                  │
             │ (Work Deliverable Submitted)                     │
             ▼                                                  │
   ┌───────────────────┐    Inactivity Protection Timer         │
   │ Freelancer Wallet │◄───────────────────────────────────────┤
   └─────────┬─────────┘    • 48 Hours Inactive  ─► Claim 10%    │
             │              • Extended Inactive  ─► Claim 40%    │
             │                                                  │
             │ (Direct Approval or 2-of-3 Governance Voting)      │
             ├──────────────────────────────────────────────────┤
             │                                                  │
   ┌─────────┴─────────┐    Governance Signatures              │
   │ Multi-Sig Signers │ ───────────────────────────────────────┤
   │ (Co-Signer 1 & 2) │    (Requires 2-of-3 Vote Threshold)    │
   └───────────────────┘                                        │
                                                                ▼
   ┌───────────────────┐    Settlement & PDF Generation ┌────────────────────────┐
   │ Client Feedback & │◄───────────────────────────────│  InvoiceMaker Engine   │
   │ Reputation Audit  │    (On-Chain Released Balance) └────────────────────────┘
   └───────────────────┘`}
            </pre>
          </div>
        </div>

        {/* 3-Column Layer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold border-b border-slate-800/80 pb-2">
              <Cpu className="w-4 h-4" />
              <span>1. Web3 Client & Invoice Layer</span>
            </div>
            <ul className="space-y-2 text-slate-400 leading-relaxed">
              <li>• <strong className="text-slate-200">Freighter Wallet:</strong> Signer & Keypair Manager</li>
              <li>• <strong className="text-slate-200">InvoiceMaker.tsx:</strong> Single-page PDF settlement generator</li>
              <li>• <strong className="text-slate-200">Stellar SDK:</strong> XDR Builder & RPC Simulation Engine</li>
            </ul>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold border-b border-slate-800/80 pb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>2. On-Chain Soroban Governance</span>
            </div>
            <ul className="space-y-2 text-slate-400 leading-relaxed">
              <li>• <strong className="text-slate-200">Soroban Contract:</strong> Multi-sig vault & milestone logic</li>
              <li>• <strong className="text-slate-200">2-of-3 Multi-Sig:</strong> Co-signer governance for &gt;5k XLM</li>
              <li>• <strong className="text-slate-200">Inactivity Protection:</strong> Automated 10%/40% claims</li>
            </ul>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2 text-violet-400 font-bold border-b border-slate-800/80 pb-2">
              <Database className="w-4 h-4" />
              <span>3. Audit & Indexing Layer</span>
            </div>
            <ul className="space-y-2 text-slate-400 leading-relaxed">
              <li>• <strong className="text-slate-200">Google Apps Script:</strong> Concurrency-locked REST API</li>
              <li>• <strong className="text-slate-200">TransactionsV2 & FeedbacksV2:</strong> Audit sheets</li>
              <li>• <strong className="text-slate-200">MailApp Service:</strong> Automated notification dispatch</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Protocol Rules */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Clock className="w-6 h-6 text-amber-400" />
          <span>Protocol Security & Protection Rules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-amber-500/30 p-6 rounded-3xl space-y-3 shadow-lg shadow-amber-950/20">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Zap className="w-5 h-5" />
              <span>Freelancer Inactivity Protection</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              To prevent funds from being permanently frozen by an inactive client after work submission, StellarFlow enforces an automated lock window:
            </p>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-amber-300 block mb-0.5">Tier 1 (48 Hours Inactive):</strong>
                Unlocks <strong className="text-white">10% partial auto-payout</strong> claimable directly on-chain by the freelancer.
              </li>
              <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-amber-300 block mb-0.5">Tier 2 (Extended Inactivity / Deadline):</strong>
                Unlocks up to <strong className="text-white">40% maximum payout cap</strong> if client review continues to be inactive.
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/80 border border-violet-500/30 p-6 rounded-3xl space-y-3 shadow-lg shadow-violet-950/20">
            <div className="flex items-center space-x-2 text-violet-400 font-bold text-sm">
              <Users className="w-5 h-5" />
              <span>High-Value Multi-Sig Governance (&gt;5,000 XLM)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              High-value project agreements exceeding 5,000 XLM automatically trigger 2-of-3 multi-sig governance rules:
            </p>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-violet-300 block mb-0.5">Governance Board:</strong>
                Requires sign-off from Client + 2 Designated Governance Co-Signers.
              </li>
              <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-violet-300 block mb-0.5">2-of-3 Approval Threshold:</strong>
                At least <strong className="text-white">2 approval votes</strong> must be recorded on-chain before milestone funds release to the freelancer.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Execution Workflow Pipeline */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <GitMerge className="w-6 h-6 text-violet-400" />
          <span>Execution Workflow Pipeline</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2 relative">
            <div className="w-8 h-8 bg-indigo-600/20 text-indigo-400 font-mono font-bold rounded-xl flex items-center justify-center border border-indigo-500/30 text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-white">Create & Lock</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Client signs <code className="text-indigo-300">create_escrow</code>. Funds lock on-chain. Contracts &gt;5k XLM register 2 Co-Signers.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2 relative">
            <div className="w-8 h-8 bg-amber-600/20 text-amber-400 font-mono font-bold rounded-xl flex items-center justify-center border border-amber-500/30 text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-white">Work Submission</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Freelancer submits deliverable. On-chain state marks milestone under review and starts 48h inactivity protection timer.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2 relative">
            <div className="w-8 h-8 bg-violet-600/20 text-violet-400 font-mono font-bold rounded-xl flex items-center justify-center border border-violet-500/30 text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-white">Multi-Sig Vote / Review</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Client or Co-Signer executes <code className="text-violet-300">approve_milestone</code> vote (requires 2-of-3 threshold for &gt;5k XLM).
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2 relative">
            <div className="w-8 h-8 bg-emerald-600/20 text-emerald-400 font-mono font-bold rounded-xl flex items-center justify-center border border-emerald-500/30 text-xs">
              04
            </div>
            <h3 className="text-sm font-bold text-white">Release & Invoice</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Once fully settled, funds release to freelancer and unlock downloadable PDF audit invoices via <code className="text-emerald-300">InvoiceMaker.tsx</code>.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2 relative">
            <div className="w-8 h-8 bg-rose-600/20 text-rose-400 font-mono font-bold rounded-xl flex items-center justify-center border border-rose-500/30 text-xs">
              05
            </div>
            <h3 className="text-sm font-bold text-white">Refund Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              If deadline passes, Client executes <code className="text-rose-300">refund_expired</code> to reclaim unreleased tokens.
            </p>
          </div>
        </div>
      </section>

      {/* Project Structure Breakdown */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Code2 className="w-6 h-6 text-indigo-400" />
          <span>Full Application Project Structure</span>
        </h2>

        <div className="bg-slate-950 border border-slate-800/90 rounded-3xl p-6 font-mono text-xs text-slate-300 overflow-x-auto shadow-2xl">
          <pre className="leading-relaxed">
{`StellarFlow/
├── contracts/
│   └── escrow/
│       ├── Cargo.toml              <-- Rust Dependencies & Soroban SDK configuration
│       └── src/
│           ├── lib.rs              <-- Escrow Contract logic, Multi-Sig & Inactivity Payouts
│           ├── types.rs            <-- Data structures (Escrow, Milestone) & custom error enums
│           ├── storage.rs          <-- Soroban Instance Storage keys & persistence helpers
│           └── test.rs             <-- Soroban unit tests
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── config/
│   │   │   └── stellar.ts          <-- RPC, Contract ID & Apps Script endpoints
│   │   ├── types/
│   │   │   └── escrow.ts           <-- TypeScript interfaces for Escrow, Milestones & Audit Logs
│   │   ├── utils/
│   │   │   └── api.ts              <-- API fetchers for Google Apps Script sheet logs
│   │   ├── hooks/
│   │   │   ├── useWallet.ts        <-- Freighter integration & live XLM balance tracker
│   │   │   └── useEscrow.ts        <-- Soroban contract calls & V2 auto-logging triggers
│   │   ├── components/
│   │   │   ├── Navbar.tsx          <-- Multi-page Navigation, XLM Balance & Role Badges
│   │   │   ├── Toast.tsx           <-- On-chain transaction status toasts
│   │   │   ├── MilestoneTracker.tsx<-- Milestone submission, multi-sig voting & inactivity UI
│   │   │   ├── EscrowCard.tsx      <-- Primary contract management interface
│   │   │   ├── InvoiceMaker.tsx    <-- Single-page PDF settlement invoice generator
│   │   │   └── FeedbackModal.tsx   <-- On-chain reputation & sheet logger modal
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       <-- Main Operations Dashboard
│   │   │   ├── CreateEscrowPage.tsx<-- Full-page contract creation form
│   │   │   ├── HistoryPage.tsx     <-- Audit Logs (TransactionsV2 & Soroban RPC)
│   │   │   ├── FeedbackPage.tsx    <-- Public Counterparty Reputation Feed (FeedbacksV2)
│   │   │   └── DocsPage.tsx        <-- Interactive Technical Documentation (This Page)
│   │   ├── App.tsx                 <-- React Router configuration & global layout
│   │   ├── main.tsx                <-- Entry point
│   │   └── index.css               <-- Tailwind CSS base directives
│   ├── index.html
│   └── package.json
└── README.md`}
          </pre>
        </div>
      </section>

      {/* External Redirection Demo Button Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Need a Complete Demonstration Walkthrough?</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Access slide decks, architectural breakdowns, and submission resources on our dedicated site.
          </p>
        </div>
        <a
          href={demoUrl}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-2 shrink-0 shadow-lg shadow-indigo-600/20"
        >
          <span>Open Extended Demo Site</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

    </div>
  );
};