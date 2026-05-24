import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, ArrowLeft, 
  History, Volume2, Info
} from 'lucide-react';
import * as Icons from 'lucide-react';
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
      type: "spring" as const,
      duration: 0.4,
      bounce: 0.1
    }
  }
};

function App() {
  // Navigation & Router
  const [recipientState, setRecipientState] = useState<CardState | null>(null);
  const [isRecipientFlow, setIsRecipientFlow] = useState(false);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);

  // Wizard state (for creator)
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState<Occasion>('birthday');
  const [customOccasionName, setCustomOccasionName] = useState('');
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [selectedFlowers, setSelectedFlowers] = useState<FlowerSelection[]>([]);
  const [wrapStyle, setWrapStyle] = useState<'kraft' | 'blush' | 'mesh' | 'gold'>('kraft');
  const [music, setMusic] = useState<string>('none');
  const [cardBg, setCardBg] = useState<'white' | 'silver' | 'slate' | 'blush' | 'gold'>('white');
  const [customOccasionName, setCustomOccasionName] = useState('');

  // Interactive UI elements
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
    setCustomOccasionName(saved.customOccasionName || '');
    setStep(5); // Go straight to preview
    setShowHistory(false);
  };

  // Check form step validation
  const isStepValid = () => {
    if (step === 1) {
      return occasion !== 'custom' || customOccasionName.trim().length > 0;
    }
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
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-[#faf8f5] via-[#f3e6dd]/40 to-[#ebd7cb]/20 w-full min-h-screen relative overflow-hidden">
          {!isEnvelopeOpened ? (
            <div className="w-full text-center space-y-6 z-10">
            <div className="w-full text-center space-y-6 z-10">
              {/* Header Logo */}
              <div className="flex items-center justify-center gap-2 opacity-95">
                <svg className="w-8 h-8 drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <div className="flex items-center justify-center gap-2 opacity-95">
                <svg className="w-8 h-8 drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="logo-grad-rec" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#c084fc" />
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
                    <path d="M50 40 C40 48 40 32 50 40 Z" fill="none" />
                    <circle cx="50" cy="40" r="3.5" fill="white" />
                  </g>
                </svg>
                <span className="text-xl font-bold font-serif italic text-slate-900">DreamWish</span>
              </div>
              
              <Envelope
                sender={recipientState.sender}
                recipient={recipientState.recipient}
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
        <>
          {/* Header - No print */}
          <header className="w-full py-4 px-6 bg-white/40 border-b border-stone-200/50 backdrop-blur-xs flex items-center justify-between no-print">
            <div className="flex items-center gap-2.5">
              <svg className="w-9 h-9 drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-grad-cre" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="92" height="92" rx="28" fill="url(#logo-grad-cre)" />
                <g stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
                  <path d="M50 50 V72" />
                  <path d="M50 60 Q36 56 42 48" />
                  <path d="M50 40 C42 30 58 30 50 40 Z" fill="none" />
                  <path d="M50 40 C60 32 60 48 50 40 Z" fill="none" />
                  <path d="M50 40 C58 50 42 50 50 40 Z" fill="none" />
                  <path d="M50 40 C40 48 40 32 50 40 Z" fill="none" />
                  <circle cx="50" cy="40" r="3.5" fill="white" />
                </g>
              </svg>
              <div>
                <h1 className="font-serif text-lg font-bold leading-none text-slate-900 italic">DreamWish</h1>
                <span className="text-[10px] text-slate-405 uppercase tracking-widest font-bold">Flower & Greeting Cards</span>
              </div>
            </div>

            {/* Top Right: History + Tabs */}
            <div className="flex items-center gap-2">
              {step === 5 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold bg-white border border-stone-200/80 px-3 py-1.5 rounded-full shadow-2xs hover:bg-stone-50 cursor-pointer active:scale-95"
                >
                  <History size={13} className="text-purple-600" />
                  <span>My Creations ({savedCards.length})</span>
                </button>
              )}

          <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
            {/* Steps Wizard Progress Indicator - No print */}
            {step < 5 && (
              <div className="w-full mb-6 sm:mb-10 no-print">
                {/* Mobile view */}
                <div className="sm:hidden flex flex-col gap-2">
                  <div className="text-xs text-slate-800 font-bold uppercase tracking-wider flex justify-between items-center px-1">
                    <span>Step {step} of 4</span>
                    <span className="text-purple-700">
                      {['Choose Theme', 'Write Message', 'Assemble Bouquet', 'Select Music'][step - 1]}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-700 transition-all duration-300"
                      style={{ width: `${(step / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Desktop/Tablet view */}
                <div className="hidden sm:block max-w-2xl mx-auto">
                  <div className="flex justify-between items-center relative">
                    {/* Connecting bar */}
                    <div className="absolute left-0 right-0 h-[3px] bg-stone-200/60 -z-10 rounded-full" />
                    <div 
                      className="absolute left-0 h-[3px] bg-purple-600 -z-10 transition-all duration-300 rounded-full"
                      style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />

                    {/* Nodes */}
                    {['Occasion', 'Message', 'Bouquet', 'Music'].map((name, i) => {
                      const active = step >= i + 1;
                      const current = step === i + 1;
                      return (
                        <div key={name} className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                            current 
                              ? 'bg-purple-700 border-purple-700 text-white shadow-md ring-4 ring-purple-100 scale-105' 
                              : active 
                                ? 'bg-purple-50 border-purple-300 text-purple-700' 
                                : 'bg-white border-stone-200 text-stone-400'
                          }`}>
                            {i + 1}
                          </div>
                          <span className={`text-[11px] font-bold mt-2 uppercase tracking-widest ${
                            current ? 'text-purple-700 font-extrabold' : active ? 'text-slate-800/60' : 'text-stone-400'
                          }`}>
                            {name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
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
                                        ? 'bg-gradient-to-r from-violet-400 to-purple-400 border-transparent text-white shadow-md scale-[1.03]'
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
                                  ? 'bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white active-press-scale cursor-pointer'
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
                                    className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white px-3.5 rounded-xl shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer min-h-[36px]"
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
                                  ? 'bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white active-press-scale cursor-pointer'
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
                                  ? 'bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white active-press-scale cursor-pointer'
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
                                      <div className="text-xs text-slate-800 font-bold">No Music</div>
                                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold block mt-0.5">
                                        A quiet and peaceful experience
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-purple-700 font-bold">{music === 'none' ? 'Active' : 'Select'}</span>
                                </motion.button>

                                {/* Royalty free audio options */}
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
                                        <div className="text-xs text-slate-800 font-bold">{track.name}</div>
                                        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold block mt-0.5">
                                          Looping background instrumental
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {music === track.id && isMusicPlaying && (
                                        <Volume2 size={12} className="text-purple-600 animate-bounce" />
                                      )}
                                      <span className="text-[10px] text-purple-700 font-bold">
                                        {music === track.id ? 'Active' : 'Select'}
                                      </span>
                                    </div>
                                  </motion.button>
                                ))}
                              </motion.div>

                              {/* Small notice banner */}
                              <div className="flex items-start gap-2 bg-slate-50 border border-stone-200/50 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed font-semibold">
                                <Info size={13} className="shrink-0 text-amber-500 mt-0.5" />
                                <span>
                                  Preview music plays for a few seconds. When shared, the track loops indefinitely upon opening the wax seal.
                                </span>
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
                              onClick={handleNextStep}
                              className="group flex items-center justify-between gap-4 bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white font-bold pl-6 pr-2 py-2 rounded-full shadow-md active-press-scale transition-all cursor-pointer text-xs uppercase tracking-wider"
                            >
                              <span>Preview & Share</span>
                              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                                <ArrowRight size={14} className="text-white" />
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right Column (7 cols): Live Card Preview */}
                  <div className="lg:col-span-7 w-full lg:sticky lg:top-6 space-y-3 no-print">
                    <div className="flex items-center justify-between text-xs text-slate-550 font-bold uppercase tracking-wider px-2">
                      <span>Live Card Preview</span>
                      <span className="text-[10px] text-purple-700 font-extrabold flex items-center gap-1">
                        <Icons.Sparkles size={10} className="animate-pulse" />
                        <span>Updates In Real-time</span>
                      </span>
                    </div>

                    <div className="double-bezel-outer shadow-lg">
                      <div className="double-bezel-inner overflow-hidden bg-white">
                        <GreetingCard
                          state={getCompiledState()}
                          isMusicPlaying={isMusicPlaying}
                          onToggleMusic={toggleMusic}
                          showMusicControls={false}
                          className="min-h-[420px] lg:min-h-[560px] py-4 px-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 5: Final Preview & Share Panel */
                <AnimatePresence mode="wait">
                  {step === 5 && (
                    <motion.div
                      key="step-5"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full pt-2"
                    >
                      {/* Visual Card Preview Column (7 cols) */}
                      <div className="lg:col-span-7 flex flex-col items-center space-y-4">
                        <div className="w-full flex items-center justify-between text-xs text-slate-550 font-bold uppercase tracking-wider px-2 no-print">
                          <span>Card Presentation Preview</span>
                          <span className="text-[10px] text-purple-750 font-bold flex items-center gap-1">
                            <Icons.Sparkles size={10} />
                            <span>Ready to Share</span>
                          </span>
                        </div>
                        
                        <div className="w-full border border-stone-200/50 rounded-3xl overflow-hidden bg-white/50 shadow-lg">
                          <GreetingCard
                            state={getCompiledState()}
                            isMusicPlaying={isMusicPlaying}
                            onToggleMusic={toggleMusic}
                            showMusicControls={true}
                          />
                        </div>
                      </div>

                      {/* Share Operations Column (5 cols) */}
                      <div className="lg:col-span-5 space-y-6 no-print">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-650">
                          <button
                            onClick={handlePrevStep}
                            className="flex items-center gap-1 hover:text-purple-700 text-slate-700 transition-all cursor-pointer bg-white px-3.5 py-1.5 rounded-full border border-stone-200 active-press-scale"
                          >
                            <ArrowLeft size={12} />
                            <span>Back to Editor</span>
                          </button>
                        </div>

                        <SharePanel
                          state={getCompiledState()}
                          onReset={handleResetCreator}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </main>

          {/* Local Drafts Drawer / Modal Overlay */}
          <AnimatePresence>
            {showHistory && (
              <motion.div 
                className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex justify-end no-print"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
              >
                <motion.div 
                  className="w-full max-w-sm h-full bg-white shadow-2xl p-6 flex flex-col justify-between"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-6 overflow-hidden flex flex-col flex-1">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                      <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-1.5">
                        <History size={16} className="text-purple-600" />
                        <span>My Sent History</span>
                      </h3>
                      <button 
                        onClick={() => setShowHistory(false)}
                        className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {savedCards.map((card) => {
                        const config = OCCASIONS.find(o => o.id === card.state.occasion);
                        const dateStr = new Date(card.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <div 
                            key={card.id}
                            className="p-3.5 rounded-2xl border border-stone-100 hover:border-purple-200 bg-stone-50 hover:bg-white transition-all shadow-2xs space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-semibold text-stone-400">{dateStr}</span>
                              <div className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                                {config && <DynamicIcon name={config.iconName} className="text-purple-650" size={12} />}
                                <span>{(card.state.occasion === 'custom' && card.state.customOccasionName) ? card.state.customOccasionName : config?.name}</span>
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-slate-800 font-bold">
                                To: {card.state.recipient} <span className="font-normal text-stone-400 text-[10px]">from {card.state.sender}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-1">
                                "{card.state.message}"
                              </p>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                Bouquet size: {card.state.flowers.length} flowers
                              </div>
                            </div>

                            <button
                              onClick={() => handleLoadSavedCard(card.state)}
                              className="w-full py-1.5 rounded-lg bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white text-[11px] font-bold text-center block transition-colors cursor-pointer active-press-scale"
                            >
                              Load & Edit Card
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-stone-100 pt-4 mt-4">
                    <button
                      onClick={() => {
                        if (confirm('Clear entire history?')) {
                          setSavedCards([]);
                          localStorage.removeItem('dreamwish_history');
                        }
                      }}
                      className="w-full text-center text-[10px] font-bold text-purple-500 hover:bg-purple-50 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Clear All History
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </>
      )}

      <footer
        className="w-full py-4 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold border-t border-stone-200/20 bg-stone-50/20 no-print">
        © {new Date().getFullYear()} DreamWish. Handcrafted flowers and wishes.
      </footer>

      <footer
        className="w-full py-4 text-center text-xs text-slate-500 font-semibold border-t border-stone-200/20 bg-stone-50/10 no-print flex items-center justify-center gap-1">
        <span>Made with love</span>
        <Icons.Heart size={12} className="text-purple-600 fill-purple-600 inline" strokeWidth={2.5} />
        <span>by Arpit</span>
      </footer>

      {/* Film Grain Overlay */}
      <div className="film-grain" />
    </div>
  );
}
