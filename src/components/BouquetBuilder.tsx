import React from 'react';
import { FLOWER_LIST, BloomSVG } from './FlowerAssets';
import type { FlowerSelection } from '../types';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, Shuffle, Sparkles } from 'lucide-react';

interface BouquetBuilderProps {
  selectedFlowers: FlowerSelection[];
  onChangeFlowers: (flowers: FlowerSelection[]) => void;
  wrapStyle: 'kraft' | 'blush' | 'mesh' | 'gold';
  onChangeWrapStyle: (style: 'kraft' | 'blush' | 'mesh' | 'gold') => void;
  cardBg: 'white' | 'silver' | 'slate' | 'blush' | 'gold';
  onChangeCardBg: (bg: 'white' | 'silver' | 'slate' | 'blush' | 'gold') => void;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      duration: 0.35,
      bounce: 0.08
    }
  }
};

export const BouquetBuilder: React.FC<BouquetBuilderProps> = ({
  selectedFlowers,
  onChangeFlowers,
  wrapStyle,
  onChangeWrapStyle,
  cardBg,
  onChangeCardBg
}) => {
  const MAX_TOTAL_FLOWERS = 20;
  const MAX_PER_TYPE = 4;

  // Add flower handler
  const handleAddFlower = (flowerId: string) => {
    const currentCount = selectedFlowers.filter(f => f.flowerId === flowerId).length;
    if (currentCount >= MAX_PER_TYPE) return;
    if (selectedFlowers.length >= MAX_TOTAL_FLOWERS) return;

    const flowerConfig = FLOWER_LIST.find(f => f.id === flowerId);
    if (!flowerConfig) return;

    const newFlower: FlowerSelection = {
      id: `${flowerId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      flowerId,
      color: flowerConfig.defaultColor
    };

    onChangeFlowers([...selectedFlowers, newFlower]);
  };

  // Remove flower handler (removes last instance added)
  const handleRemoveFlower = (flowerId: string) => {
    const index = [...selectedFlowers].reverse().findIndex(f => f.flowerId === flowerId);
    if (index === -1) return;
    
    const actualIndex = selectedFlowers.length - 1 - index;
    const updated = selectedFlowers.filter((_, i) => i !== actualIndex);
    onChangeFlowers(updated);
  };

  // Generate a random bouquet
  const handleRandomBouquet = () => {
    const targetCount = 8 + Math.floor(Math.random() * 9); // random total flowers between 8 and 16
    const newFlowers: FlowerSelection[] = [];
    const counts: Record<string, number> = {};

    // Initialize counts
    FLOWER_LIST.forEach(f => { counts[f.id] = 0; });

    for (let i = 0; i < targetCount; i++) {
      const available = FLOWER_LIST.filter(f => counts[f.id] < MAX_PER_TYPE);
      if (available.length === 0) break;

      const flower = available[Math.floor(Math.random() * available.length)];
      counts[flower.id]++;

      newFlowers.push({
        id: `${flower.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}-${i}`,
        flowerId: flower.id,
        color: flower.defaultColor
      });
    }

    onChangeFlowers(newFlowers);
  };

  // Shuffle the layout order of selected flowers
  const handleShuffle = () => {
    if (selectedFlowers.length <= 1) return;
    const shuffled = [...selectedFlowers].sort(() => Math.random() - 0.5);
    onChangeFlowers(shuffled);
  };

  // Clear bouquet
  const handleClear = () => {
    onChangeFlowers([]);
  };

  // Count of specific flower
  const getFlowerCount = (flowerId: string) => {
    return selectedFlowers.filter(f => f.flowerId === flowerId).length;
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. Flower Picker Panel */}
      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/50 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Select Blooms</h3>
              <p className="text-xs text-slate-500/70 mt-0.5">
                Up to {MAX_TOTAL_FLOWERS} flowers. Max {MAX_PER_TYPE} of each type.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={handleRandomBouquet}
                className="flex items-center justify-center gap-1.5 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100/50 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer h-10 border border-rose-200/40 shadow-2xs active-press-scale"
                title="Generate a random bouquet"
              >
                <Sparkles size={13} className="text-rose-600" />
                <span>Random</span>
              </button>
              
              {selectedFlowers.length > 1 && (
                <button
                  onClick={handleShuffle}
                  className="flex items-center justify-center gap-1.5 text-xs bg-stone-50 text-stone-700 hover:bg-stone-100 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer h-10 border border-stone-200/50 shadow-2xs active-press-scale"
                  title="Shuffle flower positions"
                >
                  <Shuffle size={13} className="text-stone-500" />
                  <span>Shuffle</span>
                </button>
              )}

              {selectedFlowers.length > 0 && (
                <button
                  onClick={handleClear}
                  className="flex items-center justify-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer h-10 border border-rose-100 shadow-2xs active-press-scale"
                  title="Clear all flowers"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Bouquet Size Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-900">
              <span>Bouquet Composition</span>
              <span className={selectedFlowers.length === MAX_TOTAL_FLOWERS ? 'text-emerald-600 font-bold' : 'text-rose-700'}>
                {selectedFlowers.length} / {MAX_TOTAL_FLOWERS} Blooms
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-emerald-500 transition-all duration-500 ease-out" 
                style={{ width: `${(selectedFlowers.length / MAX_TOTAL_FLOWERS) * 100}%` }}
              />
            </div>
          </div>

          {/* List of Flowers */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-2 max-h-[300px] overflow-y-auto pr-1"
          >
            {FLOWER_LIST.map((flower) => {
              const count = getFlowerCount(flower.id);
              const isAtMaxType = count >= MAX_PER_TYPE;
              const isAtMaxTotal = selectedFlowers.length >= MAX_TOTAL_FLOWERS;

              return (
                <motion.div 
                  variants={staggerItem}
                  key={flower.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200/50 bg-white/60 hover:bg-white hover:border-rose-200 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    {/* Flower mini circle preview */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-250/30 border border-stone-200/40 relative shrink-0 shadow-inner">
                      <svg viewBox="0 0 100 100" className="w-8 h-8">
                        <BloomSVG type={flower.id} color={flower.defaultColor} scale={0.9} />
                      </svg>
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                          {count}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-800">
                        {flower.name}
                      </div>
                      <div className="text-xs text-slate-500/70 italic">{flower.meaning}</div>
                    </div>
                  </div>

                  {/* Add / Subtract actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={count === 0}
                      onClick={() => handleRemoveFlower(flower.id)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors shrink-0 active-press-scale ${
                        count > 0 
                          ? 'border-stone-200 text-slate-700 hover:bg-slate-50 cursor-pointer' 
                          : 'border-stone-100 text-stone-300 cursor-not-allowed'
                      }`}
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      disabled={isAtMaxType || isAtMaxTotal}
                      onClick={() => handleAddFlower(flower.id)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors shrink-0 active-press-scale ${
                        !isAtMaxType && !isAtMaxTotal
                          ? 'border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-50 cursor-pointer'
                          : 'border-stone-100 text-stone-300 bg-stone-50 cursor-not-allowed'
                      }`}
                      title={isAtMaxType ? 'Limit of 4 per type' : isAtMaxTotal ? 'Bouquet size limit reached' : ''}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* 2. Wrapping Paper Selector Panel */}
      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-5 space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-800 font-bold">
            Select Bouquet Wrapping
          </h4>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-4 gap-2"
          >
            {(['kraft', 'blush', 'mesh', 'gold'] as const).map((style) => (
              <motion.button
                variants={staggerItem}
                key={style}
                onClick={() => onChangeWrapStyle(style)}
                className={`py-3 px-2 min-h-[48px] rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center justify-center active-press-scale ${
                  wrapStyle === style
                    ? 'border-rose-600 bg-rose-50/50 text-rose-800 shadow-sm font-bold scale-[1.03]'
                    : 'border-stone-200/50 bg-white/70 text-slate-800 hover:bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full mx-auto mb-1.5 border border-black/5 ${
                  style === 'kraft' ? 'bg-[#D6C0B3]' : 
                  style === 'blush' ? 'bg-[#FCE7F3]' : 
                  style === 'mesh' ? 'bg-gradient-to-tr from-stone-200 via-stone-50 to-stone-200' : 'bg-[#FFFDF5] border-amber-300'
                }`} />
                <span className="capitalize text-[10px]">{style}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 3. Backdrop Selector Panel */}
      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-5 space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-800 font-bold">
            Select Card Backdrop Style
          </h4>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-5 gap-1.5"
          >
            {[
              { id: 'white', name: 'White', bgClass: 'bg-gradient-to-br from-white via-[#faf9ff] to-[#f5f3ff] border border-purple-100/30' },
              { id: 'silver', name: 'Silver', bgClass: 'bg-gradient-to-br from-[#f1f5f9] via-[#ffffff] to-[#e2e8f0] border border-slate-200' },
              { id: 'slate', name: 'Slate', bgClass: 'bg-gradient-to-br from-[#cbd5e1] via-[#f1f5f9] to-[#94a3b8] border border-slate-300' },
              { id: 'blush', name: 'Blush', bgClass: 'bg-gradient-to-br from-[#fff1f2] via-[#ffffff] to-[#fce7f3] border border-pink-100' },
              { id: 'gold', name: 'Gold', bgClass: 'bg-gradient-to-br from-[#fef3c7] via-[#ffffff] to-[#fde68a] border border-amber-100' }
            ].map((theme) => (
              <motion.button
                variants={staggerItem}
                key={theme.id}
                onClick={() => onChangeCardBg(theme.id as any)}
                className={`py-2 px-1 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center justify-center min-h-[58px] active-press-scale ${
                  cardBg === theme.id
                    ? 'border-rose-600 ring-2 ring-rose-50/50 shadow-sm font-bold scale-[1.03]'
                    : 'border-stone-200/50 bg-white/70 text-slate-800 hover:bg-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-full mx-auto mb-1 border border-black/5 ${theme.bgClass}`} />
                <span className="text-[9px] font-medium leading-none">{theme.name}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
