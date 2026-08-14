import React, { useState } from 'react';
import { STELLAR_CONFIG } from '../config/stellar';
import { 
  PlusCircle, 
  Trash2, 
  X, 
  User, 
  Mail, 
  Coins, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Users
} from 'lucide-react';

interface CreateEscrowModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
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
  ) => void;
}

export const CreateEscrowModal: React.FC<CreateEscrowModalProps> = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
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
    { id: 1, description: 'Initial Milestone', amount: '' },
  ]);

  if (!isOpen) return null;

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

  // Calculate sum of milestones
  const milestoneSum = milestones.reduce(
    (acc, m) => acc + (parseFloat(m.amount) || 0),
    0
  );
  const totalVal = parseFloat(totalAmount) || 0;
  const isAmountMismatch = totalVal > 0 && milestoneSum !== totalVal;

  // Multi-Sig Threshold Rule: Amounts > 5,000 XLM mandate co-signers
  const isMultiSigRequired = totalVal > 5000;
  const isCosignerMissing = isMultiSigRequired && (!cosigner1.trim() || !cosigner2.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAmountMismatch) {
      alert(
        `Milestone sum (${milestoneSum} XLM) must equal Total Escrow Amount (${totalVal} XLM).`
      );
      return;
    }

    if (isCosignerMissing) {
      alert('Escrows above 5,000 XLM mandate two distinct co-signer wallet addresses for multi-sig governance.');
      return;
    }

    const deadlineTimestamp = Math.floor(
      Date.now() / 1000 + parseInt(days, 10) * 86400
    );

    onSubmit(
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
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="relative bg-slate-900 border border-slate-800/90 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Initialize Smart Escrow (V2)</h3>
              <p className="text-xs text-slate-400">Deploy non-custodial 2-of-3 multi-sig milestone vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Client Details Section */}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-3">
            <span className="text-xs font-bold uppercase text-indigo-400 flex items-center space-x-1.5 font-mono">
              <User className="w-3.5 h-3.5" />
              <span>Client Information (Your Profile)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Your Name (Client)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your Email (For Alerts)"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 pl-8"
                />
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Freelancer Details Section */}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-3">
            <span className="text-xs font-bold uppercase text-emerald-400 flex items-center space-x-1.5 font-mono">
              <User className="w-3.5 h-3.5" />
              <span>Freelancer Information (Counterparty)</span>
            </span>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Freelancer Stellar Address *
              </label>
              <input
                type="text"
                required
                value={freelancer}
                onChange={(e) => setFreelancer(e.target.value)}
                placeholder="G..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Freelancer Name"
                value={freelancerName}
                onChange={(e) => setFreelancerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <div className="relative">
                <input
                  type="email"
                  placeholder="Freelancer Email (For Alerts)"
                  value={freelancerEmail}
                  onChange={(e) => setFreelancerEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 pl-8"
                />
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Governance Co-Signers Section */}
          <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
            isMultiSigRequired ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-950/50 border-slate-800/80'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-violet-400 flex items-center space-x-1.5 font-mono">
                <Users className="w-3.5 h-3.5" />
                <span>Multi-Sig Co-Signers</span>
              </span>
              {isMultiSigRequired && (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  Required (&gt; 5k XLM)
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required={isMultiSigRequired}
                  placeholder={`Co-Signer 1 Address ${isMultiSigRequired ? '*' : '(Optional)'}`}
                  value={cosigner1}
                  onChange={(e) => setCosigner1(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
              <div>
                <input
                  type="text"
                  required={isMultiSigRequired}
                  placeholder={`Co-Signer 2 Address ${isMultiSigRequired ? '*' : '(Optional)'}`}
                  value={cosigner2}
                  onChange={(e) => setCosigner2(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Token Contract Address */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Token Contract Address (SAC)
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Amount and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1 flex items-center space-x-1">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>Total Amount (XLM)</span>
              </label>
              <input
                type="number"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="1000"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>Duration (Days)</span>
              </label>
              <input
                type="number"
                required
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Milestones Schedule Input */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-slate-300">
                Milestone Breakdown
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            {milestones.map((m, idx) => (
              <div key={m.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  required
                  placeholder={`Milestone #${m.id} description`}
                  value={m.description}
                  onChange={(e) =>
                    handleMilestoneChange(idx, 'description', e.target.value)
                  }
                  className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  required
                  placeholder="Amount"
                  value={m.amount}
                  onChange={(e) =>
                    handleMilestoneChange(idx, 'amount', e.target.value)
                  }
                  className="w-28 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {isAmountMismatch && (
              <p className="text-xs text-amber-400 flex items-center space-x-1 mt-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Milestone total ({milestoneSum} XLM) does not equal Total Amount ({totalVal} XLM).
                </span>
              </p>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isAmountMismatch || isCosignerMissing}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              {isSubmitting ? 'Deploying to Soroban...' : 'Initialize Escrow'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};