import React from 'react';

export interface FlowerType {
  id: string;
  name: string;
  meaning: string;
  defaultColor: string;
  gradientColors: [string, string];
  emoji: string;
}

export const FLOWER_LIST: FlowerType[] = [
  {
    id: 'rose',
    name: 'Red Rose',
    meaning: 'Love & Passion',
    defaultColor: '#E11D48',
    gradientColors: ['#F43F5E', '#BE123C'],
    emoji: '🌹'
  },
  {
    id: 'tulip',
    name: 'Lavender Tulip',
    meaning: 'Deep affection & Royalty',
    defaultColor: '#A855F7',
    gradientColors: ['#C084FC', '#7E22CE'],
    emoji: '🌷'
  },
  {
    id: 'lily',
    name: 'White Lily',
    meaning: 'Purity & Rebirth',
    defaultColor: '#FAFAF9',
    gradientColors: ['#FFFFFF', '#E7E5E4'],
    emoji: '⚜️'
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    meaning: 'Adoration & Longevity',
    defaultColor: '#EAB308',
    gradientColors: ['#FDE047', '#CA8A04'],
    emoji: '🌻'
  },
  {
    id: 'orchid',
    name: 'Pink Orchid',
    meaning: 'Rare Beauty & Strength',
    defaultColor: '#EC4899',
    gradientColors: ['#F472B6', '#BE185D'],
    emoji: '🌸'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    meaning: 'Grace & Serenity',
    defaultColor: '#8B5CF6',
    gradientColors: ['#A78BFA', '#6D28D9'],
    emoji: '🌾'
  },
  {
    id: 'daisy',
    name: 'Daisy',
    meaning: 'Innocence & Cheerfulness',
    defaultColor: '#F5F5F4',
    gradientColors: ['#FFFFFF', '#D6D3D1'],
    emoji: '🌼'
  },
  {
    id: 'peony',
    name: 'Peony',
    meaning: 'Prosperity & Romance',
    defaultColor: '#F472B6',
    gradientColors: ['#FBCFE8', '#DB2777'],
    emoji: '🌺'
  },
  {
    id: 'carnation',
    name: 'Pink Carnation',
    meaning: 'Gratitude & Admiration',
    defaultColor: '#F43F5E',
    gradientColors: ['#FDA4AF', '#E11D48'],
    emoji: '🏵️'
  },
  {
    id: 'hydrangea',
    name: 'Hydrangea',
    meaning: 'Heartfelt Gratitude',
    defaultColor: '#3B82F6',
    gradientColors: ['#93C5FD', '#1D4ED8'],
    emoji: '🍇'
  }
];

