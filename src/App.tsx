import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, ArrowLeft, 
  History, Volume2, Info
} from 'lucide-react';
import * as Icons from 'lucide-react';
import type { CardState, Occasion, FlowerSelection } from './types';
import { OCCASIONS, AUDIO_TRACKS } from './types';
import { deserializeCardState } from './utils/sharing';
import { Envelope } from './components/Envelope';
import { GreetingCard } from './components/GreetingCard';
import { BouquetBuilder } from './components/BouquetBuilder';
import { SharePanel } from './components/SharePanel';

const DynamicIcon = ({ name, className, size = 20, strokeWidth = 1.5 }: { name: string; className?: string; size?: number; strokeWidth?: number }) => {
  const IconComponent = (Icons as any)[name];
  return IconComponent ? <IconComponent className={className} size={size} strokeWidth={strokeWidth} /> : <Icons.Sparkles className={className} size={size} strokeWidth={strokeWidth} />;
};

interface SavedCard {
  id: string;
  timestamp: number;
  state: CardState;
}

const AI_SUGGESTIONS: Record<Occasion, string[]> = {
  birthday: [
    "Like a garden in spring, may your day bloom with endless beauty, sweet laughter, and the warmth of those who cherish you. Happy Birthday!",
    "On your special day, I hope you pause to celebrate the beautiful path behind you and the wonderful road ahead. Wishing you the happiest of birthdays!",
    "Sending you a hand-tied bouquet of joy, warm memories, and bright wishes. May your year ahead be as beautiful and extraordinary as you are."
  ],
  anniversary: [
    "Through all of life's seasons, the love you share remains a constant source of beauty and inspiration. Wishing you a beautiful Anniversary!",
    "To the couple who shows us that true love is an ever-blooming garden. Congratulations on another wonderful year together.",
    "May the love you share continue to grow, deepen, and blossom with every passing year. Happy Anniversary to a perfect couple!"
  ],
  wedding: [
    "May your love be like a continuous spring—ever fresh, ever blooming, and growing stronger with every sunrise. Happy Wedding Day!",
    "Here's to the start of a beautiful adventure! May your life together be filled with shared dreams, sweet understanding, and endless love.",
    "Congratulations on tying the knot! May your marriage be a sanctuary of joy, peace, and blooming happiness."
  ],
  graduation: [
    "Your dedication has bloomed into this magnificent achievement. Go forth with confidence and let your dreams shape the world! Congratulations!",
    "So incredibly proud of your hard work. You are officially ready to bloom in the next chapter of your life! Happy Graduation!",
    "The world is waiting for your unique light. Step forward boldly, chase your dreams, and make a beautiful difference."
  ],
  babyshower: [
    "Welcome to the beautiful adventure of parenthood. May your tiny miracle fill your days with wonder and your hearts with pure light.",
    "Wishing you and your little bundle of joy a lifetime of health, laughter, and magical moments. Congratulations on your baby shower!",
    "A brand new flower is about to join your family garden! Wishing you endless patience, warm snuggles, and deep joy."
  ],
  valentine: [
    "In a meadow of millions, my eyes will always search for you. You are my favorite bloom, my love, and my home. Happy Valentine's Day.",
    "Every day spent with you is like walking through a warm, sunny garden. You make my heart sing and bloom. I love you.",
    "You are the rose in my garden, the music in my silence, and the warmth in my winter. Happy Valentine's Day, my dearest."
  ],
  friendship: [
    "Just like flowers brighten a quiet room, your friendship fills my life with warmth, grace, and light. Thank you for being you!",
    "Through life's storms and sunshine, I am so grateful to have you by my side. You are the truest and most beautiful friend.",
    "Just a little bouquet of gratitude to remind you of how much your friendship means to me. Thank you for always understanding."
  ],
  thankyou: [
    "For your kindness that acts like sunshine and your support that helps me grow, I send this bouquet with deepest gratitude. Thank you!",
    "I am incredibly grateful for your warmth, guidance, and help. You made a beautiful difference when I needed it most.",
    "Thank you from the bottom of my heart. Your generosity is a beautiful reminder of how kind the world can be."
  ],
  getwell: [
    "May these flowers whisper gentle hopes of health and comfort to you. Sending you soft, healing wishes for a speedy recovery.",
    "Thinking of you and sending a bouquet of strength and healing. Hope you feel stronger and better with each passing day. Get well soon!",
    "Rest well, take gentle care of yourself, and let these blooms bring a little sunshine and cheer to your room as you heal."
  ],
  custom: [
    "Wishing you a day that overflows with gentle peace, bright smiles, and the simple beauty of a quiet moment.",
    "Sending warm thoughts, custom wishes, and a beautiful bouquet tailored just to bring a smile to your face today.",
    "May this little digital greeting card remind you that you are thought of, appreciated, and cherished."
  ]
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.23, 1, 0.32, 1] as const,
  duration: 0.3
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.05
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

