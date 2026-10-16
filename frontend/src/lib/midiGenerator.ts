import { ParsedNote, ParsedSong, VoiceTrack } from '../types';

export interface MidiInstrument {
  id: number;
  name: string;
  category: string;
}

export const MIDI_INSTRUMENTS: MidiInstrument[] = [
  { id: 52, name: 'Choir Aahs', category: 'Ensemble' },
  { id: 53, name: 'Voice Oohs', category: 'Ensemble' },
  { id: 54, name: 'Synth Voice', category: 'Ensemble' },
  { id: 0, name: 'Acoustic Grand Piano', category: 'Piano' },
  { id: 4, name: 'Electric Piano 1', category: 'Piano' },
  { id: 19, name: 'Church Organ', category: 'Organ' },
  { id: 48, name: 'String Ensemble 1', category: 'Strings' },
  { id: 40, name: 'Violin', category: 'Strings' },
  { id: 42, name: 'Cello', category: 'Strings' },
  { id: 73, name: 'Flute', category: 'Woodwind' },
  { id: 71, name: 'Clarinet', category: 'Woodwind' },
  { id: 56, name: 'Trumpet', category: 'Brass' },
];

/**
 * Converts integer to Variable-Length Quantity (VLQ) bytes used in MIDI standard
 */
function writeVarLength(value: number): number[] {
  let buffer = value & 0x7f;
  const bytes: number[] = [];

  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }

  return bytes;
}

/**
 * Helper to write string as ASCII bytes
 */
function stringToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i) & 0xff);
  }
  return bytes;
}

/**
 * Helper to convert 32-bit integer to 4 bytes (Big Endian)
 */
function write32Bit(value: number): number[] {
  return [
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  ];
}

/**
 * Helper to convert 16-bit integer to 2 bytes (Big Endian)
 */
