export type Occasion =
  | 'birthday'
  | 'anniversary'
  | 'wedding'
  | 'graduation'
  | 'babyshower'
  | 'valentine'
  | 'friendship'
  | 'thankyou'
  | 'getwell'
  | 'custom';

export interface OccasionConfig {
  id: Occasion;
  name: string;
  emoji: string;
  themeClass: string; // Tailwind gradient / background style
  cardBg: string;      // Inside card background style
  cardTextColor: string;
  accentClass: string; // Button / badge colors
  accentHex: string;   // Main hex color for canvas decoration
  prebuiltMessages: string[];
}

export interface FlowerSelection {
  id: string;        // Unique instance ID (e.g. "rose-1", "sunflower-0")
  flowerId: string;  // Matches FlowerType id (e.g. "rose")
  color: string;     // Hex color code
}

export interface CardState {
  occasion: Occasion;
  sender: string;
  recipient: string;
  message: string;
  flowers: FlowerSelection[];
  music: string;       // Audio track ID ('none', 'piano', 'guitar', 'harp')
  wrapStyle: 'kraft' | 'blush' | 'mesh' | 'gold';
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  emoji: string;
}

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'harp',
    name: 'Serenade Harp',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // We will use beautiful looping royalty free links, or we can use synth audio
    emoji: '🎵'
  },
  {
    id: 'piano',
    name: 'Soft Romance Piano',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    emoji: '🎹'
  },
  {
    id: 'guitar',
    name: 'Acoustic Warmth',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    emoji: '🎸'
  }
];