export default function App() {
  // State Management
  const [step, setStep] = useState(1); // 1: Occasions, 2: Message, 3: Bouquet, 4: Music, 5: Preview
  const [occasion, setOccasion] = useState<Occasion>('birthday');
  const [customOccasionName, setCustomOccasionName] = useState('');
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [selectedFlowers, setSelectedFlowers] = useState<FlowerSelection[]>([]);
  const [wrapStyle, setWrapStyle] = useState('kraft');
  const [cardBg, setCardBg] = useState('white');
  const [music, setMusic] = useState('none');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isRecipientFlow, setIsRecipientFlow] = useState(false);
  const [recipientState, setRecipientState] = useState<CardState | null>(null);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout>();

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('dreamwish_history');
    if (saved) {
      try {
        setSavedCards(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }

    // Check if we're in recipient mode via URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('card')) {
      const deserialized = deserializeCardState(params.get('card')!);
      if (deserialized) {
        setIsRecipientFlow(true);
        setRecipientState(deserialized);
      }
    }
  }, []);

  // AI Suggestion Handler
  const handleAiSuggestion = async () => {
    setIsAiLoading(true);
    try {
      const msgSuggestions = AI_SUGGESTIONS[occasion] || AI_SUGGESTIONS.custom;
      const randomIndex = Math.floor(Math.random() * msgSuggestions.length);
      setMessage(msgSuggestions[randomIndex]);
    } catch (error) {
      console.error('AI suggestion failed:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Occasion Selection
  const handleSelectOccasion = (occasionId: Occasion) => {
    setOccasion(occasionId);
    setCustomOccasionName('');
  };

  // Play / Pause music engine
  const startMusic = (trackId: string) => {
    if (!audioRef.current) return;
    
    if (trackId === 'none') {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      return;
    }

    const track = AUDIO_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    try {
      audioRef.current.src = track.url;
      audioRef.current.volume = 0.4;
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(err => {
          console.warn('Audio play blocked. Waiting for user interaction.', err);
          setIsMusicPlaying(false);
        });
    } catch (e) {
      console.error('Audio play error:', e);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(e => console.error(e));
    }
  };

  // Preview track snippet during creation
  const handlePreviewTrack = (trackId: string) => {
    setMusic(trackId);
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);

    if (trackId === 'none') {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
      return;
    }

    const track = AUDIO_TRACKS.find(t => t.id === trackId);
    if (!track || !audioRef.current) return;

    audioRef.current.src = track.url;
    audioRef.current.volume = 0.45;
    audioRef.current.play()
      .then(() => {
        setIsMusicPlaying(true);
        // Play for only 4 seconds to preview
        previewTimeoutRef.current = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsMusicPlaying(false);
          }
        }, 4500);
      })
      .catch(e => console.warn('Preview blocked:', e));
  };

  // Auto-save history when finalizing a card
  const handleSaveToHistory = (stateToSave: CardState) => {
    const newCard: SavedCard = {
      id: `card-${Date.now()}`,
      timestamp: Date.now(),
      state: stateToSave
    };

    const updated = [newCard, ...savedCards.slice(0, 19)]; // Keep last 20 cards
    setSavedCards(updated);
    localStorage.setItem('dreamwish_history', JSON.stringify(updated));
  };

  const handleLoadSavedCard = (saved: CardState) => {
    setOccasion(saved.occasion);
    setSender(saved.sender);
    setRecipient(saved.recipient);
    setMessage(saved.message);
    setSelectedFlowers(saved.flowers);
    setWrapStyle(saved.wrapStyle);
    setMusic(saved.music);
    setCardBg(saved.cardBg || 'white');
    setCustomOccasionName(saved.customOccasionName || '');
    setStep(5); // Go straight to preview
    setShowHistory(false);
  };

  // Check form step validation
  const isStepValid = () => {
    if (step === 1) {
      return occasion !== 'custom' || customOccasionName.trim().length > 0;
    }
    if (step === 2) {
      return sender.trim().length > 0 && recipient.trim().length > 0 && message.trim().length > 0;
    }
    if (step === 3) {
      return selectedFlowers.length > 0;
    }
    return true;
  };

  const currentOccasionConfig = OCCASIONS.find(o => o.id === occasion) || OCCASIONS[0];

  // Helper to compile state object
  const getCompiledState = (): CardState => ({
    occasion,
    sender: sender.trim() || 'Someone Special',
    recipient: recipient.trim() || 'You',
    message: message.trim() || 'Wishing you the absolute best!',
    flowers: selectedFlowers,
    music,
    wrapStyle,
    cardBg,
    customOccasionName: customOccasionName.trim()
  });

  const handleNextStep = () => {
    if (step < 5) {
      if (step === 4) {
        // If moving to step 5 (final preview), save this card to local history automatically
        handleSaveToHistory(getCompiledState());
      }
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
      setStep(step - 1);
    }
  };

  const handleResetCreator = () => {
    setStep(1);
    setOccasion('birthday');
    setSender('');
    setRecipient('');
    setMessage('');
    setSelectedFlowers([]);
    setWrapStyle('kraft');
    setMusic('none');
    setCardBg('white');
    setCustomOccasionName('');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  };

  // Recipient flow open envelope action
  const handleEnvelopeOpened = () => {
    setIsEnvelopeOpened(true);
    if (recipientState && recipientState.music !== 'none') {
      startMusic(recipientState.music);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between">
      {/* Invisible HTML5 Audio Player */}
      <audio ref={audioRef} loop />

      {/* RECIPIENT MODE VIEW */}
      {isRecipientFlow && recipientState && (
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-[#faf8f5] via-[#f3e6dd]/40 to-[#ebd7cb]/20 w-full min-h-screen relative overflow-hidden">
          {!isEnvelopeOpened ? (
            <div className="w-full text-center space-y-6 z-10">
              {/* Header Logo */}
              <div className="flex items-center justify-center gap-2 opacity-95">
                <svg className="w-8 h-8 drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="logo-grad-rec" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  <rect x="4" y="4" width="92" height="92" rx="28" fill="url(#logo-grad-rec)" />
                  <g stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
                    <path d="M50 50 V72" />
                    <path d="M50 60 Q36 56 42 48" />
                    <path d="M50 40 C42 30 58 30 50 40 Z" fill="none" />
                    <path d="M50 40 C60 32 60 48 50 40 Z" fill="none" />
                    <path d="M50 40 C58 50 42 50 50 40 Z" fill="none" />
                  </g>
                </svg>
                <h1 className="text-2xl font-serif font-bold text-slate-800 drop-shadow-xs">DreamWish</h1>
              </div>

              <Envelope 
                onOpen={handleEnvelopeOpened}
                recipientName={recipientState.recipient}
                senderName={recipientState.sender}
              />

              {/* Music Toggle */}
              <div className="flex items-center justify-center gap-2 opacity-80">
                <button
                  onClick={toggleMusic}
                  className="p-2 rounded-full bg-white/30 hover:bg-white/50 text-slate-700 transition-all backdrop-blur"
                >
                  {isMusicPlaying ? (
                    <Icons.VolumeX size={20} />
                  ) : (
                    <Icons.Volume2 size={20} />
                  )}
                </button>
                <span className="text-sm text-slate-600 font-medium">
                  {isMusicPlaying ? 'Music playing' : 'Music paused'}
                </span>
              </div>
            </div>
          ) : (
            <GreetingCard state={recipientState} />
          )}
        </main>
      )}

      {/* CREATOR MODE VIEW */}
      {!isRecipientFlow && (
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 bg-gradient-to-br from-[#faf8f5] via-[#f3e6dd]/40 to-[#ebd7cb]/20 w-full relative overflow-hidden">
          {/* Background Petals Animation */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-16 h-16 opacity-0 animate-petal-fall"
                style={{
                  animationDelay: `${i * 2}s`,
                  left: `${(i + 1) * 25}%`,
                  animation: `petal-fall-${(i % 3) + 1} 12s linear infinite`,
                  animationDelay: `${i * 3}s`
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full fill-purple-200/20">
                  <circle cx="50" cy="50" r="40" />
                </svg>
              </div>
            ))}
          </div>

          {/* Top Navigation and Preview Toggle */}
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 mb-8 z-10">
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="92" height="92" rx="28" fill="url(#logo-grad)" />
                <g stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
                  <path d="M50 50 V72" />
                  <path d="M50 60 Q36 56 42 48" />
                  <path d="M50 40 C42 30 58 30 50 40 Z" fill="none" />
                  <path d="M50 40 C60 32 60 48 50 40 Z" fill="none" />
                  <path d="M50 40 C58 50 42 50 50 40 Z" fill="none" />
                </g>
              </svg>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900">DreamWish</h1>
            </div>

            {/* Top Right: History + Tabs */}
            <div className="flex items-center gap-2">
              {step === 5 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 rounded-full border border-stone-200 hover:border-purple-300 bg-white hover:bg-stone-50 transition-all active-press-scale"
                >
                  <History size={13} className="text-purple-600" />
                </button>
              )}

              {/* Progress indicator */}
              {step < 5 && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="relative h-1 bg-stone-200 rounded-full w-6 overflow-hidden">
                      <span className="text-purple-700">
                        <div
                          className={`h-full bg-purple-700 transition-all duration-300`}
                          style={{
                            width: i < step ? '100%' : i === step ? '50%' : '0%'
                          }}
                        />
                      </span>
                      <div
                        className={`absolute left-0 h-[3px] bg-purple-600 -z-10 transition-all duration-300 rounded-full`}
                        style={{
                          width: i <= step ? '100%' : '0%'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Wizard Container */}
          <div className="w-full max-w-7xl mx-auto z-10">
            {/* History Panel */}
            {showHistory && step === 5 && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 p-3.5 rounded-2xl border border-stone-100 hover:border-purple-200 bg-stone-50 hover:bg-white transition-all shadow-2xs space-y-3"
                >
                  <div className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                    <History size={12} className="text-purple-600" />
                    Previous Cards
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                    {savedCards.map((card) => {
                      const config = OCCASIONS.find(o => o.id === card.state.occasion);
                      return (
                        <motion.button
                          key={card.id}
                          onClick={() => handleLoadSavedCard(card.state)}
                          whileHover={{ scale: 1.05 }}
                          className="p-2 rounded-xl border border-stone-200 hover:border-purple-300 bg-white hover:bg-purple-50 transition-all text-left text-[10px] space-y-1"
                        >
                          <div className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                            {config && <DynamicIcon name={config.iconName} className="text-purple-650" size={12} />}
                            <span className="truncate">{config?.name}</span>
                          </div>
                          <p className="truncate text-slate-700 font-medium">{card.state.recipient}</p>
                          <p className="text-slate-500 line-clamp-2">{card.state.message}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadSavedCard(card.state);
                            }}
                            className="w-full py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold text-center block transition-colors cursor-pointer active-press-scale"
                          >
                            Reload
                          </button>
                        </motion.button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="w-full text-center text-[10px] font-bold text-purple-500 hover:bg-purple-50 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Close History
                  </button>
                </motion.div>
              </AnimatePresence>
            )}
            {/* WIZARD SCREEN */}
            <div className="w-full">
              {step < 5 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
                  {/* Left Column (5 cols): Step Wizard Controls */}
                  <div className="lg:col-span-5 space-y-6">
                    <AnimatePresence mode="wait">
                      {/* Step 1: Occasion Selection */}
                      {step === 1 && (
                        <motion.div
                          key="step-1"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={pageTransition}
                          className="space-y-5 w-full"
                        >
                          <div className="text-center lg:text-left space-y-1">
                            <h2 className="font-serif text-2xl font-bold text-slate-900">Choose a Special Occasion</h2>
                            <p className="text-xs text-slate-500">
                              Selecting an occasion sets the design theme, color palette, and template choices.
                            </p>
                          </div>

                          <div className="double-bezel-outer shadow-md">
                            <div className="double-bezel-inner p-5 space-y-4">
                              <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-2 xs:grid-cols-3 gap-2.5"
                              >
                                {OCCASIONS.map((occ) => (
                                  <motion.button
                                    variants={staggerItem}
                                    key={occ.id}
                                    onClick={() => handleSelectOccasion(occ.id)}
                                    className={`p-2.5 rounded-xl border text-center flex flex-col justify-center items-center h-20 transition-all cursor-pointer active-press-scale ${
                                      occasion === occ.id
                                        ? 'bg-gradient-to-br from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 border-transparent text-white shadow-md scale-[1.03]'
                                        : 'bg-white border-stone-200/50 hover:bg-stone-50 hover:border-purple-200 hover:shadow-2xs text-slate-800'
                                    }`}
                                  >
                                    <DynamicIcon name={occ.iconName} className={occasion === occ.id ? 'text-white mb-1.5' : 'text-purple-700 mb-1.5'} size={20} />
                                    <div className={`text-xs font-bold leading-tight ${occasion === occ.id ? 'text-white' : 'text-slate-800'}`}>
                                      {occ.name}
                                    </div>
                                  </motion.button>
                                ))}
                              </motion.div>

                              {occasion === 'custom' && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="space-y-1.5 pt-2 border-t border-stone-100"
                                >
                                  <label htmlFor="custom-occasion-input" className="text-[10px] uppercase tracking-wider text-slate-800 font-bold block">Custom Occasion Name</label>
                                  <input
                                    id="custom-occasion-input"
                                    type="text"
                                    placeholder="e.g. Mother's Day, Retirement"
                                    value={customOccasionName}
                                    onChange={(e) => setCustomOccasionName(e.target.value.substring(0, 30))}
                                    className="w-full bg-slate-50/50 border border-stone-200/80 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-stone-400 focus:outline-hidden focus:border-purple-400 focus:bg-white transition-all font-semibold"
                                  />
                                </motion.div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end pt-4">
                            <button
                              disabled={!isStepValid()}
                              onClick={handleNextStep}
                              className={`group flex items-center justify-between gap-4 font-bold pl-6 pr-2 py-2 rounded-full shadow-md transition-all text-xs uppercase tracking-wider ${
                                isStepValid()
                                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white active-press-scale cursor-pointer'
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                              }`}
                            >
                              <span>Continue</span>
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${isStepValid() ? 'bg-white/15 group-hover:translate-x-0.5' : 'bg-stone-100'}`}>
                                <ArrowRight size={14} className={isStepValid() ? 'text-white' : 'text-stone-300'} />
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 2: Message Configuration */}
                      {step === 2 && (
                        <motion.div
                          key="step-2"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={pageTransition}
                          className="space-y-5 w-full"
                        >
                          <div className="text-center lg:text-left space-y-1">
                            <h2 className="font-serif text-2xl font-bold text-slate-900">Personalize Your Message</h2>
                            <p className="text-xs text-slate-500">
                              Write a heartfelt message, populate from suggestions, or let our AI helper write a draft!
                            </p>
                          </div>

                          <div className="double-bezel-outer shadow-md">
                            <div className="double-bezel-inner p-5 space-y-4">
                              {/* Sender and Recipient */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label htmlFor="recipient-input" className="text-[10px] uppercase tracking-wider text-slate-800 font-bold block">To (Recipient)</label>
                                  <input
                                    id="recipient-input"
                                    name="recipient"
                                    type="text"
                                    placeholder="e.g. Arpit"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    maxLength={25}
                                    className="w-full bg-slate-50/50 border border-stone-200/80 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-stone-400 focus:outline-hidden focus:border-purple-400 focus:bg-white transition-all font-semibold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label htmlFor="sender-input" className="text-[10px] uppercase tracking-wider text-slate-800 font-bold block">From (Sender)</label>
                                  <input
                                    id="sender-input"
                                    name="sender"
                                    type="text"
                                    placeholder="e.g. Arpita"
                                    value={sender}
                                    onChange={(e) => setSender(e.target.value)}
                                    maxLength={25}
                                    className="w-full bg-slate-50/50 border border-stone-200/80 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-stone-400 focus:outline-hidden focus:border-purple-400 focus:bg-white transition-all font-semibold"
                                  />
                                </div>
                              </div>

                              {/* Text Message Textarea */}
                              <div className="space-y-1 relative pb-10">
                                <div className="flex justify-between items-center mb-1">
                                  <label htmlFor="message-input" className="text-[10px] uppercase tracking-wider text-slate-800 font-bold">Greeting Message</label>
                                  <span className={`text-[9px] font-semibold ${message.length >= 240 ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>
                                    {message.length} / 250
                                  </span>
                                </div>
                                <textarea
                                  id="message-input"
                                  name="message"
                                  placeholder="Write something sweet and thoughtful..."
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value.substring(0, 250))}
                                  rows={3}
                                  className="w-full bg-slate-50/50 border border-stone-200/80 rounded-xl p-3 text-sm text-slate-800 placeholder-stone-400 focus:outline-hidden focus:border-purple-400 focus:bg-white transition-all font-medium resize-none leading-relaxed"
                                />
                                
                                {/* AI suggest message generator badge */}
                                <div className="absolute right-1 bottom-0">
                                  <button
                                    onClick={handleAiSuggestion}
                                    disabled={isAiLoading}
                                    className="flex items-center gap-1.5 text-xs font-bold bg-purple-700 text-white px-3.5 rounded-xl shadow-xs hover:bg-purple-800 active:scale-95 transition-all disabled:opacity-50 cursor-pointer min-h-[36px]"
                                  >
                                    <Sparkles size={11} className={isAiLoading ? 'animate-spin' : ''} />
                                    <span>{isAiLoading ? 'Writing...' : 'AI Assist'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Templates list selection */}
                              <div className="space-y-2">
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                                  Suggested Templates
                                </span>
                                <motion.div 
                                  variants={staggerContainer}
                                  initial="hidden"
                                  animate="show"
                                  className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 no-scrollbar"
                                >
                                  {currentOccasionConfig.prebuiltMessages.map((msg, index) => (
                                    <motion.button
                                      variants={staggerItem}
                                      key={index}
                                      onClick={() => setMessage(msg)}
                                      className={`w-full text-left p-2 rounded-xl border text-[11px] leading-relaxed transition-all cursor-pointer active-press-scale ${
                                        message === msg
                                          ? 'border-purple-300 bg-purple-50/40 text-purple-900 font-medium'
                                          : 'border-stone-100 bg-slate-50/30 text-slate-700 hover:bg-white hover:border-purple-200'
                                      }`}
                                    >
                                      "{msg}"
                                    </motion.button>
                                  ))}
                                </motion.div>
                              </div>
                            </div>
                          </div>

                          {/* Wizard controls */}
                          <div className="flex items-center justify-between gap-4 pt-4">
                            <button
                              onClick={handlePrevStep}
                              className="group flex items-center justify-between gap-3 border border-stone-200 bg-white/80 hover:bg-white text-slate-800 font-bold pl-2 pr-6 py-2 rounded-full transition-all active-press-scale cursor-pointer text-xs uppercase tracking-wider"
                            >
                              <span className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center transition-transform group-hover:-translate-x-0.5">
                                <ArrowLeft size={14} className="text-slate-650" />
                              </span>
                              <span>Back</span>
                            </button>
                            <button
                              disabled={!isStepValid()}
                              onClick={handleNextStep}
                              className={`group flex items-center justify-between gap-4 font-bold pl-6 pr-2 py-2 rounded-full shadow-md transition-all text-xs uppercase tracking-wider ${
                                isStepValid()
                                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white active-press-scale cursor-pointer'
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                              }`}
                            >
                              <span>Build Bouquet</span>
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${isStepValid() ? 'bg-white/15 group-hover:translate-x-0.5' : 'bg-stone-100'}`}>
                                <ArrowRight size={14} className={isStepValid() ? 'text-white' : 'text-stone-300'} />
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 3: Interactive Bouquet Builder */}
                      {step === 3 && (
                        <motion.div
                          key="step-3"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={pageTransition}
                          className="space-y-5 w-full"
                        >
                          <div className="text-center lg:text-left space-y-1">
                            <h2 className="font-serif text-2xl font-bold text-slate-900">Assemble the Flower Bouquet</h2>
                            <p className="text-xs text-slate-500">
                              Select a variety of flowers to build a hand-tied arrangement in your chosen wrap paper.
                            </p>
                          </div>

                          <BouquetBuilder
                            selectedFlowers={selectedFlowers}
                            onChangeFlowers={setSelectedFlowers}
                            wrapStyle={wrapStyle}
                            onChangeWrapStyle={setWrapStyle}
                            cardBg={cardBg}
                            onChangeCardBg={setCardBg}
                          />

                          {/* Wizard controls */}
                          <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-250/20">
                            <button
                              onClick={handlePrevStep}
                              className="group flex items-center justify-between gap-3 border border-stone-200 bg-white/80 hover:bg-white text-slate-800 font-bold pl-2 pr-6 py-2 rounded-full transition-all active-press-scale cursor-pointer text-xs uppercase tracking-wider"
                            >
                              <span className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center transition-transform group-hover:-translate-x-0.5">
                                <ArrowLeft size={14} className="text-slate-650" />
                              </span>
                              <span>Back</span>
                            </button>
                            <button
                              disabled={!isStepValid()}
                              onClick={handleNextStep}
                              className={`group flex items-center justify-between gap-4 font-bold pl-6 pr-2 py-2 rounded-full shadow-md transition-all text-xs uppercase tracking-wider ${
                                isStepValid()
                                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white active-press-scale cursor-pointer'
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                              }`}
                            >
                              <span>Select Music</span>
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${isStepValid() ? 'bg-white/15 group-hover:translate-x-0.5' : 'bg-stone-100'}`}>
                                <ArrowRight size={14} className={isStepValid() ? 'text-white' : 'text-stone-300'} />
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 4: Music Selection */}
                      {step === 4 && (
                        <motion.div
                          key="step-4"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={pageTransition}
                          className="space-y-5 w-full"
                        >
                          <div className="text-center lg:text-left space-y-1">
                            <h2 className="font-serif text-2xl font-bold text-slate-900">Add Ambient Music</h2>
                            <p className="text-xs text-slate-500">
                              Choose a gentle backing track that starts looping when the recipient opens the envelope.
                            </p>
                          </div>

                          <div className="double-bezel-outer shadow-md">
                            <div className="double-bezel-inner p-5 space-y-4">
                              {/* Track list selectors */}
                              <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                className="space-y-2.5"
                              >
                                {/* Option: None */}
                                <motion.button
                                  variants={staggerItem}
                                  onClick={() => handlePreviewTrack('none')}
                                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer active-press-scale ${
                                    music === 'none'
                                      ? 'bg-white border-purple-500 ring-2 ring-purple-100/50 shadow-xs font-bold scale-[1.01]'
                                      : 'bg-slate-50/50 border-stone-200/50 hover:bg-white hover:border-purple-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Icons.VolumeX size={18} className={music === 'none' ? 'text-purple-700' : 'text-slate-400'} strokeWidth={1.5} />
                                    <div>
                                      <p className="text-xs font-bold text-slate-800">None</p>
                                      <p className="text-[10px] text-slate-500">Quiet experience</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-purple-700 font-bold">{music === 'none' ? 'Active' : 'Select'}</span>
                                </motion.button>

                                {/* Audio tracks */}
                                {AUDIO_TRACKS.map((track) => (
                                  <motion.button
                                    variants={staggerItem}
                                    key={track.id}
                                    onClick={() => handlePreviewTrack(track.id)}
                                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer active-press-scale ${
                                      music === track.id
                                        ? 'bg-white border-purple-500 ring-2 ring-purple-100/50 shadow-xs font-bold scale-[1.01]'
                                        : 'bg-slate-50/50 border-stone-200/50 hover:bg-white hover:border-purple-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <DynamicIcon name={track.iconName} className={music === track.id ? 'text-purple-750' : 'text-slate-500'} size={18} />
                                      <div>
                                        <p className="text-xs font-bold text-slate-800">{track.name}</p>
                                        <p className="text-[10px] text-slate-500">{track.description}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isMusicPlaying && music === track.id && (
                                        <Volume2 size={12} className="text-purple-600 animate-bounce" />
                                      )}
                                      <span className="text-[10px] text-purple-700 font-bold">
                                        {music === track.id ? (isMusicPlaying ? 'Playing' : 'Selected') : 'Preview'}
                                      </span>
                                    </div>
                                  </motion.button>
                                ))}
                              </motion.div>
                            </div>
                          </div>

                          {/* Wizard controls */}
                          <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-250/20">
                            <button
                              onClick={handlePrevStep}
                              className="group flex items-center justify-between gap-3 border border-stone-200 bg-white/80 hover:bg-white text-slate-800 font-bold pl-2 pr-6 py-2 rounded-full transition-all active-press-scale cursor-pointer text-xs uppercase tracking-wider"
                            >
                              <span className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center transition-transform group-hover:-translate-x-0.5">
                                <ArrowLeft size={14} className="text-slate-650" />
                              </span>
                              <span>Back</span>
                            </button>
                            <button
                              disabled={!isStepValid()}
                              onClick={handleNextStep}
                              className={`group flex items-center justify-between gap-4 font-bold pl-6 pr-2 py-2 rounded-full shadow-md transition-all text-xs uppercase tracking-wider ${
                                isStepValid()
                                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white active-press-scale cursor-pointer'
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                              }`}
                            >
                              <span>Preview Card</span>
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${isStepValid() ? 'bg-white/15 group-hover:translate-x-0.5' : 'bg-stone-100'}`}>
                                <ArrowRight size={14} className={isStepValid() ? 'text-white' : 'text-stone-300'} />
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right Column (7 cols): Live Preview */}
                  <div className="lg:col-span-7 hidden lg:flex items-center justify-center">
                    <GreetingCard state={getCompiledState()} />
                  </div>
                </div>
              ) : (
                /* Final Preview and Share Panel */
                <div className="w-full flex flex-col items-center justify-center">
                  <GreetingCard state={getCompiledState()} />
                  <SharePanel 
                    state={getCompiledState()}
                    onReset={handleResetCreator}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-white/30 backdrop-blur-sm border-t border-white/10 text-center">
        <p className="text-[10px] text-slate-600 font-medium">
          Made with <Icons.Heart size={12} className="text-purple-600 fill-purple-600 inline" strokeWidth={2.5} /> by DreamWish
        </p>
      </footer>

      {/* Film Grain Overlay */}
      <div className="film-grain" />
    </div>
  );
}
