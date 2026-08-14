import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { EscrowCard } from '../components/EscrowCard';
import type { Escrow } from '../types/escrow';
import { 
  PlusCircle, 
  RefreshCw, 
  Layers, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  escrow: Escrow | null;
  userEscrows?: Escrow[];
  publicKey: string | null;
  isFetching: boolean;
  isSubmitting: boolean;
  onFetchEscrow: (activePublicKey?: string | null) => void;
  onSubmitWorkForReview: (id: number, targetEscrow?: Escrow) => void;
  onApproveMilestone: (id: number, targetEscrow?: Escrow) => void;
  onDenyMilestone?: (id: number, reason: string, targetEscrow?: Escrow) => void;
  onClaimInactivityPayout?: (id: number, targetEscrow?: Escrow) => void;
  onRefundExpired: (targetEscrow?: Escrow) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  escrow,
  userEscrows = [],
  publicKey,
  isFetching,
  isSubmitting,
  onFetchEscrow,
  onSubmitWorkForReview,
  onApproveMilestone,
  onDenyMilestone,
  onClaimInactivityPayout,
  onRefundExpired,
}) => {
  // Merge live on-chain escrow with locally saved user escrows, filtered by participant/co-signer wallet
  const displayEscrows: Escrow[] = useMemo(() => {
    if (!publicKey) return [];

    const activeKey = publicKey.trim().toLowerCase();
    const combinedMap = new Map<string, Escrow>();

    const isUserParticipant = (e: Escrow) => {
      const isClient = e.client?.toLowerCase() === activeKey;
      const isFreelancer = e.freelancer?.toLowerCase() === activeKey;
      const isCosigner1 = e.cosigner1?.toLowerCase() === activeKey;
      const isCosigner2 = e.cosigner2?.toLowerCase() === activeKey;
      return isClient || isFreelancer || isCosigner1 || isCosigner2;
    };

    // 1. Process local history for connected wallet
    userEscrows.forEach((e) => {
      if (e?.client && e?.freelancer && isUserParticipant(e)) {
        const key = `${e.client.toLowerCase()}_${e.freelancer.toLowerCase()}_${e.deadline}`;
        combinedMap.set(key, e);
      }
    });

    // 2. Include live RPC contract ONLY if connected wallet is a participant or co-signer
    if (escrow?.client && escrow?.freelancer && isUserParticipant(escrow)) {
      const liveKey = `${escrow.client.toLowerCase()}_${escrow.freelancer.toLowerCase()}_${escrow.deadline}`;
      combinedMap.set(liveKey, escrow);
    }

    return Array.from(combinedMap.values());
  }, [escrow, userEscrows, publicKey]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      
      {/* Top Banner Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Escrow Operations Dashboard (V2)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage Soroban 2-of-3 multi-sig milestone vaults, work denials & inactivity payouts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onFetchEscrow(publicKey)}
            disabled={isFetching}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700/80 transition cursor-pointer"
            title="Refresh Ledger State"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Syncing...' : 'Sync Contract'}</span>
          </button>

          <NavLink
            to="/feedback"
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700/80 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Give Feedback</span>
          </NavLink>

          <NavLink
            to="/create"
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Agreement</span>
          </NavLink>
        </div>
      </div>

      {/* Main Content Area */}
      {isFetching && displayEscrows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-3xl">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-300 font-medium">Querying Soroban Testnet RPC...</p>
        </div>
      ) : displayEscrows.length > 0 ? (
        <div className="space-y-8">
          {displayEscrows.map((escrowItem, idx) => (
            <EscrowCard
              key={`${escrowItem.client}_${escrowItem.deadline}_${idx}`}
              escrow={escrowItem}
              userAddress={publicKey}
              isSubmitting={isSubmitting}
              onSubmitWorkForReview={(id: number) => onSubmitWorkForReview(id, escrowItem)}
              onApproveMilestone={(id: number) => onApproveMilestone(id, escrowItem)}
              onDenyMilestone={(id: number, reason: string) => onDenyMilestone?.(id, reason, escrowItem)}
              onClaimInactivityPayout={(id: number) => onClaimInactivityPayout?.(id, escrowItem)}
              onRefundExpired={() => onRefundExpired(escrowItem)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-5">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Layers className="w-10 h-10" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-xl font-bold text-white">No Active Escrow Detected</h3>
            <p className="text-xs text-slate-400">
              There is currently no active escrow contract deployed at the configured address or your wallet has not initialized one yet.
            </p>
          </div>
          <NavLink
            to="/create"
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <span>Initialize First Escrow</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      )}

    </div>
  );
};