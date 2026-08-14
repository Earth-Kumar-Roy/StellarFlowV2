import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ArrowRight, 
  Code2, 
  Lock, 
  Users, 
  Briefcase, 
  Sparkles,
  ExternalLink,
  FileText,
  Clock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const demoUrl = 'https://drive.google.com/file/d/1Pcxuvv1ndbkt7Kd9M9xjwV5DWXD8ZEFE/view?usp=drive_link';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white space-y-20 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-12 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Background Radial Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" />
        
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-mono font-bold tracking-wide shadow-lg shadow-indigo-950/50">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Next-Gen Soroban V2 Multi-Sig Escrow Vaults</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
            Trustless Work Escrow for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
              Web3 Freelancers & Clients
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
            StellarFlow locks payments cryptographically on Stellar Testnet. Features 2-of-3 multi-sig governance (&gt;5k XLM), client inactivity auto-payout protection, full audit logging, and downloadable PDF settlement invoices.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <NavLink
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>Launch App Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>

            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 border border-slate-800 rounded-2xl text-sm font-bold transition hover:border-slate-700 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Open Project Demo Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* Live Platform Stats Banner */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left font-mono">
            <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-md">
              <span className="text-2xl font-bold text-indigo-400">0%</span>
              <span className="text-[11px] text-slate-400 block">Custodial Risk</span>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-md">
              <span className="text-2xl font-bold text-violet-400">2-of-3</span>
              <span className="text-[11px] text-slate-400 block">Multi-Sig (&gt;5k XLM)</span>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-md">
              <span className="text-2xl font-bold text-emerald-400">48-Hour</span>
              <span className="text-[11px] text-slate-400 block">Inactivity Protection</span>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-md">
              <span className="text-2xl font-bold text-amber-400">100%</span>
              <span className="text-[11px] text-slate-400 block">PDF Invoicing & Audit</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT IS STELLARFLOW & CORE FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-white">Why Choose StellarFlow?</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Eliminating payment delays, fraudulent chargebacks, and central intermediary fees with smart contract governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl space-y-3 hover:border-indigo-500/40 transition group">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Non-Custodial Escrow Vaults</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Funds are held directly inside Soroban WASM bytecode on Stellar Testnet. No central admin can arbitrarily extract locked tokens.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl space-y-3 hover:border-violet-500/40 transition group">
            <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2-of-3 Multi-Sig Governance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-value contracts (&gt;5,000 XLM) automatically enforce 2-of-3 co-signer vote thresholds prior to releasing milestone funds.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl space-y-3 hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Freelancer Inactivity Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If a client is inactive for 48 hours post-submission, freelancers can claim a 10% auto-payout (up to a 40% maximum cap for extended delay).
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl space-y-3 hover:border-emerald-500/40 transition group">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Settlement PDF Invoices</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upon full escrow completion, clients and freelancers unlock a single-page settlement invoice downloadable as a PDF.
            </p>
          </div>
        </div>
      </section>

      {/* 3. WHO USES STELLARFLOW? (TARGET AUDIENCE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 sm:p-12 rounded-3xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Built for the Global Web3 Ecosystem</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Designed to serve freelancers, DAOs, agencies, and clients seeking multi-sig security and guaranteed milestone payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-3">
              <Users className="w-6 h-6 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">DAOs & High-Budget Projects</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Execute large grants or enterprise bounties using 2-of-3 co-signer multi-sig boards for maximum financial safety.
              </p>
            </div>

            <div className="p-6 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-3">
              <Briefcase className="w-6 h-6 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Freelance Developers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Work with total peace of mind knowing funds are cryptographically locked on-chain, backed by 48-hour inactivity auto-claim protection.
              </p>
            </div>

            <div className="p-6 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-3">
              <Code2 className="w-6 h-6 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Agencies & Individual Clients</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review milestone deliverables, request revisions, and automatically export PDF settlement reports for accounting audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW TO USE STELLARFLOW (STEP-BY-STEP WORKFLOW) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white">How It Works in 5 Steps</h2>
          <p className="text-xs text-slate-400">
            From wallet connection to milestone completion and PDF invoice generation in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2.5 relative">
            <span className="text-xs font-bold text-indigo-400">Step 01</span>
            <h3 className="text-xs font-bold text-white font-sans">Connect Wallet</h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Connect Freighter wallet on Stellar Testnet to auto-sync XLM balances.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2.5 relative">
            <span className="text-xs font-bold text-amber-400">Step 02</span>
            <h3 className="text-xs font-bold text-white font-sans">Lock Agreement</h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Define milestones and lock total budget. Agreements &gt;5k XLM assign 2 governance co-signers.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2.5 relative">
            <span className="text-xs font-bold text-emerald-400">Step 03</span>
            <h3 className="text-xs font-bold text-white font-sans">Submit Deliverable</h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Freelancer submits work for review, starting the 48-hour client review timer.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2.5 relative">
            <span className="text-xs font-bold text-violet-400">Step 04</span>
            <h3 className="text-xs font-bold text-white font-sans">Approve / Vote</h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Client or Co-Signer approves work (2-of-3 vote required for multi-sig). Inactive clients trigger 10%/40% auto-claims.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2.5 relative">
            <span className="text-xs font-bold text-cyan-400">Step 05</span>
            <h3 className="text-xs font-bold text-white font-sans">Download Invoice</h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Upon 100% completion, clients and freelancers download single-page settlement invoices as PDFs.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CALL-TO-ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-indigo-900/80 via-indigo-950 to-slate-900 border border-indigo-500/30 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white">Ready to Secure Your Web3 Contracts?</h2>
            <p className="text-xs sm:text-sm text-indigo-200">
              Initialize your first milestone escrow agreement on Stellar Testnet right now.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <NavLink
              to="/create"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Create New Escrow
            </NavLink>
            <NavLink
              to="/docs"
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition"
            >
              Explore Technical Docs
            </NavLink>
          </div>
        </div>
      </section>

    </div>
  );
};