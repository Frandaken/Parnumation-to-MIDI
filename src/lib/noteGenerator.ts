export interface PitchInfo {
  name: string; // e.g. "C", "C#", "Db", "D", "Eb", etc.
  enharmonic: string; // e.g. "Db" for "C#"
  semitone: number; // 0..11
  isSharpOrFlat: boolean;
}

export interface SolfegeStepInfo {
  semitoneOffset: number; // 0 to 11
  solfegeSyllable: string; // "Do", "Di / Ra", "Re", "Ri / Me", "Mi", "Fa", "Fi / Se", "Sol", "Sel / Le", "La", "Li / Sa", "Si"
  solfegeSharp: string; // "Do", "Di", "Re", "Ri", "Mi", "Fa", "Fi", "Sol", "Sel", "La", "Li", "Si"
  solfegeFlat: string; // "Do", "Ra", "Re", "Me", "Mi", "Fa", "Se", "Sol", "Le", "La", "Sa", "Si"
  parnumationMiddle: string; // "1", "/1", "2", "/2", "3", "4", "/4", "5", "/5", "6", "/6", "7"
  parnumationFlatMiddle: string; // "1", "\\2", "2", "\\3", "3", "4", "\\5", "5", "\\6", "6", "\\7", "7"
  parnumationHigh: string; // "!", "/!", "@", "/@", "#", "$", "/$", "%", "/%", "^", "/^", "&"
  parnumationLow: string; // "q", "/q", "w", "/w", "e", "r", "/r", "t", "/t", "y", "/y", "u"
  notAngkaNumber: string; // "1", "1# / 2b", "2", "2# / 3b", "3", "4", "4# / 5b", "5", "5# / 6b", "6", "6# / 7b", "7"
  intervalName: string; // "Tonika (Unison)", "Sekon Minor (m2)", "Sekon Mayor (M2)", ...
  intervalRatio: string;
  isDiatonic: boolean;
}

export const CHROMATIC_PITCHES: PitchInfo[] = [
  { name: 'C', enharmonic: 'B#', semitone: 0, isSharpOrFlat: false },
  { name: 'C#', enharmonic: 'Db', semitone: 1, isSharpOrFlat: true },
  { name: 'D', enharmonic: 'D', semitone: 2, isSharpOrFlat: false },
  { name: 'D#', enharmonic: 'Eb', semitone: 3, isSharpOrFlat: true },
  { name: 'E', enharmonic: 'Fb', semitone: 4, isSharpOrFlat: false },
  { name: 'F', enharmonic: 'E#', semitone: 5, isSharpOrFlat: false },
  { name: 'F#', enharmonic: 'Gb', semitone: 6, isSharpOrFlat: true },
  { name: 'G', enharmonic: 'G', semitone: 7, isSharpOrFlat: false },
  { name: 'G#', enharmonic: 'Ab', semitone: 8, isSharpOrFlat: true },
  { name: 'A', enharmonic: 'A', semitone: 9, isSharpOrFlat: false },
  { name: 'A#', enharmonic: 'Bb', semitone: 10, isSharpOrFlat: true },
  { name: 'B', enharmonic: 'Cb', semitone: 11, isSharpOrFlat: false },
];

export const ROOT_KEY_OPTIONS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

export const ROOT_KEY_SEMITONES: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'DB': 1,
  'D': 2,
  'D#': 3, 'EB': 3,
  'E': 4, 'FB': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'GB': 6,
  'G': 7,
  'G#': 8, 'AB': 8,
  'A': 9,
  'A#': 10, 'BB': 10,
  'B': 11, 'CB': 11,
};

