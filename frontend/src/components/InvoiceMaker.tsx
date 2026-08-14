import React, { useState, useMemo } from 'react';
import type { Escrow } from '../types/escrow';
import { 
  Download, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Coins, 
  Calendar, 
  FileText, 
  Users,
  Loader2
} from 'lucide-react';

interface InvoiceMakerProps {
  escrow: Escrow;
  onClose: () => void;
}

export const InvoiceMaker: React.FC<InvoiceMakerProps> = ({ escrow, onClose }) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Deterministic Invoice ID (Fixed per contract)
  const invoiceNumber = useMemo(() => {
    const clientPart = escrow.client ? escrow.client.substring(2, 7) : '00000';
    const deadlinePart = escrow.deadline ? escrow.deadline.toString().slice(-5) : '12345';
    return `INV-${clientPart}-${deadlinePart}`.toUpperCase();
  }, [escrow.client, escrow.deadline]);

  // Static Invoice Settlement Date
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const totalAmountNum = parseFloat(escrow.totalAmount || '0');
  const currency = escrow.currency || 'XLM';

  // Isolated Print/PDF Document Export (White Paper Background)
  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    setIsGenerating(true);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      setIsGenerating(false);
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoiceNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff !important;
              color: #0f172a !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .invoice-box {
              padding: 16px;
              background-color: #ffffff;
              color: #0f172a;
              box-sizing: border-box;
            }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .text-[9px] { font-size: 9px; }
            .text-[10px] { font-size: 10px; }
            .text-[11px] { font-size: 11px; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .text-xl { font-size: 20px; }
            
            /* Professional Light Theme PDF Colors */
            .text-indigo-400 { color: #4f46e5 !important; }
            .text-emerald-400 { color: #059669 !important; }
            .text-violet-300, .text-violet-400 { color: #6d28d9 !important; }
            .text-slate-100, .text-white { color: #0f172a !important; }
            .text-slate-200, .text-slate-300 { color: #1e293b !important; }
            .text-slate-400, .text-slate-500 { color: #475569 !important; }
            
            .bg-slate-950, .bg-\\[\\#0f172a\\] { 
              background-color: #f8fafc !important; 
            }
            .border-slate-800 { 
              border: 1px solid #e2e8f0 !important; 
            }
            .bg-emerald-500\\/10 { 
              background-color: #ecfdf5 !important; 
            }
            .border-emerald-500\\/30 { 
              border: 1px solid #a7f3d0 !important; 
            }
            
            .rounded-lg { border-radius: 8px; }
            .rounded-xl { border-radius: 12px; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .break-all { word-break: break-all; }
            
            .space-y-0\\.5 > * + * { margin-top: 2px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-1\\.5 > * + * { margin-top: 6px; }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-4 > * + * { margin-top: 16px; }
            
            .border-b { border-bottom: 1px solid #e2e8f0 !important; }
            .border-t { border-top: 1px solid #e2e8f0 !important; }
            .pb-4 { padding-bottom: 16px; }
            .pt-3 { padding-top: 12px; }
            .p-3 { padding: 12px; }
            .p-6 { padding: 16px; }

            table { width: 100%; border-collapse: collapse; text-align: left; }
            th, td { padding: 8px 12px; font-size: 11px; }
            th { background-color: #f1f5f9 !important; color: #475569 !important; text-transform: uppercase; border-bottom: 1px solid #cbd5e1 !important; }
            td { border-bottom: 1px solid #e2e8f0 !important; color: #0f172a !important; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        setIsGenerating(false);
      }, 1000);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      
      {/* Printer CSS Overrides (Enforces White Background for Local Browser Printing) */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          html, body {
            height: 100% !important;
            overflow: hidden !important;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body > * {
            visibility: hidden !important;
          }
          #printable-invoice-modal, #printable-invoice-modal * {
            visibility: visible !important;
          }
          #printable-invoice-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            display: block !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-sizing: border-box !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            border: none !important;
            border-radius: 0 !important;
          }
          #printable-invoice .bg-slate-950 {
            background-color: #f8fafc !important;
          }
          #printable-invoice .border-slate-800 {
            border-color: #e2e8f0 !important;
          }
          #printable-invoice .text-white, #printable-invoice .text-slate-100 {
            color: #0f172a !important;
          }
          #printable-invoice .text-slate-300, #printable-invoice .text-slate-400 {
            color: #475569 !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Container */}
      <div 
        id="printable-invoice-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto sm:my-6"
      >
        
        {/* Modal Controls Header */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0 print-hidden">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs font-mono">
            <FileText className="w-4 h-4" />
            <span>Escrow Payment Settlement Invoice</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer shadow-md shadow-emerald-600/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing Invoice...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dark Mode Screen Preview Container */}
        <div className="p-4 sm:p-6 bg-slate-900 overflow-y-auto">
          <div 
            id="printable-invoice" 
            className="p-6 bg-[#0f172a] text-slate-200 space-y-4 rounded-xl border border-slate-800 text-xs font-sans"
          >
            
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2 text-indigo-400">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-xl font-black tracking-tight">StellarFlow</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Soroban Smart Contract Escrow Platform
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold uppercase mb-1">
                  Paid & Settled
                </span>
                <h1 className="text-sm font-bold text-white">{invoiceNumber}</h1>
                <p className="text-[10px] text-slate-400 flex items-center justify-end space-x-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>Date: {currentDate}</span>
                </p>
              </div>
            </div>

            {/* Stacked Address Blocks */}
            <div className="space-y-2 font-mono text-[11px]">
              
              {/* Billed To (Client) */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                  Billed To (Client)
                </span>
                <strong className="text-xs font-bold text-slate-100 block font-sans">
                  {escrow.clientName || 'Client'}
                </strong>
                <div className="text-indigo-400 text-[10px] break-all leading-normal block">
                  Address: {escrow.client}
                </div>
                {escrow.clientEmail && (
                  <div className="text-slate-400 text-[10px]">Email: {escrow.clientEmail}</div>
                )}
              </div>

              {/* Payee (Freelancer) */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                  Payee (Freelancer)
                </span>
                <strong className="text-xs font-bold text-slate-100 block font-sans">
                  {escrow.freelancerName || 'Freelancer'}
                </strong>
                <div className="text-emerald-400 text-[10px] break-all leading-normal block">
                  Address: {escrow.freelancer}
                </div>
                {escrow.freelancerEmail && (
                  <div className="text-slate-400 text-[10px]">Email: {escrow.freelancerEmail}</div>
                )}
              </div>

              {/* Multi-Sig Co-Signers */}
              {(escrow.cosigner1 || escrow.cosigner2) && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider block flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>2-of-3 Governance Co-Signers</span>
                  </span>
                  {escrow.cosigner1 && (
                    <div className="text-[10px] text-slate-300">
                      <span className="text-slate-500">Co-Signer 1: </span>
                      <span className="break-all text-violet-300">{escrow.cosigner1}</span>
                    </div>
                  )}
                  {escrow.cosigner2 && (
                    <div className="text-[10px] text-slate-300">
                      <span className="text-slate-500">Co-Signer 2: </span>
                      <span className="break-all text-violet-300">{escrow.cosigner2}</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Line Items / Milestones Table */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Settled Deliverables
              </h3>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2 text-right">Status</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {escrow.milestones.map((m) => (
                      <tr key={m.id} className="text-slate-300">
                        <td className="px-3 py-2 font-bold">#{m.id}</td>
                        <td className="px-3 py-2 font-sans font-medium text-slate-100">
                          {m.description}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Released</span>
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-white">
                          {m.amount} {currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-60 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Locked:</span>
                  <span>{escrow.totalAmount} {currency}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Protocol Fee:</span>
                  <span>0.00 {currency}</span>
                </div>
                <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center text-xs font-black text-white">
                  <span>Total Settled:</span>
                  <span className="text-emerald-400 font-mono flex items-center space-x-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{totalAmountNum.toString()} {currency}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* On-Chain Audit Footer */}
            <div className="pt-3 border-t border-slate-800 text-center text-[9px] text-slate-500 font-mono space-y-0.5">
              <p>Verified On-Chain Settlement — Stellar Testnet Soroban Escrow Contract</p>
              <p className="truncate">Vault: {escrow.token || 'Native Soroban Vault'}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};