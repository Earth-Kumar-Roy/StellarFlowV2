import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { EscrowCard } from '../components/EscrowCard';
import { EscrowFilterBar, type StatusFilter, type SortOption } from '../components/EscrowFilterBar';
import type { Escrow } from '../types/escrow';
import { EscrowStatus } from '../types/escrow';
import { 
  PlusCircle, 
  RefreshCw, 
  Layers, 
  MessageSquare,
  ArrowRight,
  SearchX
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

const MULTISIG_THRESHOLD = 5000;

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

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

  // Apply search query, status filtering, and sorting
  const filteredEscrows: Escrow[] = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);

    return displayEscrows
      .filter((item) => {
        // Keyword Search Filter
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !query ||
          item.client?.toLowerCase().includes(query) ||
          item.clientName?.toLowerCase().includes(query) ||
          item.freelancer?.toLowerCase().includes(query) ||
          item.freelancerName?.toLowerCase().includes(query) ||
          item.milestones?.some((m) => m.description?.toLowerCase().includes(query));

        if (!matchesSearch) return false;

        // Calculate actual completion state
        const totalAmountNum = parseFloat(item.totalAmount || '0');
        const isMultiSig = totalAmountNum > MULTISIG_THRESHOLD;
        const actualReleased = (item.milestones || []).reduce((acc, m) => {
          const votesList = Array.isArray(m.votes) ? m.votes : [];
          const isTrulyReleased = m.isCompleted && (!isMultiSig || votesList.length >= 2);
          return isTrulyReleased
            ? acc + parseFloat(m.amount || '0')
            : acc + parseFloat(m.autoReleasedAmount || '0');
        }, 0);

        const isFullyReleased = totalAmountNum > 0 && actualReleased >= totalAmountNum;
        const allCompleted = (item.milestones || []).length > 0 &&
          (item.milestones || []).every((m) => {
            const votesList = Array.isArray(m.votes) ? m.votes : [];
            return m.isCompleted && (!isMultiSig || votesList.length >= 2);
          });
        const isSettled = isFullyReleased || allCompleted || item.status === EscrowStatus.Completed;
        const isExpired = now >= item.deadline && !isSettled;
        const isUnderReview = !isSettled && (item.milestones || []).some((m) => (m.isSubmitted || m.isInReview) && !m.isCompleted);

        // Status Tabs Filter
        if (statusFilter === 'all') return true;
        if (statusFilter === 'completed') return isSettled;
        if (statusFilter === 'under_review') return isUnderReview;
        if (statusFilter === 'expired') return isExpired;
        if (statusFilter === 'active') return !isSettled && !isExpired;
        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'highest_amount') {
          return (parseFloat(b.totalAmount) || 0) - (parseFloat(a.totalAmount) || 0);
        }
        if (sortOption === 'deadline') {
          return a.deadline - b.deadline;
        }
        if (sortOption === 'oldest') {
          return a.deadline - b.deadline;
        }
        // Default: Newest first (highest deadline timestamp / newest entry)
        return b.deadline - a.deadline;
      });
  }, [displayEscrows, searchTerm, statusFilter, sortOption]);

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

      {/* Search & Filter Toolbar (Visible when wallet has escrows) */}
      {displayEscrows.length > 0 && (
        <EscrowFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          selectedSort={sortOption}
          onSortChange={setSortOption}
          totalCount={displayEscrows.length}
          filteredCount={filteredEscrows.length}
        />
      )}

      {/* Main Content Area */}
      {isFetching && displayEscrows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-3xl">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-300 font-medium">Querying Soroban Testnet RPC...</p>
        </div>
      ) : displayEscrows.length > 0 ? (
        filteredEscrows.length > 0 ? (
          <div className="space-y-8">
            {filteredEscrows.map((escrowItem, idx) => (
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
          /* Filter No Results State */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-3">
            <div className="p-3.5 bg-slate-800/80 text-slate-400 rounded-2xl border border-slate-700">
              <SearchX className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white">No Matching Agreements</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              No escrow vaults match your active filter or search query. Try clearing the search or changing the status filter tab.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-2 text-xs font-mono font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )
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