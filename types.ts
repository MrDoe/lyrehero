export interface Note {
  note: string; // e.g., "C4", "A3"
  lyric?: string;
  duration?: string; // "quarter", "half", etc. (optional usage)
  hand?: 'right' | 'left'; // right = melody (default), left = bass accompaniment
}

export interface Song {
  title: string;
  artist?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  notes: Note[];
}

export enum AppState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR'
}

export interface AudioConfig {
  sampleRate: number;
  fftSize: number;
}
