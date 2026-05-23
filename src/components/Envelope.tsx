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

            <div className="relative w-full h-full rounded-2xl overflow-hidden glass-card shadow-2xl border border-white/40 flex flex-col justify-between">
              
              {/* Envelope Top Flap (animated) */}
              <motion.div
                className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-stone-100 to-stone-50/90 border-b border-stone-200 origin-top z-30"
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

              {/* Envelope Body / Pocket (bottom and side flaps sitting in front) */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-stone-100/95 via-stone-50/95 to-transparent z-10"
                style={{ 
                  clipPath: 'polygon(0% 40%, 100% 40%, 100% 100%, 0% 100%)',
                  boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.02)'
                }}
              />
              
              {/* Left and Right inner folds for realistic look */}
              <div 
                className="absolute inset-0 bg-stone-100/60 z-10"
                style={{ clipPath: 'polygon(0% 0%, 35% 50%, 0% 100%)' }}
              />
              <div 
                className="absolute inset-0 bg-stone-100/60 z-10"
                style={{ clipPath: 'polygon(100% 0%, 65% 50%, 100% 100%)' }}
              />

              {/* Recipient Address Text inside the envelope pocket (shows when closed) */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 pointer-events-none text-center">
                <span className="text-xs uppercase tracking-[0.25em] text-stone-400 font-semibold mb-2">
                  Specially Created For
                </span>
                <h3 className="font-serif text-3xl italic text-purple-950 font-bold mb-4 drop-shadow-sm">
                  {recipient}
                </h3>
                <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-gold-400 to-transparent mb-4" />
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium bg-stone-100/80 px-3 py-1 rounded-full border border-stone-200/50">
                  <span>Open to reveal {occasionEmoji} wishes</span>
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
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-gold-500 to-amber-700 shadow-lg border border-amber-300 flex items-center justify-center cursor-pointer relative group-hover:scale-105 active:scale-95"
                  animate={isSealBroken ? {
                    scale: [1, 1.2, 0.8],
                    rotate: [0, -10, 10],
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)'
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {/* Wax Seal Ribbon */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-12 bg-red-700/80 skew-x-12 -z-10 shadow-sm border-r border-red-800" />
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-10 bg-red-800/90 -skew-x-12 -z-10 shadow-sm" />

                  {/* Stamp Design */}
                  <div className="w-12 h-12 rounded-full border border-amber-300/40 flex items-center justify-center bg-gold-600/20">
                    <Heart size={20} fill="#FFF" className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] animate-pulse" />
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
              className="absolute inset-x-4 bottom-2 h-[80%] rounded-xl bg-white border border-stone-200/50 shadow-inner flex flex-col justify-end p-4 select-none opacity-40 z-0 overflow-hidden"
              animate={isFlapOpened ? { 
                y: -15, 
                opacity: 0.7 
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
