// Public by design (publishable key + URL). Fill these in to enable Google sign-in and sync.
export const SUPABASE_URL: string = 'https://ourkhftwcxidvyohefoz.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY: string = 'sb_publishable_cT6tUBrjc0w7LZir1sYaIA_CGEn_qnq';

export const SYNC_CONFIGURED: boolean =
  SUPABASE_URL !== 'TODO_URL' && SUPABASE_PUBLISHABLE_KEY !== 'TODO_KEY' && SUPABASE_URL.startsWith('http');

export const DEFAULT_USERNAME = 'chessdh19';
export const DISPLAY_NAME = 'chessDh19';
export const ENGINE_URL = '/engine/stockfish-19-lite-single.js';
export const CHESSCOM_PLAY_URL = 'https://www.chess.com/play/online';