export const SOLFEGE_STEPS: SolfegeStepInfo[] = [
  {
    semitoneOffset: 0,
    solfegeSyllable: 'Do',
    solfegeSharp: 'Do',
    solfegeFlat: 'Do',
    parnumationMiddle: '1',
    parnumationFlatMiddle: '1',
    parnumationHigh: '!',
    parnumationLow: 'q',
    notAngkaNumber: '1',
    intervalName: 'Tonika (Unison / Perfect 1st)',
    intervalRatio: '1:1',
    isDiatonic: true,
  },
  {
    semitoneOffset: 1,
    solfegeSyllable: 'Di / Ra',
    solfegeSharp: 'Di (1 kres)',
    solfegeFlat: 'Ra (2 mol)',
    parnumationMiddle: '/1',
    parnumationFlatMiddle: '\\2',
    parnumationHigh: '/!',
    parnumationLow: '/q',
    notAngkaNumber: '/1 atau \\2',
    intervalName: 'Sekon Minor (m2) / +1 Semitone',
    intervalRatio: '16:15',
    isDiatonic: false,
  },
  {
    semitoneOffset: 2,
    solfegeSyllable: 'Re',
    solfegeSharp: 'Re',
    solfegeFlat: 'Re',
    parnumationMiddle: '2',
    parnumationFlatMiddle: '2',
    parnumationHigh: '@',
    parnumationLow: 'w',
    notAngkaNumber: '2',
    intervalName: 'Sekon Mayor (M2) / +2 Semitones',
    intervalRatio: '9:8',
    isDiatonic: true,
  },
  {
    semitoneOffset: 3,
    solfegeSyllable: 'Ri / Me',
    solfegeSharp: 'Ri (2 kres)',
    solfegeFlat: 'Me (3 mol)',
    parnumationMiddle: '/2',
    parnumationFlatMiddle: '\\3',
    parnumationHigh: '/@',
    parnumationLow: '/w',
    notAngkaNumber: '/2 atau \\3',
    intervalName: 'Terts Minor (m3) / +3 Semitones',
    intervalRatio: '6:5',
    isDiatonic: false,
  },
  {
    semitoneOffset: 4,
    solfegeSyllable: 'Mi',
    solfegeSharp: 'Mi',
    solfegeFlat: 'Mi',
    parnumationMiddle: '3',
    parnumationFlatMiddle: '3',
    parnumationHigh: '#',
    parnumationLow: 'e',
    notAngkaNumber: '3',
    intervalName: 'Terts Mayor (M3) / +4 Semitones',
    intervalRatio: '5:4',
    isDiatonic: true,
  },
  {
    semitoneOffset: 5,
    solfegeSyllable: 'Fa',
    solfegeSharp: 'Fa',
    solfegeFlat: 'Fa',
    parnumationMiddle: '4',
    parnumationFlatMiddle: '4',
    parnumationHigh: '$',
    parnumationLow: 'r',
    notAngkaNumber: '4',
    intervalName: 'Kuart Sempurna (P4) / +5 Semitones',
    intervalRatio: '4:3',
    isDiatonic: true,
  },
  {
    semitoneOffset: 6,
    solfegeSyllable: 'Fi / Se',
    solfegeSharp: 'Fi (4 kres)',
    solfegeFlat: 'Se (5 mol)',
    parnumationMiddle: '/4',
    parnumationFlatMiddle: '\\5',
    parnumationHigh: '/$',
    parnumationLow: '/r',
    notAngkaNumber: '/4 atau \\5',
    intervalName: 'Tritone / Kuart Berlebih (Aug 4th / Dim 5th)',
    intervalRatio: '45:32',
    isDiatonic: false,
  },
  {
    semitoneOffset: 7,
    solfegeSyllable: 'Sol',
    solfegeSharp: 'Sol',
    solfegeFlat: 'Sol',
    parnumationMiddle: '5',
    parnumationFlatMiddle: '5',
    parnumationHigh: '%',
    parnumationLow: 't',
    notAngkaNumber: '5',
    intervalName: 'Kuint Sempurna (P5) / +7 Semitones',
    intervalRatio: '3:2',
    isDiatonic: true,
  },
  {
    semitoneOffset: 8,
    solfegeSyllable: 'Sel / Le',
    solfegeSharp: 'Sel (5 kres)',
    solfegeFlat: 'Le (6 mol)',
    parnumationMiddle: '/5',
    parnumationFlatMiddle: '\\6',
    parnumationHigh: '/%',
    parnumationLow: '/t',
    notAngkaNumber: '/5 atau \\6',
    intervalName: 'Sekst Minor (m6) / Kuint Berlebih (+8 Semitones)',
    intervalRatio: '8:5',
    isDiatonic: false,
  },
  {
    semitoneOffset: 9,
    solfegeSyllable: 'La',
    solfegeSharp: 'La',
    solfegeFlat: 'La',
    parnumationMiddle: '6',
    parnumationFlatMiddle: '6',
    parnumationHigh: '^',
    parnumationLow: 'y',
    notAngkaNumber: '6',
    intervalName: 'Sekst Mayor (M6) / +9 Semitones',
    intervalRatio: '5:3',
    isDiatonic: true,
  },
  {
    semitoneOffset: 10,
    solfegeSyllable: 'Li / Sa',
    solfegeSharp: 'Li (6 kres)',
    solfegeFlat: 'Sa / Te (7 mol)',
    parnumationMiddle: '/6',
    parnumationFlatMiddle: '\\7',
    parnumationHigh: '/^',
    parnumationLow: '/y',
    notAngkaNumber: '/6 atau \\7',
    intervalName: 'Septim Minor (m7) / +10 Semitones',
    intervalRatio: '9:5',
    isDiatonic: false,
  },
  {
    semitoneOffset: 11,
    solfegeSyllable: 'Si',
    solfegeSharp: 'Si',
    solfegeFlat: 'Si',
    parnumationMiddle: '7',
    parnumationFlatMiddle: '7',
    parnumationHigh: '&',
    parnumationLow: 'u',
    notAngkaNumber: '7',
    intervalName: 'Septim Mayor (M7) / +11 Semitones',
    intervalRatio: '15:8',
    isDiatonic: true,
  },
];

