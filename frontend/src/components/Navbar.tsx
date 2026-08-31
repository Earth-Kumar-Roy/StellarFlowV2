import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Wallet, 
  LogOut, 
  Layers, 
  PlusCircle, 
  History, 
  MessageSquare, 
  BookOpen, 
  Coins, 
  UserCheck, 
  ShieldCheck, 
  Eye,
  Home,
  ExternalLink,
  Globe
} from 'lucide-react';
import type { Escrow } from '../types/escrow';

export type DisplayCurrency = 'NATIVE' | 'USD' | 'EUR' | 'INR';

interface NavbarProps {
  publicKey: string | null;
  xlmBalance: string | null;
  isLoading: boolean;
  escrow: Escrow | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  publicKey,
  xlmBalance,
  isLoading,
  escrow,
  onConnect,
  onDisconnect,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<DisplayCurrency>('NATIVE');

  useEffect(() => {
    const saved = localStorage.getItem('stellarflow_currency') as DisplayCurrency;
    if (saved) setSelectedCurrency(saved);
  }, []);

  const handleCurrencyChange = (curr: DisplayCurrency) => {
    setSelectedCurrency(curr);
    localStorage.setItem('stellarflow_currency', curr);
    // Broadcast currency change event across the DOM
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: curr }));
  };

  const formatAddress = (addr: string) =>
    `${addr.substring(0, 5)}...${addr.substring(addr.length - 4)}`;

  // Determine role relative to active escrow
  const getUserRole = () => {
    if (!publicKey || !escrow) return null;
    if (publicKey === escrow.client) {
      return { label: 'Client', icon: ShieldCheck, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    }
    if (publicKey === escrow.freelancer) {
      return { label: 'Freelancer', icon: UserCheck, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    return { label: 'Observer', icon: Eye, color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
  };

  const role = getUserRole();

  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <div className="sticky top-0 z-50">
      
      {/* Top Google Form Announcement Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-violet-900 text-white text-xs font-medium py-2 px-4 text-center border-b border-indigo-500/30 flex items-center justify-center space-x-2">
        <span>Share your valuable feedback (less than 1 min) to help us elevate StellarFlow.</span>
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLSdNgxtQ-RwlbzeZW-v1WvDm9xtM3CBmQ0ub1CARjXllzQ1Gfg/viewform" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center space-x-1 underline font-bold text-amber-300 hover:text-amber-200 transition ml-1"
        >
          <span>Fill Form</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <NavLink to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300 tracking-tight">
                    StellarFlow
                  </span>
                  <span className="bg-indigo-950/80 text-indigo-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-indigo-800/60 tracking-wider">
                    Testnet
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Soroban Smart Escrow
                </span>
              </div>
            </NavLink>

            {/* Mobile Wallet & Currency Controls */}
            <div className="md:hidden flex items-center space-x-2">
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value as DisplayCurrency)}
                className="bg-slate-800 text-slate-300 border border-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none font-mono"
              >
                <option value="NATIVE">Native</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
              </select>

              {publicKey ? (
                <button
                  onClick={onDisconnect}
                  className="p-2 text-slate-400 hover:text-red-400 bg-slate-800/80 rounded-lg border border-slate-700/60"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onConnect}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-md shadow-indigo-600/20"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <NavLink to="/" className={navLinkStyle} end>
              <Home className="w-4 h-4" />
              <span>Home</span>
            </NavLink>
            <NavLink to="/dashboard" className={navLinkStyle}>
              <Layers className="w-4 h-4" />
              <span>Escrow</span>
            </NavLink>
            <NavLink to="/create" className={navLinkStyle}>
              <PlusCircle className="w-4 h-4" />
              <span>New Agreement</span>
            </NavLink>
            <NavLink to="/history" className={navLinkStyle}>
              <History className="w-4 h-4" />
              <span>Activity Log</span>
            </NavLink>
            <NavLink to="/feedback" className={navLinkStyle}>
              <MessageSquare className="w-4 h-4" />
              <span>Feedback</span>
            </NavLink>
            <NavLink to="/docs" className={navLinkStyle}>
              <BookOpen className="w-4 h-4" />
              <span>Docs</span>
            </NavLink>
          </nav>

          {/* Wallet & Multi-Currency Display */}
          <div className="hidden md:flex items-center space-x-2.5">
            
            {/* Multi-Currency Conversion Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 font-mono">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value as DisplayCurrency)}
                className="bg-transparent text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="NATIVE" className="bg-slate-900">Native Token</option>
                <option value="USD" className="bg-slate-900">USD ($)</option>
                <option value="EUR" className="bg-slate-900">EUR (€)</option>
                <option value="INR" className="bg-slate-900">INR (₹)</option>
              </select>
            </div>

            {publicKey ? (
              <div className="flex items-center space-x-2">
                {/* Role Context Badge */}
                {role && (
                  <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${role.color}`}>
                    <role.icon className="w-3.5 h-3.5" />
                    <span>{role.label}</span>
                  </div>
                )}

                {/* Live XLM Balance Indicator */}
                <div className="flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/70 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{xlmBalance !== null ? `${xlmBalance} XLM` : 'Loading...'}</span>
                </div>

                {/* Public Key Display */}
                <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl">
                  <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-200 font-mono text-xs font-medium">
                    {formatAddress(publicKey)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={onDisconnect}
                  className="p-2 bg-slate-800 hover:bg-slate-700/80 hover:text-red-400 text-slate-400 rounded-xl transition duration-150 border border-slate-700/70 cursor-pointer"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

        </div>
      </header>
    </div>
  );
};