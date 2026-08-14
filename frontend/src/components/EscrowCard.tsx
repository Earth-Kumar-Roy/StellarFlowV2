import React, { useState, useEffect } from 'react';
import type { Escrow } from '../types/escrow';
import { EscrowStatus } from '../types/escrow';
import { MilestoneTracker } from './MilestoneTracker';
import { InvoiceMaker } from './InvoiceMaker';
import { 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  User,
  ArrowUpRight,
  Users,
  FileText
} from 'lucide-react';

export interface EscrowCardProps {
  escrow: Escrow;
  userAddress: string | null;
  isSubmitting: boolean;
  onSubmitWorkForReview?: (id: number, targetEscrow?: Escrow) => void;
  onApproveMilestone: (id: number, targetEscrow?: Escrow) => void;
  onDenyMilestone?: (id: number, reason: string, targetEscrow?: Escrow) => void;
  onClaimInactivityPayout?: (id: number, targetEscrow?: Escrow) => void;
  onRefundExpired: (targetEscrow?: Escrow) => void;
}

const MULTISIG_THRESHOLD = 5000; // XLM threshold for 2-of-3 multi-sig

export const EscrowCard: React.FC<EscrowCardProps> = ({
  escrow,
  userAddress,
  isSubmitting,
  onSubmitWorkForReview,
  onApproveMilestone,
  onDenyMilestone,
  onClaimInactivityPayout,
  onRefundExpired,
}) => {
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const activeUser = userAddress ? userAddress.toLowerCase() : '';
  const isClient = Boolean(activeUser && escrow.client.toLowerCase() === activeUser);
  const isFreelancer = Boolean(activeUser && escrow.freelancer.toLowerCase() === activeUser);
  const isCosigner1 = Boolean(activeUser && escrow.cosigner1 && escrow.cosigner1.toLowerCase() === activeUser);
  const isCosigner2 = Boolean(activeUser && escrow.cosigner2 && escrow.cosigner2.toLowerCase() === activeUser);
  const isCosigner = isCosigner1 || isCosigner2;

  const totalAmountNum = parseFloat(escrow.totalAmount || '0');
  const isMultiSigRequired = totalAmountNum > MULTISIG_THRESHOLD;

  // Accurately compute ACTUAL on-chain released funds (includes full releases & auto-released payouts)
  const actualReleasedAmount = escrow.milestones.reduce((acc, m) => {
    const votesList = Array.isArray(m.votes) ? m.votes : [];
    const isTrulyReleased = m.isCompleted && (!isMultiSigRequired || votesList.length >= 2);
    if (isTrulyReleased) {
      return acc + parseFloat(m.amount || '0');
    }
    return acc + parseFloat(m.autoReleasedAmount || '0');
  }, 0);

  // Invoice unlocks ONLY when total released amount equals or exceeds locked total amount
  const isFullyReleased = totalAmountNum > 0 && actualReleasedAmount >= totalAmountNum;

  // Compute if all milestones in this escrow are completed on-chain
  const allMilestonesCompleted = escrow.milestones.length > 0 && 
    escrow.milestones.every((m) => {
      const votesList = Array.isArray(m.votes) ? m.votes : [];
      return m.isCompleted && (!isMultiSigRequired || votesList.length >= 2);
    });

  const activeStatus = isFullyReleased || allMilestonesCompleted ? EscrowStatus.Completed : escrow.status;

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = escrow.deadline - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const days = Math.floor(diff / (3600 * 24));
        const hours = Math.floor((diff % (3600 * 24)) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = Math.floor(diff % 60);
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [escrow.deadline]);

  const getStatusBadge = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.Active:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case EscrowStatus.Completed:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case EscrowStatus.Refunded:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const formatAddress = (addr: string) =>
    `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return (
    <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/20 max-w-4xl mx-auto my-8 overflow-hidden">
      
      {/* Decorative Gradient Background Elements */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Invoice Modal Overlay */}
      {showInvoiceModal && (
        <InvoiceMaker escrow={escrow} onClose={() => setShowInvoiceModal(false)} />
      )}

      {/* Card Header */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/50">
              Active Agreement
            </span>
            {isClient && (
              <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-800/50">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Client Access</span>
              </span>
            )}
            {isFreelancer && (
              <span className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded-md border border-cyan-800/50">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Freelancer Access</span>
              </span>
            )}
            {isCosigner && (
              <span className="flex items-center space-x-1 text-xs font-semibold text-violet-400 bg-violet-950/50 px-2.5 py-1 rounded-md border border-violet-800/50">
                <Users className="w-3.5 h-3.5" />
                <span>Governance Co-Signer</span>
              </span>
            )}
            {isMultiSigRequired && (
              <span className="flex items-center space-x-1 text-xs font-semibold text-violet-400 bg-violet-950/50 px-2.5 py-1 rounded-md border border-violet-800/50">
                <Users className="w-3.5 h-3.5" />
                <span>2-of-3 Multi-Sig (&gt;5k XLM)</span>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            Escrow Vault Overview
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Download Invoice Button (Unlocks ONLY when Released Amount === Total Amount) */}
          {isFullyReleased && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Download Invoice (PDF)</span>
            </button>
          )}

          <span
            className={`text-xs font-bold px-4 py-1.5 rounded-full border uppercase tracking-wider shadow-sm ${getStatusBadge(
              activeStatus
            )}`}
          >
            {activeStatus}
          </span>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Locked Amount
            </span>
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono mt-2 tracking-tight">
            {escrow.totalAmount}{' '}
            <span className="text-sm font-semibold text-slate-400">{escrow.currency || 'XLM'}</span>
          </p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Released Amount
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-2 tracking-tight">
            {actualReleasedAmount.toString()}{' '}
            <span className="text-sm font-semibold text-slate-400">{escrow.currency || 'XLM'}</span>
          </p>
        </div>
      </div>

      {/* Countdown Timer Display */}
      {activeStatus === EscrowStatus.Active && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Contract Countdown</p>
              <p className="text-sm font-semibold text-slate-200">
                {timeLeft.isExpired
                  ? 'Deadline Exceeded — Refund Eligible'
                  : 'Time remaining before refund window opens'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-mono">
            {timeLeft.isExpired ? (
              <span className="text-rose-400 font-bold text-sm bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20">
                EXPIRED
              </span>
            ) : (
              <div className="flex items-center space-x-2 text-indigo-300">
                <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-lg font-bold">{timeLeft.days}</span>
                  <span className="text-[10px] text-slate-400 block -mt-1">d</span>
                </div>
                <span>:</span>
                <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-lg font-bold">{timeLeft.hours}</span>
                  <span className="text-[10px] text-slate-400 block -mt-1">h</span>
                </div>
                <span>:</span>
                <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-lg font-bold">{timeLeft.minutes}</span>
                  <span className="text-[10px] text-slate-400 block -mt-1">m</span>
                </div>
                <span>:</span>
                <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-lg font-bold">{timeLeft.seconds}</span>
                  <span className="text-[10px] text-slate-400 block -mt-1">s</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contract Participants Info Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-950/40 rounded-2xl border border-slate-800/80 my-6 font-mono text-xs">
        
        {/* Client Metadata */}
        <div className="space-y-1.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-2 font-sans font-semibold">
            <span className="flex items-center space-x-1.5 text-indigo-400">
              <User className="w-3.5 h-3.5" />
              <span>Client Details</span>
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {escrow.clientName || 'Client'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Address:</span>
            <a
              href={`https://stellar.expert/explorer/testnet/account/${escrow.client}`}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <span>{formatAddress(escrow.client)}</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          {escrow.clientEmail && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-slate-300 flex items-center space-x-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{escrow.clientEmail}</span>
              </span>
            </div>
          )}
        </div>

        {/* Freelancer Metadata */}
        <div className="space-y-1.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-2 font-sans font-semibold">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <User className="w-3.5 h-3.5" />
              <span>Freelancer Details</span>
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {escrow.freelancerName || 'Freelancer'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Address:</span>
            <a
              href={`https://stellar.expert/explorer/testnet/account/${escrow.freelancer}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>{formatAddress(escrow.freelancer)}</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          {escrow.freelancerEmail && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-slate-300 flex items-center space-x-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{escrow.freelancerEmail}</span>
              </span>
            </div>
          )}
        </div>

        {/* Multi-Sig Co-Signers Metadata (if present) */}
        {(escrow.cosigner1 || escrow.cosigner2) && (
          <div className="md:col-span-2 space-y-1.5 bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-500/20">
            <div className="flex items-center justify-between text-indigo-300 border-b border-indigo-900/60 pb-2 mb-2 font-sans font-semibold">
              <span className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Governance Co-Signers (2-of-3 Threshold)</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              {escrow.cosigner1 && (
                <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Co-Signer 1:</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${escrow.cosigner1}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>{formatAddress(escrow.cosigner1)}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              )}
              {escrow.cosigner2 && (
                <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Co-Signer 2:</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${escrow.cosigner2}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>{formatAddress(escrow.cosigner2)}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Milestone Schedule Component */}
      <MilestoneTracker
        milestones={escrow.milestones}
        isClient={isClient}
        isFreelancer={isFreelancer}
        isCosigner={isCosigner}
        totalAmount={escrow.totalAmount}
        deadline={escrow.deadline}
        userAddress={userAddress}
        isSubmitting={isSubmitting}
        onSubmitWork={(id) => onSubmitWorkForReview?.(id, escrow)}
        onApprove={(id) => onApproveMilestone(id, escrow)}
        onDeny={(id: number, reason: string) => onDenyMilestone?.(id, reason, escrow)}
        onClaimInactivityPayout={(id) => onClaimInactivityPayout?.(id, escrow)}
      />

      {/* Expired Refund Action Banner */}
      {isClient && timeLeft.isExpired && activeStatus === EscrowStatus.Active && (
        <div className="mt-8 p-5 bg-rose-950/40 border border-rose-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">Escrow Expiration Reached</h4>
              <p className="text-xs text-rose-300/80">
                You can reclaim all remaining unreleased tokens back to your client wallet.
              </p>
            </div>
          </div>
          <button
            onClick={() => onRefundExpired(escrow)}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-xl transition duration-150 shadow-lg shadow-rose-600/30 whitespace-nowrap cursor-pointer"
          >
            {isSubmitting ? 'Processing Refund...' : 'Claim Expired Refund'}
          </button>
        </div>
      )}

    </div>
  );
};