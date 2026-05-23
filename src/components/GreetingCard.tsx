import React, { useEffect, useState } from 'react';
import type { CardState } from '../types';
import { OCCASIONS } from '../types';
import { FLOWER_LIST, AssembledFlower } from './FlowerAssets';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Gift } from 'lucide-react';

interface GreetingCardProps {
  state: CardState;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  showMusicControls?: boolean;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({
  state,
  isMusicPlaying,
  onToggleMusic,
  showMusicControls = true
}) => {
  const occasionConfig = OCCASIONS.find(o => o.id === state.occasion) || OCCASIONS[0];

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
  const wrapY = 410;

  const positionedFlowers = state.flowers.map((selection, index) => {
    const total = state.flowers.length;
    const flowerConfig = FLOWER_LIST.find(f => f.id === selection.flowerId);
    
    let angle = 0;
    if (total > 1) {
      const spread = 70;
      angle = -spread / 2 + (spread / (total - 1)) * index;
    }

    const baseRadius = 215;
    const staggeredOffset = (index % 2 === 0 ? 25 : -25) + (index % 3 === 0 ? 10 : -10);
    const radius = baseRadius + staggeredOffset;

    const rad = (angle * Math.PI) / 180;
    const bloomX = wrapX + radius * Math.sin(rad);
    const bloomY = wrapY - radius * Math.cos(rad);

    const scale = 0.85 + (index % 4) * 0.05;
    const bloomRotation = angle + ((index % 3) - 1) * 12;

    return {
      ...selection,
      emoji: flowerConfig?.emoji || '🌸',
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
        {/* Paper Fold Base */}
        <path
          d="M 120 280 C 140 330 150 380 200 450 C 250 380 260 330 280 280 L 200 240 Z"
          fill={paperColor}
          stroke={paperStroke}
          strokeWidth="1.5"
          opacity="0.8"
        />
        
        {/* Left overlap fold */}
        <path
          d="M 110 270 C 130 350 160 410 200 455 C 190 380 160 330 110 270 Z"
          fill={paperColor}
          stroke={paperStroke}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Right overlap fold */}
        <path
          d="M 290 270 C 270 350 240 410 200 455 C 210 380 240 330 290 270 Z"
          fill={paperColor}
          stroke={paperStroke}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {state.wrapStyle === 'mesh' && (
          <path
            d="M 120 280 L 280 280 M 130 310 L 270 310 M 140 340 L 260 340 M 150 370 L 250 370"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
            opacity="0.7"
          />
        )}

        {state.wrapStyle === 'gold' && (
          <path
            d="M 120 280 Q 200 240 280 280"
            stroke="#CA8A04"
            strokeWidth="2.5"
            fill="none"
          />
        )}
        
        {/* Ribbon Bow tied */}
        <g transform="translate(200, 410)">
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

  return (
    <div className="relative w-full min-h-[90vh] flex flex-col items-center justify-center py-6 px-4 overflow-hidden rounded-3xl">
      {/* 1. HTML5 Falling Petal Particles (CSS-Accelerated) */}
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

      {/* 2. Main Music Controller (float in top right of card area) */}
      {showMusicControls && state.music !== 'none' && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={onToggleMusic}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-purple-950 shadow-md border border-stone-200/50 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            aria-label={isMusicPlaying ? "Mute Music" : "Play Music"}
          >
            {isMusicPlaying ? (
              <Volume2 size={18} className="text-purple-600 animate-bounce" />
            ) : (
              <VolumeX size={18} className="text-stone-400" />
            )}
          </button>
        </div>
      )}

      {/* 3. The Greeting Card Body */}
      <motion.div
        className={`relative z-10 w-full max-w-2xl rounded-3xl shadow-2xl p-4 sm:p-6 md:p-10 border border-white/60 flex flex-col md:grid md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-center bg-white/75 backdrop-blur-xl card-content-shadow`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Inside border decorative trim matching occasion */}
        <div className="absolute inset-2 border-2 border-dashed border-purple-200/40 rounded-2xl pointer-events-none" />
        
        {/* Top left and bottom right corner floral graphics */}
        <div className="absolute top-2 left-2 text-xl opacity-35 select-none pointer-events-none">🌸</div>
        <div className="absolute bottom-2 right-2 text-xl opacity-35 select-none pointer-events-none">🌸</div>

        {/* COL 1: The Floral Arrangement (6 cols) */}
        <div className="col-span-12 md:col-span-6 w-full flex flex-col items-center">
          <div className="relative w-full max-w-[200px] xs:max-w-[240px] sm:max-w-[280px] md:max-w-full aspect-[4/5]">
            <svg
              viewBox="0 0 400 500"
              className="w-full h-full drop-shadow-[0_8px_20px_rgba(92,72,100,0.08)] animate-sway"
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
            <div className="mt-2 text-center text-[10px] text-purple-900/40 uppercase tracking-widest font-bold">
              Handcrafted Flower Bouquet
            </div>
          )}
        </div>

        {/* COL 2: Message Content (6 cols) */}
        <div className="col-span-12 md:col-span-6 w-full flex flex-col justify-center text-center md:text-left space-y-4 md:space-y-6 md:pl-4">
          
          {/* Header Badge */}
          <div className="flex justify-center md:justify-start">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest ${occasionConfig.themeClass} shadow-2xs`}>
              <span>{occasionConfig.emoji}</span>
              <span>{occasionConfig.name}</span>
            </span>
          </div>

          {/* To Field */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-purple-900/40 font-bold block">Dearest</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold italic text-purple-950 drop-shadow-xs">
              {state.recipient}
            </h2>
          </div>

          {/* Divider line */}
          <div className="h-[1px] w-2/3 mx-auto md:mx-0 bg-gradient-to-r from-transparent via-purple-200/50 to-transparent md:from-purple-200/50 md:to-transparent" />

          {/* Message Area */}
          <div className="relative">
            {/* Elegant quotes decoration */}
            <span className="absolute -top-4 -left-3 text-4xl text-purple-200 font-serif leading-none select-none pointer-events-none font-bold">“</span>
            <p className="font-serif text-sm xs:text-base md:text-lg leading-relaxed text-purple-900/80 italic whitespace-pre-line font-medium px-2">
              {state.message}
            </p>
            <span className="absolute -bottom-6 -right-2 text-4xl text-purple-200 font-serif leading-none select-none pointer-events-none font-bold">”</span>
          </div>

          {/* Divider line */}
          <div className="h-[1px] w-2/3 mx-auto md:mx-0 bg-gradient-to-r from-transparent via-purple-200/50 to-transparent md:from-purple-200/50 md:to-transparent" />

          {/* From Field */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-purple-900/40 font-bold block">With Love & Wishes,</span>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-purple-950/90 italic">
              {state.sender}
            </h3>
          </div>
          
          {/* Flower Symbolisms if any */}
          {state.flowers.length > 0 && (
            <div className="pt-2 border-t border-purple-100/50">
              <span className="text-[9px] uppercase tracking-wider text-purple-900/40 font-bold block mb-1">
                Bouquet Symbolisms
              </span>
              <div className="flex flex-wrap gap-1 justify-center md:justify-start max-h-[80px] overflow-y-auto no-scrollbar">
                {Array.from(new Set(state.flowers.map(f => f.flowerId))).map(fid => {
                  const f = FLOWER_LIST.find(fl => fl.id === fid);
                  if (!f) return null;
                  return (
                    <span key={fid} className="text-[10px] text-purple-950/70 bg-purple-50/75 border border-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <span>{f.emoji}</span>
                      <span>{f.name}: <span className="italic font-normal">{f.meaning}</span></span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Visual floating gift note at the bottom */}
      <div className="relative mt-8 z-10 flex items-center gap-2 text-xs text-purple-900/50 font-semibold bg-white/40 border border-white/20 py-1.5 px-4 rounded-full shadow-2xs">
        <Gift size={12} className="text-gold-500 animate-pulse" />
        <span>A personalized card created with DreamWish</span>
      </div>
    </div>
  );
};