function write16Bit(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

export interface MidiExportOptions {
  instrumentOverride?: number;
  voicesToExport?: string[]; // e.g. ['S'], ['S', 'A', 'T', 'B']
  ppq?: number; // Pulses Per Quarter Note (default 480)
}

/**
 * Builds a complete standard MIDI File (SMF Type 1 or Type 0) Uint8Array
 */
export function generateMidiBuffer(song: ParsedSong, options: MidiExportOptions = {}): Uint8Array {
  const ppq = options.ppq || 480;
  const selectedVoices = options.voicesToExport || song.tracks.map((t) => t.voice);

  const tracksToExport = song.tracks.filter((t) => selectedVoices.includes(t.voice));
  if (tracksToExport.length === 0) {
    throw new Error('Tidak ada trek suara yang dipilih untuk ekspor MIDI.');
  }

  // If exporting a single track or full multi-track:
  // Standard Type 1 uses Track 0 for conductor (tempo & time sig) + Track 1..N for notes
  const isType1 = tracksToExport.length > 1;
  const format = isType1 ? 1 : 0;
  const numTracks = isType1 ? tracksToExport.length + 1 : 1;

  const chunks: number[][] = [];

  // 1. Header Chunk
  const headerBytes: number[] = [
    0x4d, 0x54, 0x68, 0x64, // "MThd"
    ...write32Bit(6),        // Header length is always 6
    ...write16Bit(format),   // Format (0 or 1)
    ...write16Bit(numTracks),// Number of tracks
    ...write16Bit(ppq),      // Ticks per quarter note
  ];
  chunks.push(headerBytes);

  // Microseconds per quarter note (tempo)
  const bpm = Math.max(20, Math.min(300, song.metadata.bpm));
  const microPerQuarter = Math.round(60000000 / bpm);

  // 2. Conductor Track (Track 0) for Type 1
  if (isType1) {
    const conductorEvents: number[] = [];

    // Track Name Meta Event
    const titleBytes = stringToBytes(song.metadata.title || 'Parnumation Score');
    conductorEvents.push(0x00, 0xff, 0x03, ...writeVarLength(titleBytes.length), ...titleBytes);

    // Time Signature Meta Event
    // FF 58 04 nn dd cc bb
    const [num, den] = song.metadata.timeSignature;
    const denPower = Math.round(Math.log2(den)); // 4 -> 2 (2^2), 8 -> 3 (2^3)
    conductorEvents.push(0x00, 0xff, 0x58, 0x04, num, denPower, 24, 8);

    // Set Tempo Meta Event
    // FF 51 03 tt tt tt
    conductorEvents.push(
      0x00,
      0xff,
      0x51,
      0x03,
      (microPerQuarter >> 16) & 0xff,
      (microPerQuarter >> 8) & 0xff,
      microPerQuarter & 0xff
    );

    // End of Track Meta Event
    conductorEvents.push(0x00, 0xff, 0x2f, 0x00);

    const conductorChunk = [
      0x4d, 0x54, 0x72, 0x6b, // "MTrk"
      ...write32Bit(conductorEvents.length),
      ...conductorEvents,
    ];
    chunks.push(conductorChunk);
  }

  // 3. Note Tracks
  tracksToExport.forEach((track, trackIdx) => {
    const trackEvents: number[] = [];
    const channel = (track.channel ?? trackIdx) % 16;
    const program = options.instrumentOverride !== undefined ? options.instrumentOverride : track.program;

    // For single-track Type 0, write tempo and time signature in this track
    if (!isType1) {
      // Time Signature
      const [num, den] = song.metadata.timeSignature;
      const denPower = Math.round(Math.log2(den));
      trackEvents.push(0x00, 0xff, 0x58, 0x04, num, denPower, 24, 8);

      // Tempo
      trackEvents.push(
        0x00,
        0xff,
        0x51,
        0x03,
        (microPerQuarter >> 16) & 0xff,
        (microPerQuarter >> 8) & 0xff,
        microPerQuarter & 0xff
      );
    }

    // Track Name Meta Event
    const trackNameBytes = stringToBytes(track.name || `Voice ${track.voice}`);
    trackEvents.push(0x00, 0xff, 0x03, ...writeVarLength(trackNameBytes.length), ...trackNameBytes);

    // Program Change (Instrument)
    // 00 C[ch] [program]
    trackEvents.push(0x00, 0xc0 | channel, program & 0x7f);

    // Panning (CC 10)
    trackEvents.push(0x00, 0xb0 | channel, 0x0a, track.pan & 0x7f);

    // Volume (CC 7)
    trackEvents.push(0x00, 0xb0 | channel, 0x07, track.volume & 0x7f);

    // Generate chronological Note-On and Note-Off event list
    interface RawMidiEvent {
      tick: number;
      type: 'on' | 'off';
      note: number;
      velocity: number;
    }

    const rawEvents: RawMidiEvent[] = [];

    for (const n of track.notes) {
      if (n.pitch.isRest || n.pitch.midiNote <= 0) {
        continue;
      }

      const startTick = Math.round(n.beatOffset * ppq);
      const durationTicks = Math.max(1, Math.round(n.durationBeats * ppq));
      const endTick = startTick + durationTicks;
      const velocity = Math.max(1, Math.min(127, n.articulation.velocity || 88));

      rawEvents.push({
        tick: startTick,
        type: 'on',
        note: n.pitch.midiNote,
        velocity,
      });

      rawEvents.push({
        tick: endTick,
        type: 'off',
        note: n.pitch.midiNote,
        velocity: 0,
      });
    }

    // Sort events by tick (Note-offs before note-ons at exact same tick)
    rawEvents.sort((a, b) => {
      if (a.tick !== b.tick) return a.tick - b.tick;
      if (a.type === 'off' && b.type === 'on') return -1;
      if (a.type === 'on' && b.type === 'off') return 1;
      return 0;
    });

    let currentTick = 0;
    for (const evt of rawEvents) {
      const deltaTicks = Math.max(0, evt.tick - currentTick);
      currentTick = evt.tick;

      trackEvents.push(...writeVarLength(deltaTicks));

      if (evt.type === 'on') {
        trackEvents.push(0x90 | channel, evt.note & 0x7f, evt.velocity & 0x7f);
      } else {
        trackEvents.push(0x80 | channel, evt.note & 0x7f, 0x00);
      }
    }

    // End of Track Meta Event
    trackEvents.push(0x00, 0xff, 0x2f, 0x00);

    const trackChunk = [
      0x4d, 0x54, 0x72, 0x6b, // "MTrk"
      ...write32Bit(trackEvents.length),
      ...trackEvents,
    ];
    chunks.push(trackChunk);
  });

  // Flatten chunks into a single byte array
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Triggers a browser file download of the generated MIDI buffer
 */
export function downloadMidiFile(buffer: Uint8Array, filename: string) {
  const blob = new Blob([buffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.mid') ? filename : `${filename}.mid`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
