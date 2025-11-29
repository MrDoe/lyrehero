import { CheckCircle2 } from "lucide-react";
import React from "react";
import { NoteDuration } from "../types";

interface NoteCircleProps {
  note: string;
  duration?: NoteDuration;
  isActive: boolean;
  isPast: boolean;
  noteProgress: number;
  showStaffLines?: boolean;
}

// Map note names to staff positions
// Using treble clef with half-line spacing (each position is 0.5 line spacing)
// Lines (even positions): E4=0, G4=2, B4=4, D5=6, F5=8
// Spaces (odd positions): F4=1, A4=3, C5=5, E5=7
// Below staff: D4=-2, C4=-4, B3=-6, A3=-8, etc.
const getNotePosition = (noteStr: string): number => {
  // Staff position system: B4 (middle line) = 0
  // Each position is one staff position (line or space)
  // Lines: E4=-4, G4=-2, B4=0, D5=2, F5=4
  // Spaces: F4=-3, A4=-1, C5=1, E5=3
  const noteMap: Record<string, number> = {
    // Below staff
    F3: -10,
    G3: -9,
    A3: -8,
    B3: -7,
    C4: -6, // One ledger line below
    D4: -5,
    E4: -4, // Bottom line
    F4: -3, // 1st space
    G4: -2, // 2nd line
    A4: -1, // 2nd space
    B4: 0,  // 3rd line (middle) - REFERENCE
    C5: 1,  // 3rd space
    D5: 2,  // 4th line
    E5: 3,  // 4th space
    F5: 4,  // Top line
    G5: 5,  // Just above top line
    A5: 6,  // One ledger line above
    B5: 7,
    C6: 8,
  };
  return noteMap[noteStr] ?? 0; // Default to middle line
};

// Check if a note needs ledger lines
const getLedgerLines = (position: number): number[] => {
  const lines: number[] = [];
  // Ledger lines are at even positions (where staff lines would be)
  // Below staff: positions -6, -8, -10, etc.
  if (position <= -5) {
    // Start at -6 (first ledger line below, for C4)
    for (let p = -6; p >= position; p -= 2) {
      lines.push(p);
    }
  }
  // Above staff: positions 6, 8, 10, etc.
  if (position >= 5) {
    // Start at 6 (first ledger line above, for A5)
    for (let p = 6; p <= position; p += 2) {
      lines.push(p);
    }
  }
  return lines;
};

