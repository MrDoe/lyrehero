import React, { useState } from 'react';
import { Song, AppState } from './types';
import { PRESET_SONGS } from './constants';
import { SongCard } from './components/SongCard';
import { TutorInterface } from './components/TutorInterface';
import { Music } from 'lucide-react';

export default function App() {
  const [songs] = useState<Song[]>(PRESET_SONGS);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.MENU);

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setAppState(AppState.PLAYING);
  };

  const handleBack = () => {
    setAppState(AppState.MENU);
    setCurrentSong(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="flex items-center gap-3 mb-8 max-w-5xl mx-auto">
        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <Music size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Lyre Hero
          </h1>
          <p className="text-slate-400 text-sm">Master the Lyre Harp</p>
        </div>
      </header>

      {appState === AppState.MENU && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Song List */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-300">Song Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {songs.map((song, index) => (
                <SongCard 
                  key={index + song.title} 
                  song={song} 
                  onSelect={handleSelectSong} 
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {appState === AppState.PLAYING && currentSong && (
        <TutorInterface 
          song={currentSong} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
}