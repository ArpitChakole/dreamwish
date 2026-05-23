import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, ArrowLeft, 
  History, Volume2, Info
} from 'lucide-react';
import type { CardState, Occasion, FlowerSelection } from './types';
import { OCCASIONS, AUDIO_TRACKS } from './types';
import { deserializeCardState } from './utils/sharing';
import { Envelope } from './components/Envelope';
import { GreetingCard } from './components/GreetingCard';
import { BouquetBuilder } from './components/BouquetBuilder';
import { SharePanel } from './components/SharePanel';

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
    "Here’s to the start of a beautiful adventure! May your life together be filled with shared dreams, sweet understanding, and endless love.",
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
    "You are the rose in my garden, the music in my silence, and the warmth in my winter. Happy Valentine’s Day, my dearest."
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

function App() {
  // Navigation & Router
  const [recipientState, setRecipientState] = useState<CardState | null>(null);
  const [isRecipientFlow, setIsRecipientFlow] = useState(false);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);

  // Wizard state (for creator)
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState<Occasion>('birthday');
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [selectedFlowers, setSelectedFlowers] = useState<FlowerSelection[]>([]);
  const [wrapStyle, setWrapStyle] = useState<'kraft' | 'blush' | 'mesh' | 'gold'>('kraft');
  const [music, setMusic] = useState<string>('none');
  const [cardBg, setCardBg] = useState<'white' | 'silver' | 'slate' | 'blush' | 'gold'>('white');

  // Interactive UI elements
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Audio system
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect URL parameter on mount and hash changes
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#card=')) {
        const compressed = hash.substring(6);
        const decoded = deserializeCardState(compressed);
        setRecipientState(decoded);
        setIsRecipientFlow(true);
      } else {
        setIsRecipientFlow(false);
        setRecipientState(null);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    
    // Load drafts history
    try {
      const saved = localStorage.getItem('dreamwish_history');
      if (saved) {
        setSavedCards(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }

    return () => {
      window.removeEventListener('hashchange', checkHash);
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    };
  }, []);

  // Sync creator state with templates on occasion change
  const handleSelectOccasion = (selected: Occasion) => {
    setOccasion(selected);
    const config = OCCASIONS.find(o => o.id === selected);
    if (config) {
      // Pick the first template as default
      setMessage(config.prebuiltMessages[0]);
    }
  };

  // AI assistant simulation
  const handleAiSuggestion = () => {
    setIsAiLoading(true);
    
    // Simulate generation typing delay
    setTimeout(() => {
      const suggestions = AI_SUGGESTIONS[occasion];
      const randomIndex = Math.floor(Math.random() * suggestions.length);
      const chosen = suggestions[randomIndex];
      
      // Auto populate fields if empty for extra delight
      if (!sender) setSender('Your Friend');
      if (!recipient) setRecipient('Someone Special');
      
      setMessage(chosen);
      setIsAiLoading(false);
    }, 1200);
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
    setStep(5); // Go straight to preview
    setShowHistory(false);
  };

  // Check form step validation
  const isStepValid = () => {
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
    cardBg
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
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          {!isEnvelopeOpened ? (
            <div className="w-full text-center space-y-6">
              {/* Header Logo */}
              <div className="flex items-center justify-center gap-2 opacity-90">
                <svg className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(168,85,247,0.15)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="logo-grad-rec" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="50%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#EAB308" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" fill="url(#logo-grad-rec)" />
                  <path d="M25 45 L50 65 L75 45 L75 75 C75 77.8 72.8 80 70 80 L30 80 C27.2 80 25 77.8 25 75 Z" fill="white" fillOpacity="0.22" />
                  <path d="M42 55 C37 50 38 35 44 26 C46 23 50 25 50 30 C50 25 54 23 56 26 C62 35 63 50 58 55 C55 58 45 58 42 55 Z" fill="white" />
                  <path d="M50 58 C47 50 48 42 50 32 C52 42 53 50 50 58 Z" fill="#FCE7F3" opacity="0.9" />
                  <path d="M25 76 L50 58 L75 76" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M25 45 L50 28 L75 45" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                </svg>
                <span className="text-xl font-bold font-serif italic text-purple-950">DreamWish</span>
              </div>
              
              <Envelope
                sender={recipientState.sender}
                recipient={recipientState.recipient}
                occasionEmoji={OCCASIONS.find(o => o.id === recipientState.occasion)?.emoji || '🌸'}
                onOpen={handleEnvelopeOpened}
              >
                <div /> {/* Dummy children as layout is handled */}
              </Envelope>
            </div>
          ) : (
            <motion.div 
              className="w-full max-w-4xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <GreetingCard 
                state={recipientState} 
                isMusicPlaying={isMusicPlaying} 
                onToggleMusic={toggleMusic} 
              />
            </motion.div>
          )}
        </main>
      )}

      {/* CREATOR MODE VIEW */}
      {!isRecipientFlow && (
        <>
          {/* Header - No print */}
          <header className="w-full py-4 px-6 bg-white/40 border-b border-stone-200/50 backdrop-blur-xs flex items-center justify-between no-print">
            <div className="flex items-center gap-2.5">
              <svg className="w-9 h-9 drop-shadow-[0_2px_4px_rgba(168,85,247,0.15)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-grad-cre" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#EAB308" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="url(#logo-grad-cre)" />
                <path d="M25 45 L50 65 L75 45 L75 75 C75 77.8 72.8 80 70 80 L30 80 C27.2 80 25 77.8 25 75 Z" fill="white" fillOpacity="0.22" />
                <path d="M42 55 C37 50 38 35 44 26 C46 23 50 25 50 30 C50 25 54 23 56 26 C62 35 63 50 58 55 C55 58 45 58 42 55 Z" fill="white" />
                <path d="M50 58 C47 50 48 42 50 32 C52 42 53 50 50 58 Z" fill="#FCE7F3" opacity="0.9" />
                <path d="M25 76 L50 58 L75 76" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M25 45 L50 28 L75 45" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
              </svg>
              <div>
                <h1 className="font-serif text-lg font-bold leading-none text-purple-950 italic">DreamWish</h1>
                <span className="text-[10px] text-purple-900/40 uppercase tracking-widest font-bold">Flower & Greeting Cards</span>
              </div>
            </div>

            {/* Sidebar Toggle History */}
            <div className="flex items-center gap-2">
              {savedCards.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1.5 text-xs text-purple-950 font-semibold bg-white border border-stone-200/80 px-3 py-1.5 rounded-full shadow-2xs hover:bg-stone-50 cursor-pointer active:scale-95"
                >
                  <History size={13} className="text-purple-500" />
                  <span>My Creations ({savedCards.length})</span>
                </button>
              )}
            </div>
          </header>

          <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
            {/* Steps Wizard Progress Indicator - No print */}
            {step < 5 && (
              <div className="max-w-2xl w-full mx-auto mb-6 sm:mb-10 no-print">
                {/* Mobile view */}
                <div className="sm:hidden flex flex-col gap-2">
                  <div className="text-xs text-purple-950 font-bold uppercase tracking-wider flex justify-between items-center px-1">
                    <span>Step {step} of 4</span>
                    <span className="text-purple-600">
                      {['Choose Theme', 'Write Message', 'Assemble Bouquet', 'Select Music'][step - 1]}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${(step / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Desktop/Tablet view */}
                <div className="hidden sm:block">
                  <div className="flex justify-between items-center relative">
                    {/* Connecting bar */}
                    <div className="absolute left-0 right-0 h-0.5 bg-stone-200/80 -z-10" />
                    <div 
                      className="absolute left-0 h-0.5 bg-purple-500 -z-10 transition-all duration-300"
                      style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />

                    {/* Nodes */}
                    {['Occasion', 'Message', 'Bouquet', 'Music'].map((name, i) => {
                      const active = step >= i + 1;
                      const current = step === i + 1;
                      return (
                        <div key={name} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                            current 
                              ? 'bg-purple-600 border-purple-600 text-white shadow-md ring-4 ring-purple-100 scale-105' 
                              : active 
                                ? 'bg-purple-100 border-purple-400 text-purple-700' 
                                : 'bg-white border-stone-200 text-stone-400'
                          }`}>
                            {i + 1}
                          </div>
                          <span className={`text-sm font-semibold mt-1.5 uppercase tracking-wider ${
                            current ? 'text-purple-600 font-extrabold' : active ? 'text-purple-900/60' : 'text-stone-400'
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

            {/* WIZARD SCREENS */}
            <div className="w-full">
              <AnimatePresence mode="wait">
                
                {/* Step 1: Occasion Selection */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 max-w-4xl mx-auto"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="font-serif text-3xl font-bold text-purple-950">Choose a Special Occasion</h2>
                      <p className="text-sm text-purple-900/60">
                        Selecting an occasion sets the design theme, color palette, and template choices.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
                      {OCCASIONS.map((occ) => (
                        <button
                          key={occ.id}
                          onClick={() => handleSelectOccasion(occ.id)}
                          className={`p-3 lg:p-4 rounded-2xl border text-center flex flex-col justify-center items-center h-20 lg:h-32 transition-all cursor-pointer ${
                            occasion === occ.id
                              ? 'bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-500 border-transparent text-white shadow-lg shadow-purple-500/10 scale-[1.04]'
                              : 'bg-white/80 border-stone-200/50 hover:bg-white hover:border-purple-200 hover:shadow-xs text-purple-950'
                          }`}
                        >
                          <div className="text-3xl filter drop-shadow-sm mb-1">{occ.emoji}</div>
                          <div className={`text-[13px] lg:text-sm font-bold leading-tight ${occasion === occ.id ? 'text-white' : 'text-purple-950'}`}>
                            {occ.name}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-center pt-6">
                      <button
                        onClick={handleNextStep}
                        className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold px-7 py-3 rounded-full shadow-md active:scale-95 transition-all cursor-pointer text-sm"
                      >
                        <span>Continue to Message</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Message Configuration */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 max-w-xl mx-auto"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="font-serif text-3xl font-bold text-purple-950">Personalize Your Message</h2>
                      <p className="text-sm text-purple-900/60">
                        Write a heartfelt message, populate from suggestions, or let our AI helper write a draft!
                      </p>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/60 space-y-5">
                      {/* Sender and Recipient */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="recipient-input" className="text-[11px] uppercase tracking-wider text-purple-950 font-bold">To (Recipient)</label>
                          <input
                            id="recipient-input"
                            name="recipient"
                            type="text"
                            placeholder="e.g. Arpit"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            maxLength={25}
                            className="w-full bg-white/70 border border-stone-200/80 rounded-xl px-3.5 py-3 text-sm text-purple-950 placeholder-stone-400 focus:outline-hidden focus:border-purple-400 focus:bg-white transition-all font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="sender-input" className="text-[11px] uppercase tracking-wider text-purple-950 font-bold">From (Sender)</label>
                          <input
                            id="sender-input"
                            name="sender"
                            type="text"
                            placeholder="e.g. Rutuja"
                            value={sender}
                            onChange={(e) => setSender(e.target.value)}
                            maxLength={25}
                            className="w-full bg-white/70 border border-stone-200/80 rounded-xl px-3.5 py-3 text-sm text-purple-950 placeholder-stone-400 focus:outline-hidden focus:border-purple-400 focus:bg-white transition-all font-semibold"
                          />
                        </div>
                      </div>

                      {/* Text Message Textarea */}
                      <div className="space-y-1.5 relative">
                        <div className="flex justify-between items-center">
                          <label htmlFor="message-input" className="text-[11px] uppercase tracking-wider text-purple-950 font-bold">Greeting Message</label>
                          <span className={`text-[10px] font-semibold ${message.length >= 240 ? 'text-rose-500 font-bold' : 'text-purple-900/40'}`}>
                            {message.length} / 250 characters
                          </span>
                        </div>
                        <textarea
                          id="message-input"
                          name="message"
                          placeholder="Write something sweet and thoughtful..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value.substring(0, 250))}
                          rows={4}
                          className="w-full bg-white/70 border border-stone-200/80 rounded-xl p-3.5 text-sm text-purple-950 placeholder-stone-400 focus:outline-hidden focus:border-purple-400 focus:bg-white transition-all font-medium resize-none leading-relaxed"
                        />
                        
                        {/* AI suggest message generator badge */}
                        <div className="absolute right-2 bottom-2">
                          <button
                            onClick={handleAiSuggestion}
                            disabled={isAiLoading}
                            className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3.5 min-h-[44px] rounded-full shadow-sm hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <Sparkles size={11} className={isAiLoading ? 'animate-spin' : ''} />
                            <span>{isAiLoading ? 'Writing...' : 'AI Assist'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Templates list selection */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-purple-900/40 font-bold block">
                          Suggested Templates
                        </span>
                        <div className="space-y-1.5">
                          {currentOccasionConfig.prebuiltMessages.map((msg, index) => (
                            <button
                              key={index}
                              onClick={() => setMessage(msg)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer ${
                                message === msg
                                  ? 'border-purple-300 bg-purple-50/50 text-purple-950 font-medium'
                                  : 'border-stone-100 bg-white/40 text-purple-900/70 hover:bg-white hover:border-purple-200'
                              }`}
                            >
                              "{msg}"
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Wizard controls */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <button
                        onClick={handlePrevStep}
                        className="flex items-center justify-center gap-1.5 border border-stone-200 bg-white/80 hover:bg-white text-purple-950 font-bold px-6 py-3 rounded-full transition-all active:scale-95 cursor-pointer text-sm"
                      >
                        <ArrowLeft size={15} />
                        <span>Back</span>
                      </button>
                      <button
                        disabled={!isStepValid()}
                        onClick={handleNextStep}
                        className={`flex items-center justify-center gap-1.5 font-bold px-7 py-3 rounded-full shadow-md transition-all text-sm ${
                          isStepValid()
                            ? 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95 cursor-pointer'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                        }`}
                      >
                        <span>Build Bouquet</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Interactive Bouquet Builder */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 w-full"
                  >
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                      <h2 className="font-serif text-3xl font-bold text-purple-950">Assemble the Flower Bouquet</h2>
                      <p className="text-sm text-purple-900/60">
                        Select a variety of flowers to build a hand-tied arrangement in your chosen wrap paper.
                      </p>
                    </div>

                    {/* Render Bouquet Workspace */}
                    <BouquetBuilder
                      selectedFlowers={selectedFlowers}
                      onChangeFlowers={setSelectedFlowers}
                      wrapStyle={wrapStyle}
                      onChangeWrapStyle={setWrapStyle}
                      cardBg={cardBg}
                      onChangeCardBg={setCardBg}
                    />

                    {/* Wizard controls */}
                    <div className="flex items-center justify-between gap-4 pt-6 max-w-5xl mx-auto border-t border-purple-100/50">
                      <button
                        onClick={handlePrevStep}
                        className="flex items-center justify-center gap-1.5 border border-stone-200 bg-white/80 hover:bg-white text-purple-950 font-bold px-6 py-3 rounded-full transition-all active:scale-95 cursor-pointer text-sm"
                      >
                        <ArrowLeft size={15} />
                        <span>Back</span>
                      </button>
                      <button
                        disabled={!isStepValid()}
                        onClick={handleNextStep}
                        className={`flex items-center justify-center gap-1.5 font-bold px-7 py-3 rounded-full shadow-md transition-all text-sm ${
                          isStepValid()
                            ? 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95 cursor-pointer'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                        }`}
                      >
                        <span>Select Music</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Music Selection */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 max-w-xl mx-auto"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="font-serif text-3xl font-bold text-purple-950">Add Ambient Music</h2>
                      <p className="text-sm text-purple-900/60">
                        Choose a gentle backing track that starts looping when the recipient opens the envelope.
                      </p>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/60 space-y-4">
                      
                      {/* Track list selectors */}
                      <div className="space-y-3">
                        {/* Option: None */}
                        <button
                          onClick={() => handlePreviewTrack('none')}
                          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            music === 'none'
                              ? 'bg-white border-purple-500 ring-4 ring-purple-100/50 shadow-sm font-bold'
                              : 'bg-white/50 border-stone-200/50 hover:bg-white hover:border-purple-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🔇</span>
                            <div>
                              <div className="text-sm text-purple-950 font-bold">No Music</div>
                              <span className="text-[10px] text-purple-900/40 uppercase tracking-widest font-semibold block mt-0.5">
                                A quiet and peaceful experience
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-purple-500 font-semibold">{music === 'none' ? 'Active' : 'Select'}</span>
                        </button>

                        {/* Royalty free audio options */}
                        {AUDIO_TRACKS.map((track) => (
                          <button
                            key={track.id}
                            onClick={() => handlePreviewTrack(track.id)}
                            className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              music === track.id
                                ? 'bg-white border-purple-500 ring-4 ring-purple-100/50 shadow-sm font-bold scale-[1.01]'
                                : 'bg-white/50 border-stone-200/50 hover:bg-white hover:border-purple-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{track.emoji}</span>
                              <div>
                                <div className="text-sm text-purple-950 font-bold">{track.name}</div>
                                <span className="text-[10px] text-purple-900/40 uppercase tracking-widest font-semibold block mt-0.5">
                                  Looping background instrumental
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {music === track.id && isMusicPlaying && (
                                <Volume2 size={13} className="text-purple-600 animate-bounce" />
                              )}
                              <span className="text-xs text-purple-500 font-semibold">
                                {music === track.id ? 'Active' : 'Select'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Small notice banner */}
                      <div className="flex items-start gap-2 bg-stone-50 border border-stone-200/50 rounded-xl p-3 text-[11px] text-stone-500 leading-relaxed font-semibold">
                        <Info size={14} className="shrink-0 text-amber-500 mt-0.5" />
                        <span>
                          Preview music plays for a few seconds. When shared, the track loops indefinitely upon opening the wax seal.
                        </span>
                      </div>
                    </div>

                    {/* Wizard controls */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <button
                        onClick={handlePrevStep}
                        className="flex items-center justify-center gap-1.5 border border-stone-200 bg-white/80 hover:bg-white text-purple-950 font-bold px-6 py-3 rounded-full transition-all active:scale-95 cursor-pointer text-sm"
                      >
                        <ArrowLeft size={15} />
                        <span>Back</span>
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold px-7 py-3 rounded-full shadow-md active:scale-95 transition-all cursor-pointer text-sm"
                      >
                        <span>Preview & Share</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Final Preview & Share Panel */}
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
                      <div className="w-full flex items-center justify-between text-xs text-purple-900/60 font-semibold px-2 no-print">
                        <span>Card Presentation Preview</span>
                        <span className="text-[10px] text-purple-600 font-bold">Scroll to inspect, print, or copy below</span>
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
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-600/70">
                        <button
                          onClick={handlePrevStep}
                          className="flex items-center gap-1 hover:text-purple-700 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-stone-200"
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
            </div>
          </main>

          {/* Local Drafts Drawer / Modal Overlay */}
          <AnimatePresence>
            {showHistory && (
              <motion.div 
                className="fixed inset-0 bg-purple-950/20 backdrop-blur-xs z-50 flex justify-end no-print"
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
                      <h3 className="font-serif text-lg font-bold text-purple-950 flex items-center gap-1.5">
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
                              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                                {config?.emoji} {config?.name}
                              </span>
                            </div>

                            <div>
                              <div className="text-xs text-purple-950 font-bold">
                                To: {card.state.recipient} <span className="font-normal text-stone-400 text-[10px]">from {card.state.sender}</span>
                              </div>
                              <p className="text-[11px] text-purple-900/60 truncate mt-1">
                                "{card.state.message}"
                              </p>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                Bouquet size: {card.state.flowers.length} flowers
                              </div>
                            </div>

                            <button
                              onClick={() => handleLoadSavedCard(card.state)}
                              className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold text-center block transition-colors cursor-pointer"
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
                      className="w-full text-center text-[10px] font-bold text-rose-500 hover:bg-rose-50 py-2 rounded-xl transition-colors cursor-pointer"
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

      {/* Footer - No print */}
      {/* <footer className="w-full py-4 text-center text-xs text-purple-900/40 font-semibold border-t border-stone-200/20 bg-stone-50/10 no-print">
        Made with love ❤️ by Arpit
      </footer> */}

      <footer className="w-full py-4 text-center border-t border-stone-200/20 bg-stone-50/10 no-print space-y-1">
        <div className="text-[10px] text-purple-900/30 uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} DreamWish. Handcrafted flowers and wishes.
        </div>

        <div className="text-xs text-purple-900/40 font-semibold">
          Made with love ❤️ by Arpit
        </div>
      </footer>

    </div>
  );
}

export default App;
