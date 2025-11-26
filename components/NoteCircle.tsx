import { CheckCircle2 } from "lucide-react";
import React from "react";
import { NoteDuration } from "../types";

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
 * - Whole note (1): Hollow oval, no stem
 * - Half note (1/2): Hollow oval with stem
 * - Quarter note (1/4): Filled oval with stem (default)
 * - Eighth note (1/8): Filled oval with stem and flag
 */
export const NoteCircle: React.FC<NoteCircleProps> = ({
  note,
  duration = "1/4",
  isActive,
  isPast,
  noteProgress,
}) => {
  const isHollow = duration === "1" || duration === "1/2";
  const hasStem = duration !== "1";
  const hasFlag = duration === "1/8";

  // Get colors based on state
  const getColor = () => {
    if (isPast) return "#22c55e"; // green-500
    if (isActive) return "#818cf8"; // indigo-400
    return "#cbd5e1"; // slate-300
  };

  const getFillColor = () => {
    if (isPast) return "#22c55e";
    if (isActive) return "#818cf8";
    return "#cbd5e1";
  };

  const color = getColor();
  const fillColor = getFillColor();

  // Render whole note (hollow oval, no stem)
  const renderWholeNote = () => (
    <svg
      viewBox="0 0 120 100"
      className="w-20 h-16 sm:w-28 sm:h-20 drop-shadow-lg"
    >
      {/* Whole note - hollow ellipse with thick border */}
      <ellipse
        cx="60"
        cy="50"
        rx="45"
        ry="32"
        fill="none"
        stroke={color}
        strokeWidth="8"
        transform="rotate(-25 60 50)"
      />
      <ellipse
        cx="60"
        cy="50"
        rx="30"
        ry="20"
        fill="rgb(15 23 42)"
        transform="rotate(-25 60 50)"
      />
    </svg>
  );

  // Render half note (hollow oval with stem)
  const renderHalfNote = () => (
    <svg
      viewBox="0 0 120 200"
      className="w-20 h-32 sm:w-28 sm:h-40 drop-shadow-lg"
    >
      {/* Stem */}
      <rect x="97" y="10" width="5" height="110" fill={color} />

      {/* Note head - hollow ellipse */}
      <ellipse
        cx="60"
        cy="120"
        rx="45"
        ry="32"
        fill="none"
        stroke={color}
        strokeWidth="8"
        transform="rotate(-25 60 120)"
      />
      <ellipse
        cx="60"
        cy="120"
        rx="30"
        ry="20"
        fill="rgb(15 23 42)"
        transform="rotate(-25 60 120)"
      />
    </svg>
  );

  // Render quarter note (filled oval with stem)
  const renderQuarterNote = () => (
    <svg
      viewBox="0 0 120 200"
      className="w-20 h-32 sm:w-28 sm:h-40 drop-shadow-lg"
    >
      {/* Stem */}
      <rect x="97" y="10" width="5" height="110" fill={color} />

      {/* Note head - filled ellipse */}
      <ellipse
        cx="60"
        cy="120"
        rx="45"
        ry="32"
        fill={fillColor}
        transform="rotate(-25 60 120)"
      />
    </svg>
  );

  // Render eighth note (filled oval with stem and flag)
  const renderEighthNote = () => (
    <svg
      viewBox="0 0 140 200"
      className="w-24 h-32 sm:w-32 sm:h-40 drop-shadow-lg"
    >
      {/* Stem */}
      <rect x="97" y="10" width="5" height="110" fill={color} />

      {/* Flag - authentic curved flag shape */}
      <path
        d="M 104 10 Q 130 25, 135 50 Q 132 48, 125 42 Q 115 32, 108 25 Q 104 20, 104 15 Z"
        fill={color}
      />

      {/* Note head - filled ellipse */}
      <ellipse
        cx="60"
        cy="120"
        rx="45"
        ry="32"
        fill={fillColor}
        transform="rotate(-25 60 120)"
      />
    </svg>
  );

  const renderNote = () => {
    if (duration === "1") return renderWholeNote();
    if (duration === "1/2") return renderHalfNote();
    if (duration === "1/8") return renderEighthNote();
    return renderQuarterNote();
  };

  return (
    <div className="relative flex items-center justify-center h-36 sm:h-44">
      <div className="relative flex items-center justify-center">
        {/* Musical note SVG */}
        <div className="relative">
          {renderNote()}

          {/* Progress fill overlay for active notes */}
          {isActive && noteProgress > 0 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute inset-0 bg-white/20 transition-all ease-linear"
                style={{
                  height: `${noteProgress * 100}%`,
                  top: "auto",
                  bottom: 0,
                }}
              />
            </div>
          )}

          {/* Note label overlay */}
          <div className="absolute mt-7 inset-0 flex items-center justify-center">
            {isPast ? (
              <CheckCircle2
                size={20}
                className="sm:w-8 sm:h-8 text-green-500"
              />
            ) : (
              <span
                className={`text-lg font-bold ${
                  isActive
                    ? "text-white"
                    : isHollow
                    ? "text-slate-300"
                    : "text-slate-900"
                } drop-shadow-md`}
              >
                {note}
              </span>
            )}
          </div>
        </div>

        {/* Glow effect for active notes */}
        {isActive && !isPast && (
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};