/**
 * Normalizes pitch text (e.g. "c#", "Db", "re", "5", "/4")
 */
export function getRootKeySemitone(rootKey: string): number {
  const normalized = rootKey.trim().toUpperCase();
  return ROOT_KEY_SEMITONES[normalized] ?? 0;
}

/**
 * Calculates absolute MIDI note number and frequency for a note and octave
 */
export function calculateMidiAndFreq(semitone: number, octave: number = 4): { midi: number; freq: number; noteName: string } {
  const midi = 12 * (octave + 1) + (semitone % 12);
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const noteName = `${CHROMATIC_PITCHES[semitone % 12].name}${octave}`;
  return { midi, freq, noteName };
}

/**
 * Convert Note Name (e.g. "C#", "G", "Bb", "D4") to Solfège given Root Key (Do = X)
 */
export function convertPitchToSolfege(pitchName: string, rootKey: string, octave = 4) {
  const cleanPitch = pitchName.trim().toUpperCase().replace(/\d+$/, '');
  const targetSemitone = ROOT_KEY_SEMITONES[cleanPitch] ?? 0;
  const rootSemitone = getRootKeySemitone(rootKey);

  // Interval semitones from root (0 to 11)
  const offset = ((targetSemitone - rootSemitone) % 12 + 12) % 12;
  const step = SOLFEGE_STEPS[offset];

  // Frequency
  const { midi, freq, noteName } = calculateMidiAndFreq(targetSemitone, octave);

  return {
    pitchName: CHROMATIC_PITCHES[targetSemitone].name,
    enharmonic: CHROMATIC_PITCHES[targetSemitone].enharmonic,
    rootKey: rootKey.toUpperCase(),
    semitoneOffset: offset,
    solfege: step.solfegeSyllable,
    solfegeSharp: step.solfegeSharp,
    solfegeFlat: step.solfegeFlat,
    parnumation: step.parnumationMiddle,
    parnumationFlat: step.parnumationFlatMiddle,
    parnumationHigh: step.parnumationHigh,
    parnumationLow: step.parnumationLow,
    notAngka: step.notAngkaNumber,
    intervalName: step.intervalName,
    isDiatonic: step.isDiatonic,
    midiNote: midi,
    frequencyHz: freq,
    fullNoteName: noteName,
  };
}

/**
 * Convert Solfège / Not Angka (e.g. "2", "re", "/5", "sel", "fa", "!", "q") to Note Name given Root Key (Do = X)
 */
