export type NoteDuration = '1' | '1/2' | '1/4' | '1/8';

export interface Note {
  note: string; // e.g., "C4", "A3" - right hand melody
  bassNote?: string; // e.g., "C3" - left hand bass (optional)
  lyric?: string;
  duration?: NoteDuration; // Standard music notation: "1" (whole), "1/2" (half), "1/4" (quarter), "1/8" (eighth)
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
