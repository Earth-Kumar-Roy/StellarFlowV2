import React from 'react';
import { Search, ArrowUpDown, Filter } from 'lucide-react';

export type StatusFilter = 'all' | 'active' | 'under_review' | 'completed' | 'expired';
export type SortOption = 'newest' | 'oldest' | 'highest_amount' | 'deadline';

interface EscrowFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  filteredCount: number;
}

export const EscrowFilterBar: React.FC<EscrowFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  totalCount,
  filteredCount,
}) => {
  const statusTabs: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All Agreements' },
    { id: 'active', label: 'Active Vaults' },
    { id: 'under_review', label: 'In Review' },
    { id: 'completed', label: 'Settled' },
    { id: 'expired', label: 'Expired' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-md">
      {/* Search Input & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by participant name, wallet address, or milestone description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-14 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 font-mono cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="newest" className="bg-slate-900">Newest Created</option>
              <option value="oldest" className="bg-slate-900">Oldest Created</option>
              <option value="highest_amount" className="bg-slate-900">Highest Budget (XLM)</option>
              <option value="deadline" className="bg-slate-900">Closest Deadline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 hidden sm:inline" />
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer text-xs font-semibold ${
                selectedStatus === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5 self-end sm:self-auto">
          <span>Showing</span>
          <strong className="text-indigo-300 font-bold">{filteredCount}</strong>
          <span>of</span>
          <strong className="text-white">{totalCount}</strong>
          <span>Vaults</span>
        </div>
      </div>
    </div>
  );
};