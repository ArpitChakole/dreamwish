import React, { useEffect, useState } from 'react';
import type { CardState } from '../types';
import { OCCASIONS } from '../types';
import { FLOWER_LIST, AssembledFlower } from './FlowerAssets';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

interface GreetingCardProps {
  state: CardState;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  showMusicControls?: boolean;
  className?: string;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({
  state,
  isMusicPlaying,
  onToggleMusic,
  showMusicControls = true,
  className
}) => {
  const occasionConfig = OCCASIONS.find(o => o.id === state.occasion) || OCCASIONS[0];
  const OccasionIcon = (Icons as any)[occasionConfig.iconName] || Icons.Sparkles;

  // Floating petals count & delay calculation
  const [petals, setPetals] = useState<{ id: number; left: string; delay: string; scale: number; animation: string }[]>([]);

  useEffect(() => {
    // Generate random floating petals once on component mount
    const generated = [...Array(15)].map((_, i) => {
      const animations = ['animate-petal-fall-1', 'animate-petal-fall-2', 'animate-petal-fall-3'];
      return {
        id: i,
        left: `${5 + Math.random() * 90}%`, // spread across width
        delay: `${Math.random() * -15}s`,   // negative delay so they start at different phases
        scale: 0.5 + Math.random() * 0.8,   // random sizes
        animation: animations[i % animations.length]
      };
    });
    setPetals(generated);
  }, []);

  // SVG Geometry for Bouquet layout
  const wrapX = 200;
  const wrapY = 425;

  const positionedFlowers = state.flowers.map((selection, index) => {
    const total = state.flowers.length;
    
    let angle = 0;
    if (total > 1) {
      const spread = 75; // Align both to 75
      angle = -spread / 2 + (spread / (total - 1)) * index;
    }

    const baseRadius = 260; // Increased from 240
    const staggeredOffset = (index % 2 === 0 ? 25 : -25) + (index % 3 === 0 ? 10 : -10);
    const radius = baseRadius + staggeredOffset;

    const rad = (angle * Math.PI) / 180;
    const bloomX = wrapX + radius * Math.sin(rad);
    const bloomY = wrapY - radius * Math.cos(rad);

    const scale = 1.3 + (index % 4) * 0.08; // Increased from 1.15
    const bloomRotation = angle + ((index % 3) - 1) * 12;

    return {
      ...selection,
      bloomX,
      bloomY,
      angle: bloomRotation,
      scale
    };
  });

  const renderWrapGraphic = () => {
    let paperColor = '#D6C0B3'; 
    let paperStroke = '#BFA090';

    if (state.wrapStyle === 'blush') {
      paperColor = '#FCE7F3'; 
      paperStroke = '#F472B6';
    } else if (state.wrapStyle === 'mesh') {
      paperColor = '#F3F4F6'; 
      paperStroke = '#D1D5DB';
    } else if (state.wrapStyle === 'gold') {
      paperColor = '#FFFDF5'; 
      paperStroke = '#EAB308';
    }

    return (
      <g>
        {/* Background wrapping paper fold - Enlarged for better presence */}
        <path
          d="M 100 260 C 130 325 150 390 200 470 C 250 390 270 325 300 260 L 200 220 Z"
          fill={paperColor}
          stroke={paperStroke}
          strokeWidth="1.5"
          opacity="0.8"
        />
        
        {/* Left wrap fold overlay */}
        <path
          d="M 90 250 C 120 350 150 420 200 475 C 190 390 150 330 90 250 Z"
          fill={paperColor}
          stroke={paperStroke}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Right wrap fold overlay */}
        <path
          d="M 310 250 C 280 350 250 420 200 475 C 210 390 250 330 310 250 Z"
          fill={paperColor}
          stroke={paperStroke}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {state.wrapStyle === 'mesh' && (
          <path
            d="M 100 260 L 300 260 M 115 295 L 285 295 M 130 330 L 270 330 M 145 365 L 255 365 M 160 400 L 240 400"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
            opacity="0.7"
          />
        )}

        {state.wrapStyle === 'gold' && (
          <path
            d="M 100 260 Q 200 220 300 260"
            stroke="#CA8A04"
            strokeWidth="2.5"
            fill="none"
          />
        )}
        
        {/* Ribbon Bow tied */}
        <g transform="translate(200, 425)">
          <path
            d="M 0 0 C -15 20 -20 40 -15 55 M 0 0 C 15 20 20 40 15 55"
            fill="none"
            stroke={state.wrapStyle === 'gold' ? '#CA8A04' : '#DB2777'}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 0 0 C -25 -25 -35 5 0 0 M 0 0 C 25 -25 35 5 0 0"
            fill={state.wrapStyle === 'gold' ? '#FDE047' : '#F472B6'}
            stroke={state.wrapStyle === 'gold' ? '#CA8A04' : '#D11D60'}
            strokeWidth="2.5"
          />
          <circle cx="0" cy="0" r="6" fill={state.wrapStyle === 'gold' ? '#CA8A04' : '#BE123C'} />
        </g>
      </g>
    );
  };