// Bloom definitions rendered at (0,0) scaled to a 100x100 viewport
export const BloomSVG: React.FC<{ type: string; color: string; scale?: number }> = ({ type, color, scale = 1 }) => {
  const s = scale;
  
  // Custom definitions based on flower types
  switch (type) {
    case 'rose':
      return (
        <g transform={`scale(${s})`}>
          <defs>
            <radialGradient id="rose-grad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FFA4B4" />
              <stop offset="60%" stopColor={color} />
              <stop offset="100%" stopColor="#880825" />
            </radialGradient>
          </defs>
          {/* Outer Petals */}
          <path d="M 50 15 C 30 15 15 35 25 55 C 30 65 45 80 50 82 C 55 80 70 65 75 55 C 85 35 70 15 50 15 Z" fill="url(#rose-grad)" />
          <path d="M 50 25 C 22 25 22 55 35 68 C 45 78 50 80 50 80 C 50 80 55 78 65 68 C 78 55 78 25 50 25 Z" fill="url(#rose-grad)" opacity="0.95" />
          <path d="M 50 32 C 30 32 32 58 42 68 C 48 74 50 75 50 75 C 50 75 52 74 58 68 C 68 58 70 32 50 32 Z" fill="url(#rose-grad)" opacity="0.9" />
          {/* Ruffled layers */}
          <path d="M 40 40 C 35 48 45 58 50 58 C 55 58 65 48 60 40 C 55 32 45 32 40 40 Z" fill="url(#rose-grad)" />
          <path d="M 45 45 C 43 48 47 52 50 52 C 53 52 57 48 55 45 C 53 42 47 42 45 45 Z" fill="#990520" />
        </g>
      );

    case 'tulip':
      return (
        <g transform={`scale(${s})`}>
          <defs>
            <linearGradient id="tulip-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#581C87" />
              <stop offset="50%" stopColor={color} />
              <stop offset="100%" stopColor="#F5F3FF" />
            </linearGradient>
          </defs>
          {/* Base green sepal */}
          <path d="M 46 80 C 44 83 56 83 54 80 L 50 74 Z" fill="#4D7C0F" />
          {/* Left Petal */}
          <path d="M 50 80 C 35 80 20 60 30 35 C 35 25 45 28 46 38 C 48 55 48 70 50 80 Z" fill="url(#tulip-grad)" />
          {/* Right Petal */}
          <path d="M 50 80 C 65 80 80 60 70 35 C 65 25 55 28 54 38 C 52 55 52 70 50 80 Z" fill="url(#tulip-grad)" />
          {/* Center Petal (Overlay) */}
          <path d="M 50 80 C 40 80 32 60 40 30 C 45 20 55 20 60 30 C 68 60 60 80 50 80 Z" fill="url(#tulip-grad)" opacity="0.95" stroke="#FFFFFF" strokeWidth="0.5" />
        </g>
      );

    case 'lily':
      return (
        <g transform={`scale(${s})`}>
          <defs>
            <radialGradient id="lily-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#FAFAF9" />
              <stop offset="100%" stopColor={color === '#FAFAF9' ? '#E7E5E4' : color} />
            </radialGradient>
          </defs>
          {/* 6 star petals */}
          <g>
            <path d="M 50 50 C 50 30 40 5 50 0 C 60 5 50 30 50 50 Z" fill="url(#lily-grad)" />
            <path d="M 50 50 C 65 35 95 40 100 50 C 95 60 65 65 50 50 Z" fill="url(#lily-grad)" />
            <path d="M 50 50 C 35 65 5 60 0 50 C 5 40 35 35 50 50 Z" fill="url(#lily-grad)" />
            <path d="M 50 50 C 50 70 60 95 50 100 C 40 95 50 70 50 50 Z" fill="url(#lily-grad)" />
            
            <path d="M 50 50 C 65 65 85 85 85 90 C 80 90 60 70 50 50 Z" fill="url(#lily-grad)" opacity="0.9" />
            <path d="M 50 50 C 35 35 15 15 15 10 C 20 10 40 30 50 50 Z" fill="url(#lily-grad)" opacity="0.9" />
            <path d="M 50 50 C 65 35 85 15 90 15 C 90 20 70 40 50 50 Z" fill="url(#lily-grad)" opacity="0.9" />
            <path d="M 50 50 C 35 65 15 85 10 85 C 10 80 30 60 50 50 Z" fill="url(#lily-grad)" opacity="0.9" />
          </g>
          {/* Pistils and stamens */}
          <g stroke="#CA8A04" strokeWidth="1.5" fill="none">
            <line x1="50" y1="50" x2="45" y2="35" />
            <line x1="50" y1="50" x2="55" y2="35" />
            <line x1="50" y1="50" x2="60" y2="45" />
            <line x1="50" y1="50" x2="40" y2="45" />
            <line x1="50" y1="50" x2="50" y2="30" stroke="#15803D" strokeWidth="2" />
          </g>
          {/* Anthers */}
          <circle cx="45" cy="34" r="2" fill="#854D0E" />
          <circle cx="55" cy="34" r="2" fill="#854D0E" />
          <circle cx="61" cy="44" r="2" fill="#854D0E" />
          <circle cx="39" cy="44" r="2" fill="#854D0E" />
          <circle cx="50" cy="28" r="2.5" fill="#166534" />
        </g>
      );

    case 'sunflower':
      return (
        <g transform={`scale(${s})`}>
          <defs>
            <linearGradient id="sun-petal" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#EAB308" />
              <stop offset="70%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
            <radialGradient id="sun-center" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="70%" stopColor="#451A03" />
              <stop offset="100%" stopColor="#1C1917" />
            </radialGradient>
          </defs>
          {/* Rays of golden petals */}
          <g>
            {[...Array(24)].map((_, i) => {
              const rotation = (360 / 24) * i;
              return (
                <path
                  key={i}
                  d="M 50 50 C 45 35 44 15 50 5 C 56 15 55 35 50 50 Z"
                  fill="url(#sun-petal)"
                  transform={`rotate(${rotation} 50 50)`}
                  stroke="#EAB308"
                  strokeWidth="0.2"
                />
              );
            })}
          </g>
          {/* Inner ring of shorter offset petals */}
          <g opacity="0.9" transform="scale(0.85) translate(8.8, 8.8)">
            {[...Array(20)].map((_, i) => {
              const rotation = (360 / 20) * i + 9;
              return (
                <path
                  key={i}
                  d="M 50 50 C 46 35 45 18 50 8 C 55 18 54 35 50 50 Z"
                  fill="#F59E0B"
                  transform={`rotate(${rotation} 50 50)`}
                />
              );
            })}
          </g>
          {/* Center disc */}
          <circle cx="50" cy="50" r="22" fill="url(#sun-center)" stroke="#78350F" strokeWidth="1" />
          {/* Textured seed details */}
          <circle cx="50" cy="50" r="16" fill="none" stroke="#CA8A04" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.5" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="#EAB308" strokeWidth="1" strokeDasharray="1 2" opacity="0.4" />
        </g>
      );

    case 'orchid':
      return (
        <g transform={`scale(${s})`}>
          <defs>
            <linearGradient id="orchid-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBCFE8" />
              <stop offset="60%" stopColor={color} />
              <stop offset="100%" stopColor="#9D174D" />
            </linearGradient>
          </defs>
          {/* 3 Outer Sepals */}
          <path d="M 50 50 C 35 32 45 10 50 5 C 55 10 65 32 50 50 Z" fill="url(#orchid-grad)" opacity="0.9" />
          <path d="M 50 50 C 30 50 12 75 15 82 C 18 89 42 68 50 50 Z" fill="url(#orchid-grad)" opacity="0.9" />
          <path d="M 50 50 C 70 50 88 75 85 82 C 82 89 58 68 50 50 Z" fill="url(#orchid-grad)" opacity="0.9" />
          {/* 2 Large Wing Petals */}
          <path d="M 50 50 C 25 35 5 45 5 55 C 5 65 28 65 50 50 Z" fill="url(#orchid-grad)" stroke="#FFF" strokeWidth="0.5" />
          <path d="M 50 50 C 75 35 95 45 95 55 C 95 65 72 65 50 50 Z" fill="url(#orchid-grad)" stroke="#FFF" strokeWidth="0.5" />
          {/* Lip / Labellum (Centerpiece) */}
          <path d="M 50 50 C 40 50 35 72 50 85 C 65 72 60 50 50 50 Z" fill="#F43F5E" stroke="#BE123C" strokeWidth="0.5" />
          <path d="M 50 50 C 45 50 42 62 50 70 C 58 62 55 50 50 50 Z" fill="#FDE047" />
          {/* Stigma node */}
          <circle cx="50" cy="46" r="3" fill="#FFF" />
          <circle cx="50" cy="46" r="1.5" fill="#EAB308" />
        </g>
      );

    case 'lavender':
      return (
        <g transform={`scale(${s})`}>
          <defs>
            <linearGradient id="lavender-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor={color} />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>
          </defs>
          {/* A tall stem spike with florets */}
          <line x1="50" y1="95" x2="50" y2="10" stroke="#4D7C0F" strokeWidth="2.5" />
          
          {/* Clustered tiny buds going up */}
          {[...Array(9)].map((_, index) => {
            const y = 80 - index * 8;
            const size = 10 - index * 0.5;
            return (
              <g key={index} transform={`translate(0, ${y})`}>
                {/* Left floret */}
                <path d="M 50 0 C 42 -4 38 -12 40 -15 C 44 -15 48 -5 50 0 Z" fill="url(#lavender-grad)" />
                {/* Right floret */}
                <path d="M 50 0 C 58 -4 62 -12 60 -15 C 56 -15 52 -5 50 0 Z" fill="url(#lavender-grad)" />
                {/* Upright center floret */}
                <path d="M 50 0 C 47 -6 47 -14 50 -18 C 53 -14 53 -6 50 0 Z" fill="url(#lavender-grad)" opacity="0.9" />
                {/* Angled buds */}
                <circle cx="44" cy="-5" r={size / 3} fill="#A78BFA" />
                <circle cx="56" cy="-5" r={size / 3} fill="#A78BFA" />
              </g>
            );
          })}
        </g>
      );

    case 'daisy':
      return (
        <g transform={`scale(${s})`}>
          <defs>
            <radialGradient id="daisy-center" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="80%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </radialGradient>
          </defs>
          {/* Radiating slender white petals */}
          <g>
            {[...Array(16)].map((_, i) => {
              const rotation = (360 / 16) * i;
              return (
                <path
                  key={i}
                  d="M 50 50 C 47 30 46 8 50 2 C 54 8 53 30 50 50 Z"
                  fill="#FAFAF9"
                  transform={`rotate(${rotation} 50 50)`}
                  stroke="#E7E5E4"
                  strokeWidth="0.5"
                />
              );
            })}
          </g>
          {/* Golden Center Disc */}
          <circle cx="50" cy="50" r="14" fill="url(#daisy-center)" stroke="#CA8A04" strokeWidth="0.5" />
          {/* Seed patterns */}
          <circle cx="50" cy="50" r="9" fill="none" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        </g>
      );

    case 'peony':
      return (
        <g transform={`scale(${s})`}>
          <defs>
            <radialGradient id="peony-grad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="40%" stopColor="#FBCFE8" />
              <stop offset="85%" stopColor={color} />
              <stop offset="100%" stopColor="#9D174D" />
            </radialGradient>
          </defs>
          {/* Massive layered fluffy flower */}
          {/* Outer circle of petals */}
          {[...Array(12)].map((_, i) => {
            const rot = i * 30;
            return (
              <path
                key={`o-${i}`}
                d="M 50 50 C 30 30 18 10 50 5 C 82 10 70 30 50 50 Z"
                fill="url(#peony-grad)"
                transform={`rotate(${rot} 50 50)`}
                opacity="0.85"
              />
            );
          })}
          {/* Middle layer */}
          <g transform="scale(0.85) translate(8.8, 8.8)">
            {[...Array(10)].map((_, i) => {
              const rot = i * 36 + 18;
              return (
                <path
                  key={`m-${i}`}
                  d="M 50 50 C 32 32 20 12 50 8 C 80 12 68 32 50 50 Z"
                  fill="url(#peony-grad)"
                  transform={`rotate(${rot} 50 50)`}
                  opacity="0.95"
                />
              );
            })}
          </g>
          {/* Inner core layer */}
          <g transform="scale(0.68) translate(23.5, 23.5)">
            {[...Array(8)].map((_, i) => {
              const rot = i * 45 + 9;
              return (
                <path
                  key={`i-${i}`}
                  d="M 50 50 C 35 35 25 15 50 10 C 75 15 65 35 50 50 Z"
                  fill="url(#peony-grad)"
                  transform={`rotate(${rot} 50 50)`}
                />
              );
            })}
          </g>
          {/* Center tiny stamens */}
          <circle cx="50" cy="50" r="7" fill="#FDE047" opacity="0.9" />
          <circle cx="50" cy="50" r="4" fill="#CA8A04" />
        </g>
      );

    case 'carnation':
      return (
        <g transform={`scale(${s})`}>
          <defs>
            <radialGradient id="carn-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE4E6" />
              <stop offset="65%" stopColor={color} />
              <stop offset="100%" stopColor="#9F1239" />
            </radialGradient>
          </defs>
          {/* Jagged / ruffled petals */}
          {[...Array(18)].map((_, i) => {
            const rot = i * 20;
            return (
              <path
                key={i}
                d="M 50 50 C 35 30 25 12 40 8 C 50 14 50 14 60 8 C 75 12 65 30 50 50 Z"
                fill="url(#carn-grad)"
                transform={`rotate(${rot} 50 50)`}
                opacity="0.9"
              />
            );
          })}
          {/* Inner layers */}
          <g transform="scale(0.8) translate(12.5, 12.5)">
            {[...Array(12)].map((_, i) => {
              const rot = i * 30 + 10;
              return (
                <path
                  key={`in-${i}`}
                  d="M 50 50 C 35 32 28 15 42 10 C 50 15 50 15 58 10 C 72 15 65 32 50 50 Z"
                  fill="url(#carn-grad)"
                  transform={`rotate(${rot} 50 50)`}
                />
              );
            })}
          </g>
          {/* Center ruffled cluster */}
          <circle cx="50" cy="50" r="10" fill={color} stroke="#FFE4E6" strokeWidth="0.5" />
        </g>
      );

    case 'hydrangea':
      return (
        <g transform={`scale(${s})`}>
          <defs>
            <radialGradient id="hyd-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="60%" stopColor={color} />
              <stop offset="100%" stopColor="#1E3A8A" />
            </radialGradient>
          </defs>
          {/* Large globular cluster made of small 4-petal florets */}
          <circle cx="50" cy="50" r="32" fill="none" />
          
          {/* Define a helper list of positions for 18 tiny florets */}
          {FLORET_POSITIONS.map((pos, index) => {
            const fScale = 0.28;
            return (
              <g key={index} transform={`translate(${pos.x - 50 * fScale}, ${pos.y - 50 * fScale}) scale(${fScale})`}>
                {/* 4 Petals of single floret */}
                <path d="M 50 50 C 35 35 35 15 50 15 C 65 15 65 35 50 50 Z" fill="url(#hyd-grad)" />
                <path d="M 50 50 C 65 35 85 35 85 50 C 85 65 65 65 50 50 Z" fill="url(#hyd-grad)" />
                <path d="M 50 50 C 35 65 35 85 50 85 C 65 85 65 65 50 50 Z" fill="url(#hyd-grad)" />
                <path d="M 50 50 C 35 35 15 35 15 50 C 15 65 35 65 50 50 Z" fill="url(#hyd-grad)" />
                {/* Tiny yellow center */}
                <circle cx="50" cy="50" r="3.5" fill="#FEF08A" />
              </g>
            );
          })}
        </g>
      );

    default:
      return <circle cx="50" cy="50" r="20" fill={color} />;
  }
};

