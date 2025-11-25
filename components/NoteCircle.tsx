import React from 'react';
import { NoteDuration } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface NoteCircleProps {
  note: string;
  duration?: NoteDuration;
  isActive: boolean;
  isPast: boolean;
  noteProgress: number;
}

/**
 * Renders a music note with visual representation of its duration.
 * Uses standard music notation styling:
 * - Whole note (1): Hollow circle, no stem
 * - Half note (1/2): Hollow circle with stem
 * - Quarter note (1/4): Filled circle with stem (default)
 * - Eighth note (1/8): Filled circle with stem and flag
 */
export const NoteCircle: React.FC<NoteCircleProps> = ({
  note,
  duration = '1/4',
  isActive,
  isPast,
  noteProgress,
}) => {
  const isHollow = duration === '1' || duration === '1/2';
  const hasStem = duration !== '1';
  const hasFlag = duration === '1/8';

  // Base circle styles
  const circleBaseClasses = `
    w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center 
    border-2 sm:border-4 shadow-lg sm:shadow-xl relative overflow-visible
  `;

  // Style variations based on state and duration
  const getCircleStyles = () => {
    if (isPast) {
      return 'bg-slate-800 border-green-900';
    }
    if (isActive) {
      if (isHollow) {
        return 'bg-transparent border-indigo-400 shadow-indigo-500/50';
      }
      return 'bg-indigo-600 border-indigo-400 shadow-indigo-500/50';
    }
    if (isHollow) {
      return 'bg-transparent border-slate-600';
    }
    return 'bg-slate-700 border-slate-600';
  };

  // Inner circle for hollow notes (to create the ring effect)
  const getInnerCircleStyles = () => {
    if (isPast) {
      return 'bg-slate-800';
    }
    if (isActive) {
      return 'bg-slate-900';
    }
    return 'bg-slate-800';
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className={`${circleBaseClasses} ${getCircleStyles()}`}>
        {/* Progress fill for active note */}
        {isActive && noteProgress > 0 && (
          <div
            className="absolute inset-0 bg-white/20 transition-all ease-linear rounded-full"
            style={{ height: `${noteProgress * 100}%`, top: 'auto', bottom: 0 }}
          />
        )}

        {/* Hollow effect for whole and half notes */}
        {isHollow && !isPast && (
          <div
            className={`absolute inset-2 sm:inset-3 rounded-full ${getInnerCircleStyles()}`}
          />
        )}

        {/* Note content */}
        <div className="relative z-10">
          {isPast ? (
            <CheckCircle2 size={24} className="sm:w-10 sm:h-10 text-green-500" />
          ) : (
            <span className={`text-xl sm:text-3xl font-bold ${isHollow && !isActive ? 'text-slate-300' : 'text-white'}`}>
              {note}
            </span>
          )}
        </div>
      </div>

      {/* Stem - positioned to the right of the note */}
      {hasStem && !isPast && (
        <div className="absolute -right-1 sm:-right-2 top-1 sm:top-2">
          <div 
            className={`w-0.5 sm:w-1 h-10 sm:h-16 ${
              isActive ? 'bg-indigo-400' : 'bg-slate-500'
            }`}
          />
          
          {/* Flag for eighth notes */}
          {hasFlag && (
            <svg 
              className={`absolute -left-0.5 sm:-left-1 top-0 w-3 sm:w-5 h-6 sm:h-10 ${
                isActive ? 'text-indigo-400' : 'text-slate-500'
              }`}
              viewBox="0 0 20 40"
              fill="currentColor"
            >
              <path d="M2 0 Q 15 8, 18 20 Q 12 15, 2 18 Z" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};