  // Color petal styling based on occasion
  const getPetalColor = () => {
    switch (state.occasion) {
      case 'birthday':
      case 'babyshower':
        return '#FDA4AF'; // pink
      case 'anniversary':
      case 'valentine':
        return '#F43F5E'; // red-rose
      case 'graduation':
      case 'getwell':
        return '#86EFAC'; // green
      case 'wedding':
      case 'custom':
        return '#FEF08A'; // gold-yellow
      case 'friendship':
      case 'thankyou':
      default:
        return '#C084FC'; // purple
    }
  };

  // Map background styles
  const getBgStyle = () => {
    switch (state.cardBg) {
      case 'silver':
        return 'bg-gradient-to-br from-[#f1f5f9] via-[#ffffff] to-[#e2e8f0] border border-slate-200';
      case 'slate':
        return 'bg-gradient-to-br from-[#cbd5e1] via-[#f1f5f9] to-[#94a3b8] border border-slate-300';
      case 'blush':
        return 'bg-gradient-to-br from-[#fff1f2] via-[#ffffff] to-[#fce7f3] border border-pink-100';
      case 'gold':
        return 'bg-gradient-to-br from-[#fef3c7] via-[#ffffff] to-[#fde68a] border border-amber-100';
      case 'white':
      default:
        return 'bg-gradient-to-br from-white via-[#faf9ff] to-[#f5f3ff] border border-stone-200/20';
    }
  };

