import React, { useState, useEffect } from 'react';
import type { CardState } from '../types';
import { serializeCardState } from '../utils/sharing';
import { Copy, Check, QrCode, Download, ArrowRight } from 'lucide-react';
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
      colors: ['#F472B6', '#C084FC', '#FDE047', '#34D399', '#60A5FA']
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
        origin: { y: 0.8 }
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
      <div className="glass-panel p-8 rounded-3xl shadow-xl border border-white/60 text-center space-y-6">
        
        {/* Celebration Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
            <Check size={28} className="animate-pulse" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-purple-950">Greeting Card Created!</h3>
          <p className="text-sm text-purple-900/60 max-w-[340px] mx-auto leading-relaxed">
            Your custom bouquet has been wrapped and placed in the envelope. Share it with your loved one instantly.
          </p>
        </div>

        {/* Copy Link Input & Button */}
        <div className="space-y-2.5">
          <label className="text-[11px] uppercase tracking-widest text-purple-900/40 font-bold block text-left">
            Your Unique Share Link
          </label>
          <div className="flex flex-col sm:flex-row gap-2 bg-white/70 p-1.5 rounded-2xl border border-stone-200/50 shadow-inner">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-full sm:flex-1 bg-stone-50/80 border border-stone-200/60 rounded-xl text-xs text-purple-950 font-semibold px-3 h-12 focus:outline-hidden truncate"
            />
            {/* Subtle dividing line on mobile when stacked */}
            <div className="block sm:hidden h-px bg-stone-200/40 w-[95%] mx-auto my-0.5" />
            <button
              onClick={handleCopyLink}
              className={`w-full sm:w-auto flex items-center justify-center gap-1.5 h-12 px-6 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
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
            className={`w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
              showQR
                ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                : 'bg-white/80 border-stone-200/80 text-purple-950 hover:bg-white'
            }`}
          >
            <QrCode size={15} />
            <span>{showQR ? 'Hide QR Code' : 'Show QR Code'}</span>
          </button>

          {/* Download PDF (Native Print) */}
          <button
            onClick={handlePrint}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-semibold bg-white/80 border border-stone-200/80 text-purple-950 hover:bg-white transition-all cursor-pointer"
          >
            <Download size={15} />
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
            <span className="text-[10px] text-purple-900/50 font-medium">Scan to open on mobile</span>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={onReset}
          className="w-full sm:w-auto text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-6 py-3 rounded-2xl border border-purple-200/40 text-center transition-all cursor-pointer"
        >
          Create Another Card
        </button>

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 text-center cursor-pointer"
        >
          <span>Test Recipient Preview</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
};