/**
 * Renders a music note on a staff with visual representation of its duration.
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
  showStaffLines = true,
}) => {
  const isHollow = duration === "1" || duration === "1/2";
  const position = getNotePosition(note);
  const ledgerLines = getLedgerLines(position);

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

  // Staff configuration - all values are in viewBox units (not pixels)
  // This ensures consistent positioning regardless of zoom or device resolution
  const staffLineColor = "rgba(148, 163, 184, 0.5)"; // slate-400/50
  
  // Fixed viewBox dimensions for consistent scaling
  const viewBoxWidth = 80;
  const viewBoxHeight = 100;
  
  // Line spacing in viewBox units - calculated relative to viewBox height
  const lineSpacing = 8; // viewBox units per staff position
  
  // B4 (middle line) is at position 0, which should be at the center of the viewBox
  const staffCenterY = viewBoxHeight / 2;

  // Note positioning - calculate Y based on position (negative position = lower on staff = higher Y)
  const noteY = staffCenterY - position * lineSpacing;

  // Note head dimensions in viewBox units
  const noteHeadRx = 9;
  const noteHeadRy = 6;
  const stemHeight = 42;
  const stemX = noteHeadRx - 2;

  // Determine stem direction based on position (stems go up for notes below B4, down for notes at or above B4)
  const stemUp = position < 0;

  return (
    <div className="relative flex items-center justify-center" style={{ height: 'clamp(144px, 20vw, 176px)' }}>
      <div className="relative flex items-center justify-center">
        {/* Staff and Note SVG - uses fixed viewBox for consistent positioning */}
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="drop-shadow-lg"
          style={{ 
            width: 'clamp(80px, 12vw, 96px)', 
            height: 'clamp(112px, 16vw, 128px)',
            overflow: 'visible' 
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Staff lines (5 lines) - extended beyond viewBox for continuous staff appearance */}
          {/* Lines are at staff positions: E4=-4, G4=-2, B4=0, D5=2, F5=4 */}
          {showStaffLines &&
            [-4, -2, 0, 2, 4].map((linePos) => (
              <line
                key={linePos}
                x1={-1000}
                y1={staffCenterY - linePos * lineSpacing}
                x2={1000}
                y2={staffCenterY - linePos * lineSpacing}
                stroke={staffLineColor}
                strokeWidth="1"
              />
            ))}

          {/* Ledger lines */}
          {ledgerLines.map((linePos) => (
            <line
              key={`ledger-${linePos}`}
              x1="25"
              y1={staffCenterY - linePos * lineSpacing}
              x2="55"
              y2={staffCenterY - linePos * lineSpacing}
              stroke={staffLineColor}
              strokeWidth="1"
            />
          ))}

          {/* Note */}
          <g>
            {/* Stem (not for whole notes) */}
            {duration !== "1" && (
              <rect
                x={stemUp ? 40 + stemX : 40 - stemX - 2}
                y={stemUp ? noteY - stemHeight : noteY}
                width="2"
                height={stemHeight}
                fill={color}
              />
            )}

            {/* Flag for eighth notes */}
            {duration === "1/8" && (
              <path
                d={
                  stemUp
                    ? `M ${40 + stemX + 2} ${noteY - stemHeight} Q ${
                        40 + stemX + 15
                      } ${noteY - stemHeight + 10}, ${40 + stemX + 18} ${
                        noteY - stemHeight + 25
                      } Q ${40 + stemX + 12} ${noteY - stemHeight + 18}, ${
                        40 + stemX + 2
                      } ${noteY - stemHeight + 12} Z`
                    : `M ${40 - stemX} ${noteY + stemHeight} Q ${
                        40 - stemX - 15
                      } ${noteY + stemHeight - 10}, ${40 - stemX - 18} ${
                        noteY + stemHeight - 25
                      } Q ${40 - stemX - 12} ${noteY + stemHeight - 18}, ${
                        40 - stemX
                      } ${noteY + stemHeight - 12} Z`
                }
                fill={color}
              />
            )}

            {/* Note head */}
            {isHollow ? (
              <>
                {/* Hollow note head (whole/half notes) */}
                <ellipse
                  cx="40"
                  cy={noteY}
                  rx={noteHeadRx}
                  ry={noteHeadRy}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  transform={`rotate(-20 40 ${noteY})`}
                />
              </>
            ) : (
              /* Filled note head (quarter/eighth notes) */
              <ellipse
                cx="40"
                cy={noteY}
                rx={noteHeadRx}
                ry={noteHeadRy}
                fill={fillColor}
                transform={`rotate(-20 40 ${noteY})`}
              />
            )}

            {/* Checkmark for completed notes */}
            {isPast && (
              <g transform={`translate(${40 - 8}, ${noteY - 8})`}>
                <CheckCircle2 size={16} color="#22c55e" />
              </g>
            )}
          </g>

          {/* Glow effect for active notes */}
          {isActive && !isPast && (
            <ellipse
              cx="40"
              cy={noteY}
              rx={noteHeadRx + 8}
              ry={noteHeadRy + 8}
              fill={
                noteProgress > 0.5
                  ? "rgba(34, 197, 94, 0.3)"
                  : "rgba(129, 140, 248, 0.3)"
              }
              className={noteProgress > 0.5 ? "animate-pulse" : ""}
              style={{ filter: "blur(8px)" }}
            />
          )}
        </svg>

        {/* Note name label above the staff */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <span
            className={`text-lg sm:text-2xl font-bold ${
              isPast
                ? "text-green-500"
                : isActive
                ? "text-indigo-400"
                : "text-slate-400"
            } transition-all ${
              isActive && noteProgress > 0.7 ? "scale-110" : ""
            }`}
          >
            {note}
          </span>
        </div>

        {/* Progress indicator */}
        {isActive && noteProgress > 0 && (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 h-1 bg-indigo-500/30 rounded-full overflow-hidden"
            style={{ width: "60px" }}
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-green-500 transition-all ease-linear"
              style={{ width: `${noteProgress * 100}%` }}
            />
          </div>
        )}

        {/* Success flash effect when note completes */}
        {isActive && noteProgress >= 0.99 && (
          <div className="absolute inset-0 bg-green-400/40 rounded-lg blur-xl animate-ping pointer-events-none" />
        )}
      </div>
    </div>
  );
};