export function convertSolfegeToPitch(solfegeInput: string, rootKey: string, octave = 4) {
  const rootSemitone = getRootKeySemitone(rootKey);
  const q = solfegeInput.trim().toLowerCase();

  let offset = 0;
  let octaveShift = 0;

  // Syllable matching
  if (q === '1' || q === 'do') offset = 0;
  else if (q === '/1' || q === 'di' || q === '1#' || q === '1 kres') offset = 1;
  else if (q === '\\2' || q === 'ra' || q === '2b' || q === '2 mol') offset = 1;
  else if (q === '2' || q === 're') offset = 2;
  else if (q === '/2' || q === 'ri' || q === '2#' || q === '2 kres') offset = 3;
  else if (q === '\\3' || q === 'me' || q === '3b' || q === '3 mol') offset = 3;
  else if (q === '3' || q === 'mi') offset = 4;
  else if (q === '4' || q === 'fa') offset = 5;
  else if (q === '/4' || q === 'fi' || q === '4#' || q === '4 kres') offset = 6;
  else if (q === '\\5' || q === 'se' || q === '5b' || q === '5 mol') offset = 6;
  else if (q === '5' || q === 'sol') offset = 7;
  else if (q === '/5' || q === 'sel' || q === '5#' || q === '5 kres') offset = 8;
  else if (q === '\\6' || q === 'le' || q === '6b' || q === '6 mol') offset = 8;
  else if (q === '6' || q === 'la') offset = 9;
  else if (q === '/6' || q === 'li' || q === '6#' || q === '6 kres') offset = 10;
  else if (q === '\\7' || q === 'sa' || q === 'te' || q === '7b' || q === '7 mol') offset = 10;
  else if (q === '7' || q === 'si') offset = 11;
  // High Octave Shift chars
  else if (q === '!' || q === 'do tinggi') { offset = 0; octaveShift = 1; }
  else if (q === '@' || q === 're tinggi') { offset = 2; octaveShift = 1; }
  else if (q === '#' || q === 'mi tinggi') { offset = 4; octaveShift = 1; }
  else if (q === '$' || q === 'fa tinggi') { offset = 5; octaveShift = 1; }
  else if (q === '%' || q === 'sol tinggi') { offset = 7; octaveShift = 1; }
  else if (q === '^' || q === 'la tinggi') { offset = 9; octaveShift = 1; }
  else if (q === '&' || q === 'si tinggi') { offset = 11; octaveShift = 1; }
  // Low Octave Shift chars
  else if (q === 'q' || q === 'do rendah') { offset = 0; octaveShift = -1; }
  else if (q === 'w' || q === 're rendah') { offset = 2; octaveShift = -1; }
  else if (q === 'e' || q === 'mi rendah') { offset = 4; octaveShift = -1; }
  else if (q === 'r' || q === 'fa rendah') { offset = 5; octaveShift = -1; }
  else if (q === 't' || q === 'sol rendah') { offset = 7; octaveShift = -1; }
  else if (q === 'y' || q === 'la rendah') { offset = 9; octaveShift = -1; }
  else if (q === 'u' || q === 'si rendah') { offset = 11; octaveShift = -1; }

  const step = SOLFEGE_STEPS[offset];
  const targetSemitone = (rootSemitone + offset) % 12;
  const actualOctave = octave + octaveShift;
  const { midi, freq, noteName } = calculateMidiAndFreq(targetSemitone, actualOctave);

  return {
    solfegeInput,
    rootKey: rootKey.toUpperCase(),
    semitoneOffset: offset,
    stepInfo: step,
    pitchName: CHROMATIC_PITCHES[targetSemitone].name,
    enharmonic: CHROMATIC_PITCHES[targetSemitone].enharmonic,
    fullNoteName: noteName,
    midiNote: midi,
    frequencyHz: freq,
    octaveShift,
  };
}

/**
 * Get all 12 chromatic scale mappings for a given Root Key
 */
