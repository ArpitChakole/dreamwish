import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

interface EnvelopeProps {
  sender: string;
  recipient: string;
  occasionEmoji: string;
  onOpen: () => void;
  children: React.ReactNode; // The actual Greeting Card content
}

export const Envelope: React.FC<EnvelopeProps> = ({
  sender,
  recipient,
  occasionEmoji,
  onOpen,
  children
}) => {
  const [isSealBroken, setIsSealBroken] = useState(false);
  const [isFlapOpened, setIsFlapOpened] = useState(false);
  const [isCardExtracted, setIsCardExtracted] = useState(false);

  const handleOpenFlow = async () => {
    if (isSealBroken) return;
    
    // Step 1: Break seal
    setIsSealBroken(true);
    
    // Step 2: Open Top Flap after a small delay
    setTimeout(() => {
      setIsFlapOpened(true);
      
      // Step 3: Slide out and scale the card after the flap is open
      setTimeout(() => {
        setIsCardExtracted(true);
        // Trigger parent callback (e.g. play music)
        onOpen();
      }, 800);
    }, 600);
  };

  return (
    <div className="relative w-full max-w-[90vw] md:max-w-lg aspect-[4/3] max-h-[50vh] md:max-h-none mx-auto flex items-center justify-center select-none perspective-[1000px] px-4">
      <AnimatePresence>
        {!isCardExtracted ? (
          <motion.div 
            className="relative w-full h-full cursor-pointer group"
            onClick={handleOpenFlow}
            exit={{ 
              scale: 0.85, 
              opacity: 0,
              y: 50,
              transition: { duration: 0.8, ease: "easeInOut" }
            }}
          >
            {/* Soft shadow underneath the envelope */}
            <div className="absolute -bottom-6 left-1/10 right-1/10 h-6 bg-purple-950/5 blur-xl rounded-full transition-all group-hover:bg-purple-950/10 group-hover:scale-x-105" />

            <div className="relative w-full h-full rounded-2xl overflow-hidden glass-card shadow-2xl border border-white/40 flex flex-col justify-between" style={{ background: 'rgba(255, 255, 255, 0.22)', backdropFilter: 'blur(4px)' }}>
              
              {/* Envelope Top Flap (translucent glass flap) */}
              <motion.div
                className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-white/30 border-b border-white/20 origin-top z-30 backdrop-blur-xs"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}
                animate={isFlapOpened ? { 
                  rotateX: 180, 
                  y: -1,
                  zIndex: 5,
                  filter: 'brightness(0.95)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                } : { 
                  rotateX: 0 
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />

              {/* Envelope Body / Pocket (translucent glass pocket) */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/40 to-transparent z-10"
                style={{ 
                  clipPath: 'polygon(0% 40%, 100% 40%, 100% 100%, 0% 100%)',
                  boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.02)'
                }}
              />
              
              {/* Left and Right inner folds for realistic translucent look */}
              <div 
                className="absolute inset-0 bg-white/15 z-10"
                style={{ clipPath: 'polygon(0% 0%, 35% 50%, 0% 100%)' }}
              />
              <div 
                className="absolute inset-0 bg-white/15 z-10"
                style={{ clipPath: 'polygon(100% 0%, 65% 50%, 100% 100%)' }}
              />

              {/* Recipient Address Text - Top portion (no overlap with stamp) */}
              <div className="absolute inset-x-0 top-0 z-20 flex flex-col items-center p-6 pt-10 pointer-events-none text-center">
                <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold mb-1">
                  Specially Created For
                </span>
                <h3 className="font-serif text-2xl italic text-purple-950 font-bold drop-shadow-sm">
                  {recipient}
                </h3>
              </div>

              {/* Envelope Action Prompt - Bottom portion (no overlap with stamp) */}
              <div className="absolute inset-x-0 bottom-12 z-20 flex flex-col items-center pointer-events-none text-center">
                <div className="flex items-center gap-1.5 text-xs text-stone-600 font-bold bg-white/70 px-4 py-1.5 rounded-full border border-stone-200/20 backdrop-blur-xs shadow-2xs">
                  <span>Click here or open here {occasionEmoji}</span>
                  <Sparkles size={12} className="text-gold-500 animate-pulse-slow" />
                </div>
              </div>

              {/* Gold Wax Seal (animates and breaks on click) */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
                animate={isFlapOpened ? { 
                  y: -60,
                  scale: 0.9,
                  opacity: 0,
                  pointerEvents: 'none'
                } : {}}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  className="relative w-18 h-18 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
                  animate={isSealBroken ? {
                    scale: [1, 1.15, 0.8],
                    rotate: [0, -8, 8, 0],
                    boxShadow: '0 0 25px rgba(212, 175, 55, 0.7)'
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {/* Wax Seal Ribbons - premium dual tone with V-cuts */}
                  <div className="absolute top-12 left-[30%] w-3 h-14 bg-rose-700 origin-top rotate-[-12deg] -z-10 shadow-md border-r border-rose-800 group-hover:opacity-10 transition-opacity duration-300" 
                       style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 90%, 50% 100%, 0% 90%)' }} />
                  <div className="absolute top-12 left-[50%] w-3 h-16 bg-rose-800 origin-top rotate-[10deg] -z-10 shadow-md border-l border-rose-950 group-hover:opacity-10 transition-opacity duration-300" 
                       style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 90%, 50% 100%, 0% 90%)' }} />
                  {/* Gold thread overlay */}
                  <div className="absolute top-12 left-[44%] w-1.5 h-15 bg-amber-400 origin-top rotate-[-2deg] -z-10 opacity-70 group-hover:opacity-10 transition-opacity duration-300"
                       style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />

                  {/* Organic irregular wax outer pool */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b] via-[#d97706] to-[#b45309] shadow-xl border border-[#fbbf24]/30 group-hover:opacity-15 transition-opacity duration-300"
                       style={{ 
                         borderRadius: '53% 47% 52% 48% / 47% 55% 45% 53%',
                         boxShadow: 'inset 1.5px 1.5px 3px rgba(255,255,255,0.25), inset -2px -2px 4px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.15)'
                       }} 
                  />

                  {/* Secondary inner ring of melted wax buildup */}
                  <div className="absolute inset-1.5 bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f] border border-[#fbbf24]/20 group-hover:opacity-15 transition-opacity duration-300"
                       style={{ 
                         borderRadius: '48% 52% 46% 54% / 51% 47% 53% 49%',
                         boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.45)'
                       }} 
                  />

                  {/* Flat central die press area */}
                  <div className="absolute inset-3.5 bg-gradient-to-tr from-[#78350f] via-[#b45309] to-[#fbbf24] flex items-center justify-center border border-[#78350f]/30 shadow-inner group-hover:opacity-10 transition-opacity duration-300"
                       style={{ borderRadius: '50%' }}
                  >
                    {/* Concentric engraved thin circle */}
                    <div className="absolute inset-1 rounded-full border border-[#78350f]/20 opacity-50 pointer-events-none" />

                    {/* Engraved heart icon with drop shadow letterpress effect */}
                    <div className="relative transform translate-y-[-0.5px]">
                      <Heart 
                        size={18} 
                        fill="#78350f" 
                        className="text-[#b45309] filter drop-shadow-[0.5px_0.5px_0.5px_rgba(255,255,255,0.4)] drop-shadow-[-0.5px_-0.5px_0.5px_rgba(0,0,0,0.45)] group-hover:opacity-10 transition-opacity duration-300" 
                      />
                    </div>
                  </div>

                  {/* Sparkles micro-animation on hover */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Sparkles size={12} className="text-amber-200 absolute top-1 left-2 animate-pulse" />
                    <Sparkles size={10} className="text-amber-100 absolute bottom-2 right-1.5 animate-pulse delay-75" />
                  </div>

                  {/* Click/Open Hint Badge */}
                  <div className="absolute top-[80px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100/95 border border-amber-200/50 px-3 py-1.5 rounded-full shadow-xs pointer-events-none animate-bounce z-50 transition-opacity duration-300">
                    Click here or open here 👆
                  </div>
                </motion.div>
              </motion.div>

              {/* Sender stamp in the corner */}
              <div className="absolute bottom-4 right-6 text-right z-20 pointer-events-none">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 block mb-0.5">With Love,</span>
                <span className="font-serif text-sm italic text-stone-600 font-semibold">{sender}</span>
              </div>
            </div>

            {/* The greeting card peek (sitting inside the envelope) */}
            <motion.div 
              className="absolute inset-x-4 bottom-2 h-[80%] rounded-xl bg-white border border-stone-200/50 shadow-inner flex flex-col justify-end p-4 select-none opacity-80 z-0 overflow-hidden transition-all duration-500 group-hover:-translate-y-6 group-hover:opacity-95"
              animate={isFlapOpened ? { 
                y: -15, 
                opacity: 0.95 
              } : {}}
            >
              <div className="w-12 h-1 bg-stone-200 mx-auto rounded-full mb-auto" />
              <div className="space-y-2 mb-4">
                <div className="h-2 w-3/4 bg-stone-100 rounded" />
                <div className="h-2 w-1/2 bg-stone-100 rounded" />
              </div>
            </motion.div>

          </motion.div>
        ) : (
          /* When card is extracted, we render the children inside a smooth entry container */
          <motion.div
            key="greeting-card-content"
            className="w-full"
            initial={{ scale: 0.9, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
