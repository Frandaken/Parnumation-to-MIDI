import { ParsedNote, ParsedSong, SATBVoice, SongMetadata, VoiceTrack } from '../types';

export const KEY_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'B#': 0, 'DO': 0, '1': 0,
  'C#': 1, 'DB': 1, 'CIS': 1, 'DES': 1,
  'D': 2, 'RE': 2, '2': 2,
  'D#': 3, 'EB': 3, 'DIS': 3, 'ES': 3,
  'E': 4, 'MI': 4, '3': 4, 'FB': 4,
  'F': 5, 'FA': 5, '4': 5, 'E#': 5,
  'F#': 6, 'GB': 6, 'FIS': 6, 'GES': 6,
  'G': 7, 'SOL': 7, '5': 7,
  'G#': 8, 'AB': 8, 'GIS': 8, 'AS': 8,
  'A': 9, 'LA': 9, '6': 9,
  'A#': 10, 'BB': 10, 'BES': 10, 'AIS': 10,
  'B': 11, 'SI': 11, '7': 11, 'CB': 11,
};

export const SCALE_INTERVALS: Record<number, number> = {
  1: 0,  // Do
  2: 2,  // Re
  3: 4,  // Mi
  4: 5,  // Fa
  5: 7,  // Sol
  6: 9,  // La
  7: 11, // Si
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToNoteName(midi: number): string {
  if (midi < 0 || midi > 127) return `N/A`;
  const name = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

// Map characters to Solfège (1-7), Octave offset (-1, 0, +1)
const CHAR_TO_PITCH: Record<string, { note: number; octave: number; solfege: string }> = {
  // Middle Octave
  '1': { note: 1, octave: 0, solfege: '1' },
  '2': { note: 2, octave: 0, solfege: '2' },
  '3': { note: 3, octave: 0, solfege: '3' },
  '4': { note: 4, octave: 0, solfege: '4' },
  '5': { note: 5, octave: 0, solfege: '5' },
  '6': { note: 6, octave: 0, solfege: '6' },
  '7': { note: 7, octave: 0, solfege: '7' },
  
  // High Octave (+1, Shift 1-7)
  '!': { note: 1, octave: 1, solfege: '1' },
  '@': { note: 2, octave: 1, solfege: '2' },
  '#': { note: 3, octave: 1, solfege: '3' },
  '$': { note: 4, octave: 1, solfege: '4' },
  '%': { note: 5, octave: 1, solfege: '5' },
  '^': { note: 6, octave: 1, solfege: '6' },
  '&': { note: 7, octave: 1, solfege: '7' },

  // Low Octave (-1, qwertyu)
  'q': { note: 1, octave: -1, solfege: '1' },
  'w': { note: 2, octave: -1, solfege: '2' },
  'e': { note: 3, octave: -1, solfege: '3' },
  'r': { note: 4, octave: -1, solfege: '4' },
  't': { note: 5, octave: -1, solfege: '5' },
  'y': { note: 6, octave: -1, solfege: '6' },
  'u': { note: 7, octave: -1, solfege: '7' },

  // Rest
  '0': { note: 0, octave: 0, solfege: '0' },
};

export const DEFAULT_METADATA: SongMetadata = {
  title: 'Untitled Parnumation',
  key: 'C',
  keyRootMidi: 60, // C4
  bpm: 100,
  timeSignature: [4, 4],
  composer: '',
  arranger: '',
  interpretDotAsTie: true,
  unrollRepeats: true,
  fermataMultiplier: 1.75,
};

export function parseMetadata(text: string): { metadata: SongMetadata; cleanedLines: string[] } {
  const metadata: SongMetadata = { ...DEFAULT_METADATA };
  const cleanedLines: string[] = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    // Comment lines starting with // or ;
    if (trimmed.startsWith('//') || trimmed.startsWith(';')) {
      continue;
    }

    // Match Judul / Title
    const titleMatch = trimmed.match(/^(?:judul|title)\s*:\s*(.+)$/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
      continue;
    }

    // Match Komposer / Composer
    const compMatch = trimmed.match(/^(?:komposer|composer|cipt(?:aan)?)\s*:\s*(.+)$/i);
    if (compMatch) {
      metadata.composer = compMatch[1].trim();
      continue;
    }

    // Match Arranger
    const arrMatch = trimmed.match(/^(?:arranger|arr|aransemen)\s*:\s*(.+)$/i);
    if (arrMatch) {
      metadata.arranger = arrMatch[1].trim();
      continue;
    }

    // Match Key / Nada Dasar / 1= / Do=
    const keyMatch = trimmed.match(/^(?:nada dasar|key|do\s*=|1\s*=)\s*:?\s*([A-Ga-g][#bB]?|\d)\b/i) ||
                     trimmed.match(/\b(?:do\s*=|1\s*=)\s*([A-Ga-g][#bB]?)/i);
    if (keyMatch) {
      const rawKey = keyMatch[1].toUpperCase();
      const semitone = KEY_TO_SEMITONE[rawKey] ?? 0;
      metadata.key = rawKey;
      metadata.keyRootMidi = 60 + semitone;
      continue;
    }

    // Match Tempo / BPM / MM
    const tempoMatch = trimmed.match(/(?:tempo|bpm|mm)\s*[:=]?\s*(\d{2,3})/i);
    if (tempoMatch) {
      const parsedBpm = parseInt(tempoMatch[1], 10);
      if (parsedBpm >= 30 && parsedBpm <= 300) {
        metadata.bpm = parsedBpm;
      }
      continue;
    }

    // Match Birama / Time Signature (4/4, 3/4, 2/4, 6/8, etc.)
    const timeMatch = trimmed.match(/(?:birama|time|sukat)\s*[:=]?\s*(\d)\/(\d)/i) ||
                       trimmed.match(/^(\d)\/(\d)$/);
    if (timeMatch) {
      const num = parseInt(timeMatch[1], 10);
      const den = parseInt(timeMatch[2], 10);
      if (num > 0 && [2, 4, 8, 16].includes(den)) {
        metadata.timeSignature = [num, den];
      }
      continue;
    }

    cleanedLines.push(line);
  }

  return { metadata, cleanedLines };
}

/**
 * Calculates MIDI pitch given note number (1-7), octave offset, key, and voice
 */
export function calculateMidiPitch(
  noteNum: number,
  octaveOffset: number,
  key: string,
  voice: SATBVoice,
  accidentalOffset: number = 0
): { midiNote: number; noteName: string } {
  if (noteNum === 0) {
    return { midiNote: 0, noteName: 'Rest' };
  }

  const keySemitone = KEY_TO_SEMITONE[key.toUpperCase()] ?? 0;
  const interval = SCALE_INTERVALS[noteNum] ?? 0;

  // Standard Voice Base Octaves
  // Soprano & Melody: Base C4 (MIDI 60)
  // Alto: Base C4 (transposed or natural)
  // Tenor: Base C3 (MIDI 48) (one octave lower)
  // Bass: Base C3 or C2 (MIDI 36 or 48)
  let baseOctaveOffset = 0;
  if (voice === 'T') {
    baseOctaveOffset = -1; // Tenor sings octave lower
  } else if (voice === 'B') {
    baseOctaveOffset = -1; // Bass sings octave lower (or -2 if very low)
  }

  const totalOctave = octaveOffset + baseOctaveOffset;
  const midiNote = 60 + keySemitone + interval + accidentalOffset + (totalOctave * 12);

  // Clamp within MIDI boundaries [0, 127]
  const clamped = Math.max(0, Math.min(127, midiNote));
  return {
    midiNote: clamped,
    noteName: midiToNoteName(clamped),
  };
}

export function getSolfegeSyllable(noteNum: number, accidental: number = 0): string {
  if (noteNum === 0) return 'Rest';
  const SHARP_NAMES: Record<number, string> = {
    1: 'di',
    2: 'ri',
    3: 'mi#',
    4: 'fi',
    5: 'sel',
    6: 'lis',
    7: 'si#',
  };
  const FLAT_NAMES: Record<number, string> = {
    1: 'do♭',
    2: 'ra',
    3: 'me',
    4: 'fa♭',
    5: 'se',
    6: 'le',
    7: 'sa',
  };
  const NATURAL_NAMES: Record<number, string> = {
    1: 'do',
    2: 're',
    3: 'mi',
    4: 'fa',
    5: 'sol',
    6: 'la',
    7: 'si',
  };
  if (accidental > 0) return SHARP_NAMES[noteNum] || `${noteNum}#`;
  if (accidental < 0) return FLAT_NAMES[noteNum] || `${noteNum}b`;
  return NATURAL_NAMES[noteNum] || `${noteNum}`;
}

interface RawVoiceLine {
  voice: SATBVoice;
  content: string;
}

/**
 * Categorize lines into SATB voices
 */
function extractVoiceLines(lines: string[]): Record<SATBVoice, string[]> {
  const result: Record<SATBVoice, string[]> = {
    S: [],
    A: [],
    T: [],
    B: [],
    M: [],
  };

  let currentVoice: SATBVoice = 'M';
  let hasExplicitVoice = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for explicit voice prefix: S., S:, S), S (space), A., A:, T., T:, B., B:, M., M:
    // Support dot (.) or colon (:) or paren ()) or spaces
    const satbMatch = trimmed.match(/^([SATBM]|sopran(?:o)?|alto|tenor|bas(?:s)?|melod(?:i|y)?)(?:\s*[:.)]\s*|\s+)(.*)$/i);
    if (satbMatch) {
      hasExplicitVoice = true;
      const prefix = satbMatch[1].toUpperCase()[0] as SATBVoice;
      const content = satbMatch[2].trim();
      currentVoice = ['S', 'A', 'T', 'B', 'M'].includes(prefix) ? prefix : 'M';
      if (content) {
        result[currentVoice].push(content);
      }
    } else {
      // If no prefix, add to currentVoice (or M if no SATB tags yet)
      result[currentVoice].push(trimmed);
    }
  }

  return result;
}

/**
 * Main Parnumation Voice Parser
 */
export function parseVoiceContent(
  contentLines: string[],
  voice: SATBVoice,
  metadata: SongMetadata
): { notes: ParsedNote[]; totalBars: number; totalBeats: number; warnings: string[] } {
  const fullText = contentLines.join(' ');
  const notes: ParsedNote[] = [];
  const warnings: string[] = [];

  let currentBarIndex = 1;
  let currentBeatOffset = 0.0;
  let activeDuration = 1.0; // 1 beat = quarter note
  let currentVelocity = 88;

  // Track Beam decorations (b = 1 note beam, h = 2 note beam higher)
  let currentBeam: 'b' | 'h' | undefined = undefined;
  let beamRemainingCount = 0;

  // Track Slur / Legato curve (f = small curve 2 notes, g = large curve 3 notes / 2 notes spaced)
  let currentSlur: 'small' | 'large' | 'start' | 'middle' | 'end' | undefined = undefined;
  let slurRemainingCount = 0;
  let autoSlurSequence = false;

  // Track Custom Under-Slur / Bottom curve (z = start, x = middle/extend, c = end)
  let currentUnderSlur: 'z' | 'x' | 'c' | 'start' | 'middle' | 'end' | undefined = undefined;
  let underSlurRemainingCount = 0;
  let autoUnderSlurSequence = false;

  // Track Octave modifier (s = lower middle octave note by -1)
  let pendingOctaveMod = 0;

  // Track Accidental modifier (/ for sharp +1, \ for flat -1)
  let pendingAccidental = 0;

  // Track repeat sections
  const repeatStartBars: number[] = [];
  let noteCounter = 0;

  const tokens = fullText.split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    // Check for bar symbols
    if (token === '|' || token === ')' || token === '_') {
      currentBarIndex++;
      activeDuration = 1.0; // Reset duration flag on bar line
      continue;
    }

    if (token === '[' || token === '{' || token === '||:') {
      repeatStartBars.push(currentBarIndex);
      activeDuration = 1.0;
      continue;
    }

    if (token === ']' || token === '}' || token === ':||') {
      // End repeat marker
      activeDuration = 1.0;
      continue;
    }

    // Process token character by character
    let i = 0;
    while (i < token.length) {
      const char = token[i];

      // Bar delimiters inside token
      if (char === '|' || char === ')' || char === '_') {
        currentBarIndex++;
        activeDuration = 1.0;
        i++;
        continue;
      }
      if (char === '[' || char === '{') {
        repeatStartBars.push(currentBarIndex);
        activeDuration = 1.0;
        i++;
        continue;
      }
      if (char === ']' || char === '}') {
        activeDuration = 1.0;
        i++;
        continue;
      }

      // Duration flags: j (1/2), k (1/4), l (1/8)
      if (char === 'j' || char === 'J') {
        activeDuration = 0.5; // 1/2 beat
        i++;
        continue;
      }
      if (char === 'k' || char === 'K') {
        activeDuration = 0.25; // 1/4 beat
        i++;
        continue;
      }
      if (char === 'l' || char === 'L') {
        activeDuration = 0.125; // 1/8 beat
        i++;
        continue;
      }

      // Beam flags: b (1-not beam), h (2-not beam, higher position)
      if (char === 'b' || char === 'B') {
        currentBeam = 'b';
        beamRemainingCount = 1;
        i++;
        continue;
      }
      if (char === 'h' || char === 'H') {
        currentBeam = 'h';
        beamRemainingCount = 2;
        i++;
        continue;
      }

      // Slur / Curve flags: f (small curve 2 notes), g (large curve 3 notes / 2 notes with space)
      if (char === 'f' || char === 'F') {
        currentSlur = 'small';
        slurRemainingCount = 2;
        autoSlurSequence = false;
        i++;
        continue;
      }
      if (char === 'g' || char === 'G') {
        // Count note characters in rest of token
        let noteCharsInToken = 0;
        for (let c = i + 1; c < token.length; c++) {
          if (CHAR_TO_PITCH[token[c]]) noteCharsInToken++;
        }
        currentSlur = 'large';
        slurRemainingCount = noteCharsInToken >= 3 ? 3 : 2;
        autoSlurSequence = false;
        i++;
        continue;
      }

      // Custom Upper-Slur / Top curve flags: v (start / v..m), m (end)
      if (char === 'v' || char === 'V') {
        let noteCharsInToken = 0;
        for (let c = i + 1; c < token.length; c++) {
          if (CHAR_TO_PITCH[token[c]]) noteCharsInToken++;
        }
        if (noteCharsInToken >= 2 && !token.toLowerCase().includes('m')) {
          currentSlur = 'start';
          slurRemainingCount = noteCharsInToken;
          autoSlurSequence = true;
        } else {
          currentSlur = 'start';
          slurRemainingCount = 1;
          autoSlurSequence = false;
        }
        i++;
        continue;
      }
      if (char === 'm' || char === 'M') {
        currentSlur = 'end';
        slurRemainingCount = 1;
        autoSlurSequence = false;
        i++;
        continue;
      }

      // Custom Under-Slur / Bottom curve flags: z (start), x (middle/extend), c (end)
      if (char === 'z' || char === 'Z') {
        let noteCharsInToken = 0;
        for (let c = i + 1; c < token.length; c++) {
          if (CHAR_TO_PITCH[token[c]]) noteCharsInToken++;
        }
        if (noteCharsInToken >= 2 && !token.toLowerCase().includes('x') && !token.toLowerCase().includes('c')) {
          currentUnderSlur = 'z';
          underSlurRemainingCount = noteCharsInToken;
          autoUnderSlurSequence = true;
        } else {
          currentUnderSlur = 'z';
          underSlurRemainingCount = 1;
          autoUnderSlurSequence = false;
        }
        i++;
        continue;
      }
      if (char === 'x' || char === 'X') {
        currentUnderSlur = 'x';
        underSlurRemainingCount = 1;
        autoUnderSlurSequence = false;
        i++;
        continue;
      }
      if (char === 'c' || char === 'C') {
        currentUnderSlur = 'c';
        underSlurRemainingCount = 1;
        autoUnderSlurSequence = false;
        i++;
        continue;
      }

      // Octave modifier s: lowers middle octave note by 1 octave (e.g. s1 = q, s2 = w)
      if (char === 's' || char === 'S') {
        pendingOctaveMod = -1;
        i++;
        continue;
      }

      // Accidental prefix modifier: / or # (naik 1/2 nada: di, ri, fi, sel, lis), \ (turun 1/2 nada: ra, me, se, le, sa)
      if (char === '/' || char === '#') {
        pendingAccidental = 1;
        i++;
        continue;
      }
      if (char === '\\') {
        pendingAccidental = -1;
        i++;
        continue;
      }

      // Dynamic markings
      if (char === ':') {
        currentVelocity = Math.min(127, currentVelocity + 15);
        i++;
        continue;
      }
      if (char === ';') {
        currentVelocity = Math.max(40, currentVelocity - 15);
        i++;
        continue;
      }

      // Fermata marking
      let hasFermata = false;
      if (char === 'd' || char === 'D') {
        hasFermata = true;
        i++;
        if (i >= token.length) {
          // If standalone fermata at end of token, apply to last note
          if (notes.length > 0) {
            const lastNote = notes[notes.length - 1];
            lastNote.articulation.fermata = true;
            lastNote.durationBeats *= metadata.fermataMultiplier;
          }
          continue;
        }
      }

      // Check Dot (.) Tie or Rest
      if (char === '.') {
        const dur = activeDuration;
        if (metadata.interpretDotAsTie && notes.length > 0 && !notes[notes.length - 1].pitch.isRest) {
          // Sustain / extend previous note
          const prevNote = notes[notes.length - 1];
          prevNote.durationBeats += dur;
          currentBeatOffset += dur;
        } else {
          // Create a rest
          noteCounter++;
          notes.push({
            id: `${voice}-note-${noteCounter}`,
            voice,
            barIndex: currentBarIndex,
            beatOffset: currentBeatOffset,
            durationBeats: dur,
            pitch: {
              solfege: '.',
              noteNumber: 0,
              octaveOffset: 0,
              midiNote: 0,
              noteName: 'Rest',
              isRest: true,
              isTie: true,
            },
            rawSymbol: '.',
            articulation: {
              velocity: 0,
            },
          });
          currentBeatOffset += dur;
        }
        i++;
        continue;
      }

      // Check for Solfège Pitch character
      const pitchInfo = CHAR_TO_PITCH[char];
      if (pitchInfo) {
        let accidentalOffset = pendingAccidental;
        let octaveMod = pitchInfo.octave + pendingOctaveMod;
        let nextIdx = i + 1;
        const prefixStr = (pendingAccidental === 1 ? '/' : pendingAccidental === -1 ? '\\' : '') + (pendingOctaveMod < 0 ? 's' : '');
        let symbolStr = prefixStr + char;
        pendingAccidental = 0; // Reset after consumed
        pendingOctaveMod = 0; // Reset after consumed

        // Check for suffix octave modifiers '9' (+2), '8' (-2), comma ',' (-1), apostrophe "'" (+1)
        while (nextIdx < token.length && (token[nextIdx] === '9' || token[nextIdx] === '8' || token[nextIdx] === ',' || token[nextIdx] === '\'')) {
          const modChar = token[nextIdx];
          symbolStr += modChar;
          if (modChar === '9') {
            octaveMod += 2;
          } else if (modChar === '8') {
            octaveMod -= 2;
          } else if (modChar === ',') {
            octaveMod -= 1;
          } else if (modChar === '\'') {
            octaveMod += 1;
          }
          nextIdx++;
        }

        // Check for accidental suffixes like / (sharp/di), # (sharp), \ (flat/mol)
        if (nextIdx < token.length && (token[nextIdx] === '/' || token[nextIdx] === '#' || token[nextIdx] === '\\')) {
          const acc = token[nextIdx];
          symbolStr += acc;
          if (acc === '/' || acc === '#') accidentalOffset = 1;
          if (acc === '\\') accidentalOffset = -1;
          nextIdx++;
        }

        // Check for fermata suffix
        if (nextIdx < token.length && (token[nextIdx] === 'd' || token[nextIdx] === 'D')) {
          hasFermata = true;
          symbolStr += token[nextIdx];
          nextIdx++;
        }

        const isRest = pitchInfo.note === 0;
        let midiVal = 0;
        let noteName = 'Rest';

        if (!isRest) {
          const calculated = calculateMidiPitch(pitchInfo.note, octaveMod, metadata.key, voice, accidentalOffset);
          midiVal = calculated.midiNote;
          noteName = calculated.noteName;
        }

        const finalDuration = hasFermata ? activeDuration * metadata.fermataMultiplier : activeDuration;

        // Assign beam and slur if active
        let assignedBeam: 'b' | 'h' | undefined = undefined;
        if (beamRemainingCount > 0) {
          assignedBeam = currentBeam;
          beamRemainingCount--;
          if (beamRemainingCount === 0) currentBeam = undefined;
        }

        let assignedSlur: 'small' | 'large' | 'start' | 'middle' | 'end' | undefined = undefined;
        if (slurRemainingCount > 0) {
          if (autoSlurSequence) {
            if (currentSlur === 'start') {
              assignedSlur = 'start';
              currentSlur = slurRemainingCount > 2 ? 'middle' : 'end';
            } else if (currentSlur === 'middle') {
              assignedSlur = 'middle';
              if (slurRemainingCount === 2) currentSlur = 'end';
            } else {
              assignedSlur = 'end';
            }
          } else {
            assignedSlur = currentSlur;
          }
          slurRemainingCount--;
          if (slurRemainingCount === 0) {
            currentSlur = undefined;
            autoSlurSequence = false;
          }
        }

        let assignedUnderSlur: 'z' | 'x' | 'c' | 'start' | 'middle' | 'end' | undefined = undefined;
        if (underSlurRemainingCount > 0) {
          if (autoUnderSlurSequence) {
            if (currentUnderSlur === 'z') {
              assignedUnderSlur = 'z';
              currentUnderSlur = underSlurRemainingCount > 2 ? 'x' : 'c';
            } else if (currentUnderSlur === 'x') {
              assignedUnderSlur = 'x';
              if (underSlurRemainingCount === 2) currentUnderSlur = 'c';
            } else {
              assignedUnderSlur = 'c';
            }
          } else {
            assignedUnderSlur = currentUnderSlur;
          }
          underSlurRemainingCount--;
          if (underSlurRemainingCount === 0) {
            currentUnderSlur = undefined;
            autoUnderSlurSequence = false;
          }
        }

        const solfegeSyllable = isRest ? '0' : getSolfegeSyllable(pitchInfo.note, accidentalOffset);

        noteCounter++;
        notes.push({
          id: `${voice}-note-${noteCounter}`,
          voice,
          barIndex: currentBarIndex,
          beatOffset: currentBeatOffset,
          durationBeats: finalDuration,
          pitch: {
            solfege: solfegeSyllable,
            noteNumber: pitchInfo.note,
            octaveOffset: octaveMod,
            midiNote: midiVal,
            noteName,
            isRest,
            isTie: false,
          },
          rawSymbol: symbolStr,
          articulation: {
            fermata: hasFermata,
            beam: assignedBeam,
            slur: assignedSlur,
            underSlur: assignedUnderSlur,
            velocity: isRest ? 0 : currentVelocity,
          },
        });

        currentBeatOffset += finalDuration;
        i = nextIdx;
        continue;
      }

      // Unrecognized character
      if (!/[,\s\-_]/.test(char)) {
        warnings.push(`Bar ${currentBarIndex}: Karakter '${char}' tidak dikenali dalam aturan Parnumation.`);
      }
      i++;
    }
  }

  // Calculate time in seconds for each note
  const secondsPerBeat = 60.0 / metadata.bpm;
  for (const note of notes) {
    note.timeSeconds = note.beatOffset * secondsPerBeat;
  }

  return {
    notes,
    totalBars: currentBarIndex,
    totalBeats: currentBeatOffset,
    warnings,
  };
}

const VOICE_PRESETS: Record<SATBVoice, { name: string; channel: number; program: number; pan: number; volume: number }> = {
  S: { name: 'Soprano', channel: 0, program: 52, pan: 35, volume: 105 },  // Choir Aahs
  A: { name: 'Alto', channel: 1, program: 52, pan: 50, volume: 100 },
  T: { name: 'Tenor', channel: 2, program: 52, pan: 78, volume: 102 },
  B: { name: 'Bass', channel: 3, program: 52, pan: 95, volume: 105 },
  M: { name: 'Melody / Single Voice', channel: 0, program: 0, pan: 64, volume: 110 }, // Acoustic Grand Piano
};

/**
 * Main parser entry point
 */
export function parseParnumation(rawText: string, customOptions?: Partial<SongMetadata>): ParsedSong {
  const { metadata: extractedMetadata, cleanedLines } = parseMetadata(rawText);
  const metadata: SongMetadata = {
    ...extractedMetadata,
    ...customOptions,
  };

  const voiceLinesMap = extractVoiceLines(cleanedLines);
  const tracks: VoiceTrack[] = [];
  const allWarnings: string[] = [];
  let maxBeats = 0;

  const activeVoices: SATBVoice[] = [];
  (['S', 'A', 'T', 'B'] as SATBVoice[]).forEach(v => {
    if (voiceLinesMap[v].length > 0) {
      activeVoices.push(v);
    }
  });

  if (activeVoices.length === 0) {
    // Single melody voice
    if (voiceLinesMap.M.length > 0 || cleanedLines.length > 0) {
      activeVoices.push('M');
      if (voiceLinesMap.M.length === 0) {
        voiceLinesMap.M = cleanedLines;
      }
    }
  }

  for (const v of activeVoices) {
    const lines = voiceLinesMap[v];
    const parsed = parseVoiceContent(lines, v, metadata);
    allWarnings.push(...parsed.warnings);

    if (parsed.totalBeats > maxBeats) {
      maxBeats = parsed.totalBeats;
    }

    const preset = VOICE_PRESETS[v];
    tracks.push({
      voice: v,
      name: preset.name,
      notes: parsed.notes,
      totalBeats: parsed.totalBeats,
      totalBars: parsed.totalBars,
      channel: preset.channel,
      program: preset.program,
      pan: preset.pan,
      volume: preset.volume,
      isMuted: false,
      isSolo: false,
    });
  }

  const secondsPerBeat = 60.0 / metadata.bpm;
  const totalDurationSeconds = maxBeats * secondsPerBeat;

  return {
    metadata,
    tracks,
    totalDurationSeconds,
    maxBeats,
    warnings: allWarnings,
    rawText,
  };
}
