import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STELLAR_CONFIG } from '../config/stellar';
import { 
  PlusCircle, 
  Trash2, 
  User, 
  Mail, 
  Coins, 
  ShieldCheck, 
  AlertCircle,
  ArrowLeft,
  Users
} from 'lucide-react';

interface CreateEscrowPageProps {
  isSubmitting: boolean;
  publicKey?: string | null;
  onSubmit: (
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
  ) => Promise<void>;
}

export const CreateEscrowPage: React.FC<CreateEscrowPageProps> = ({
  isSubmitting,
  publicKey,
  onSubmit,
}) => {
  const navigate = useNavigate();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [freelancer, setFreelancer] = useState('');
  const [freelancerName, setFreelancerName] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [cosigner1, setCosigner1] = useState('');
  const [cosigner2, setCosigner2] = useState('');
  const [token, setToken] = useState(STELLAR_CONFIG.nativeTokenAddress);
  const [totalAmount, setTotalAmount] = useState('');
  const [days, setDays] = useState('7');
  const [milestones, setMilestones] = useState([
    { id: 1, description: 'Initial Project Deliverable', amount: '' },
  ]);

  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { id: prev.length + 1, description: '', amount: '' },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMilestoneChange = (
    index: number,
    field: 'description' | 'amount',
    value: string
  ) => {
    setMilestones((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const milestoneSum = milestones.reduce(
    (acc, m) => acc + (parseFloat(m.amount) || 0),
    0
  );
  const totalVal = parseFloat(totalAmount) || 0;
  const isAmountMismatch = totalVal > 0 && milestoneSum !== totalVal;

  // Threshold check: Amounts > 5,000 XLM mandate 2-of-3 multi-sig co-signers
  const isMultiSigRequired = totalVal > 5000;

  // Validation: Freelancer address cannot match client connected wallet
  const isSelfAddress = Boolean(
    publicKey && freelancer.trim().toLowerCase() === publicKey.trim().toLowerCase()
  );

  // Validation: Co-signers check for > 5,000 XLM contracts
  const isCosignerMissing =
    isMultiSigRequired && (!cosigner1.trim() || !cosigner2.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSelfAddress) {
      alert('Freelancer address cannot be the same as your connected client wallet address.');
      return;
    }

    if (isAmountMismatch) {
      alert(`Milestone total (${milestoneSum} XLM) must equal total escrow amount (${totalVal} XLM).`);
      return;
    }

    if (isCosignerMissing) {
      alert('Escrows above 5,000 XLM mandate two distinct co-signer wallet addresses for governance.');
      return;
    }

    const deadlineTimestamp = Math.floor(
      Date.now() / 1000 + parseInt(days, 10) * 86400
    );

    await onSubmit(
      clientName || 'Client',
      clientEmail,
      freelancer,
      freelancerName || 'Freelancer',
      freelancerEmail,
      cosigner1.trim(),
      cosigner2.trim(),
      token,
      totalAmount,
      deadlineTimestamp,
      milestones
    );

    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
      
      {/* Back Button & Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Create Escrow Agreement (V2)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Lock funds into Soroban smart contract with automated 2-of-3 multi-sig governance & inactivity payouts
        </p>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Client Details Section */}
          <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-4">
            <span className="text-xs font-bold uppercase text-indigo-400 flex items-center space-x-1.5 font-mono">
              <User className="w-4 h-4" />
              <span>1. Client Profile (Deployer)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Client Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Earth Kumar"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Client Email Address (For Notifications)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 pl-9"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Freelancer Details Section */}
          <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-4">
            <span className="text-xs font-bold uppercase text-emerald-400 flex items-center space-x-1.5 font-mono">
              <User className="w-4 h-4" />
              <span>2. Freelancer Profile (Recipient)</span>
            </span>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Freelancer Stellar Wallet Address *
              </label>
              <input
                type="text"
                required
                value={freelancer}
                onChange={(e) => setFreelancer(e.target.value)}
                placeholder="G..."
                className={`w-full bg-slate-900 border ${
                  isSelfAddress ? 'border-rose-500/80' : 'border-slate-800'
                } rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono`}
              />
              {isSelfAddress && (
                <p className="text-[11px] text-rose-400 font-mono mt-1.5 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Freelancer wallet address cannot be the same as your connected client wallet address.</span>
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Freelancer Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={freelancerName}
                  onChange={(e) => setFreelancerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Freelancer Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="freelancer@example.com"
                    value={freelancerEmail}
                    onChange={(e) => setFreelancerEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 pl-9"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Financial & Lock Parameters */}
          <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-4">
            <span className="text-xs font-bold uppercase text-amber-400 flex items-center space-x-1.5 font-mono">
              <Coins className="w-4 h-4" />
              <span>3. Financial & Lock Parameters</span>
            </span>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Stellar Asset Contract (SAC) Address
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Total Locked Escrow Amount (XLM)
                </label>
                <input
                  type="number"
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Contract Duration (Days)
                </label>
                <input
                  type="number"
                  required
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Multi-Sig Governance Co-Signers (Mandatory when > 5,000 XLM) */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
            isMultiSigRequired 
              ? 'bg-indigo-950/40 border-indigo-500/50' 
              : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-violet-400 flex items-center space-x-1.5 font-mono">
                <Users className="w-4 h-4" />
                <span>4. Governance Co-Signers (2-of-3 Approval)</span>
              </span>
              {isMultiSigRequired && (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  Mandatory (&gt; 5,000 XLM)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              For contracts exceeding 5,000 XLM, Soroban requires 2-of-3 distinct approval votes (Client + Co-Signer 1 or 2) before releasing milestone funds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Co-Signer 1 Wallet Address {isMultiSigRequired ? '*' : '(Optional)'}
                </label>
                <input
                  type="text"
                  required={isMultiSigRequired}
                  value={cosigner1}
                  onChange={(e) => setCosigner1(e.target.value)}
                  placeholder="G..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Co-Signer 2 Wallet Address {isMultiSigRequired ? '*' : '(Optional)'}
                </label>
                <input
                  type="text"
                  required={isMultiSigRequired}
                  value={cosigner2}
                  onChange={(e) => setCosigner2(e.target.value)}
                  placeholder="G..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 5. Milestone Allocations */}
          <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-indigo-300 flex items-center space-x-1.5 font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>5. Milestone Schedule & Allocation</span>
              </span>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Milestone</span>
              </button>
            </div>

            {milestones.map((m, idx) => (
              <div key={m.id} className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-900 px-2.5 py-2 rounded-xl border border-slate-800">
                  #{m.id}
                </span>
                <input
                  type="text"
                  required
                  placeholder={`Milestone #${m.id} description`}
                  value={m.description}
                  onChange={(e) =>
                    handleMilestoneChange(idx, 'description', e.target.value)
                  }
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  required
                  placeholder="XLM"
                  value={m.amount}
                  onChange={(e) =>
                    handleMilestoneChange(idx, 'amount', e.target.value)
                  }
                  className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {isAmountMismatch && (
              <p className="text-xs text-amber-400 flex items-center space-x-1 mt-2 font-mono bg-amber-950/40 p-3 rounded-xl border border-amber-800/60">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Sum of milestones ({milestoneSum} XLM) does not equal total escrow amount ({totalVal} XLM).
                </span>
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-6 py-3 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isAmountMismatch || isSelfAddress || isCosignerMissing}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-indigo-600/25"
            >
              {isSubmitting ? 'Deploying to Soroban...' : 'Deploy & Lock Funds'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};