const FLORET_POSITIONS = [
  { x: 50, y: 50 },
  { x: 34, y: 44 },
  { x: 66, y: 44 },
  { x: 50, y: 30 },
  { x: 50, y: 70 },
  { x: 38, y: 62 },
  { x: 62, y: 62 },
  { x: 34, y: 30 },
  { x: 66, y: 30 },
  // Outer layer
  { x: 20, y: 50 },
  { x: 80, y: 50 },
  { x: 50, y: 16 },
  { x: 50, y: 84 },
  { x: 26, y: 34 },
  { x: 74, y: 34 },
  { x: 26, y: 66 },
  { x: 74, y: 66 },
  { x: 42, y: 46 }
];

// Stem SVG drawing
export const StemSVG: React.FC<{ type: string; color?: string }> = ({ type, color = '#3F6212' }) => {
  // Stems start near (50, 100) and go up to (50, 0).
  // Different flowers have different leaf shapes or details.
  switch (type) {
    case 'rose':
      return (
        <g stroke={color} strokeWidth="3" fill="none" strokeLinecap="round">
          {/* Main Stem */}
          <path d="M 50 100 C 48 70 52 40 50 10" />
          {/* Leaves with detail */}
          <g fill={color} stroke="none">
            {/* Left Leaf */}
            <path d="M 49 65 C 35 60 25 50 30 45 C 38 45 45 55 49 60 Z" />
            {/* Right Leaf */}
            <path d="M 51 45 C 65 40 75 30 70 25 C 62 25 55 35 51 40 Z" />
          </g>
          {/* Tiny thorns */}
          <path d="M 49 80 L 44 78" strokeWidth="2" />
          <path d="M 51 55 L 56 53" strokeWidth="2" />
        </g>
      );

    case 'sunflower':
      return (
        <g stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round">
          <path d="M 50 100 L 50 10" />
          {/* Large wide leaves */}
          <g fill={color} stroke="none">
            <path d="M 48 70 C 25 70 15 50 30 45 C 40 45 46 60 48 65 Z" />
            <path d="M 52 50 C 75 50 85 30 70 25 C 60 25 54 40 52 45 Z" />
          </g>
        </g>
      );

    case 'tulip':
      return (
        <g stroke={color} strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M 50 100 C 52 70 48 40 50 10" />
          {/* Long smooth blade-like leaves wrapping the stem */}
          <g fill={color} stroke="none">
            <path d="M 50 95 C 35 85 32 50 48 20 C 44 45 42 75 50 90 Z" opacity="0.9" />
            <path d="M 50 95 C 65 85 68 60 52 35 C 56 55 58 75 50 90 Z" opacity="0.95" />
          </g>
        </g>
      );

    case 'lavender':
      // Lavender stem is very thin and linear, leaves are narrow needles
      return (
        <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M 50 100 L 50 10" />
          {/* Needle leaves pointing upwards */}
          <line x1="50" y1="80" x2="38" y2="70" />
          <line x1="50" y1="75" x2="62" y2="65" />
          <line x1="50" y1="60" x2="40" y2="50" />
          <line x1="50" y1="55" x2="60" y2="45" />
          <line x1="50" y1="40" x2="42" y2="30" />
          <line x1="50" y1="35" x2="58" y2="25" />
        </g>
      );

    case 'lily':
    case 'orchid':
    case 'daisy':
    case 'peony':
    case 'carnation':
    case 'hydrangea':
    default:
      // A standard graceful leafy stem
      return (
        <g stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M 50 100 C 49 70 51 40 50 10" />
          <g fill={color} stroke="none">
            {/* Standard oval leaves */}
            <path d="M 49 70 C 38 66 32 58 36 54 C 42 54 47 62 49 66 Z" />
            <path d="M 51 50 C 62 46 68 38 64 34 C 58 34 53 42 51 46 Z" />
          </g>
        </g>
      );
  }
};



