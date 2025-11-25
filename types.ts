export interface Note {
  note: string; // e.g., "C4", "A3" - right hand melody
  bassNote?: string; // e.g., "C3" - left hand bass (optional)
  lyric?: string;
  duration?: string; // "quarter", "half", etc. (optional usage)
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
