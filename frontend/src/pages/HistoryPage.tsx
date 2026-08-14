import React, { useState, useEffect, useCallback, useRef } from 'react';
import { rpc, Contract, TransactionBuilder, Account, scValToNative } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../config/stellar';
import type { TestnetEvent, Escrow } from '../types/escrow';
import { 
  History, 
  Database, 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  RotateCcw,
  ArrowUpRight,
  XCircle,
  Vote,
  Zap,
  Users,
  MessageSquare,
  Wallet
} from 'lucide-react';

export interface DbTransactionV2 {
  timestamp: string;
  eventType: string;
  clientName: string;
  clientAddress: string;
  clientEmail?: string;
  freelancerName: string;
  freelancerAddress: string;
  freelancerEmail?: string;
  cosigner1Address?: string;
  cosigner2Address?: string;
  totalAmount: string;
  currency?: string;
  milestoneId?: string | number;
  milestoneDescription?: string;
  milestoneAmount?: string;
  txHash: string;
  denialReason?: string;
}

interface HistoryPageProps {
  publicKey: string | null;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ publicKey }) => {
  const [activeTab, setActiveTab] = useState<'db' | 'testnet'>('db');
  const [dbLogs, setDbLogs] = useState<DbTransactionV2[]>([]);
  const [testnetEvents, setTestnetEvents] = useState<TestnetEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeUserKey = publicKey ? publicKey.trim().toLowerCase() : '';
  const dbLogsRef = useRef<DbTransactionV2[]>([]);

  // Helper: Fetch Google Sheets Audit Database Logs & Filter Client-Side (Case-Insensitive, Newest First)
  const fetchDbLogs = async (userAddress: string): Promise<DbTransactionV2[]> => {
    if (!userAddress) return [];
    try {
      const url = new URL(STELLAR_CONFIG.appsScriptUrl);
      url.searchParams.append('action', 'get_transactions_v2');

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        const target = userAddress.trim().toLowerCase();

        // Strict participant filter: connected wallet must be Client, Freelancer, or Co-Signer
        const filtered = data.filter((item: DbTransactionV2) => {
          const c = (item.clientAddress || '').trim().toLowerCase();
          const f = (item.freelancerAddress || '').trim().toLowerCase();
          const cos1 = (item.cosigner1Address || '').trim().toLowerCase();
          const cos2 = (item.cosigner2Address || '').trim().toLowerCase();
          return c === target || f === target || cos1 === target || cos2 === target;
        });

        // Enforce Newest-First Sorting (Descending Order by Timestamp)
        filtered.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
        dbLogsRef.current = filtered;
        return filtered;
      }
    } catch (err) {
      console.warn('Failed to fetch V2 database logs:', err);
    }
    return [];
  };

  // 1. Load Database Logs
  const loadDbHistory = useCallback(async () => {
    if (!activeUserKey) {
      setDbLogs([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const logs = await fetchDbLogs(activeUserKey);
    setDbLogs(logs);
    setIsLoading(false);
  }, [activeUserKey]);

  // 2. Load Testnet RPC Events (Derived On-Chain Events + RPC Ledger Events, Newest First + Tx Hash Links)
  const loadTestnetEvents = useCallback(async () => {
    if (!activeUserKey) {
      setTestnetEvents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      const latestDb = dbLogsRef.current.length > 0 ? dbLogsRef.current : await fetchDbLogs(activeUserKey);
      const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);
      const contract = new Contract(STELLAR_CONFIG.contractId);
      const fetchedEvents: TestnetEvent[] = [];

      // A. Query Soroban RPC Ledger Events
      try {
        const latestLedgerHeader = await server.getLatestLedger();
        const currentLedger = latestLedgerHeader.sequence;
        const startLedger = Math.max(1, currentLedger - 1000);

        let res: any;
        try {
          res = await server.getEvents({
            startLedger,
            filters: [{ contractIds: [STELLAR_CONFIG.contractId] }],
            limit: 30,
          } as any);
        } catch {
          res = await server.getEvents({
            filters: [{ contractIds: [STELLAR_CONFIG.contractId] }],
            limit: 30,
          } as any);
        }

        if (res && Array.isArray(res.events)) {
          res.events.forEach((e: any) => {
            const rawHash = e.txHash || e.txHashStr || e.transactionHash || '';
            fetchedEvents.push({
              id: e.id || `evt_${Math.random().toString(36).substring(2, 9)}`,
              ledger: e.ledger,
              createdAt: e.createdAt || e.ledgerClosedAt || new Date().toISOString(),
              topic: Array.isArray(e.topic) ? e.topic : [],
              txHash: rawHash,
            });
          });
        }
      } catch (rpcErr) {
        console.warn('RPC event query fallback:', rpcErr);
      }

      // B. Query On-Chain Escrow State via RPC Simulation
      const mergedEscrows: Escrow[] = [];
      try {
        const dummyAccount = new Account(
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
          '0'
        );

        const tx = new TransactionBuilder(dummyAccount, {
          fee: '100',
          networkPassphrase: STELLAR_CONFIG.networkPassphrase,
        })
          .addOperation(contract.call('get_escrow'))
          .setTimeout(30)
          .build();

        const simRes = await server.simulateTransaction(tx);

        if (rpc.Api.isSimulationSuccess(simRes) && simRes.result) {
          const rawNative: any = scValToNative(simRes.result.retval);
          if (rawNative) {
            const liveEscrow: Escrow = {
              client: rawNative.client,
              freelancer: rawNative.freelancer,
              cosigner1: rawNative.cosigner1 || rawNative.cosigner_1 || null,
              cosigner2: rawNative.cosigner2 || rawNative.cosigner_2 || null,
              token: rawNative.token,
              totalAmount: (Number(rawNative.total_amount || 0) / 10000000).toString(),
              releasedAmount: (Number(rawNative.released_amount || 0) / 10000000).toString(),
              deadline: Number(rawNative.deadline || 0),
              status: rawNative.status,
              milestones: (Array.isArray(rawNative.milestones) ? rawNative.milestones : []).map((m: any) => ({
                id: Number(m.id),
                description: m.description,
                amount: (Number(m.amount || 0) / 10000000).toString(),
                isCompleted: Boolean(m.is_completed),
                isSubmitted: Boolean(m.is_submitted),
                submittedAt: Number(m.submitted_at || 0),
                isDenied: Boolean(m.is_denied),
                denialReason: m.denial_reason || '',
                autoReleasedAmount: (Number(m.auto_released_amount || 0) / 10000000).toString(),
                votes: Array.isArray(m.votes) ? m.votes : [],
              })),
            };
            mergedEscrows.push(liveEscrow);
          }
        }
      } catch (simErr) {
        console.warn('RPC simulation error:', simErr);
      }

      // Read Local Storage History for Connected Wallet
      try {
        const key = `stellarflow_user_escrows_${activeUserKey}`;
        const localList: Escrow[] = JSON.parse(localStorage.getItem(key) || '[]');
        localList.forEach((e) => {
          if (e && e.client && e.freelancer) {
            mergedEscrows.push(e);
          }
        });
      } catch (e) {
        console.warn('Local storage parse error:', e);
      }

      // Filter escrows strictly for connected wallet
      const userEscrowsList = mergedEscrows.filter((e) => {
        const c = (e.client || '').toLowerCase();
        const f = (e.freelancer || '').toLowerCase();
        const cos1 = (e.cosigner1 || '').toLowerCase();
        const cos2 = (e.cosigner2 || '').toLowerCase();
        return c === activeUserKey || f === activeUserKey || cos1 === activeUserKey || cos2 === activeUserKey;
      });

      // Derive milestone events & attach exact txHash from DB logs
      const derivedEvents: TestnetEvent[] = [];
      userEscrowsList.forEach((e) => {
        (e.milestones || []).forEach((m) => {
          const votesList = Array.isArray(m.votes) ? m.votes : [];
          const autoClaimedVal = parseFloat(m.autoReleasedAmount || '0');

          if (m.isCompleted) {
            const matchingDb = latestDb.find(
              (log) =>
                String(log.milestoneId) === String(m.id) &&
                (log.eventType === 'MILESTONE_RELEASED' || log.eventType === 'MILESTONE_RELEASE_VOTE')
            );
            derivedEvents.push({
              id: `completed_m${m.id}_${e.client.substring(0, 4)}`,
              ledger: 0,
              createdAt: matchingDb?.timestamp || new Date().toISOString(),
              topic: [
                'MILESTONE_RELEASED',
                `Milestone #${m.id}: ${m.description}`,
                `${m.amount} XLM`,
                `Client: ${e.client}`,
                `Freelancer: ${e.freelancer}`,
                votesList.length > 0 ? `Votes: ${votesList.length}/2` : 'Direct Approval'
              ],
              txHash: matchingDb?.txHash || '',
            });
          } else if (m.isDenied) {
            const matchingDb = latestDb.find(
              (log) => String(log.milestoneId) === String(m.id) && log.eventType === 'MILESTONE_DENIED'
            );
            derivedEvents.push({
              id: `denied_m${m.id}_${e.client.substring(0, 4)}`,
              ledger: 0,
              createdAt: matchingDb?.timestamp || new Date().toISOString(),
              topic: [
                'MILESTONE_DENIED',
                `Milestone #${m.id}: ${m.description}`,
                `${m.amount} XLM`,
                `Reason: "${m.denialReason || 'Revision Requested'}"`
              ],
              txHash: matchingDb?.txHash || '',
            });
          } else if (m.isSubmitted) {
            const matchingDb = latestDb.find(
              (log) => String(log.milestoneId) === String(m.id) && log.eventType === 'WORK_SUBMITTED'
            );
            derivedEvents.push({
              id: `submitted_m${m.id}_${e.client.substring(0, 4)}`,
              ledger: 0,
              createdAt: matchingDb?.timestamp || (m.submittedAt ? new Date(m.submittedAt * 1000).toISOString() : new Date().toISOString()),
              topic: [
                'WORK_SUBMITTED',
                `Milestone #${m.id}: ${m.description}`,
                `${m.amount} XLM`,
                `Submitted At: ${m.submittedAt ? new Date(m.submittedAt * 1000).toLocaleString() : 'Recently'}`,
                votesList.length > 0 ? `Current Votes: ${votesList.length}/2` : 'Awaiting First Vote'
              ],
              txHash: matchingDb?.txHash || '',
            });
          }

          if (autoClaimedVal > 0) {
            const matchingDb = latestDb.find(
              (log) => String(log.milestoneId) === String(m.id) && log.eventType === 'PARTIAL_PAYOUT_RELEASED'
            );
            derivedEvents.push({
              id: `autoclaim_m${m.id}_${e.client.substring(0, 4)}`,
              ledger: 0,
              createdAt: matchingDb?.timestamp || new Date().toISOString(),
              topic: [
                'PARTIAL_PAYOUT_RELEASED',
                `Milestone #${m.id}: ${m.description}`,
                `Auto-Payout Claimed: ${autoClaimedVal} XLM`
              ],
              txHash: matchingDb?.txHash || '',
            });
          }
        });
      });

      // Combine and Sort Newest First (Descending Order)
      const combined = [...derivedEvents, ...fetchedEvents];
      combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      setTestnetEvents(combined);
    } catch (err) {
      console.warn('Failed to fetch Testnet RPC events:', err);
      setTestnetEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeUserKey]);

  useEffect(() => {
    if (!activeUserKey) return;
    if (activeTab === 'db') {
      loadDbHistory();
    } else {
      loadTestnetEvents();
    }
  }, [activeTab, activeUserKey, loadDbHistory, loadTestnetEvents]);

  const formatAddress = (addr?: string) =>
    addr && addr.trim() ? `${addr.substring(0, 5)}...${addr.substring(addr.length - 4)}` : 'N/A';

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'ESCROW_CREATED':
        return {
          label: 'Escrow Created',
          icon: ShieldCheck,
          color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        };
      case 'WORK_SUBMITTED':
        return {
          label: 'Work Submitted',
          icon: Send,
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'MILESTONE_DENIED':
        return {
          label: 'Work Denied',
          icon: XCircle,
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };
      case 'MILESTONE_RELEASE_VOTE':
        return {
          label: 'Approval Vote',
          icon: Vote,
          color: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
        };
      case 'MILESTONE_RELEASED':
        return {
          label: 'Milestone Released',
          icon: CheckCircle2,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'PARTIAL_PAYOUT_RELEASED':
        return {
          label: 'Auto-Payout Claimed',
          icon: Zap,
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'REFUNDED':
        return {
          label: 'Escrow Refunded',
          icon: RotateCcw,
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };
      default:
        return {
          label: type,
          icon: History,
          color: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  if (!publicKey) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-12 rounded-3xl max-w-lg mx-auto space-y-4">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 w-fit mx-auto">
            <Wallet className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">Wallet Connection Required</h2>
          <p className="text-xs text-slate-400">
            Please connect your Freighter wallet to view transaction activity logs and on-chain contract events associated with your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <span>Escrow Activity Log (V2)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Permanent transaction audit trail stored on Google Sheets (TransactionsV2) & Soroban RPC
          </p>
        </div>

        {/* Tab Selection Controls */}
        <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('db')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'db'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Logs (V2)</span>
          </button>
          <button
            onClick={() => setActiveTab('testnet')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'testnet'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Testnet RPC Events</span>
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Fetching V2 activity logs...</p>
        </div>
      ) : activeTab === 'db' ? (
        /* V2 Database Logs Table View (Newest First) */
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Google Sheet Audit Entries (Filtered for {formatAddress(publicKey)}) — Newest First
            </span>
            <button
              onClick={loadDbHistory}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl transition cursor-pointer"
              title="Refresh Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {dbLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-mono">
              No recorded V2 database logs found for account {formatAddress(publicKey)}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Event Type</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Freelancer</th>
                    <th className="px-6 py-4">Milestone / Details</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {dbLogs.map((log, index) => {
                    const badge = getEventBadge(log.eventType);
                    const BadgeIcon = badge.icon;
                    const amountVal = log.milestoneAmount || log.totalAmount || '0';
                    const curr = log.currency || 'XLM';

                    return (
                      <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-sans">
                          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${badge.color}`}>
                            <BadgeIcon className="w-3.5 h-3.5" />
                            <span>{badge.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-indigo-400 font-bold block">{log.clientName || 'Client'}</span>
                          <span className="text-[10px] text-slate-500 block">{formatAddress(log.clientAddress)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-emerald-400 font-bold block">{log.freelancerName || 'Freelancer'}</span>
                          <span className="text-[10px] text-slate-500 block">{formatAddress(log.freelancerAddress)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 max-w-xs">
                            {log.milestoneDescription && (
                              <div className="text-slate-200 font-sans font-semibold text-xs flex items-center space-x-1">
                                {log.milestoneId !== undefined && log.milestoneId !== '' && (
                                  <span className="text-indigo-400 font-bold">#{log.milestoneId}</span>
                                )}
                                <span>{log.milestoneDescription}</span>
                              </div>
                            )}

                            {log.denialReason && (
                              <div className="text-[11px] text-rose-300 bg-rose-950/40 border border-rose-800/50 p-1.5 rounded-lg flex items-start space-x-1">
                                <MessageSquare className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                                <span>Note: "{log.denialReason}"</span>
                              </div>
                            )}

                            {(log.cosigner1Address || log.cosigner2Address) && (
                              <div className="text-[10px] text-violet-300 flex items-center space-x-1">
                                <Users className="w-3 h-3 text-violet-400 shrink-0" />
                                <span>Co-Signers: {formatAddress(log.cosigner1Address)}, {formatAddress(log.cosigner2Address)}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-100">
                          {amountVal} {curr}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.txHash ? (
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${log.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-indigo-400 hover:underline font-bold"
                            >
                              <span>View Tx</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Detailed Testnet RPC Events View (Newest First) */
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Soroban Contract Events (Filtered for {formatAddress(publicKey)}) — Newest First
            </span>
            <button
              onClick={loadTestnetEvents}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {testnetEvents.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-mono">
              No recent Soroban RPC contract events found for account {formatAddress(publicKey)}.
            </div>
          ) : (
            <div className="space-y-4 font-mono">
              {testnetEvents.map((e, idx) => {
                const topicType = Array.isArray(e.topic) && e.topic.length > 0 ? String(e.topic[0]) : 'CONTRACT_EVENT';
                const badge = getEventBadge(topicType);
                const BadgeIcon = badge.icon;

                return (
                  <div key={e.id || idx} className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${badge.color}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>

                        <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/50 font-bold">
                          {e.ledger ? `Ledger #${e.ledger}` : 'On-Chain Execution'}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-500">
                        {e.createdAt ? new Date(e.createdAt).toLocaleString() : 'Recently Executed'}
                      </span>
                    </div>

                    {/* Detailed Event Topics Display */}
                    {Array.isArray(e.topic) && e.topic.length > 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-300">
                        {e.topic.slice(1).map((param, pIdx) => (
                          <div key={pIdx} className="flex items-center space-x-2 text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <span className="truncate">{String(param)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Explorer Transaction Link */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 font-mono text-[11px]">Event ID: {e.id}</span>
                      {e.txHash ? (
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${e.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:underline font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800"
                        >
                          <span>View Tx on Stellar Expert</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
                          Verified On-Chain
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};