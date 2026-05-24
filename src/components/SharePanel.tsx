import React, { useState, useEffect } from 'react';
import type { CardState } from '../types';
import { serializeCardState } from '../utils/sharing';
import { Copy, Check, QrCode, Printer, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SharePanelProps {
  state: CardState;
  onReset: () => void;
}

export const SharePanel: React.FC<SharePanelProps> = ({ state, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // Generate full sharing URL based on the current window location
    const baseUrl = window.location.origin + window.location.pathname;
    const hash = serializeCardState(state);
    const fullUrl = `${baseUrl}#card=${hash}`;
    setShareUrl(fullUrl);

    // Burst confetti when the user completes the card and lands here!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#be123c', '#e11d48', '#fda4af', '#f43f5e', '#fb7185'] // Mapped rose colors
    });
  }, [state]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // Trigger a small confetti burst on copy success
      confetti({
        particleCount: 30,
        spread: 30,
        origin: { y: 0.8 },
        colors: ['#be123c', '#e11d48', '#f43f5e']
      });

      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 no-print">
      {/* Double-Bezel outer shell */}
      <div className="double-bezel-outer shadow-xl">
        {/* Double-Bezel inner core */}
        <div className="double-bezel-inner p-8 text-center space-y-6">
          
          {/* Celebration Header */}
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100/50 shadow-xs">
              <Check size={28} className="animate-pulse" strokeWidth={2} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-900">Greeting Card Created!</h3>
            <p className="text-sm text-slate-500 max-w-[340px] mx-auto leading-relaxed">
              Your custom bouquet has been wrapped and placed in the envelope. Share it with your loved one instantly.
            </p>
          </div>

          {/* Copy Link Input & Button */}
          <div className="space-y-2.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block text-left">
              Your Unique Share Link
            </label>
            <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-1.5 rounded-2xl border border-stone-200/50 shadow-inner">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full sm:flex-1 bg-white border border-stone-200/40 rounded-xl text-xs text-slate-800 font-semibold px-3 h-12 focus:outline-hidden truncate"
              />
              <div className="block sm:hidden h-px bg-stone-200/40 w-[95%] mx-auto my-0.5" />
              <button
                onClick={handleCopyLink}
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 h-12 px-6 rounded-xl text-xs font-bold transition-all active-press-scale cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-rose-700 hover:bg-rose-800 text-white shadow-md'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share buttons row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {/* Toggle QR Code */}
            <button
              onClick={() => setShowQR(!showQR)}
              className={`w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer active-press-scale ${
                showQR
                  ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                  : 'bg-white/80 border-stone-200/80 text-slate-800 hover:bg-white'
              }`}
            >
              <QrCode size={15} strokeWidth={1.5} />
              <span>{showQR ? 'Hide QR Code' : 'Show QR Code'}</span>
            </button>

            {/* Download PDF (Native Print) */}
            <button
              onClick={handlePrint}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-white/80 border border-stone-200/80 text-slate-800 hover:bg-white transition-all cursor-pointer active-press-scale"
            >
              <Printer size={15} strokeWidth={1.5} />
              <span>Save PDF / Print</span>
            </button>
          </div>

          {/* QR Code Container */}
          {showQR && (
            <div className="p-4 bg-white rounded-2xl border border-stone-100 shadow-inner flex flex-col items-center justify-center gap-2 max-w-[200px] mx-auto animate-scale-up">
              <img 
                src={qrImageUrl} 
                alt="QR Code Link" 
                className="w-36 h-36 border border-stone-100 rounded-lg"
                loading="lazy"
              />
              <span className="text-[10px] text-slate-400 font-medium">Scan to open on mobile</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={onReset}
          className="w-full sm:w-auto text-xs font-bold text-slate-700 hover:text-slate-800 bg-stone-100 hover:bg-stone-200/60 px-6 py-3 rounded-full border border-stone-200 text-center transition-all cursor-pointer active-press-scale"
        >
          Create Another Card
        </button>

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-between gap-4 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white pl-6 pr-3.5 py-3 rounded-full shadow-lg transition-all active-press-scale text-center cursor-pointer group"
        >
          <span>Test Recipient Preview</span>
          <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <ArrowRight size={14} className="text-white transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>
      </div>
    </div>
  );
};
