import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Song } from '../types';
import { AudioEngine } from '../services/audioEngine';
import { Visualizer } from './Visualizer';
import { ArrowLeft, Mic, RotateCcw, CheckCircle2, AlertCircle, Settings2, X, Wand2, Activity } from 'lucide-react';

interface TutorInterfaceProps {
  song: Song;
  onBack: () => void;
}

interface AudioConfig {
  rmsThreshold: number;
  correlationThreshold: number;
  holdDuration: number;
  gain: number;
}

const STORAGE_KEY = 'lyrehero-audio-config';

const getDefaultConfig = (): AudioConfig => ({
  rmsThreshold: 0.0005,
  correlationThreshold: 0.01,
  holdDuration: 100,
  gain: 1.5
});

const loadConfig = (): AudioConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...getDefaultConfig(), ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load audio config from localStorage:', e);
  }
  return getDefaultConfig();
};

export const TutorInterface: React.FC<TutorInterfaceProps> = ({ song, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detectedNote, setDetectedNote] = useState<string>('...');
  const [isListening, setIsListening] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Debug / Live Stats State
  const [currentRms, setCurrentRms] = useState(0);
  const [currentClarity, setCurrentClarity] = useState(0);
  const [currentFreq, setCurrentFreq] = useState(0);
  
  // Configuration State
  const [showSettings, setShowSettings] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationPhase, setCalibrationPhase] = useState<'idle' | 'noise' | 'note'>('idle');
  const [noiseFloor, setNoiseFloor] = useState(0);
  const [config, setConfig] = useState<AudioConfig>(loadConfig);
  
  const [noteProgress, setNoteProgress] = useState(0);
  
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const requestRef = useRef<number>(0);
  const lastNoteTimeRef = useRef<number>(0);
  
  const holdStartTimeRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const isListeningRef = useRef(false);
  const isCalibratingRef = useRef(false);
  const configRef = useRef(config);
  const lastCompletedNoteRef = useRef<string | null>(null);
  const requireSilenceRef = useRef(false);

  // Sync refs
  useEffect(() => {
    currentIndexRef.current = currentIndex;
    const activeNoteEl = document.getElementById(`note-${currentIndex}`);
    if (activeNoteEl) {
      activeNoteEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [currentIndex]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isCalibratingRef.current = isCalibrating;
  }, [isCalibrating]);

  useEffect(() => {
    configRef.current = config;
    if (audioEngineRef.current && !isCalibrating) {
      audioEngineRef.current.rmsThreshold = config.rmsThreshold;
      audioEngineRef.current.correlationThreshold = config.correlationThreshold;
      audioEngineRef.current.setGain(config.gain);
    }
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save audio config to localStorage:', e);
    }
  }, [config, isCalibrating]);

  // Initialize Audio Engine
  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    audioEngineRef.current.rmsThreshold = config.rmsThreshold;
    audioEngineRef.current.correlationThreshold = config.correlationThreshold;
    audioEngineRef.current.setGain(config.gain);
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      audioEngineRef.current?.stop();
    };
  }, []);

  const startListening = async () => {
    setErrorMsg(null);
    if (audioEngineRef.current) {
      try {
        await audioEngineRef.current.start();
        // Update ref IMMEDIATELY before starting the loop
        isListeningRef.current = true;
        setIsListening(true);
        checkPitch();
      } catch (err) {
        console.error("Microphone access denied or error:", err);
        setErrorMsg("Could not access microphone. Please check permissions.");
        setIsListening(false);
        isListeningRef.current = false;
      }
    }
  };

  const stopListening = useCallback(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setIsListening(false);
    setDetectedNote('...');
    setNoteProgress(0);
    holdStartTimeRef.current = null;
    setCurrentRms(0);
    setCurrentClarity(0);
    setCurrentFreq(0);
  }, []);

  const handleCorrectNote = useCallback(() => {
    const now = Date.now();
    if (now - lastNoteTimeRef.current < 500) return; 
    
    lastNoteTimeRef.current = now;
    setNoteProgress(0);
    holdStartTimeRef.current = null;

    // Store the completed note
    const completedNote = song.notes[currentIndexRef.current].note;
    lastCompletedNoteRef.current = completedNote;

    // Check if next note is the same - if so, require silence before accepting it
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex < song.notes.length && song.notes[nextIndex].note === completedNote) {
      requireSilenceRef.current = true;
    } else {
      requireSilenceRef.current = false;
    }

    if (currentIndexRef.current < song.notes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      stopListening();
    }
  }, [song.notes, stopListening]);

  const checkPitch = useCallback(() => {
    // Stop loop if not listening
    if (!isListeningRef.current) {
      requestRef.current = 0;
      return;
    }
    
    if (!audioEngineRef.current) {
      requestRef.current = requestAnimationFrame(checkPitch);
      return;
    }

    const result = audioEngineRef.current.detectPitch();
    
    if (result) {
        // ALWAYS update debug stats
        setCurrentRms(result.volume);
        setCurrentClarity(result.clarity);
        setCurrentFreq(result.frequency);
        
        // Debug log every ~0.5 seconds
        if (Math.random() < 0.033) {
          console.log('UI checkPitch:', { rms: result.volume.toFixed(4), clarity: result.clarity.toFixed(3), freq: result.frequency.toFixed(1) });
        }

        const idx = currentIndexRef.current;
        const targetNote = song.notes[idx];
        const { holdDuration } = configRef.current;

        // Check if result is valid note based on Engine's internal check + our loop check
        if (result.note) {
          setDetectedNote(result.note);
          
          // Only do note matching if not calibrating
          if (!isCalibratingRef.current && targetNote && result.note === targetNote.note) {
            // If we need silence before accepting this note (duplicate note scenario)
            if (requireSilenceRef.current) {
              // Don't start the hold timer, just stay in waiting state
              holdStartTimeRef.current = null;
              setNoteProgress(0);
            } else {
              // Normal note matching logic
              if (!holdStartTimeRef.current) {
                holdStartTimeRef.current = Date.now();
              }

              const elapsed = Date.now() - holdStartTimeRef.current;
              const progress = Math.min(elapsed / holdDuration, 1);
              setNoteProgress(progress);

              if (elapsed >= holdDuration) {
                handleCorrectNote();
              }
            }
          } else {
            holdStartTimeRef.current = null;
            setNoteProgress(0);
          }
        } else {
          // No note detected - clear the "require silence" flag if we were waiting
          if (requireSilenceRef.current) {
            requireSilenceRef.current = false;
          }
          
          setDetectedNote('...');
          holdStartTimeRef.current = null;
          setNoteProgress(0);
        }
    }
    
    requestRef.current = requestAnimationFrame(checkPitch);
  }, [song.notes, handleCorrectNote]); 

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFinished(false);
    lastNoteTimeRef.current = 0;
    setErrorMsg(null);
    setNoteProgress(0);
    holdStartTimeRef.current = null;
    lastCompletedNoteRef.current = null;
    requireSilenceRef.current = false;
    startListening();
  };

  const startNoiseCalibration = async () => {
    if (!audioEngineRef.current) return;
    
    setIsCalibrating(true);
    setCalibrationPhase('noise');
    setErrorMsg(null);
    setNoiseFloor(0);

    if (!isListening) {
      try {
        await audioEngineRef.current.start();
        // Update ref IMMEDIATELY before starting the loop
        isListeningRef.current = true;
        setIsListening(true);
        // Start the checkPitch loop
        checkPitch();
      } catch (e) {
        setErrorMsg("Cannot start microphone for calibration.");
        setIsCalibrating(false);
        setCalibrationPhase('idle');
        isListeningRef.current = false;
        return;
      }
    }
  };

  const stopNoiseCalibration = () => {
    if (!audioEngineRef.current || calibrationPhase !== 'noise') return;

    // Calculate noise floor from recent RMS values
    const noise = currentRms;
    setNoiseFloor(noise);
    
    // Set RMS threshold slightly above noise floor
    const newRmsThreshold = Math.max(0.0003, noise * 2.5);
    
    setConfig(prev => ({
      ...prev,
      rmsThreshold: newRmsThreshold
    }));

    setCalibrationPhase('idle');
    setIsCalibrating(false);
  };

  const startNoteCalibration = async () => {
    if (!audioEngineRef.current) return;
    
    setIsCalibrating(true);
    setCalibrationPhase('note');
    setErrorMsg(null);

    if (!isListening) {
      try {
        await audioEngineRef.current.start();
        // Update ref IMMEDIATELY before starting the loop
        isListeningRef.current = true;
        setIsListening(true);
        // Start the checkPitch loop
        checkPitch();
      } catch (e) {
        setErrorMsg("Cannot start microphone for calibration.");
        setIsCalibrating(false);
        setCalibrationPhase('idle');
        isListeningRef.current = false;
        return;
      }
    }

    // Set very permissive thresholds for detection
    if (audioEngineRef.current) {
      audioEngineRef.current.rmsThreshold = 0.0001;
      audioEngineRef.current.correlationThreshold = 0.005;
    }
  };

  const stopNoteCalibration = () => {
    if (!audioEngineRef.current || calibrationPhase !== 'note') return;

    // Check if we detected a note
    if (detectedNote && detectedNote !== '...' && currentClarity > 0.01) {
      // Success - use current clarity to set threshold
      const newClarityThreshold = Math.max(0.005, Math.min(currentClarity * 0.5, 0.3));
      
      setConfig(prev => ({
        ...prev,
        correlationThreshold: newClarityThreshold
      }));
      
      setErrorMsg(null);
    } else {
      setErrorMsg("No note detected. Try increasing gain.");
    }

    setCalibrationPhase('idle');
    setIsCalibrating(false);
    
    // Restore thresholds
    if (audioEngineRef.current) {
      audioEngineRef.current.rmsThreshold = config.rmsThreshold;
      audioEngineRef.current.correlationThreshold = config.correlationThreshold;
    }
  };

  const increaseGain = () => {
    const newGain = Math.min(config.gain + 0.5, 5.0);
    setConfig(prev => ({ ...prev, gain: newGain }));
    if (audioEngineRef.current) {
      audioEngineRef.current.setGain(newGain);
    }
  };

  const decreaseGain = () => {
    const newGain = Math.max(config.gain - 0.5, 0.5);
    setConfig(prev => ({ ...prev, gain: newGain }));
    if (audioEngineRef.current) {
      audioEngineRef.current.setGain(newGain);
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return (
    <div className="flex flex-col h-full w-full mx-auto animate-in fade-in zoom-in duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 shrink-0 bg-slate-900 z-20 gap-2">
        <button 
          onClick={onBack}
          className="p-1 sm:p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base flex-shrink-0"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="text-center flex-1 min-w-0">
          <h2 className="text-base sm:text-xl font-bold truncate">{song.title}</h2>
          <p className="text-slate-400 text-xs">
            {isFinished ? 'Complete' : `Note ${currentIndex + 1} / ${song.notes.length}`}
          </p>
        </div>
        <div className="w-12 sm:w-20 flex-shrink-0" /> 
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {isFinished ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center animate-in fade-in zoom-in duration-500 p-8 bg-slate-800/50 rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full">
              <CheckCircle2 size={80} className="text-green-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">Song Complete!</h3>
              <p className="text-slate-300 mb-8 text-lg">Great job playing {song.title}</p>
              <button
                onClick={handleRestart}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-600/20"
              >
                <RotateCcw size={20} />
                Play Again
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Song Timeline */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full overflow-y-hidden overflow-x-visible bg-gradient-to-b from-slate-900 to-slate-800">
               <div className="absolute left-1/2 top-0 bottom-0 w-px bg-indigo-500/20 z-0"></div>

               {/* Right Hand (Melody) - Top Row */}
               <div className="w-full overflow-x-auto scrollbar-hide touch-scroll flex items-center px-[50%] py-3 sm:py-4 gap-4 sm:gap-8 snap-x snap-mandatory">
                  {song.notes.map((noteObj, idx) => {
                    const isActive = idx === currentIndex;
                    const isPast = idx < currentIndex;
                    
                    return (
                      <div 
                        key={idx}
                        id={`note-${idx}`}
                        className={`
                          relative shrink-0 flex flex-col items-center justify-center transition-all duration-500 snap-center
                          ${isActive ? 'scale-100 sm:scale-125 opacity-100 z-10' : ''}
                          ${isPast ? 'scale-75 sm:scale-90 opacity-40 grayscale' : ''}
                          ${!isActive && !isPast ? 'scale-75 sm:scale-90 opacity-60' : ''}
                        `}
                      >
                         <div className={`
                            w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-2 sm:border-4 shadow-lg sm:shadow-xl relative overflow-hidden
                            ${isActive ? 'bg-indigo-600 border-indigo-400 shadow-indigo-500/50' : 'bg-slate-700 border-slate-600'}
                            ${isPast ? 'bg-slate-800 border-green-900' : ''}
                         `}>
                            {isActive && noteProgress > 0 && (
                                <div 
                                    className="absolute inset-0 bg-white/20 transition-all ease-linear"
                                    style={{ height: `${noteProgress * 100}%`, top: 'auto', bottom: 0 }}
                                />
                            )}
                            
                            {isPast ? (
                                <CheckCircle2 size={24} className="sm:w-10 sm:h-10 text-green-500" />
                            ) : (
                                <span className="text-xl sm:text-3xl font-bold text-white">{noteObj.note}</span>
                            )}
                         </div>

                         <div className={`mt-2 sm:mt-3 font-serif text-xs sm:text-lg italic transition-all ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                            {noteObj.lyric || "-"}
                         </div>
                         
                         {idx < song.notes.length - 1 && (
                            <div className={`absolute top-8 sm:top-12 left-full w-4 sm:w-8 h-1 -z-10 ${isPast ? 'bg-green-900' : 'bg-slate-700'}`} />
                         )}
                      </div>
                    );
                  })}
               </div>

               {/* Left Hand (Bass) - Bottom Row - Only display if any bass notes exist */}
               {song.notes.some(n => n.bassNote) && (
                 <div className="w-full border-t border-slate-700/30">
                   <div className="text-center py-1">
                     <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-wider">Left Hand (Bass)</span>
                   </div>
                   <div className="w-full overflow-x-auto scrollbar-hide touch-scroll flex items-center px-[50%] py-2 sm:py-3 gap-4 sm:gap-8">
                     {song.notes.map((noteObj, idx) => {
                       const isActive = idx === currentIndex;
                       
                       return (
                         <div 
                           key={`bass-${idx}`}
                           className={`
                             relative shrink-0 flex flex-col items-center justify-center transition-all duration-500
                             ${isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-75'}
                           `}
                         >
                           {noteObj.bassNote ? (
                             <div className={`
                               w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 shadow-md relative overflow-hidden
                               ${isActive ? 'bg-purple-700/60 border-purple-400' : 'bg-slate-800/80 border-slate-700'}
                             `}>
                               <span className="text-sm sm:text-lg font-bold text-slate-200">{noteObj.bassNote}</span>
                             </div>
                           ) : (
                             <div className="w-12 h-12 sm:w-16 sm:h-16" />
                           )}
                           
                           {idx < song.notes.length - 1 && noteObj.bassNote && (
                             <div className="absolute top-6 sm:top-8 left-full w-4 sm:w-8 h-1 -z-10 bg-slate-800/50" />
                           )}
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}
            </div>

            {/* Controls & Feedback Panel */}
            <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-6 pb-20 sm:pb-6 z-20 relative transition-all duration-300 ease-in-out overflow-y-auto">
                {showSettings && (
                  <div className="max-w-xl mx-auto mb-4 sm:mb-6 bg-slate-800/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-700 animate-in slide-in-from-bottom-4 fade-in z-50 shadow-2xl max-h-[70vh] overflow-y-auto">
                     <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-800/95 -m-4 sm:-m-6 p-4 sm:p-6 z-10">
                        <div className="flex items-center gap-2">
                            <Settings2 className="text-indigo-400" size={20} />
                            <h3 className="font-bold text-lg text-slate-200">Audio Debug & Config</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSettings(false)}
                          aria-label="Close settings"
                          title="Close settings"
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            <X size={20}/>
                        </button>
                     </div>
                     
                     <div className="space-y-6 pt-2">
                     {/* Live Meters */}
                     {isListening && (
                         <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                            <div className="col-span-2 flex justify-between text-xs font-mono text-slate-500 mb-2 border-b border-slate-800 pb-2">
                                <span>Detected Freq: <span className="text-indigo-400">{currentFreq.toFixed(1)} Hz</span></span>
                                <span className="text-xs text-slate-600">RMS: {(currentRms * 1000).toFixed(1)}</span>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Signal Volume (RMS)</span>
                                    <span className={currentRms >= config.rmsThreshold ? 'text-green-400 font-bold' : 'text-slate-500'}>
                                        {(currentRms * 1000).toFixed(1)}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-75 ${currentRms >= config.rmsThreshold ? 'bg-green-500' : 'bg-slate-500'}`}
                                        style={{ width: `${Math.min(currentRms * 1000, 100)}%` }} // Scale up for visibility
                                    />
                                </div>
                                <div className="text-[10px] text-slate-600 mt-1 flex justify-between">
                                    <span>Threshold: {(config.rmsThreshold * 1000).toFixed(1)}</span>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Clarity (NSDF)</span>
                                    <span className={currentClarity >= config.correlationThreshold ? 'text-green-400 font-bold' : 'text-slate-500'}>
                                        {(currentClarity * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-75 ${currentClarity >= config.correlationThreshold ? 'bg-green-500' : 'bg-slate-500'}`}
                                        style={{ width: `${Math.min(currentClarity * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="text-[10px] text-slate-600 mt-1 flex justify-between">
                                    <span>Threshold: {(config.correlationThreshold * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                         </div>
                     )}

                     <div className="mb-6 space-y-4">
                        {/* Calibration Instructions */}
                        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/50">
                          <h4 className="text-sm font-bold text-indigo-300 mb-3">🎯 Auto-Calibration Steps</h4>
                          
                          {/* Step 1: Noise Floor */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-400">
                                <span className="font-bold text-slate-300">Step 1:</span> Measure Background Noise
                              </span>
                              {noiseFloor > 0 && (
                                <span className="text-xs text-green-400">✓ Done ({(noiseFloor * 1000).toFixed(2)})</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {calibrationPhase === 'noise' ? (
                                <button 
                                  onClick={stopNoiseCalibration}
                                  className="flex-1 py-2 rounded-lg font-bold bg-red-600 hover:bg-red-500 text-white text-sm"
                                >
                                  Stop & Save Noise Level
                                </button>
                              ) : (
                                <button 
                                  onClick={startNoiseCalibration}
                                  disabled={isCalibrating}
                                  className="flex-1 py-2 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm"
                                >
                                  Start (Be Quiet!)
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Step 2: Note Detection */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-400">
                                <span className="font-bold text-slate-300">Step 2:</span> Play a Clear Note
                              </span>
                              {detectedNote && detectedNote !== '...' && calibrationPhase === 'note' && (
                                <span className="text-xs text-green-400">✓ Detected: {detectedNote}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {calibrationPhase === 'note' ? (
                                <button 
                                  onClick={stopNoteCalibration}
                                  className="flex-1 py-2 rounded-lg font-bold bg-green-600 hover:bg-green-500 text-white text-sm"
                                >
                                  Stop & Apply Settings
                                </button>
                              ) : (
                                <button 
                                  onClick={startNoteCalibration}
                                  disabled={isCalibrating}
                                  className="flex-1 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm"
                                >
                                  Start (Play Note!)
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Gain Controls */}
                          <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-2">
                              <span className="font-bold text-slate-300">Input Gain (Boost)</span>
                              <span className="text-indigo-400">{config.gain.toFixed(1)}x</span>
                            </div>
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={decreaseGain}
                                className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold"
                              >
                                −
                              </button>
                              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500"
                                  style={{ width: `${(config.gain / 5) * 100}%` }}
                                />
                              </div>
                              <button
                                onClick={increaseGain}
                                className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold"
                              >
                                +
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-1">
                              Increase if notes aren't detected. Decrease if signal clips.
                            </p>
                          </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        {/* RMS Threshold */}
                        <div>
                           <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-400">Volume Threshold</span>
                              <span className="font-mono text-indigo-400">{config.rmsThreshold.toFixed(4)}</span>
                           </div>
                           <label htmlFor="rmsThreshold" className="sr-only">Volume Threshold</label>
                           <input 
                              id="rmsThreshold"
                              type="range" min="0.0001" max="0.05" step="0.0001"
                              value={config.rmsThreshold}
                              onChange={(e) => setConfig({...config, rmsThreshold: parseFloat(e.target.value)})}
                              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              aria-label="Volume Threshold"
                              title="Adjust volume threshold for note detection"
                           />
                        </div>

                        {/* Correlation Threshold */}
                        <div>
                           <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-400">Clarity Threshold</span>
                              <span className="font-mono text-indigo-400">{config.correlationThreshold.toFixed(2)}</span>
                           </div>
                           <label htmlFor="correlationThreshold" className="sr-only">Clarity Threshold</label>
                           <input 
                              id="correlationThreshold"
                              type="range" min="0.01" max="0.95" step="0.01"
                              value={config.correlationThreshold}
                              onChange={(e) => setConfig({...config, correlationThreshold: parseFloat(e.target.value)})}
                              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              aria-label="Clarity Threshold"
                              title="Adjust clarity (correlation) threshold for pitch detection"
                           />
                        </div>
                     </div>
                     </div>
                  </div>
                )}

                <div className="max-w-xl mx-auto flex flex-col gap-3 sm:gap-6">
                    
                    {/* Visualizer & Detection Display */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-700 shadow-lg">
                        <div className="flex-shrink-0">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                                <Activity size={10} />
                                Detected
                            </div>
                            <div className={`text-2xl sm:text-3xl font-mono font-bold ${detectedNote === song.notes[currentIndex]?.note ? 'text-green-400 scale-110' : 'text-slate-200'} transition-all`}>
                                {detectedNote}
                            </div>
                        </div>
                        
                        <div className="hidden sm:block h-10 w-px bg-slate-700 mx-2"></div>
                        
                        <div className="flex-1">
                             <Visualizer isListening={isListening} audioEngine={audioEngineRef.current} />
                        </div>
                    </div>

                    {/* Simple Settings Toggle */}
                    <div className="flex justify-center">
                       <button 
                          onClick={() => setShowSettings(!showSettings)}
                          className={`flex items-center gap-2 text-xs uppercase font-bold tracking-wider px-4 py-2 rounded-full transition-all ${showSettings ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                       >
                          <Settings2 size={14} />
                          <span>{showSettings ? 'Hide Configuration' : 'Configuration'}</span>
                       </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center mt-2">
                        {errorMsg ? (
                            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/50">
                                <AlertCircle size={18} />
                                <span className="text-sm">{errorMsg}</span>
                            </div>
                        ) : !isListening ? (
                            <button
                            onClick={startListening}
                            className="flex items-center gap-3 bg-green-500 hover:bg-green-400 text-slate-900 px-8 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-green-500/20 active:scale-95"
                            >
                            <Mic size={24} />
                            Start Playing
                            </button>
                        ) : (
                            <button 
                                onClick={stopListening}
                                className="text-slate-500 hover:text-red-400 text-sm py-2 px-6 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                Stop / Pause
                            </button>
                        )}
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}