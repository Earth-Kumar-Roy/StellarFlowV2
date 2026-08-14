import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CreateEscrowModal } from './components/CreateEscrowModal';
import { FeedbackModal } from './components/FeedbackModal';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { CreateEscrowPage } from './pages/CreateEscrowPage';
import { HistoryPage } from './pages/HistoryPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { DocsPage } from './pages/DocsPage';
import { useWallet } from './hooks/useWallet';
import { useEscrow } from './hooks/useEscrow';
import { STELLAR_CONFIG } from './config/stellar';
import type { Escrow } from './types/escrow';

import { ExternalLink, AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const {
    publicKey,
    xlmBalance,
    isLoading: isWalletLoading,
    error: walletError,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  } = useWallet();

  const {
    escrow,
    userEscrows,
    isFetching,
    isSubmitting,
    txHash,
    error: escrowError,
    fetchEscrow,
    createEscrow,
    submitWorkForReview,
    denyMilestone,
    claimInactivityPayout,
    approveMilestone,
    refundExpired,
  } = useEscrow();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  // Stable handler for fetching escrows
  const handleFetchEscrow = useCallback(
    (pk?: string | null) => {
      fetchEscrow(pk !== undefined ? pk : publicKey);
    },
    [fetchEscrow, publicKey]
  );

  // Sync contract & local user escrow state when wallet connects/changes
  useEffect(() => {
    fetchEscrow(publicKey);
  }, [fetchEscrow, publicKey]);

  // Sync wallet error state to top notification banner
  useEffect(() => {
    if (walletError) {
      setBannerError(walletError);
    }
  }, [walletError]);

  // Sync contract error state to top notification banner
  useEffect(() => {
    if (escrowError) {
      setBannerError(escrowError);
    }
  }, [escrowError]);

  // Handler for escrow creation (V2 Multi-Sig Parameters)
  const handleCreateEscrowSubmit = async (
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
    if (!publicKey) {
      alert('Please connect your Freighter wallet first.');
      return;
    }

    await createEscrow(
      publicKey,
      clientName,
      clientEmail,
      freelancer,
      freelancerName,
      freelancerEmail,
      cosigner1,
      cosigner2,
      token,
      totalAmount,
      deadline,
      milestones
    );

    setIsCreateModalOpen(false);
    await refreshBalance();
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased">
        
        <div>
          {/* Global Multi-Page Navigation Bar */}
          <Navbar
            publicKey={publicKey}
            xlmBalance={xlmBalance}
            isLoading={isWalletLoading}
            escrow={escrow}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
          />

          {/* Toast / Banner Notification Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
            {bannerError && (
              <div className="bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs sm:text-sm p-4 rounded-2xl mb-4 flex items-center justify-between shadow-lg shadow-rose-950/30">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{bannerError}</span>
                </div>
                <button
                  onClick={() => setBannerError(null)}
                  className="p-1 hover:bg-rose-900/60 rounded-lg text-rose-400 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {txHash && (
              <div className="bg-indigo-950/80 border border-indigo-800/80 text-indigo-200 text-xs sm:text-sm p-4 rounded-2xl mb-4 flex items-center justify-between shadow-lg shadow-indigo-950/30">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    Transaction confirmed on Testnet!{' '}
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-mono text-indigo-300 hover:text-white inline-flex items-center space-x-1 font-bold ml-1"
                    >
                      <span>View on Stellar Expert</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Router View Outlets */}
          <Routes>
            {/* 1. Landing / Home Page */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Operations Dashboard View */}
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  escrow={escrow}
                  userEscrows={userEscrows}
                  publicKey={publicKey}
                  isFetching={isFetching}
                  isSubmitting={isSubmitting}
                  onFetchEscrow={handleFetchEscrow}
                  onSubmitWorkForReview={async (id: number, targetEscrow?: Escrow) => {
                    if (publicKey) {
                      await submitWorkForReview(publicKey, id, targetEscrow);
                    }
                  }}
                  onApproveMilestone={async (id: number, targetEscrow?: Escrow) => {
                    if (publicKey) {
                      await approveMilestone(publicKey, id, targetEscrow);
                      await refreshBalance();
                    }
                  }}
                  onDenyMilestone={async (id: number, reason: string, targetEscrow?: Escrow) => {
                    if (publicKey) {
                      await denyMilestone(publicKey, id, reason, targetEscrow);
                    }
                  }}
                  onClaimInactivityPayout={async (id: number, targetEscrow?: Escrow) => {
                    if (publicKey) {
                      await claimInactivityPayout(publicKey, id, targetEscrow);
                      await refreshBalance();
                    }
                  }}
                  onRefundExpired={async (targetEscrow?: Escrow) => {
                    if (publicKey) {
                      await refundExpired(publicKey, targetEscrow);
                      await refreshBalance();
                    }
                  }}
                />
              }
            />

            {/* 3. Full-Page Escrow Creation Route */}
            <Route
              path="/create"
              element={
                <CreateEscrowPage
                  isSubmitting={isSubmitting}
                  publicKey={publicKey}
                  onSubmit={handleCreateEscrowSubmit}
                />
              }
            />

            {/* 4. Transaction & Audit History Route */}
            <Route
              path="/history"
              element={<HistoryPage publicKey={publicKey} />}
            />

            {/* 5. Community Feedback Route */}
            <Route
              path="/feedback"
              element={<FeedbackPage publicKey={publicKey} escrow={escrow} />}
            />

            {/* 6. System Documentation Route */}
            <Route
              path="/docs"
              element={<DocsPage />}
            />

            {/* Default Route Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Global Modal Overlays */}
        <CreateEscrowModal
          isOpen={isCreateModalOpen}
          isSubmitting={isSubmitting}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEscrowSubmit}
        />

        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          userAddress={publicKey}
          onClose={() => setIsFeedbackModalOpen(false)}
          onFeedbackSubmitted={() => fetchEscrow(publicKey)}
        />

        {/* Global Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
            <span>StellarFlow © 2026 — Soroban Non-Custodial Smart Escrow V2</span>
            <span className="text-slate-600">
              Contract ID:{' '}
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${STELLAR_CONFIG.contractId}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline"
              >
                {STELLAR_CONFIG.contractId.substring(0, 8)}...
              </a>
            </span>
          </div>
        </footer>

      </div>
    </Router>
  );
}