export const OCCASIONS: OccasionConfig[] = [
  {
    id: 'birthday',
    name: 'Birthday',
    emoji: '🎂',
    themeClass: 'from-pink-100 to-amber-100 border-pink-200 text-pink-800',
    cardBg: 'bg-gradient-to-tr from-pink-50 via-stone-50 to-amber-50',
    cardTextColor: 'text-pink-900',
    accentClass: 'bg-pink-500 hover:bg-pink-600 focus:ring-pink-300 text-white',
    accentHex: '#ec4899',
    prebuiltMessages: [
      'Wishing you endless joy, beautiful memories, and a year that blooms with happiness!',
      'May your special day be as bright, beautiful, and wonderful as you are.',
      'Sending you a bouquet of love, laughter, and wishes for the happiest of birthdays!'
    ]
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    emoji: '💍',
    themeClass: 'from-rose-100 to-red-100 border-rose-200 text-rose-800',
    cardBg: 'bg-gradient-to-tr from-rose-50 via-stone-50 to-pink-50',
    cardTextColor: 'text-rose-950',
    accentClass: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-300 text-white',
    accentHex: '#e11d48',
    prebuiltMessages: [
      'Celebrating your beautiful journey of love, friendship, and togetherness. Happy Anniversary!',
      'Wishing a wonderful couple another year of shared dreams, laughter, and lasting love.',
      'May the love you share continue to grow and blossom with every passing year.'
    ]
  },
  {
    id: 'wedding',
    name: 'Wedding',
    emoji: '🥂',
    themeClass: 'from-amber-100 to-yellow-50 border-amber-200 text-amber-800',
    cardBg: 'bg-gradient-to-tr from-amber-50/50 via-stone-50 to-yellow-50/50',
    cardTextColor: 'text-amber-950',
    accentClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-300 text-white',
    accentHex: '#d97706',
    prebuiltMessages: [
      'Congratulations on your wedding day! Wishing you a lifetime of love and happiness together.',
      'May your marriage be filled with all the sweet ingredients of love, understanding, and joy.',
      'Here’s to the start of your happily ever after! Wishing you a beautiful lifetime together.'
    ]
  },
  {
    id: 'graduation',
    name: 'Graduation',
    emoji: '🎓',
    themeClass: 'from-emerald-100 to-teal-50 border-emerald-200 text-emerald-800',
    cardBg: 'bg-gradient-to-tr from-emerald-50/40 via-stone-50 to-teal-50/40',
    cardTextColor: 'text-emerald-950',
    accentClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300 text-white',
    accentHex: '#059669',
    prebuiltMessages: [
      'Congratulations on your graduation! The future belongs to those who believe in their dreams.',
      'So proud of your hard work and achievements. Go out there and shine brightly!',
      'Wishing you success and joy as you step into this exciting new chapter of your life.'
    ]
  },
  {
    id: 'babyshower',
    name: 'Baby Shower',
    emoji: '🍼',
    themeClass: 'from-blue-100 to-pink-100 border-indigo-100 text-indigo-800',
    cardBg: 'bg-gradient-to-tr from-sky-50/60 via-purple-50/40 to-pink-50/60',
    cardTextColor: 'text-indigo-950',
    accentClass: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-300 text-white',
    accentHex: '#6366f1',
    prebuiltMessages: [
      'Wishing you and your new little bundle of joy a lifetime of happiness, health, and laughter.',
      'Congratulations! May your baby fill your home with warmth and your heart with endless love.',
      'Sending love and sweet wishes to the soon-to-be parents! Exciting times lie ahead.'
    ]
  },
  {
    id: 'valentine',
    name: 'Valentine’s Day',
    emoji: '💖',
    themeClass: 'from-red-100 to-rose-200 border-red-200 text-red-800',
    cardBg: 'bg-gradient-to-tr from-red-50 via-rose-50 to-stone-50',
    cardTextColor: 'text-red-950',
    accentClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-300 text-white',
    accentHex: '#dc2626',
    prebuiltMessages: [
      'You make my heart bloom with love and joy every single day. Happy Valentine’s Day!',
      'Every moment spent with you is a dream come true. You are my forever valentine.',
      'Sending you a bouquet of love, kisses, and beautiful thoughts. I cherish you.'
    ]
  },
  {
    id: 'friendship',
    name: 'Friendship',
    emoji: '🤗',
    themeClass: 'from-purple-100 to-pink-100 border-purple-200 text-purple-800',
    cardBg: 'bg-gradient-to-tr from-purple-50 via-stone-50 to-pink-50',
    cardTextColor: 'text-purple-950',
    accentClass: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-300 text-white',
    accentHex: '#9333ea',
    prebuiltMessages: [
      'Thank you for being such an amazing friend. You bring so much color and light into my life!',
      'Through thick and thin, I’m so grateful to have you by my side. Here’s to our friendship!',
      'Just a little bouquet of gratitude to remind you of how much your friendship means to me.'
    ]
  },
  {
    id: 'thankyou',
    name: 'Thank You',
    emoji: '🙏',
    themeClass: 'from-indigo-100 to-sky-100 border-indigo-200 text-indigo-800',
    cardBg: 'bg-gradient-to-tr from-indigo-50 via-stone-50 to-sky-50',
    cardTextColor: 'text-indigo-950',
    accentClass: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300 text-white',
    accentHex: '#4f46e5',
    prebuiltMessages: [
      'Thank you from the bottom of my heart. Your kindness and generosity mean the world to me.',
      'I am incredibly grateful for your support and help. Thanks for being so wonderful!',
      'Sending this bouquet as a token of my heartfelt appreciation. Thank you so much.'
    ]
  },
  {
    id: 'getwell',
    name: 'Get Well Soon',
    emoji: '🌿',
    themeClass: 'from-lime-100 to-emerald-100 border-lime-200 text-lime-800',
    cardBg: 'bg-gradient-to-tr from-lime-50/40 via-stone-50 to-emerald-50/40',
    cardTextColor: 'text-lime-950',
    accentClass: 'bg-lime-600 hover:bg-lime-700 focus:ring-lime-300 text-white',
    accentHex: '#65a30d',
    prebuiltMessages: [
      'Wishing you a gentle, speedy recovery. Take all the time you need to rest and heal!',
      'Sending healthy, healing thoughts and a warm hug. Hope you feel better day by day.',
      'May these flowers bring a little sunshine and cheer to your room as you recover. Get well soon!'
    ]
  },
  {
    id: 'custom',
    name: 'Custom Occasion',
    emoji: '🌸',
    themeClass: 'from-stone-100 to-orange-100 border-stone-200 text-stone-800',
    cardBg: 'bg-gradient-to-tr from-orange-50/40 via-stone-50 to-amber-50/40',
    cardTextColor: 'text-stone-900',
    accentClass: 'bg-stone-700 hover:bg-stone-800 focus:ring-stone-400 text-white',
    accentHex: '#44403c',
    prebuiltMessages: [
      'Sending warm thoughts, custom wishes, and a beautiful bouquet tailored just for you!',
      'Thinking of you today and sending this special greeting card to brighten your day.',
      'May your day be filled with unexpected joy, sweet surprises, and moments that make you smile.'
    ]
  }
];