  return (
    <div className={`relative w-full flex flex-col items-center justify-center py-6 px-4 overflow-hidden rounded-3xl shadow-sm transition-all duration-500 ${getBgStyle()} ${className || 'min-h-[90vh]'}`}>
      {/* 1. Falling Petal Particles (CSS-Accelerated) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className={`absolute top-0 ${petal.animation}`}
            style={{
              left: petal.left,
              animationDelay: petal.delay,
              transform: `scale(${petal.scale})`
            }}
          >
            {/* Simple Leaf/Petal SVG path */}
            <svg width="24" height="24" viewBox="0 0 24 24" opacity="0.65">
              <path
                d="M12,2 C12,2 4,10 4,14 C4,18 7,21 12,21 C17,21 20,18 20,14 C20,10 12,2 12,2 Z"
                fill={getPetalColor()}
                transform="rotate(45 12 12)"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Floating particles background */}
      <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 80%) pointer-events-none" />

      {/* 2. Main Music Controller */}
      {showMusicControls && state.music !== 'none' && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={onToggleMusic}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md border border-stone-250/20 backdrop-blur-md transition-all active-press-scale cursor-pointer"
            aria-label={isMusicPlaying ? "Mute Music" : "Play Music"}
          >
            {isMusicPlaying ? (
              <Icons.Volume2 size={18} className="text-rose-700 animate-bounce" strokeWidth={1.5} />
            ) : (
              <Icons.VolumeX size={18} className="text-stone-400" strokeWidth={1.5} />
            )}
          </button>
        </div>
      )}

      {/* 3. The Greeting Card Body (Double-Bezel nested card) */}
      <div className="double-bezel-outer w-full max-w-2xl relative z-10 card-content-shadow">
        <motion.div
          className={`double-bezel-inner relative w-full p-4 sm:p-6 md:p-10 flex flex-col md:grid md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-center bg-white`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", duration: 0.65, bounce: 0.15 }}
        >
          {/* Inside border decorative trim matching occasion */}
          <div className="absolute inset-2 border border-dashed border-rose-200/20 rounded-2xl pointer-events-none" />
          
          {/* Top left and bottom right corner floral vector icons */}
          <div className="absolute top-3.5 left-3.5 opacity-25 select-none pointer-events-none text-rose-800">
            <Icons.Flower size={16} strokeWidth={1.2} />
          </div>
          <div className="absolute bottom-3.5 right-3.5 opacity-25 select-none pointer-events-none text-rose-800">
            <Icons.Flower size={16} strokeWidth={1.2} />
          </div>

          {/* COL 1: The Floral Arrangement (6 cols) */}
          <div className="col-span-12 md:col-span-6 w-full flex flex-col items-center">
            <div className={`relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[380px] md:max-w-full aspect-[4/5] rounded-3xl shadow-xl p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden transition-all duration-500 border ${
              state.cardBg === 'silver' ? 'bg-gradient-to-br from-[#f1f5f9] via-[#ffffff] to-[#e2e8f0] border-slate-200' :
              state.cardBg === 'slate' ? 'bg-gradient-to-br from-[#cbd5e1] via-[#f1f5f9] to-[#94a3b8] border-slate-300' :
              state.cardBg === 'blush' ? 'bg-gradient-to-br from-[#fff1f2] via-[#ffffff] to-[#fce7f3] border-pink-100' :
              state.cardBg === 'gold' ? 'bg-gradient-to-br from-[#fef3c7] via-[#ffffff] to-[#fde68a] border-amber-100' :
              'bg-gradient-to-br from-white via-[#faf9ff] to-[#f5f3ff] border-purple-100/30'
            }`}>
              {/* Subtle grid background to look premium */}
              <div className="absolute inset-0 bg-[radial-gradient(#f4eef5_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

              <svg
                viewBox="0 0 400 500"
                className="w-full h-full drop-shadow-[0_8px_20px_rgba(92,72,100,0.08)] animate-sway relative z-10"
              >
                {/* Stems */}
                <g>
                  {positionedFlowers.map((flower) => (
                    <AssembledFlower
                      key={`card-stem-${flower.id}`}
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

                {/* Wrapper */}
                {state.flowers.length > 0 && renderWrapGraphic()}

                {/* Blooms */}
                <g>
                  {positionedFlowers.map((flower) => (
                    <g key={`card-bloom-${flower.id}`}>
                      <AssembledFlower
                        key={`card-bloom-detail-${flower.id}`}
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
            </div>

            {/* Meaning Badge */}
            {state.flowers.length > 0 && (
              <div className="mt-2 text-center text-[10px] text-slate-500/50 uppercase tracking-widest font-bold">
                Handcrafted Flower Bouquet
              </div>
            )}
          </div>

          {/* COL 2: Message Content (6 cols) */}
          <div className="col-span-12 md:col-span-6 w-full flex flex-col justify-center text-center md:text-left space-y-4 md:space-y-6 md:pl-4">
            
            {/* Header Badge */}
            <div className="flex justify-center md:justify-start">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest ${occasionConfig.themeClass} shadow-2xs`}>
                <OccasionIcon size={12} className="shrink-0" strokeWidth={1.8} />
                <span>{(state.occasion === 'custom' && state.customOccasionName) ? state.customOccasionName : occasionConfig.name}</span>
              </span>
            </div>

            {/* To Field */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500/60 font-bold block">Dearest</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold italic text-slate-900 drop-shadow-xs">
                {state.recipient}
              </h2>
            </div>

            {/* Divider line */}
            <div className="h-[1px] w-2/3 mx-auto md:mx-0 bg-gradient-to-r from-transparent via-stone-200/50 to-transparent md:from-stone-200/50 md:to-transparent" />

            {/* Message Area */}
            <div className="relative">
              {/* Elegant quotes decoration */}
              <span className="absolute -top-4 -left-3 text-4xl text-rose-200/40 font-serif leading-none select-none pointer-events-none font-bold">“</span>
              <p className="font-serif text-sm xs:text-base md:text-lg leading-relaxed text-slate-800/80 italic whitespace-pre-line font-medium px-2">
                {state.message}
              </p>
              <span className="absolute -bottom-6 -right-2 text-4xl text-rose-200/40 font-serif leading-none select-none pointer-events-none font-bold">”</span>
            </div>

            {/* Divider line */}
            <div className="h-[1px] w-2/3 mx-auto md:mx-0 bg-gradient-to-r from-transparent via-stone-200/50 to-transparent md:from-stone-200/50 md:to-transparent" />

            {/* From Field */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500/60 font-bold block">With Love & Wishes,</span>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-slate-950/90 italic">
                {state.sender}
              </h3>
            </div>
            
            {/* Flower Symbolisms if any */}
            {state.flowers.length > 0 && (
              <div className="pt-2 border-t border-stone-200/50">
                <span className="text-[9px] uppercase tracking-wider text-slate-500/60 font-bold block mb-1">
                  Bouquet Symbolisms
                </span>
                <div className="flex flex-wrap gap-1 justify-center md:justify-start max-h-[80px] overflow-y-auto no-scrollbar">
                  {Array.from(new Set(state.flowers.map(f => f.flowerId))).map(fid => {
                    const f = FLOWER_LIST.find(fl => fl.id === fid);
                    if (!f) return null;
                    return (
                      <span key={fid} className="text-[10px] text-slate-800 bg-stone-50 border border-stone-200/60 px-2 py-0.5 rounded-full flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: f.defaultColor }} />
                        <span>{f.name}: <span className="italic font-normal text-slate-500">{f.meaning}</span></span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Visual floating gift note at the bottom */}
      <div className="relative mt-8 z-10 flex items-center gap-2 text-xs text-slate-500/60 font-semibold bg-white/40 border border-stone-200/20 py-1.5 px-4 rounded-full shadow-2xs">
        <Icons.Gift size={12} className="text-rose-600 animate-pulse" strokeWidth={1.5} />
        <span>A personalized card created with DreamWish</span>
      </div>
    </div>
  );
};
