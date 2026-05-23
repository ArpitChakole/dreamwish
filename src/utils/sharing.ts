import LZString from 'lz-string';
import type { CardState } from '../types';

const DEFAULT_STATE: CardState = {
  occasion: 'birthday',
  sender: 'Someone Special',
  recipient: 'You',
  message: 'Hope your day blooms with happiness and laughter!',
  flowers: [
    { id: 'rose-1', flowerId: 'rose', color: '#E11D48' },
    { id: 'sunflower-1', flowerId: 'sunflower', color: '#EAB308' },
    { id: 'lavender-1', flowerId: 'lavender', color: '#8B5CF6' }
  ],
  music: 'none',
  wrapStyle: 'kraft',
  cardBg: 'white'
};

/**
 * Compresses a CardState object into a URL-safe compressed string.
 */
export function serializeCardState(state: CardState): string {
  try {
    const jsonStr = JSON.stringify(state);
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (error) {
    console.error('Failed to serialize card state:', error);
    return '';
  }
}

/**
 * Decompresses a URL-safe string back into a CardState object.
 * Returns a fallback default state if decompression fails.
 */
export function deserializeCardState(compressedStr: string): CardState {
  if (!compressedStr) return DEFAULT_STATE;
  
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(compressedStr);
    if (!decompressed) {
      console.warn('Decompressed output is empty. Using fallback state.');
      return DEFAULT_STATE;
    }
    const state = JSON.parse(decompressed) as CardState;
    
    // Ensure all required fields exist to prevent runtime errors
    return {
      occasion: state.occasion || 'birthday',
      sender: state.sender || 'Someone Special',
      recipient: state.recipient || 'You',
      message: state.message || 'Hope your day blooms with happiness!',
      flowers: Array.isArray(state.flowers) ? state.flowers : [],
      music: state.music || 'none',
      wrapStyle: state.wrapStyle || 'kraft',
      cardBg: state.cardBg || 'white'
    };
  } catch (error) {
    console.error('Failed to deserialize card state:', error);
    return DEFAULT_STATE;
  }
}
