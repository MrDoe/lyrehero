import { Song } from './types';

// Standard frequencies for notes (A4 = 440Hz)
// Extended range to support 19-string lyre harp (C3 to D6)
export const NOTE_FREQUENCIES: Record<string, number> = {
  // Octave 3
  "C3": 130.81, "C#3": 138.59, "Db3": 138.59,
  "D3": 146.83, "D#3": 155.56, "Eb3": 155.56,
  "E3": 164.81,
  "F3": 174.61, "F#3": 185.00, "Gb3": 185.00,
  "G3": 196.00, "G#3": 207.65, "Ab3": 207.65,
  "A3": 220.00, "A#3": 233.08, "Bb3": 233.08,
  "B3": 246.94,
  // Octave 4
  "C4": 261.63, "C#4": 277.18, "Db4": 277.18,
  "D4": 293.66, "D#4": 311.13, "Eb4": 311.13,
  "E4": 329.63,
  "F4": 349.23, "F#4": 369.99, "Gb4": 369.99,
  "G4": 392.00, "G#4": 415.30, "Ab4": 415.30,
  "A4": 440.00, "A#4": 466.16, "Bb4": 466.16,
  "B4": 493.88,
  // Octave 5
  "C5": 523.25, "C#5": 554.37, "Db5": 554.37,
  "D5": 587.33, "D#5": 622.25, "Eb5": 622.25,
  "E5": 659.25,
  "F5": 698.46, "F#5": 739.99, "Gb5": 739.99,
  "G5": 783.99, "G#5": 830.61, "Ab5": 830.61,
  "A5": 880.00, "A#5": 932.33, "Bb5": 932.33,
  "B5": 987.77,
  // Octave 6
  "C6": 1046.50, "C#6": 1108.73, "Db6": 1108.73,
  "D6": 1174.66
};

