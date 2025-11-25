# Lyre Hero - AI Coding Instructions

## Project Overview
Lyre Hero is a React-based web application that teaches users how to play the Lyre Harp using real-time audio processing and pitch detection. It listens to the user's microphone, detects the played note, and advances the song when the correct note is held.

## Tech Stack
- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Audio:** Native Web Audio API (no external audio libraries)

## Architecture & Core Components

### Audio Engine (`services/audioEngine.ts`)
- Encapsulates all Web Audio API logic (`AudioContext`, `AnalyserNode`, `MediaStream`).
- Implements custom pitch detection using **NSDF (Normalized Squared Difference Function)** autocorrelation.
- **Key Methods:** `start()`, `stop()`, `detectPitch()`.
- **Configuration:** Handles `rmsThreshold` (volume) and `correlationThreshold` (clarity/pitch confidence).

### Tutor Interface (`components/TutorInterface.tsx`)
- The core "gameplay" component.
- **Game Loop:** Uses `requestAnimationFrame` to poll `audioEngine.detectPitch()` continuously.
- **State Management:** Uses `useRef` for high-frequency updates (pitch, volume) to avoid React render thrashing, and `useState` for UI updates (current note, progress).
- **Calibration:** Includes a built-in wizard to adjust noise floor and gain settings.

### Data Models (`types.ts`)
- **Song:** `{ title, notes: Note[], difficulty }`
- **Note:** `{ note: string, lyric?: string }` (e.g., "C4", "A3")
- **AppState:** `MENU` | `PLAYING` | `GENERATING` | `ERROR`

## Development Patterns & Conventions

### Audio Processing Loop
- **Do not** put the audio processing loop inside `AudioEngine`. The UI component (`TutorInterface`) drives the loop via `requestAnimationFrame`.
- **Pattern:**
  ```typescript
  const checkPitch = () => {
    const result = audioEngine.detectPitch();
    // Update refs for performance, state for UI
    requestRef.current = requestAnimationFrame(checkPitch);
  };
  ```

### State Management
- **High Frequency Data:** Use `useRef` for data that changes every frame (audio levels, current frequency) to prevent re-renders.
- **UI State:** Use `useState` for game progression (current note index, song completion).

### Styling
- Use **Tailwind CSS** for all styling.
- **Theme:** Dark mode default (`bg-slate-900`, `text-slate-100`).
- **Animations:** Use `animate-in`, `fade-in`, `slide-in` classes for transitions.

### Debugging
- The `TutorInterface` includes a hidden "Troubleshoot" panel (`showSettings`).
- `AudioEngine` logs debug info to console when `detectPitch` is called (throttled in UI).

## Critical Workflows
- **Run:** `npm run dev`
- **Microphone:** Browser requires user interaction to start `AudioContext`. Always handle `start()` via a button click.
- **Permissions:** Handle `navigator.mediaDevices.getUserMedia` errors gracefully.
