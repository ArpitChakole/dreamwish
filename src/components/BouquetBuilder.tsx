import React from 'react';
import { FLOWER_LIST, BloomSVG, AssembledFlower } from './FlowerAssets';
import type { FlowerSelection } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, HelpCircle, Shuffle, Sparkles } from 'lucide-react';

interface BouquetBuilderProps {
  selectedFlowers: FlowerSelection[];
  onChangeFlowers: (flowers: FlowerSelection[]) => void;
  wrapStyle: 'kraft' | 'blush' | 'mesh' | 'gold';
  onChangeWrapStyle: (style: 'kraft' | 'blush' | 'mesh' | 'gold') => void;
}

export const BouquetBuilder: React.FC<BouquetBuilderProps> = ({
  selectedFlowers,
  onChangeFlowers,
  wrapStyle,
  onChangeWrapStyle
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

  // Remove a specific flower instance by ID
  const handleRemoveInstance = (instanceId: string) => {
    onChangeFlowers(selectedFlowers.filter(f => f.id !== instanceId));
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

  // SVG Geometry for Bouquet layout
  const wrapX = 200;
  const wrapY = 410;

  // Compute positions of each flower dynamically based on index and total count
  const positionedFlowers = selectedFlowers.map((selection, index) => {
    const total = selectedFlowers.length;
    const flowerConfig = FLOWER_LIST.find(f => f.id === selection.flowerId);
    
    // Spread angle: from -35 deg to +35 deg
    let angle = 0;
    if (total > 1) {
      const spread = 75; // total width of fan in degrees
      angle = -spread / 2 + (spread / (total - 1)) * index;
    }

    // Radius: varies slightly to create staggered layers
    // Even indices are slightly higher, odd slightly lower
    const baseRadius = 240;
    const staggeredOffset = (index % 2 === 0 ? 25 : -25) + (index % 3 === 0 ? 10 : -10);
    const radius = baseRadius + staggeredOffset;

    // Trigonometric conversion (angles in radians, rotated so 0 is straight up)
    const rad = (angle * Math.PI) / 180;
    const bloomX = wrapX + radius * Math.sin(rad);
    const bloomY = wrapY - radius * Math.cos(rad);

    // Minor random-looking scales and rotation variations
    const scale = 1.15 + (index % 4) * 0.08;
    const bloomRotation = angle + ((index % 3) - 1) * 12; // tilted slightly organic

    return {
      ...selection,
      emoji: flowerConfig?.emoji || '🌸',
      name: flowerConfig?.name || 'Flower',
      meaning: flowerConfig?.meaning || '',
      bloomX,
      bloomY,
      angle: bloomRotation,
      scale
    };
  });

  // Render bouquet wrapping paper paths
  const renderWrapGraphic = () => {
    let paperColor = '#D6C0B3'; // kraft
    let paperStroke = '#BFA090';

    if (wrapStyle === 'blush') {
      paperColor = '#FCE7F3'; // pink
      paperStroke = '#F472B6';
    } else if (wrapStyle === 'mesh') {
      paperColor = '#F3F4F6'; // mesh white
      paperStroke = '#D1D5DB';
    } else if (wrapStyle === 'gold') {
      paperColor = '#FFFDF5'; // golden cream
      paperStroke = '#EAB308';
    }

    return (
      <g>
        {/* Background wrapping paper fold */}
        <path
          d="M 120 280 C 140 330 150 380 200 450 C 250 380 260 330 280 280 L 200 240 Z"
          fill={paperColor}
          stroke={paperStroke}
          strokeWidth="1.5"
          opacity="0.8"
        />
        
        {/* Left wrap fold overlay */}
        <path
          d="M 110 270 C 130 350 160 410 200 455 C 190 380 160 330 110 270 Z"
          fill={paperColor}
          stroke={paperStroke}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Right wrap fold overlay */}
        <path
          d="M 290 270 C 270 350 240 410 200 455 C 210 380 240 330 290 270 Z"
          fill={paperColor}
          stroke={paperStroke}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Mesh pattern overlay if selected */}
        {wrapStyle === 'mesh' && (
          <path
            d="M 120 280 L 280 280 M 130 310 L 270 310 M 140 340 L 260 340 M 150 370 L 250 370"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
            opacity="0.7"
          />
        )}

        {/* Gold accent trim for gold style */}
        {wrapStyle === 'gold' && (
          <path
            d="M 120 280 Q 200 240 280 280"
            stroke="#CA8A04"
            strokeWidth="2.5"
            fill="none"
          />
        )}
        
        {/* Bow and Ribbon tied at (200, 410) */}
        <g transform="translate(200, 410)">
          {/* Ribbon tails hanging down */}
          <path
            d="M 0 0 C -15 20 -20 40 -15 55 M 0 0 C 15 20 20 40 15 55"
            fill="none"
            stroke={wrapStyle === 'gold' ? '#CA8A04' : '#DB2777'}
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Ribbon Bow Loops */}
          <path
            d="M 0 0 C -25 -25 -35 5 0 0 M 0 0 C 25 -25 35 5 0 0"
            fill={wrapStyle === 'gold' ? '#FDE047' : '#F472B6'}
            stroke={wrapStyle === 'gold' ? '#CA8A04' : '#D11D60'}
            strokeWidth="2.5"
          />
          {/* Ribbon Knot */}
          <circle cx="0" cy="0" r="6" fill={wrapStyle === 'gold' ? '#CA8A04' : '#BE123C'} />
        </g>
      </g>
    );
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start w-full">
      {/* 1. Flower Picker Controls - 5 columns */}
      <div className="lg:col-span-5 space-y-6 w-full order-2 lg:order-1">
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-white/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-purple-950">Select Blooms</h3>
              <p className="text-xs text-purple-900/60 mt-0.5">
                Up to {MAX_TOTAL_FLOWERS} flowers. Max {MAX_PER_TYPE} of each type.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={handleRandomBouquet}
                className="flex items-center justify-center gap-1.5 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer h-10 border border-purple-200/50 shadow-2xs"
                title="Generate a random bouquet"
              >
                <Sparkles size={13} className="text-purple-600 animate-pulse" />
                <span>Random</span>
              </button>
              
              {selectedFlowers.length > 1 && (
                <button
                  onClick={handleShuffle}
                  className="flex items-center justify-center gap-1.5 text-xs bg-stone-50 text-stone-700 hover:bg-stone-100 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer h-10 border border-stone-200/50 shadow-2xs"
                  title="Shuffle flower positions"
                >
                  <Shuffle size={13} className="text-stone-500" />
                  <span>Shuffle</span>
                </button>
              )}

              {selectedFlowers.length > 0 && (
                <button
                  onClick={handleClear}
                  className="flex items-center justify-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer h-10 border border-rose-100 shadow-2xs"
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
            <div className="flex justify-between text-xs font-semibold text-purple-950">
              <span>Bouquet Composition</span>
              <span className={selectedFlowers.length === MAX_TOTAL_FLOWERS ? 'text-emerald-600 font-bold' : 'text-purple-600'}>
                {selectedFlowers.length} / {MAX_TOTAL_FLOWERS} Blooms
              </span>
            </div>
            <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 transition-all duration-500 ease-out" 
                style={{ width: `${(selectedFlowers.length / MAX_TOTAL_FLOWERS) * 100}%` }}
              />
            </div>
          </div>

          {/* List of Flowers */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {FLOWER_LIST.map((flower) => {
              const count = getFlowerCount(flower.id);
              const isAtMaxType = count >= MAX_PER_TYPE;
              const isAtMaxTotal = selectedFlowers.length >= MAX_TOTAL_FLOWERS;

              return (
                <div 
                  key={flower.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200/50 bg-white/60 hover:bg-white hover:border-purple-200 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    {/* Flower mini circle preview */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200/50 border border-stone-200/40 relative shrink-0 shadow-inner">
                      <svg viewBox="0 0 100 100" className="w-8 h-8">
                        <BloomSVG type={flower.id} color={flower.defaultColor} scale={0.9} />
                      </svg>
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                          {count}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-purple-950 flex items-center gap-1.5">
                        <span>{flower.name}</span>
                        <span className="text-xs font-normal text-purple-900/60">({flower.emoji})</span>
                      </div>
                      <div className="text-xs text-purple-900/50 italic">{flower.meaning}</div>
                    </div>
                  </div>

                  {/* Add / Subtract actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={count === 0}
                      onClick={() => handleRemoveFlower(flower.id)}
                      className={`w-12 h-12 flex items-center justify-center rounded-lg border transition-colors shrink-0 ${
                        count > 0 
                          ? 'border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer' 
                          : 'border-stone-100 text-stone-300 cursor-not-allowed'
                      }`}
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      disabled={isAtMaxType || isAtMaxTotal}
                      onClick={() => handleAddFlower(flower.id)}
                      className={`w-12 h-12 flex items-center justify-center rounded-lg border transition-colors shrink-0 ${
                        !isAtMaxType && !isAtMaxTotal
                          ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer'
                          : 'border-stone-100 text-stone-300 bg-stone-50 cursor-not-allowed'
                      }`}
                      title={isAtMaxType ? 'Limit of 2 per type' : isAtMaxTotal ? 'Bouquet size limit reached' : ''}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wrapping Paper Selector */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm border border-white/50 space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-purple-950 font-bold">
            Select Bouquet Wrapping
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {(['kraft', 'blush', 'mesh', 'gold'] as const).map((style) => (
              <button
                key={style}
                onClick={() => onChangeWrapStyle(style)}
                className={`py-3 px-2 min-h-[48px] rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                  wrapStyle === style
                    ? 'border-gold-500 bg-gold-50 text-gold-700 shadow-sm font-bold scale-[1.03]'
                    : 'border-stone-200/50 bg-white/70 text-purple-950 hover:bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full mx-auto mb-1.5 border border-black/5 ${
                  style === 'kraft' ? 'bg-[#D6C0B3]' : 
                  style === 'blush' ? 'bg-[#FCE7F3]' : 
                  style === 'mesh' ? 'bg-gradient-to-tr from-stone-200 via-stone-50 to-stone-200' : 'bg-[#FFFDF5] border-amber-300'
                }`} />
                <span className="capitalize text-[10px]">{style}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Visual Bouquet Canvas Preview - 7 columns */}
      <div className="lg:col-span-7 flex flex-col items-center order-1 lg:order-2 w-full sticky top-0 z-20 bg-stone-50/90 backdrop-blur-md py-4 lg:py-0 lg:bg-transparent lg:backdrop-blur-none border-b border-stone-200/20 lg:border-none">
        <div className="relative w-full max-w-[420px] h-[320px] sm:h-[380px] lg:h-auto lg:aspect-[4/5] bg-white rounded-3xl shadow-xl border border-stone-200/40 p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden">
          {/* Subtle grid background to look premium */}
          <div className="absolute inset-0 bg-[radial-gradient(#f4eef5_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

          {/* Visual canvas title */}
          <div className="relative z-10 w-full flex items-center justify-between text-xs text-purple-900/60 font-semibold px-2">
            <span>Live Bouquet Canvas</span>
            {selectedFlowers.length === 0 && (
              <span className="text-purple-600 animate-pulse">Tap blooms to build arrangement</span>
            )}
          </div>

          {/* SVG Arrangement Canvas */}
          <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
            <svg 
              viewBox="0 0 400 500" 
              className="w-full h-full drop-shadow-[0_12px_24px_rgba(92,72,100,0.12)]"
            >
              {/* 1. All Stems (in the background, so blooms overlay them) */}
              <g>
                {positionedFlowers.map((flower) => (
                  <AssembledFlower
                    key={`stem-${flower.id}`}
                    type={flower.flowerId}
                    color={flower.color}
                    wrapX={wrapX}
                    wrapY={wrapY}
                    bloomX={flower.bloomX}
                    bloomY={flower.bloomY}
                    angle={flower.angle}
                    scale={flower.scale}
                  />
                ))}
              </g>

              {/* 2. Wrapping Paper & Ribbon overlay (sits on top of stems, but below blooms) */}
              {selectedFlowers.length > 0 && renderWrapGraphic()}

              {/* 3. Blooms (drawn on top of the wrap, with animation) */}
              <g>
                {positionedFlowers.map((flower) => (
                  <g key={`bloom-${flower.id}`}>
                    <AssembledFlower
                      key={`bloom-detail-${flower.id}`}
                      type={flower.flowerId}
                      color={flower.color}
                      wrapX={wrapX}
                      wrapY={wrapY}
                      bloomX={flower.bloomX}
                      bloomY={flower.bloomY}
                      angle={flower.angle}
                      scale={flower.scale}
                      showBloomOnly={true}
                    />
                  </g>
                ))}
              </g>
            </svg>

            {/* Quick floating actions / indicators */}
            <AnimatePresence>
              {selectedFlowers.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-stone-50/50 backdrop-blur-xs rounded-2xl pointer-events-none"
                >
                  <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-400 flex items-center justify-center mb-3 border border-purple-100">
                    <HelpCircle size={24} className="animate-bounce" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-purple-950">Your Vase is Empty</h4>
                  <p className="text-xs text-purple-900/60 max-w-[220px] mt-1 leading-relaxed">
                    Select flower options on the left to start assembling your custom hand-tied bouquet!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick list of flowers in the bouquet, click to remove */}
          {selectedFlowers.length > 0 && (
            <div className="relative z-10 w-full bg-stone-50/80 backdrop-blur-xs rounded-2xl p-2 border border-stone-200/40">
              <span className="text-[10px] uppercase tracking-wider text-purple-900/50 font-bold block mb-1 px-1">
                Bouquet Layout (Tap to pluck out)
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto no-scrollbar">
                {positionedFlowers.map((flower) => (
                  <button
                    key={flower.id}
                    onClick={() => handleRemoveInstance(flower.id)}
                    className="flex items-center gap-1.5 bg-white hover:bg-rose-50 text-xs text-purple-950 font-medium px-3.5 py-3 min-h-[48px] rounded-full border border-stone-200 hover:border-rose-200 shadow-2xs group transition-all"
                  >
                    <span>{flower.emoji}</span>
                    <span className="group-hover:line-through group-hover:text-rose-500">{flower.name}</span>
                    <Minus size={10} className="text-purple-400 group-hover:text-rose-500 ml-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