// Single assembled flower in the bouquet canvas
export const AssembledFlower: React.FC<{
  type: string;
  color: string;
  wrapX: number;
  wrapY: number;
  bloomX: number;
  bloomY: number;
  angle: number;
  scale: number;
  showBloomOnly?: boolean;
}> = ({ type, color, wrapX, wrapY, bloomX, bloomY, angle, scale, showBloomOnly = false }) => {
  return (
    <g>
      {/* 1. Draw Stem (Line from wrap to bloom center, rotated) */}
      {!showBloomOnly && (
        <g>
          {/* We define a clip path or draw a curve from wrap point to bloom point */}
          {/* Stems converge at wrapX, wrapY. Stems ends at bloomX, bloomY */}
          {/* We can use a quadratic bezier curve for organic bending */}
          {/* The control point can bend slightly outwards based on the bloom position */}
          {(() => {
            const ctrlX = (wrapX + bloomX) / 2 + (bloomX - wrapX) * 0.15;
            const ctrlY = (wrapY + bloomY) / 2 + 10; // pull control point down
            const pathD = `M ${wrapX} ${wrapY} Q ${ctrlX} ${ctrlY} ${bloomX} ${bloomY}`;
            
            return (
              <g>
                {/* Stem green path */}
                <path d={pathD} fill="none" stroke="#4D7C0F" strokeWidth={3 * scale} strokeLinecap="round" />
                {/* Add a tiny leaf branch near middle */}
                <circle cx={(wrapX + ctrlX) / 2} cy={(wrapY + ctrlY) / 2} r={4 * scale} fill="#65A30D" />
                <circle cx={(ctrlX + bloomX) / 2 - 5} cy={(ctrlY + bloomY) / 2} r={3 * scale} fill="#65A30D" />
              </g>
            );
          })()}
        </g>
      )}

      {/* 2. Draw Bloom at (bloomX, bloomY) with rotation and scale */}
      <g transform={`translate(${bloomX}, ${bloomY}) rotate(${angle}) translate(-50, -50)`}>
        <BloomSVG type={type} color={color} scale={scale} />
      </g>
    </g>
  );
};