export function getChromaticScaleForRoot(rootKey: string, baseOctave = 4) {
  const rootSemitone = getRootKeySemitone(rootKey);

  return SOLFEGE_STEPS.map((step) => {
    const targetSemitone = (rootSemitone + step.semitoneOffset) % 12;
    const pitch = CHROMATIC_PITCHES[targetSemitone];
    const { midi, freq, noteName } = calculateMidiAndFreq(targetSemitone, baseOctave);

    return {
      step,
      pitch,
      midiNote: midi,
      frequencyHz: freq,
      fullNoteName: noteName,
    };
  });
}

/**
 * Predefined melodic / chord patterns generator for a given root key
 */
export interface GeneratedPattern {
  name: string;
  category: 'Scale' | 'Chord / Arpeggio' | 'Exercise';
  description: string;
  parnumationText: string;
}

export function generatePredefinedPatterns(rootKey: string): GeneratedPattern[] {
  return [
    {
      name: 'Tangga Nada Diatonis Mayor (Naik & Turun)',
      category: 'Scale',
      description: `Skala Mayor Do = ${rootKey} lengkap 1 oktaf dengan ketukan 4/4`,
      parnumationText: `// Tangga Nada Diatonis Do = ${rootKey}\n1 2 3 4 | 5 6 7 ! | ! 7 6 5 | 4 3 2 1 _`,
    },
    {
      name: 'Tangga Nada Kromatis Lengkap (12 Nada)',
      category: 'Scale',
      description: `Semua 12 nada kromatis (Kres) untuk Do = ${rootKey}`,
      parnumationText: `// Skala Kromatis Penuh Do = ${rootKey}\n1 /1 2 /2 | 3 4 /4 5 | /5 6 /6 7 | ! . . . _`,
    },
    {
      name: 'Tangga Nada Kromatis Mol (Desenden)',
      category: 'Scale',
      description: `Tangga nada kromatis menurun menggunakan notasi mol (\\)`,
      parnumationText: `// Skala Kromatis Mol Do = ${rootKey}\n! \\7 7 \\6 | 6 \\5 5 4 | 3 \\3 2 \\2 | 1 . . . _`,
    },
    {
      name: 'Arpeggio Mayor Triad (I - Do Mi Sol Do)',
      category: 'Chord / Arpeggio',
      description: `Arpeggio Akor Tonika Do - Mi - Sol - Do' dalam Do = ${rootKey}`,
      parnumationText: `// Arpeggio Akor I (Do-Mi-Sol) Do = ${rootKey}\n1 . 3 . | 5 . ! . | ! . 5 . | 3 . 1 . _`,
    },
    {
      name: 'Progresi Akor Harmoni SATB (I - IV - V - I)',
      category: 'Chord / Arpeggio',
      description: `Kadens harmonis klasik paduan suara 4 suara dalam Do = ${rootKey}`,
      parnumationText: `// Kadens Harmoni SATB I - IV - V - I (Do = ${rootKey})\nS: 3 . 4 . | 5 . 3 . | 2 . 5 . | 1 . . . _\nA: 1 . 1 . | 1 . 1 . | 7, . 2 . | 1 . . . _\nT: 5 . 6 . | 5 . 5 . | 5 . 4 . | 3 . . . _\nB: 1 . 4 . | 1 . 1 . | 5, . 5, . | 1 . . . _`,
    },
    {
      name: 'Latihan Vokal Solfeggio Melompat (Interval Jumps)',
      category: 'Exercise',
      description: 'Latihan interval Terts, Kuart, Kuint untuk pemanasan paduan suara',
      parnumationText: `// Latihan Solfeggio Interval Do = ${rootKey}\n1 3 2 4 | 3 5 4 6 | 5 7 6 ! | ! 5 3 1 _`,
    },
    {
      name: 'Rhythm Syncopation & Beams Flag Showcase',
      category: 'Exercise',
      description: 'Pola ritme kombinasi not 1/8 (j), perpanjang (.) dan fermata',
      parnumationText: `// Ritme Sinkopasi & Flag Do = ${rootKey}\n1 . j12 3 | j34 5 . 0 | j56 j54 3 2 | 1 . . . _`,
    },
  ];
}
