import { useState, useCallback } from 'react';
import {
  rpc,
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
  TransactionBuilder,
  xdr,
  Account,
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import { STELLAR_CONFIG } from '../config/stellar';
import { EscrowStatus } from '../types/escrow';
import type { Escrow } from '../types/escrow';

const toStroops = (xlmAmount: string | number): bigint => {
  const parsed = typeof xlmAmount === 'string' ? parseFloat(xlmAmount) : xlmAmount;
  if (isNaN(parsed) || parsed <= 0) return 0n;
  return BigInt(Math.round(parsed * 10_000_000));
};

const fromStroops = (stroops: any): string => {
  if (!stroops) return '0';
  const val = Number(stroops);
  return (val / 10_000_000).toString();
};

const toOptionAddress = (addr?: string | null) => {
  if (!addr || !addr.trim()) {
    return xdr.ScVal.scvVoid();
  }
  return new Address(addr.trim()).toScVal();
};

export function useEscrow() {
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [userEscrows, setUserEscrows] = useState<Escrow[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper: Save an escrow into wallet history list in local storage
  const persistEscrowLocally = (userAddress: string, newEscrow: Escrow) => {
    if (!userAddress) return;
    try {
      const key = `stellarflow_user_escrows_${userAddress.toLowerCase()}`;
      const existing: Escrow[] = JSON.parse(localStorage.getItem(key) || '[]');

      const index = existing.findIndex(
        (e) => e.client === newEscrow.client && e.deadline === newEscrow.deadline
      );

      if (index >= 0) {
        existing[index] = newEscrow;
      } else {
        existing.unshift(newEscrow);
      }

      localStorage.setItem(key, JSON.stringify(existing));
    } catch (err) {
      console.warn('Failed to save local escrow history:', err);
    }
  };

  // Helper: Load local escrows for a specific wallet address
  const loadLocalEscrows = (userAddress: string | null): Escrow[] => {
    if (!userAddress) return [];
    try {
      const key = `stellarflow_user_escrows_${userAddress.toLowerCase()}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  };

  // Helper: Log V2 transaction to Google Sheet
  const logTransactionToSheet = async (payload: Record<string, any>) => {
    try {
      await fetch(STELLAR_CONFIG.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'log_transaction_v2', ...payload }),
      });
    } catch (err) {
      console.warn('Failed to log V2 transaction to Google Sheet:', err);
    }
  };

  // Fetch Escrow State from Soroban RPC
  const fetchEscrow = useCallback(async (activePublicKey?: string | null) => {
    setIsFetching(true);
    setError(null);

    const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);
    const contract = new Contract(STELLAR_CONFIG.contractId);

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
        const savedMeta = JSON.parse(localStorage.getItem('stellarflow_escrow_meta') || '{}');
        const rawMilestones = Array.isArray(rawNative?.milestones) ? rawNative.milestones : [];

        const liveEscrow: Escrow = {
          client: rawNative.client,
          clientName: savedMeta.clientName || 'Client',
          clientEmail: savedMeta.clientEmail || '',
          freelancer: rawNative.freelancer,
          freelancerName: savedMeta.freelancerName || 'Freelancer',
          freelancerEmail: savedMeta.freelancerEmail || '',
          cosigner1: rawNative.cosigner1 || rawNative.cosigner_1 || savedMeta.cosigner1 || null,
          cosigner2: rawNative.cosigner2 || rawNative.cosigner_2 || savedMeta.cosigner2 || null,
          token: rawNative.token,
          currency: savedMeta.currency || 'XLM',
          totalAmount: fromStroops(rawNative.total_amount),
          releasedAmount: fromStroops(rawNative.released_amount),
          deadline: Number(rawNative.deadline),
          status: rawNative.status as EscrowStatus,
          milestones: rawMilestones.map((m: any) => ({
            id: Number(m.id),
            description: m.description,
            amount: fromStroops(m.amount),
            isCompleted: Boolean(m.is_completed),
            isSubmitted: Boolean(m.is_submitted),
            isInReview: Boolean(m.is_submitted) || savedMeta[`review_m_${m.id}`] || false,
            submittedAt: Number(m.submitted_at || 0),
            isDenied: Boolean(m.is_denied),
            denialReason: m.denial_reason || '',
            autoReleasedAmount: fromStroops(m.auto_released_amount || 0),
            votes: Array.isArray(m.votes) ? m.votes : [],
          })),
        };

        persistEscrowLocally(rawNative.client, liveEscrow);
        persistEscrowLocally(rawNative.freelancer, liveEscrow);
        if (liveEscrow.cosigner1) persistEscrowLocally(liveEscrow.cosigner1, liveEscrow);
        if (liveEscrow.cosigner2) persistEscrowLocally(liveEscrow.cosigner2, liveEscrow);

        setEscrow(liveEscrow);
      } else {
        setEscrow(null);
      }
    } catch (err: any) {
      console.error('Fetch Escrow Error:', err);
      setEscrow(null);
    } finally {
      if (activePublicKey) {
        setUserEscrows(loadLocalEscrows(activePublicKey));
      } else {
        setUserEscrows([]);
      }
      setIsFetching(false);
    }
  }, []);

  // Submit signed transaction helper
  const submitSignedTransaction = async (preparedTx: any): Promise<string> => {
    const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);

    const signedResult = await signTransaction(preparedTx.toXDR(), {
      networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    });

    const signedXdr =
      typeof signedResult === 'string'
        ? signedResult
        : (signedResult as any)?.signedTxXdr || signedResult;

    const sendRes = await server.sendTransaction(
      TransactionBuilder.fromXDR(signedXdr, STELLAR_CONFIG.networkPassphrase)
    );

    if (sendRes.status === 'PENDING') {
      setTxHash(sendRes.hash);
      let statusRes = await server.getTransaction(sendRes.hash);
      while (statusRes.status === 'NOT_FOUND') {
        await new Promise((r) => setTimeout(r, 2000));
        statusRes = await server.getTransaction(sendRes.hash);
      }
      return sendRes.hash;
    } else {
      throw new Error('Transaction submission failed on Testnet.');
    }
  };

  // Create Escrow
  const createEscrow = async (
    userAddress: string,
    clientName: string,
    clientEmail: string,
    freelancer: string,
    freelancerName: string,
    freelancerEmail: string,
    cosigner1: string,
    cosigner2: string,
    token: string,
    totalAmount: string,
    deadline: number,
    milestones: { id: number; description: string; amount: string }[]
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setTxHash(null);

      const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);
      const contract = new Contract(STELLAR_CONFIG.contractId);

      const account = await server.getAccount(userAddress);
      const totalStroops = toStroops(totalAmount);
      const safeMilestones = Array.isArray(milestones) ? milestones : [];

      const formattedMilestones = safeMilestones.map((m) =>
        xdr.ScVal.scvMap([
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('amount'),
            val: nativeToScVal(toStroops(m.amount), { type: 'i128' }),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('auto_released_amount'),
            val: nativeToScVal(0n, { type: 'i128' }),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('denial_reason'),
            val: xdr.ScVal.scvString(''),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('description'),
            val: xdr.ScVal.scvString(m.description),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('id'),
            val: nativeToScVal(m.id, { type: 'u32' }),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('is_completed'),
            val: xdr.ScVal.scvBool(false),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('is_denied'),
            val: xdr.ScVal.scvBool(false),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('is_submitted'),
            val: xdr.ScVal.scvBool(false),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('submitted_at'),
            val: nativeToScVal(0n, { type: 'u64' }),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('votes'),
            val: xdr.ScVal.scvVec([]),
          }),
        ])
      );

      const tx = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'create_escrow',
            new Address(userAddress).toScVal(),
            new Address(freelancer).toScVal(),
            toOptionAddress(cosigner1),
            toOptionAddress(cosigner2),
            new Address(token).toScVal(),
            nativeToScVal(totalStroops, { type: 'i128' }),
            nativeToScVal(BigInt(deadline), { type: 'u64' }),
            xdr.ScVal.scvVec(formattedMilestones)
          )
        )
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const hash = await submitSignedTransaction(preparedTx);

      const newEscrowObj: Escrow = {
        client: userAddress,
        clientName,
        clientEmail,
        freelancer,
        freelancerName,
        freelancerEmail,
        cosigner1: cosigner1.trim() || null,
        cosigner2: cosigner2.trim() || null,
        token,
        currency: 'XLM',
        totalAmount,
        releasedAmount: '0',
        deadline,
        status: EscrowStatus.Active,
        milestones: safeMilestones.map((m) => ({
          ...m,
          isCompleted: false,
          isSubmitted: false,
          isInReview: false,
          submittedAt: 0,
          isDenied: false,
          denialReason: '',
          autoReleasedAmount: '0',
          votes: [],
        })),
      };

      persistEscrowLocally(userAddress, newEscrowObj);
      persistEscrowLocally(freelancer, newEscrowObj);
      if (cosigner1) persistEscrowLocally(cosigner1, newEscrowObj);
      if (cosigner2) persistEscrowLocally(cosigner2, newEscrowObj);

      setEscrow(newEscrowObj);
      setUserEscrows(loadLocalEscrows(userAddress));

      localStorage.setItem(
        'stellarflow_escrow_meta',
        JSON.stringify({
          clientName,
          clientEmail,
          freelancerName,
          freelancerEmail,
          cosigner1,
          cosigner2,
        })
      );

      await logTransactionToSheet({
        eventType: 'ESCROW_CREATED',
        clientName,
        clientAddress: userAddress,
        clientEmail,
        freelancerName,
        freelancerAddress: freelancer,
        freelancerEmail,
        cosigner1Address: cosigner1,
        cosigner2Address: cosigner2,
        totalAmount,
        currency: 'XLM',
        txHash: hash,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to create escrow.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Work On-Chain
  const submitWorkForReview = async (
    userAddress: string,
    milestoneId: number,
    targetEscrow?: Escrow
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setTxHash(null);

      const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);
      const contract = new Contract(STELLAR_CONFIG.contractId);

      const account = await server.getAccount(userAddress);
      const milestoneVal = nativeToScVal(milestoneId, { type: 'u32' });

      const tx = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call('submit_work', milestoneVal))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const hash = await submitSignedTransaction(preparedTx);

      const activeEscrow = targetEscrow || escrow;
      const milestone = activeEscrow?.milestones.find((m) => m.id === milestoneId);

      if (activeEscrow) {
        const updatedEscrow: Escrow = {
          ...activeEscrow,
          milestones: activeEscrow.milestones.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  isSubmitted: true,
                  isInReview: true,
                  isDenied: false,
                  denialReason: '',
                  submittedAt: Math.floor(Date.now() / 1000),
                }
              : m
          ),
        };

        persistEscrowLocally(activeEscrow.client, updatedEscrow);
        persistEscrowLocally(activeEscrow.freelancer, updatedEscrow);
        setEscrow(updatedEscrow);
        setUserEscrows(loadLocalEscrows(userAddress));
      }

      await logTransactionToSheet({
        eventType: 'WORK_SUBMITTED',
        clientName: activeEscrow?.clientName || 'Client',
        clientAddress: activeEscrow?.client || '',
        clientEmail: activeEscrow?.clientEmail,
        freelancerName: activeEscrow?.freelancerName || 'Freelancer',
        freelancerAddress: userAddress,
        freelancerEmail: activeEscrow?.freelancerEmail,
        totalAmount: activeEscrow?.totalAmount || '',
        milestoneId,
        milestoneDescription: milestone?.description || '',
        milestoneAmount: milestone?.amount || '',
        txHash: hash,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to submit work.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deny Milestone Work (Fixed: Passes reviewer Address)
  const denyMilestone = async (
    userAddress: string,
    milestoneId: number,
    reason: string,
    targetEscrow?: Escrow
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setTxHash(null);

      const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);
      const contract = new Contract(STELLAR_CONFIG.contractId);

      const account = await server.getAccount(userAddress);
      const reviewerVal = new Address(userAddress).toScVal();
      const milestoneVal = nativeToScVal(milestoneId, { type: 'u32' });
      const reasonVal = xdr.ScVal.scvString(reason);

      const tx = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call('deny_milestone', reviewerVal, milestoneVal, reasonVal))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const hash = await submitSignedTransaction(preparedTx);

      const activeEscrow = targetEscrow || escrow;
      const milestone = activeEscrow?.milestones.find((m) => m.id === milestoneId);

      if (activeEscrow) {
        const updatedEscrow: Escrow = {
          ...activeEscrow,
          milestones: activeEscrow.milestones.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  isDenied: true,
                  denialReason: reason,
                  isSubmitted: false,
                  isInReview: false,
                }
              : m
          ),
        };

        persistEscrowLocally(activeEscrow.client, updatedEscrow);
        persistEscrowLocally(activeEscrow.freelancer, updatedEscrow);
        setEscrow(updatedEscrow);
        setUserEscrows(loadLocalEscrows(userAddress));
      }

      await logTransactionToSheet({
        eventType: 'MILESTONE_DENIED',
        clientName: activeEscrow?.clientName || 'Client',
        clientAddress: userAddress,
        clientEmail: activeEscrow?.clientEmail,
        freelancerName: activeEscrow?.freelancerName || 'Freelancer',
        freelancerAddress: activeEscrow?.freelancer || '',
        freelancerEmail: activeEscrow?.freelancerEmail,
        totalAmount: activeEscrow?.totalAmount || '',
        milestoneId,
        milestoneDescription: milestone?.description || '',
        milestoneAmount: milestone?.amount || '',
        denialReason: reason,
        txHash: hash,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to deny milestone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Claim Inactivity Payout
  // Claim Inactivity Payout (10% or 40%)
  const claimInactivityPayout = async (
    userAddress: string,
    milestoneId: number,
    targetEscrow?: Escrow
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setTxHash(null);

      const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);
      const contract = new Contract(STELLAR_CONFIG.contractId);

      const account = await server.getAccount(userAddress);
      const milestoneVal = nativeToScVal(milestoneId, { type: 'u32' });

      const tx = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call('claim_inactivity_payout', milestoneVal))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const hash = await submitSignedTransaction(preparedTx);

      const activeEscrow = targetEscrow || escrow;
      const milestone = activeEscrow?.milestones.find((m) => m.id === milestoneId);

      await logTransactionToSheet({
        eventType: 'PARTIAL_PAYOUT_RELEASED',
        clientName: activeEscrow?.clientName || 'Client',
        clientAddress: activeEscrow?.client || '',
        clientEmail: activeEscrow?.clientEmail,
        freelancerName: activeEscrow?.freelancerName || 'Freelancer',
        freelancerAddress: userAddress,
        freelancerEmail: activeEscrow?.freelancerEmail,
        totalAmount: activeEscrow?.totalAmount || '',
        milestoneId,
        milestoneDescription: milestone?.description || '',
        milestoneAmount: milestone?.amount || '',
        txHash: hash,
      });

      if (activeEscrow) {
        await fetchEscrow(userAddress);
      }
    } catch (err: any) {
      const errStr = String(err?.message || err);
      if (errStr.includes('#14') || errStr.includes('InactivityWindowNotReached')) {
        setError(
          'Inactivity window not reached. The contract requires at least 48 hours of client inactivity after work submission before auto-payout can be claimed.'
        );
      } else {
        setError(err?.message || 'Failed to claim inactivity payout.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve Milestone (Fixed: Passes approver Address)
  // Inside useEscrow.ts - Updated approveMilestone method
  // Inside useEscrow.ts - Updated approveMilestone method
  const approveMilestone = async (
    userAddress: string,
    milestoneId: number,
    targetEscrow?: Escrow
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setTxHash(null);

      const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);
      const contract = new Contract(STELLAR_CONFIG.contractId);

      const account = await server.getAccount(userAddress);
      const approverVal = new Address(userAddress).toScVal();
      const milestoneVal = nativeToScVal(milestoneId, { type: 'u32' });

      const tx = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call('approve_milestone', approverVal, milestoneVal))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const hash = await submitSignedTransaction(preparedTx);

      const activeEscrow = targetEscrow || escrow;
      const milestone = activeEscrow?.milestones.find((m) => m.id === milestoneId);

      // Clear local review flags
      const savedMeta = JSON.parse(localStorage.getItem('stellarflow_escrow_meta') || '{}');
      delete savedMeta[`review_m_${milestoneId}`];
      localStorage.setItem('stellarflow_escrow_meta', JSON.stringify(savedMeta));

      // ALWAYS re-fetch directly from Soroban RPC to get exact on-chain votes & completion status
      await fetchEscrow(userAddress);

      await logTransactionToSheet({
        eventType: 'MILESTONE_RELEASE_VOTE',
        clientName: activeEscrow?.clientName || 'Client',
        clientAddress: userAddress,
        clientEmail: activeEscrow?.clientEmail,
        freelancerName: activeEscrow?.freelancerName || 'Freelancer',
        freelancerAddress: activeEscrow?.freelancer || '',
        freelancerEmail: activeEscrow?.freelancerEmail,
        totalAmount: activeEscrow?.totalAmount || '',
        milestoneId,
        milestoneDescription: milestone?.description || '',
        milestoneAmount: milestone?.amount || '',
        txHash: hash,
      });
    } catch (err: any) {
      const errStr = String(err?.message || err);
      if (errStr.includes('#12') || errStr.includes('AlreadyVoted')) {
        setError('You have already submitted your approval vote for this milestone.');
      } else {
        setError(err?.message || 'Failed to approve milestone.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refund Expired Escrow
  const refundExpired = async (userAddress: string, targetEscrow?: Escrow) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setTxHash(null);

      const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);
      const contract = new Contract(STELLAR_CONFIG.contractId);

      const account = await server.getAccount(userAddress);

      const tx = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call('refund_expired'))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const hash = await submitSignedTransaction(preparedTx);

      const activeEscrow = targetEscrow || escrow;

      if (activeEscrow) {
        const updatedEscrow = { ...activeEscrow, status: EscrowStatus.Refunded };
        persistEscrowLocally(activeEscrow.client, updatedEscrow);
        persistEscrowLocally(activeEscrow.freelancer, updatedEscrow);
        setUserEscrows(loadLocalEscrows(userAddress));
        setEscrow(updatedEscrow);
      }

      await logTransactionToSheet({
        eventType: 'REFUNDED',
        clientName: activeEscrow?.clientName || 'Client',
        clientAddress: userAddress,
        clientEmail: activeEscrow?.clientEmail,
        freelancerName: activeEscrow?.freelancerName || 'Freelancer',
        freelancerAddress: activeEscrow?.freelancer || '',
        freelancerEmail: activeEscrow?.freelancerEmail,
        totalAmount: activeEscrow?.totalAmount || '',
        txHash: hash,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to execute refund.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    escrow,
    userEscrows,
    isFetching,
    isSubmitting,
    txHash,
    error,
    fetchEscrow,
    createEscrow,
    submitWorkForReview,
    denyMilestone,
    claimInactivityPayout,
    approveMilestone,
    refundExpired,
  };
}