// Common songs to preload
// All songs use diatonic notes only (no sharps/flats) for 19-string diatonic lyre harp
export const PRESET_SONGS: Song[] = [
  {
    title: "Twinkle Twinkle Little Star",
    artist: "Traditional",
    difficulty: "Easy",
    notes: [
      // Section A
      { note: "C4", bassNote: "C3", lyric: "Twin" }, { note: "C4", bassNote: "C3", lyric: "kle" },
      { note: "G4", bassNote: "C3", lyric: "Twin" }, { note: "G4", bassNote: "C3", lyric: "kle" },
      { note: "A4", bassNote: "F3", lyric: "Lit" }, { note: "A4", bassNote: "F3", lyric: "tle" },
      { note: "G4", bassNote: "C3", lyric: "Star" },
      { note: "F4", bassNote: "F3", lyric: "How" }, { note: "F4", bassNote: "F3", lyric: "I" },
      { note: "E4", bassNote: "C3", lyric: "Won" }, { note: "E4", bassNote: "C3", lyric: "der" },
      { note: "D4", bassNote: "G3", lyric: "What" }, { note: "D4", bassNote: "G3", lyric: "You" },
      { note: "C4", bassNote: "C3", lyric: "Are" },
      // Section B
      { note: "G4", bassNote: "C3", lyric: "Up" }, { note: "G4", bassNote: "C3", lyric: "a" },
      { note: "F4", bassNote: "F3", lyric: "bove" }, { note: "F4", bassNote: "F3", lyric: "the" },
      { note: "E4", bassNote: "C3", lyric: "world" }, { note: "E4", bassNote: "C3", lyric: "so" },
      { note: "D4", bassNote: "G3", lyric: "high" },
      { note: "G4", bassNote: "C3", lyric: "Like" }, { note: "G4", bassNote: "C3", lyric: "a" },
      { note: "F4", bassNote: "F3", lyric: "dia" }, { note: "F4", bassNote: "F3", lyric: "mond" },
      { note: "E4", bassNote: "C3", lyric: "in" }, { note: "E4", bassNote: "C3", lyric: "the" },
      { note: "D4", bassNote: "G3", lyric: "sky" },
      // Section A Repeat
      { note: "C4", bassNote: "C3", lyric: "Twin" }, { note: "C4", bassNote: "C3", lyric: "kle" },
      { note: "G4", bassNote: "C3", lyric: "Twin" }, { note: "G4", bassNote: "C3", lyric: "kle" },
      { note: "A4", bassNote: "F3", lyric: "Lit" }, { note: "A4", bassNote: "F3", lyric: "tle" },
      { note: "G4", bassNote: "C3", lyric: "Star" },
      { note: "F4", bassNote: "F3", lyric: "How" }, { note: "F4", bassNote: "F3", lyric: "I" },
      { note: "E4", bassNote: "C3", lyric: "Won" }, { note: "E4", bassNote: "C3", lyric: "der" },
      { note: "D4", bassNote: "G3", lyric: "What" }, { note: "D4", bassNote: "G3", lyric: "You" },
      { note: "C4", bassNote: "C3", lyric: "Are" }
    ]
  },
  {
    title: "Ode to Joy",
    artist: "Beethoven",
    difficulty: "Easy",
    notes: [
      // Part 1
      { note: "E4", bassNote: "C3", lyric: "Joy" }, { note: "E4", bassNote: "C3", lyric: "ful" },
      { note: "F4", bassNote: "F3", lyric: "Joy" }, { note: "G4", bassNote: "C3", lyric: "ful" },
      { note: "G4", bassNote: "C3", lyric: "We" }, { note: "F4", bassNote: "F3", lyric: "A" },
      { note: "E4", bassNote: "C3", lyric: "dore" }, { note: "D4", bassNote: "G3", lyric: "Thee" },
      { note: "C4", bassNote: "C3", lyric: "God" }, { note: "C4", bassNote: "C3", lyric: "of" },
      { note: "D4", bassNote: "G3", lyric: "Glo" }, { note: "E4", bassNote: "C3", lyric: "ry" },
      { note: "E4", bassNote: "C3", lyric: "Lord" }, { note: "D4", bassNote: "G3", lyric: "of" },
      { note: "D4", bassNote: "G3", lyric: "Love" },
      // Part 2
      { note: "E4", bassNote: "C3", lyric: "Hearts" }, { note: "E4", bassNote: "C3", lyric: "un" },
      { note: "F4", bassNote: "F3", lyric: "fold" }, { note: "G4", bassNote: "C3", lyric: "like" },
      { note: "G4", bassNote: "C3", lyric: "flowers" }, { note: "F4", bassNote: "F3", lyric: "be" },
      { note: "E4", bassNote: "C3", lyric: "fore" }, { note: "D4", bassNote: "G3", lyric: "Thee" },
      { note: "C4", bassNote: "C3", lyric: "Hail" }, { note: "C4", bassNote: "C3", lyric: "Thee" },
      { note: "D4", bassNote: "G3", lyric: "as" }, { note: "E4", bassNote: "C3", lyric: "the" },
      { note: "D4", bassNote: "G3", lyric: "sun" }, { note: "C4", bassNote: "C3", lyric: "a" },
      { note: "C4", bassNote: "C3", lyric: "bove" }
    ]
  },
  {
    title: "Amazing Grace",
    artist: "John Newton",
    difficulty: "Easy",
    notes: [
      { note: "G3", bassNote: "C3", lyric: "A" },
      { note: "C4", bassNote: "C3", lyric: "ma" }, { note: "E4", bassNote: "C3", lyric: "zing" },
      { note: "C4", bassNote: "C3", lyric: "Grace" },
      { note: "E4", bassNote: "C3", lyric: "How" },
      { note: "D4", bassNote: "G3", lyric: "Sweet" },
      { note: "C4", bassNote: "C3", lyric: "The" },
      { note: "A3", bassNote: "F3", lyric: "Sound" },
      { note: "G3", bassNote: "C3", lyric: "That" },
      { note: "C4", bassNote: "C3", lyric: "Saved" },
      { note: "E4", bassNote: "C3", lyric: "A" },
      { note: "C4", bassNote: "C3", lyric: "Wretch" },
      { note: "E4", bassNote: "C3", lyric: "Like" },
      { note: "G4", bassNote: "C3", lyric: "Me" },
      // Part 2
      { note: "E4", bassNote: "C3", lyric: "I" },
      { note: "G4", bassNote: "C3", lyric: "once" }, { note: "E4", bassNote: "C3", lyric: "was" },
      { note: "G4", bassNote: "C3", lyric: "lost" },
      { note: "E4", bassNote: "C3", lyric: "but" },
      { note: "C4", bassNote: "F3", lyric: "now" }, { note: "A3", bassNote: "F3", lyric: "am" },
      { note: "G3", bassNote: "C3", lyric: "found" },
      { note: "G3", bassNote: "C3", lyric: "Was" },
      { note: "C4", bassNote: "C3", lyric: "blind" }, { note: "E4", bassNote: "C3", lyric: "but" },
      { note: "C4", bassNote: "C3", lyric: "now" },
      { note: "E4", bassNote: "C3", lyric: "I" },
      { note: "D4", bassNote: "G3", lyric: "see" },
      { note: "C4", bassNote: "C3", lyric: "-" }
    ]
  },
  {
    title: "Canon in C",
    artist: "Pachelbel (adapted)",
    difficulty: "Medium",
    notes: [
      // Bass line intro
      { note: "E4", lyric: "Bass" }, { note: "D4", lyric: "-" },
      { note: "C4", lyric: "-" }, { note: "B3", lyric: "-" },
      { note: "A3", lyric: "-" }, { note: "G3", lyric: "-" },
      { note: "A3", lyric: "-" }, { note: "B3", lyric: "-" },
      // Melody Entrance
      { note: "E5", lyric: "Mel" }, { note: "D5", lyric: "o" },
      { note: "C5", lyric: "dy" }, { note: "B4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "G4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "B4", lyric: "-" },
      { note: "C5", lyric: "-" }, { note: "B4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "G4", lyric: "-" },
      { note: "F4", lyric: "-" }, { note: "E4", lyric: "-" },
      { note: "F4", lyric: "-" }, { note: "G4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "G4", lyric: "-" },
      { note: "F4", lyric: "-" }, { note: "E4", lyric: "-" },
      { note: "D4", lyric: "-" }, { note: "C4", lyric: "End" }
    ]
  },
  {
    title: "Greensleeves",
    artist: "Traditional English",
    difficulty: "Medium",
    notes: [
      // Verse
      { note: "A3", lyric: "A" },
      { note: "C4", lyric: "las" }, { note: "D4", lyric: "my" },
      { note: "E4", lyric: "love" },
      { note: "F4", lyric: "you" },
      { note: "E4", lyric: "do" },
      { note: "D4", lyric: "me" },
      { note: "B3", lyric: "wrong" },
      { note: "G3", lyric: "to" },
      { note: "A3", lyric: "cast" },
      { note: "B3", lyric: "me" },
      { note: "C4", lyric: "off" },
      { note: "A3", lyric: "dis" },
      { note: "A3", lyric: "cour" },
      { note: "G3", lyric: "teous" },
      { note: "A3", lyric: "ly" },
      // Chorus
      { note: "G4", lyric: "Green" }, { note: "G4", lyric: "sleeves" },
      { note: "F4", lyric: "was" }, { note: "E4", lyric: "all" },
      { note: "D4", lyric: "my" }, { note: "B3", lyric: "joy" },
      { note: "G3", lyric: "-" },
      { note: "A3", lyric: "Green" }, { note: "B3", lyric: "sleeves" },
      { note: "C4", lyric: "was" }, { note: "A3", lyric: "my" },
      { note: "A3", lyric: "de" }, { note: "G3", lyric: "light" },
      { note: "E3", lyric: "-" },
      { note: "G4", lyric: "Green" }, { note: "G4", lyric: "sleeves" },
      { note: "F4", lyric: "was" }, { note: "E4", lyric: "my" },
      { note: "D4", lyric: "heart" }, { note: "B3", lyric: "of" },
      { note: "G3", lyric: "gold" },
      { note: "A3", lyric: "And" }, { note: "G3", lyric: "who" },
      { note: "F3", lyric: "but" }, { note: "E3", lyric: "la" },
      { note: "D3", lyric: "dy" }, { note: "A3", lyric: "Green" },
      { note: "A3", lyric: "sleeves" }
    ]
  },
  {
    title: "Scarborough Fair",
    artist: "Traditional English",
    difficulty: "Easy",
    notes: [
      { note: "A3", lyric: "Are" },
      { note: "A3", lyric: "you" },
      { note: "E4", lyric: "go" },
      { note: "E4", lyric: "ing" },
      { note: "E4", lyric: "to" },
      { note: "F4", lyric: "Scar" },
      { note: "E4", lyric: "bor" },
      { note: "D4", lyric: "ough" },
      { note: "A3", lyric: "Fair" },
      // Part 2
      { note: "C4", lyric: "Pars" },
      { note: "B3", lyric: "ley" },
      { note: "A3", lyric: "sage" },
      { note: "G3", lyric: "rose" },
      { note: "A3", lyric: "ma" },
      { note: "E3", lyric: "ry" },
      { note: "A3", lyric: "thyme" },
      // Part 3
      { note: "A3", lyric: "Re" },
      { note: "C4", lyric: "mem" },
      { note: "D4", lyric: "ber" },
      { note: "D4", lyric: "me" },
      { note: "D4", lyric: "to" },
      { note: "C4", lyric: "one" },
      { note: "A3", lyric: "who" },
      { note: "G3", lyric: "lives" },
      { note: "F3", lyric: "there" },
      // Part 4
      { note: "A3", lyric: "She" },
      { note: "C4", lyric: "once" },
      { note: "B3", lyric: "was" },
      { note: "A3", lyric: "a" },
      { note: "G3", lyric: "true" },
      { note: "A3", lyric: "love" },
      { note: "E3", lyric: "of" },
      { note: "A3", lyric: "mine" }
    ]
  },
  {
    title: "Für Elise (simplified)",
    artist: "Beethoven",
    difficulty: "Medium",
    notes: [
      // Main Theme
      { note: "E5", lyric: "-" }, { note: "D5", lyric: "-" },
      { note: "E5", lyric: "-" }, { note: "D5", lyric: "-" },
      { note: "E5", lyric: "-" }, { note: "B4", lyric: "-" },
      { note: "D5", lyric: "-" }, { note: "C5", lyric: "-" },
      { note: "A4", lyric: "-" },
      // Connector 1
      { note: "C4", lyric: "-" }, { note: "E4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "B4", lyric: "-" },
      { note: "E4", lyric: "-" }, { note: "A4", lyric: "-" },
      { note: "B4", lyric: "-" }, { note: "C5", lyric: "-" },
      // Connector 2
      { note: "E4", lyric: "-" }, { note: "E5", lyric: "-" },
      { note: "D5", lyric: "-" }, { note: "E5", lyric: "-" },
      { note: "D5", lyric: "-" }, { note: "E5", lyric: "-" },
      { note: "B4", lyric: "-" }, { note: "D5", lyric: "-" },
      { note: "C5", lyric: "-" }, { note: "A4", lyric: "-" },
      // Ending
      { note: "C4", lyric: "-" }, { note: "E4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "B4", lyric: "-" },
      { note: "E4", lyric: "-" }, { note: "C5", lyric: "-" },
      { note: "B4", lyric: "-" }, { note: "A4", lyric: "Fin" }
    ]
  },
  {
    title: "River Flows in You",
    artist: "Yiruma (adapted)",
    difficulty: "Medium",
    notes: [
      { note: "A4", lyric: "-" }, { note: "B4", lyric: "-" },
      { note: "C5", lyric: "-" }, { note: "B4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "E4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "G4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "E4", lyric: "-" },
      { note: "D4", lyric: "-" }, { note: "E4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "G4", lyric: "-" },
      { note: "E4", lyric: "-" }, { note: "D4", lyric: "-" },
      // Loop Extension
      { note: "A4", lyric: "-" }, { note: "B4", lyric: "-" },
      { note: "C5", lyric: "-" }, { note: "B4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "E4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "G4", lyric: "-" },
      { note: "A4", lyric: "-" }, { note: "E4", lyric: "-" },
      { note: "D4", lyric: "-" }, { note: "E4", lyric: "-" },
      { note: "G4", lyric: "-" }, { note: "F4", lyric: "-" },
      { note: "E4", lyric: "-" }, { note: "D4", lyric: "-" },
      { note: "C4", lyric: "-" }, { note: "D4", lyric: "-" },
      { note: "E4", lyric: "-" }, { note: "F4", lyric: "-" },
      { note: "G4", lyric: "-" }, { note: "A4", lyric: "-" }
    ]
  },
  {
    title: "My Heart Will Go On",
    artist: "Celine Dion (adapted)",
    difficulty: "Medium",
    notes: [
      // Verse
      { note: "E4", lyric: "Ev" }, { note: "F4", lyric: "ery" },
      { note: "F4", lyric: "night" }, { note: "F4", lyric: "in" },
      { note: "E4", lyric: "my" }, { note: "F4", lyric: "dreams" },
      { note: "G4", lyric: "I" }, { note: "A4", lyric: "see" },
      { note: "G4", lyric: "you" }, { note: "F4", lyric: "I" },
      { note: "E4", lyric: "feel" }, { note: "D4", lyric: "you" },
      { note: "E4", lyric: "That" }, { note: "F4", lyric: "is" },
      { note: "E4", lyric: "how" }, { note: "D4", lyric: "I" },
      { note: "C4", lyric: "know" }, { note: "D4", lyric: "you" },
      { note: "E4", lyric: "go" }, { note: "D4", lyric: "on" },
      // Chorus
      { note: "E4", lyric: "Near" }, { note: "F4", lyric: "Far" },
      { note: "G4", lyric: "Wher" }, { note: "A4", lyric: "ev" },
      { note: "G4", lyric: "er" }, { note: "F4", lyric: "you" },
      { note: "E4", lyric: "are" },
      { note: "D4", lyric: "I" }, { note: "E4", lyric: "be" },
      { note: "F4", lyric: "lieve" }, { note: "G4", lyric: "that" },
      { note: "A4", lyric: "the" }, { note: "G4", lyric: "heart" },
      { note: "F4", lyric: "does" }, { note: "E4", lyric: "go" },
      { note: "D4", lyric: "on" },
      { note: "C4", lyric: "-" }
    ]
  },
  {
    title: "Hallelujah",
    artist: "Leonard Cohen",
    difficulty: "Medium",
    notes: [
      // Verse
      { note: "E4", lyric: "I've" }, { note: "E4", lyric: "heard" },
      { note: "E4", lyric: "there" }, { note: "E4", lyric: "was" },
      { note: "E4", lyric: "a" }, { note: "D4", lyric: "se" },
      { note: "E4", lyric: "cret" }, { note: "F4", lyric: "chord" },
      { note: "G4", lyric: "That" }, { note: "G4", lyric: "Da" },
      { note: "G4", lyric: "vid" }, { note: "F4", lyric: "played" },
      { note: "E4", lyric: "and" }, { note: "D4", lyric: "it" },
      { note: "C4", lyric: "pleased" }, { note: "C4", lyric: "the" },
      { note: "D4", lyric: "Lord" },
      // Chorus
      { note: "F4", lyric: "Hal" }, { note: "A4", lyric: "le" },
      { note: "A4", lyric: "lu" }, { note: "A4", lyric: "jah" },
      { note: "G4", lyric: "Hal" }, { note: "E4", lyric: "le" },
      { note: "E4", lyric: "lu" }, { note: "E4", lyric: "jah" },
      { note: "F4", lyric: "Hal" }, { note: "A4", lyric: "le" },
      { note: "A4", lyric: "lu" }, { note: "A4", lyric: "jah" },
      { note: "G4", lyric: "Hal" }, { note: "E4", lyric: "le" },
      { note: "D4", lyric: "lu" }, { note: "C4", lyric: "jah" }
    ]
  },
  {
    title: "Yesterday",
    artist: "The Beatles",
    difficulty: "Easy",
    notes: [
      { note: "G4", lyric: "Yes" }, { note: "F4", lyric: "ter" },
      { note: "E4", lyric: "day" },
      { note: "D4", lyric: "All" }, { note: "E4", lyric: "my" },
      { note: "F4", lyric: "trou" }, { note: "E4", lyric: "bles" },
      { note: "D4", lyric: "seemed" }, { note: "C4", lyric: "so" },
      { note: "D4", lyric: "far" }, { note: "E4", lyric: "a" },
      { note: "F4", lyric: "way" },
      { note: "G4", lyric: "Now" }, { note: "F4", lyric: "it" },
      { note: "E4", lyric: "looks" }, { note: "D4", lyric: "as" },
      { note: "E4", lyric: "though" }, { note: "F4", lyric: "they're" },
      { note: "G4", lyric: "here" }, { note: "A4", lyric: "to" },
      { note: "G4", lyric: "stay" },
      { note: "F4", lyric: "Oh" },
      { note: "E4", lyric: "I" },
      { note: "D4", lyric: "be" }, { note: "E4", lyric: "lieve" },
      { note: "F4", lyric: "in" },
      { note: "G4", lyric: "yes" }, { note: "D4", lyric: "ter" },
      { note: "C4", lyric: "day" }
    ]
  },
  {
    title: "Moon River",
    artist: "Henry Mancini",
    difficulty: "Easy",
    notes: [
      // Part 1
      { note: "C4", lyric: "Moon" },
      { note: "E4", lyric: "Ri" }, { note: "F4", lyric: "ver" },
      { note: "G4", lyric: "wi" }, { note: "A4", lyric: "der" },
      { note: "G4", lyric: "than" }, { note: "F4", lyric: "a" },
      { note: "E4", lyric: "mile" },
      { note: "D4", lyric: "I'm" }, { note: "E4", lyric: "cross" },
      { note: "F4", lyric: "ing" }, { note: "G4", lyric: "you" },
      { note: "E4", lyric: "in" }, { note: "C4", lyric: "style" },
      { note: "D4", lyric: "some" }, { note: "E4", lyric: "day" },
      // Part 2
      { note: "C4", lyric: "Oh" },
      { note: "G4", lyric: "dream" }, { note: "F4", lyric: "ma" },
      { note: "E4", lyric: "ker" },
      { note: "C4", lyric: "you" },
      { note: "G4", lyric: "heart" }, { note: "F4", lyric: "brea" },
      { note: "E4", lyric: "ker" },
      { note: "D4", lyric: "wher" }, { note: "E4", lyric: "ev" },
      { note: "F4", lyric: "er" }, { note: "G4", lyric: "you're" },
      { note: "A4", lyric: "go" }, { note: "G4", lyric: "ing" },
      { note: "F4", lyric: "I'm" },
      { note: "E4", lyric: "go" }, { note: "D4", lyric: "ing" },
      { note: "C4", lyric: "your" }, { note: "D4", lyric: "way" }
    ]
  },
  {
    title: "Can't Help Falling in Love",
    artist: "Elvis Presley (adapted)",
    difficulty: "Easy",
    notes: [
      // Verse
      { note: "G4", lyric: "Wise" },
      { note: "A4", lyric: "men" },
      { note: "B4", lyric: "say" },
      { note: "G4", lyric: "on" }, { note: "E4", lyric: "ly" },
      { note: "F4", lyric: "fools" },
      { note: "G4", lyric: "rush" },
      { note: "A4", lyric: "in" },
      { note: "D4", lyric: "But" },
      { note: "E4", lyric: "I" },
      { note: "F4", lyric: "can't" },
      { note: "G4", lyric: "help" },
      { note: "A4", lyric: "fall" }, { note: "B4", lyric: "ing" },
      { note: "A4", lyric: "in" },
      { note: "G4", lyric: "love" },
      { note: "F4", lyric: "with" },
      { note: "G4", lyric: "you" },
      // Bridge
      { note: "E4", lyric: "Like" }, { note: "A4", lyric: "a" },
      { note: "G4", lyric: "riv" }, { note: "F4", lyric: "er" },
      { note: "E4", lyric: "flows" },
      { note: "E4", lyric: "sure" }, { note: "A4", lyric: "ly" },
      { note: "G4", lyric: "to" }, { note: "F4", lyric: "the" },
      { note: "E4", lyric: "sea" },
      { note: "E4", lyric: "Dar" }, { note: "A4", lyric: "ling" },
      { note: "G4", lyric: "so" }, { note: "F4", lyric: "it" },
      { note: "E4", lyric: "goes" },
      { note: "E4", lyric: "some" }, { note: "F4", lyric: "things" },
      { note: "G4", lyric: "are" }, { note: "A4", lyric: "meant" },
      { note: "B4", lyric: "to" }, { note: "C5", lyric: "be" }
    ]
  },
  {
    title: "Over the Rainbow",
    artist: "Judy Garland",
    difficulty: "Medium",
    notes: [
      { note: "C4", lyric: "Some" },
      { note: "C5", lyric: "where" },
      { note: "B4", lyric: "O" }, { note: "G4", lyric: "ver" },
      { note: "A4", lyric: "the" }, { note: "B4", lyric: "rain" },
      { note: "C5", lyric: "bow" },
      { note: "G4", lyric: "Way" },
      { note: "A4", lyric: "up" },
      { note: "B4", lyric: "high" },
      { note: "A4", lyric: "There's" },
      { note: "G4", lyric: "a" },
      { note: "A4", lyric: "land" },
      { note: "G4", lyric: "that" },
      { note: "C4", lyric: "I" },
      { note: "D4", lyric: "heard" },
      { note: "E4", lyric: "of" },
      { note: "C4", lyric: "Once" },
      { note: "D4", lyric: "in" },
      { note: "E4", lyric: "a" },
      { note: "F4", lyric: "lul" }, { note: "D4", lyric: "la" },
      { note: "C4", lyric: "by" }
    ]
  },
  {
    title: "Danny Boy",
    artist: "Traditional Irish",
    difficulty: "Easy",
    notes: [
      // Verse
      { note: "C4", lyric: "Oh" }, { note: "D4", lyric: "Dan" },
      { note: "E4", lyric: "ny" }, { note: "F4", lyric: "Boy" },
      { note: "G4", lyric: "the" }, { note: "A4", lyric: "pipes" },
      { note: "G4", lyric: "the" }, { note: "F4", lyric: "pipes" },
      { note: "E4", lyric: "are" }, { note: "F4", lyric: "call" },
      { note: "G4", lyric: "ing" },
      { note: "C4", lyric: "From" }, { note: "D4", lyric: "glen" },
      { note: "E4", lyric: "to" }, { note: "F4", lyric: "glen" },
      { note: "E4", lyric: "and" }, { note: "D4", lyric: "down" },
      { note: "C4", lyric: "the" }, { note: "D4", lyric: "moun" },
      { note: "E4", lyric: "tain" }, { note: "C4", lyric: "side" },
      // Chorus
      { note: "G4", lyric: "But" }, { note: "A4", lyric: "come" },
      { note: "C5", lyric: "ye" }, { note: "C5", lyric: "back" },
      { note: "B4", lyric: "when" }, { note: "A4", lyric: "sum" },
      { note: "G4", lyric: "mers" }, { note: "E4", lyric: "in" },
      { note: "D4", lyric: "the" }, { note: "C4", lyric: "mea" },
      { note: "D4", lyric: "dow" },
      { note: "E4", lyric: "Or" },
      { note: "G4", lyric: "when" }, { note: "A4", lyric: "the" },
      { note: "C5", lyric: "val" }, { note: "C5", lyric: "leys" },
      { note: "B4", lyric: "hushed" }, { note: "A4", lyric: "and" },
      { note: "G4", lyric: "white" }, { note: "E4", lyric: "with" },
      { note: "C5", lyric: "snow" }
    ]
  },
  {
    title: "Silent Night",
    artist: "Franz Gruber",
    difficulty: "Easy",
    notes: [
      // Verse
      { note: "G4", lyric: "Si" }, { note: "A4", lyric: "lent" },
      { note: "G4", lyric: "night" },
      { note: "E4", lyric: "Ho" }, { note: "F4", lyric: "ly" },
      { note: "E4", lyric: "night" },
      { note: "G4", lyric: "All" }, { note: "A4", lyric: "is" },
      { note: "G4", lyric: "calm" },
      { note: "G4", lyric: "All" }, { note: "A4", lyric: "is" },
      { note: "G4", lyric: "bright" },
      { note: "D5", lyric: "Round" }, { note: "D5", lyric: "yon" },
      { note: "B4", lyric: "vir" }, { note: "C5", lyric: "gin" },
      { note: "B4", lyric: "mo" }, { note: "G4", lyric: "ther" },
      { note: "A4", lyric: "and" }, { note: "G4", lyric: "child" },
      // Ending
      { note: "C5", lyric: "Sleep" }, { note: "C5", lyric: "in" },
      { note: "A4", lyric: "hea" }, { note: "F4", lyric: "ven" },
      { note: "G4", lyric: "ly" }, { note: "E4", lyric: "peace" },
      { note: "C4", lyric: "Sleep" },
      { note: "G4", lyric: "in" },
      { note: "F4", lyric: "hea" }, { note: "D4", lyric: "ven" },
      { note: "C4", lyric: "ly" }, { note: "C4", lyric: "peace" }
    ]
  },
  {
    title: "Auld Lang Syne",
    artist: "Traditional Scottish",
    difficulty: "Easy",
    notes: [
      // Verse
      { note: "G3", lyric: "Should" },
      { note: "C4", lyric: "auld" }, { note: "C4", lyric: "ac" },
      { note: "C4", lyric: "quain" }, { note: "E4", lyric: "tance" },
      { note: "D4", lyric: "be" }, { note: "C4", lyric: "for" },
      { note: "D4", lyric: "got" },
      { note: "E4", lyric: "and" }, { note: "D4", lyric: "ne" },
      { note: "C4", lyric: "ver" }, { note: "C4", lyric: "brought" },
      { note: "A3", lyric: "to" }, { note: "G3", lyric: "mind" },
      { note: "G3", lyric: "should" },
      { note: "C4", lyric: "auld" }, { note: "C4", lyric: "ac" },
      { note: "C4", lyric: "quain" }, { note: "E4", lyric: "tance" },
      { note: "G4", lyric: "be" }, { note: "A4", lyric: "for" },
      { note: "A4", lyric: "got" },
      { note: "A4", lyric: "and" }, { note: "G4", lyric: "days" },
      { note: "E4", lyric: "of" }, { note: "E4", lyric: "auld" },
      { note: "C4", lyric: "lang" }, { note: "D4", lyric: "syne" },
      // Chorus
      { note: "A4", lyric: "For" },
      { note: "G4", lyric: "auld" }, { note: "E4", lyric: "lang" },
      { note: "E4", lyric: "syne" }, { note: "C4", lyric: "my" },
      { note: "D4", lyric: "dear" },
      { note: "E4", lyric: "For" },
      { note: "G4", lyric: "auld" }, { note: "E4", lyric: "lang" },
      { note: "G4", lyric: "syne" },
      { note: "A4", lyric: "We'll" },
      { note: "A4", lyric: "take" }, { note: "G4", lyric: "a" },
      { note: "E4", lyric: "cup" }, { note: "E4", lyric: "of" },
      { note: "C4", lyric: "kind" }, { note: "D4", lyric: "ness" },
      { note: "C4", lyric: "yet" },
      { note: "A3", lyric: "For" }, { note: "G3", lyric: "auld" },
      { note: "A3", lyric: "lang" }, { note: "C4", lyric: "syne" }
    ]
  }
];