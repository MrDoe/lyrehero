import React from 'react';
import { Song } from '../types';
import { Play } from 'lucide-react';

interface SongCardProps {
  song: Song;
  onSelect: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(song)}
      className="group relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer overflow-hidden gap-3 sm:gap-0"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
      
      <div className="relative z-10 flex-1 min-w-0">
        <h3 className="font-bold text-base sm:text-lg text-slate-100 truncate">{song.title}</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-slate-400 mt-1">
          {song.artist && <span>{song.artist} • </span>}
          <span className={`
            ${song.difficulty === 'Easy' ? 'text-green-400' : ''}
            ${song.difficulty === 'Medium' ? 'text-yellow-400' : ''}
            ${song.difficulty === 'Hard' ? 'text-red-400' : ''}
          `}>{song.difficulty}</span>
          <span>• {song.notes.length} notes</span>
        </div>
      </div>

      <div className="relative z-10 bg-indigo-600 p-2 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-x-4 sm:group-hover:translate-x-0 transition-all duration-300 flex-shrink-0">
        <Play size={18} className="sm:w-5 sm:h-5" fill="currentColor" />
      </div>
    </div>
  );
};
