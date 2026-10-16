export type SATBVoice = 'S' | 'A' | 'T' | 'B' | 'M';

export interface NotePitch {
  solfege: string; // '1', '2', '3', '4', '5', '6', '7', '0', '.'
  noteNumber: number; // 1 to 7, 0 for rest
  octaveOffset: number; // -2, -1, 0, +1, +2
  midiNote: number; // Calculated absolute MIDI note number (e.g. 60 for C4)
  noteName: string; // e.g. "C4", "G#5", "Rest"
  isRest: boolean;
  isTie: boolean;
}

export interface Articulation {
  fermata?: boolean;
  slur?: 'small' | 'large' | 'start' | 'middle' | 'end' | 'short';
  underSlur?: 'z' | 'x' | 'c' | 'start' | 'middle' | 'end'; // 'z' (start bottom curve), 'x' (middle/extend bottom curve), 'c' (end bottom curve)
  beam?: 'b' | 'h'; // 'b' for 1-note beam, 'h' for 2-note beam (higher position)
  dynamic?: 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'cresc' | 'decresc';
  velocity: number; // 0-127
}

export interface ParsedNote {
  id: string;
  voice: SATBVoice;
  barIndex: number;
  beatOffset: number; // in quarter beats (0.0, 1.0, 1.5, etc.)
  durationBeats: number; // in quarter note units (e.g. 1.0 = quarter, 0.5 = eighth, 0.25 = sixteenth)
  pitch: NotePitch;
  rawSymbol: string;
  articulation: Articulation;
  timeSeconds?: number;
}

export interface VoiceTrack {
  voice: SATBVoice;
  name: string;
  notes: ParsedNote[];
  totalBeats: number;
  totalBars: number;
  channel: number; // 0 to 15
  program: number; // MIDI program number (e.g. 52 for Choir Aahs, 0 for Piano)
  pan: number; // 0 to 127
  volume: number; // 0 to 127
  isMuted?: boolean;
  isSolo?: boolean;
}

export interface SongMetadata {
  title: string;
  key: string; // e.g. "C", "G", "F#", "Bb", "D"
  keyRootMidi: number; // MIDI note for Do (C4 = 60, G4 = 67, etc.)
  bpm: number; // Beats per minute
  timeSignature: [number, number]; // [numerator, denominator] e.g. [4, 4], [3, 4]
  composer?: string;
  arranger?: string;
  interpretDotAsTie: boolean; // true = tie/sustain, false = rest
  unrollRepeats: boolean; // true = expand repeat bars
  fermataMultiplier: number; // 1.5 or 2.0
}

export interface ParsedSong {
  metadata: SongMetadata;
  tracks: VoiceTrack[];
  totalDurationSeconds: number;
  maxBeats: number;
  warnings: string[];
  rawText: string;
}

export interface PresetSong {
  id: string;
  title: string;
  category: 'SATB Choir' | 'Lagu Nasional' | 'Rhythm Test' | 'Demo';
  description: string;
  text: string;
}
