import React, { useState, useEffect } from 'react';
import type { Milestone } from '../types/escrow';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  Coins, 
  XCircle, 
  Zap, 
  Users,
  Timer,
  Vote
} from 'lucide-react';

interface MilestoneTrackerProps {
  milestones: Milestone[];
  isClient: boolean;
  isFreelancer?: boolean;
  isCosigner?: boolean;
  totalAmount?: string;
  deadline?: number;
  userAddress?: string | null;
  isSubmitting: boolean;
  onSubmitWork?: (milestoneId: number) => void;
  onApprove: (milestoneId: number) => void;
  onDeny?: (milestoneId: number, reason: string) => void;
  onClaimInactivityPayout?: (milestoneId: number) => void;
}

const TWO_DAYS_SECONDS = 172800;  // 48 hours required for 10% auto-payout
const SEVEN_DAYS_SECONDS = 604800; // 7 days required for 40% auto-payout

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  milestones,
  isClient,
  isFreelancer,
  isCosigner,
  totalAmount = '0',
  deadline,
  userAddress,
  isSubmitting,
  onSubmitWork,
  onApprove,
  onDeny,
  onClaimInactivityPayout,
}) => {
  const [denialInputId, setDenialInputId] = useState<number | null>(null);
  const [denialReason, setDenialReason] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const activeUser = userAddress ? userAddress.trim().toLowerCase() : '';
  const totalVal = parseFloat(totalAmount) || 0;
  const isMultiSig = totalVal > 5000;

  const handleDenySubmit = (milestoneId: number) => {
    if (!denialReason.trim()) {
      alert('Please provide a reason for denying this milestone work submission.');
      return;
    }
    if (onDeny) {
      onDeny(milestoneId, denialReason.trim());
      setDenialInputId(null);
      setDenialReason('');
    }
  };

  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '0h 0m';
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="mt-8 bg-slate-950/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 shadow-inner">
      <div className="flex items-center justify-between mb-5 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
            <span>Milestone Release Schedule</span>
            {isMultiSig && (
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>2-of-3 Multi-Sig Required (&gt;5k XLM)</span>
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Soroban smart contract milestone state, governance votes & payout execution
          </p>
        </div>
        <span className="text-xs font-mono font-semibold bg-slate-800/80 text-slate-300 px-3 py-1 rounded-lg border border-slate-700/60">
          {milestones.filter((m) => {
            const votesList = Array.isArray(m.votes) ? m.votes : [];
            return m.isCompleted && (!isMultiSig || votesList.length >= 2);
          }).length} / {milestones.length} Released
        </span>
      </div>

      <div className="space-y-4">
        {milestones.map((m) => {
          const votesList = Array.isArray(m.votes) ? m.votes : [];
          const voteCount = votesList.length;

          // Strictly check if connected active user address already voted in m.votes array
          const hasUserVoted = activeUser
            ? votesList.some((v) => String(v).trim().toLowerCase() === activeUser)
            : false;

          // Milestone is ONLY completed if contract state is completed AND (for >5k XLM) at least 2 votes exist
          const isTrulyCompleted = m.isCompleted && (!isMultiSig || voteCount >= 2);

          const isSubmitted = m.isSubmitted || m.isInReview;
          const isDenied = m.isDenied;

          const submittedAt = m.submittedAt || 0;
          const timeElapsed = isSubmitted && submittedAt > 0 ? Math.max(0, currentTime - submittedAt) : 0;

          const maxPossibleInactivity = deadline && submittedAt > 0 ? deadline - submittedAt : TWO_DAYS_SECONDS;
          const isSubmittedTooCloseToDeadline = isSubmitted && maxPossibleInactivity < TWO_DAYS_SECONDS;

          const hasPassed2Days = timeElapsed >= TWO_DAYS_SECONDS;
          const hasPassed7Days = timeElapsed >= SEVEN_DAYS_SECONDS;
          const isExpired = deadline ? currentTime >= deadline : false;

          const milestoneAmountNum = parseFloat(m.amount) || 0;
          const autoReleasedVal = parseFloat(m.autoReleasedAmount || '0') || 0;

          let targetAutoPayoutPct = 0;
          if (hasPassed2Days) {
            if (hasPassed7Days || isExpired) {
              targetAutoPayoutPct = 40;
            } else {
              targetAutoPayoutPct = 10;
            }
          }

          const targetAutoPayoutAmount = (milestoneAmountNum * targetAutoPayoutPct) / 100;
          const claimableAutoPayout = Math.max(0, targetAutoPayoutAmount - autoReleasedVal);

          const isEligibleForAutoPayout =
            isSubmitted &&
            !isTrulyCompleted &&
            !isDenied &&
            !isSubmittedTooCloseToDeadline &&
            hasPassed2Days &&
            claimableAutoPayout > 0;

          const secondsUntilTier1 = Math.max(0, TWO_DAYS_SECONDS - timeElapsed);

          return (
            <div
              key={m.id}
              className={`flex flex-col p-4 sm:p-5 rounded-2xl border transition-all duration-200 gap-4 ${
                isTrulyCompleted
                  ? 'bg-emerald-950/10 border-emerald-500/30'
                  : isDenied
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : isSubmitted
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                
                {/* Left Side: Info */}
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700 font-mono">
                      Milestone #{m.id}
                    </span>
                    <span className="text-base font-bold text-white tracking-tight">
                      {m.description}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        Payout: <strong className="text-slate-200 font-sans">{m.amount} XLM</strong>
                      </span>
                    </span>

                    {autoReleasedVal > 0 && (
                      <span className="text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded text-[10px]">
                        Auto-Claimed: {autoReleasedVal} XLM
                      </span>
                    )}
                  </div>

                  {isDenied && m.denialReason && (
                    <div className="text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/50 mt-1 font-mono">
                      <strong>Rejection Reason:</strong> "{m.denialReason}"
                    </div>
                  )}
                </div>

                {/* Right Side: Status Badges & Action Controls */}
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end border-t sm:border-0 pt-3 sm:pt-0 border-slate-800/60">
                  
                  {/* Status 1: Truly Completed & Released */}
                  {isTrulyCompleted && (
                    <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3.5 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Released</span>
                    </div>
                  )}

                  {/* Status 2: Denied */}
                  {isDenied && !isTrulyCompleted && (
                    <div className="flex items-center space-x-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold px-3.5 py-1.5 rounded-xl">
                      <XCircle className="w-4 h-4" />
                      <span>Work Denied</span>
                    </div>
                  )}

                  {/* Status 3: Submitted & Under Review */}
                  {isSubmitted && !isTrulyCompleted && !isDenied && (
                    <div className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-xl">
                      <AlertCircle className="w-4 h-4 animate-pulse text-amber-400" />
                      <span>
                        Under Review {isMultiSig ? `(${voteCount}/2 Votes)` : ''}
                      </span>
                    </div>
                  )}

                  {/* Status 4: Pending */}
                  {!isTrulyCompleted && !isSubmitted && !isDenied && (
                    <div className="flex items-center space-x-1.5 bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending</span>
                    </div>
                  )}

                  {/* Freelancer Action: Submit Work */}
                  {isFreelancer && !isTrulyCompleted && (!isSubmitted || isDenied) && onSubmitWork && (
                    <button
                      onClick={() => onSubmitWork(m.id)}
                      disabled={isSubmitting}
                      className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-150 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isDenied ? 'Resubmit Work' : 'Submit Work'}</span>
                    </button>
                  )}

                  {/* Freelancer Action: Claim Auto-Payout */}
                  {isFreelancer && isSubmitted && !isTrulyCompleted && !isDenied && onClaimInactivityPayout && (
                    <button
                      onClick={() => onClaimInactivityPayout(m.id)}
                      disabled={isSubmitting || !isEligibleForAutoPayout}
                      className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition duration-150 ${
                        isEligibleForAutoPayout
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 cursor-pointer'
                          : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
                      }`}
                      title={
                        isSubmittedTooCloseToDeadline
                          ? 'Ineligible: Work submitted within 48h of contract deadline'
                          : !hasPassed2Days
                          ? `Auto-Payout locked until client is inactive for 48h (${formatCountdown(secondsUntilTier1)})`
                          : 'Claim 10%/40% Inactivity Auto-Payout'
                      }
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>
                        {isEligibleForAutoPayout
                          ? `Claim Auto-Payout (${claimableAutoPayout} XLM)`
                          : 'Auto-Payout Locked'}
                      </span>
                    </button>
                  )}

                  {/* Client / Co-Signer Action: Vote to Approve (Disabled if hasUserVoted === true) */}
                  {(isClient || isCosigner) && !isTrulyCompleted && (
                    <button
                      onClick={() => onApprove(m.id)}
                      disabled={isSubmitting || (isMultiSig && hasUserVoted)}
                      className={`flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl transition duration-150 shadow-md ${
                        isMultiSig && hasUserVoted
                          ? 'bg-slate-800/90 text-slate-400 border border-slate-700/80 cursor-not-allowed opacity-75'
                          : isSubmitted
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 cursor-pointer'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 cursor-pointer'
                      }`}
                      title={hasUserVoted ? 'Your vote is recorded. Waiting for second co-signer approval.' : 'Cast vote to approve'}
                    >
                      <Vote className="w-3.5 h-3.5" />
                      <span>
                        {isSubmitting
                          ? 'Processing...'
                          : isMultiSig
                          ? hasUserVoted
                            ? `You Voted (${voteCount}/2)`
                            : voteCount > 0
                            ? 'Cast 2nd Vote to Release (1/2)'
                            : 'Vote to Approve (0/2)'
                          : 'Approve & Release'}
                      </span>
                    </button>
                  )}

                  {/* Client / Co-Signer Action: Deny Work */}
                  {(isClient || isCosigner) && isSubmitted && !isTrulyCompleted && !isDenied && onDeny && (
                    <button
                      onClick={() => setDenialInputId(denialInputId === m.id ? null : m.id)}
                      disabled={isSubmitting}
                      className="flex items-center space-x-1 bg-rose-950 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Deny</span>
                    </button>
                  )}

                </div>
              </div>

              {/* BOTH CLIENT & FREELANCER: Inactivity Timer & Protection Notice */}
              {isSubmitted && !isTrulyCompleted && !isDenied && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 font-mono">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Timer className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {isSubmittedTooCloseToDeadline ? (
                        <strong className="text-rose-400">
                          Ineligible for Auto-Payout: Work submitted within 48h of contract deadline.
                        </strong>
                      ) : !hasPassed2Days ? (
                        <span>
                          Inactivity Protection:{' '}
                          <strong className="text-amber-300">
                            {formatCountdown(secondsUntilTier1)}
                          </strong>{' '}
                          remaining before 10% auto-payout unlocks.
                        </span>
                      ) : hasPassed7Days || isExpired ? (
                        <strong className="text-amber-300">
                          40% Maximum Inactivity Auto-Payout Unlocked!
                        </strong>
                      ) : (
                        <strong className="text-amber-300">
                          10% Inactivity Auto-Payout Unlocked! (40% cap unlocks after 7 days or contract deadline)
                        </strong>
                      )}
                    </span>
                  </div>

                  {isClient && !hasPassed2Days && !isSubmittedTooCloseToDeadline && (
                    <span className="text-[11px] text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      Action required: Review submission to prevent auto-payout.
                    </span>
                  )}
                </div>
              )}

              {/* Denial Reason Input Panel */}
              {denialInputId === m.id && (
                <div className="pt-3 border-t border-slate-800 space-y-2 font-mono">
                  <label className="block text-[11px] font-semibold text-rose-400">
                    Reason for Rejection / Revision Request *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bug detected in smart contract authorization logic"
                      value={denialReason}
                      onChange={(e) => setDenialReason(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleDenySubmit(m.id)}
                      disabled={isSubmitting}
                      className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Confirm Denial
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};