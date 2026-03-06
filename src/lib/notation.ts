export interface ScaleDefinition {
  name: string;
  abc: string;
}

export const SCALE_DICTIONARY: Record<string, ScaleDefinition> = {
  'A Major': {
    name: 'A Major',
    abc: 'X:1\nT:A Major\nM:4/4\nL:1/4\nK:A\nA, B, C D | E F G A | A G F E | D C B, A, |]'
  },
  'Ab Major': {
    name: 'Ab Major',
    abc: 'X:1\nT:Ab Major\nM:4/4\nL:1/4\nK:Ab\nA, B, C D | E F G A | A G F E | D C B, A, |]'
  },
  'B Major': {
    name: 'B Major',
    abc: 'X:1\nT:B Major\nM:4/4\nL:1/4\nK:B\nB, C D E | F G A B | B A G F | E D C B, |]'
  },
  'Bb Major': {
    name: 'Bb Major',
    abc: 'X:1\nT:Bb Major\nM:4/4\nL:1/4\nK:Bb\nB, C D E | F G A B | B A G F | E D C B, |]'
  },
  'C Major': {
    name: 'C Major',
    abc: 'X:1\nT:C Major\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c | c B A G | F E D C |]'
  },
  'D Major': {
    name: 'D Major',
    abc: 'X:1\nT:D Major\nM:4/4\nL:1/4\nK:D\nD E F G | A B c d | d c B A | G F E D |]'
  },
  'Db Major': {
    name: 'Db Major',
    abc: 'X:1\nT:Db Major\nM:4/4\nL:1/4\nK:Db\nD E F G | A B c d | d c B A | G F E D |]'
  },
  'E Major': {
    name: 'E Major',
    abc: 'X:1\nT:E Major\nM:4/4\nL:1/4\nK:E\nE F G A | B c d e | e d c B | A G F E |]'
  },
  'Eb Major': {
    name: 'Eb Major',
    abc: 'X:1\nT:Eb Major\nM:4/4\nL:1/4\nK:Eb\nE F G A | B c d e | e d c B | A G F E |]'
  },
  'F Major': {
    name: 'F Major',
    abc: 'X:1\nT:F Major\nM:4/4\nL:1/4\nK:F\nF G A B | c d e f | f e d c | B A G F |]'
  },
  'F# Major': {
    name: 'F# Major',
    abc: 'X:1\nT:F# Major\nM:4/4\nL:1/4\nK:F#\nF G A B | c d e f | f e d c | B A G F |]'
  },
  'G Major': {
    name: 'G Major',
    abc: 'X:1\nT:G Major\nM:4/4\nL:1/4\nK:G\nG A B c | d e f g | g f e d | c B A G |]'
  },
  'G': {
    name: 'G Major',
    abc: 'X:1\nT:G Major\nM:4/4\nL:1/4\nK:G\nG A B c | d e f g | g f e d | c B A G |]'
  },
  'A min Harmonic': {
    name: 'A min Harmonic',
    abc: 'X:1\nT:A min Harmonic\nM:4/4\nL:1/4\nK:Am\nA, B, C D | E F ^G A | A ^G F E | D C B, A, |]'
  },
  'A min Melodic': {
    name: 'A min Melodic',
    abc: 'X:1\nT:A min Melodic\nM:4/4\nL:1/4\nK:Am\nA, B, C D | E ^F ^G A | A =G =F E | D C B, A, |]'
  },
  'B min Harmonic': {
    name: 'B min Harmonic',
    abc: 'X:1\nT:B min Harmonic\nM:4/4\nL:1/4\nK:Bm\nB, C D E | F G ^A B | B ^A G F | E D C B, |]'
  },
  'B min Melodic': {
    name: 'B min Melodic',
    abc: 'X:1\nT:B min Melodic\nM:4/4\nL:1/4\nK:Bm\nB, C D E | F ^G ^A B | B =A =G F | E D C B, |]'
  },
  'Bb min Harmonic': {
    name: 'Bb min Harmonic',
    abc: 'X:1\nT:Bb min Harmonic\nM:4/4\nL:1/4\nK:Bbm\nB, C D E | F G =A B | B =A G F | E D C B, |]'
  },
  'Bb min Melodic': {
    name: 'Bb min Melodic',
    abc: 'X:1\nT:Bb min Melodic\nM:4/4\nL:1/4\nK:Bbm\nB, C D E | F =G =A B | B _A _G F | E D C B, |]'
  },
  'C min Harmonic': {
    name: 'C min Harmonic',
    abc: 'X:1\nT:C min Harmonic\nM:4/4\nL:1/4\nK:Cm\nC D E F | G A =B c | c =B A G | F E D C |]'
  },
  'C min Melodic': {
    name: 'C min Melodic',
    abc: 'X:1\nT:C min Melodic\nM:4/4\nL:1/4\nK:Cm\nC D E F | G =A =B c | c _B _A G | F E D C |]'
  },
  'C# min Harmonic': {
    name: 'C# min Harmonic',
    abc: 'X:1\nT:C# min Harmonic\nM:4/4\nL:1/4\nK:C#m\nC D E F | G A ^B c | c ^B A G | F E D C |]'
  },
  'C# min Melodic': {
    name: 'C# min Melodic',
    abc: 'X:1\nT:C# min Melodic\nM:4/4\nL:1/4\nK:C#m\nC D E F | G ^A ^B c | c =B =A G | F E D C |]'
  },
  'D min Harmonic': {
    name: 'D min Harmonic',
    abc: 'X:1\nT:D min Harmonic\nM:4/4\nL:1/4\nK:Dm\nD E F G | A B ^c d | d ^c B A | G F E D |]'
  },
  'D min Melodic': {
    name: 'D min Melodic',
    abc: 'X:1\nT:D min Melodic\nM:4/4\nL:1/4\nK:Dm\nD E F G | A =B ^c d | d =c _B A | G F E D |]'
  },
  'D# min Harmonic': {
    name: 'D# min Harmonic',
    abc: 'X:1\nT:D# min Harmonic\nM:4/4\nL:1/4\nK:D#m\nD E F G | A B ^^c d | d ^^c B A | G F E D |]'
  },
  'D# min Melodic': {
    name: 'D# min Melodic',
    abc: 'X:1\nT:D# min Melodic\nM:4/4\nL:1/4\nK:D#m\nD E F G | A ^B ^^c d | d ^c =B A | G F E D |]'
  },
  'E min Harmonic': {
    name: 'E min Harmonic',
    abc: 'X:1\nT:E min Harmonic\nM:4/4\nL:1/4\nK:Em\nE F G A | B c ^d e | e ^d c B | A G F E |]'
  },
  'E min Melodic': {
    name: 'E min Melodic',
    abc: 'X:1\nT:E min Melodic\nM:4/4\nL:1/4\nK:Em\nE F G A | B ^c ^d e | e =d =c B | A G F E |]'
  },
  'F min Harmonic': {
    name: 'F min Harmonic',
    abc: 'X:1\nT:F min Harmonic\nM:4/4\nL:1/4\nK:Fm\nF G A B | c d =e f | f =e d c | B A G F |]'
  },
  'F min Melodic': {
    name: 'F min Melodic',
    abc: 'X:1\nT:F min Melodic\nM:4/4\nL:1/4\nK:Fm\nF G A B | c =d =e f | f _e _d c | B A G F |]'
  },
  'F# min Harmonic': {
    name: 'F# min Harmonic',
    abc: 'X:1\nT:F# min Harmonic\nM:4/4\nL:1/4\nK:F#m\nF G A B | c d ^e f | f ^e d c | B A G F |]'
  },
  'F# min Melodic': {
    name: 'F# min Melodic',
    abc: 'X:1\nT:F# min Melodic\nM:4/4\nL:1/4\nK:F#m\nF G A B | c ^d ^e f | f =e =d c | B A G F |]'
  },
  'G min Harmonic': {
    name: 'G min Harmonic',
    abc: 'X:1\nT:G min Harmonic\nM:4/4\nL:1/4\nK:Gm\nG A B c | d e ^f g | g ^f e d | c B A G |]'
  },
  'G min Melodic': {
    name: 'G min Melodic',
    abc: 'X:1\nT:G min Melodic\nM:4/4\nL:1/4\nK:Gm\nG A B c | d =e ^f g | g =f _e d | c B A G |]'
  },
  'G# min Harmonic': {
    name: 'G# min Harmonic',
    abc: 'X:1\nT:G# min Harmonic\nM:4/4\nL:1/4\nK:G#m\nG A B c | d e ^^f g | g ^^f e d | c B A G |]'
  },
  'G# min Melodic': {
    name: 'G# min Melodic',
    abc: 'X:1\nT:G# min Melodic\nM:4/4\nL:1/4\nK:G#m\nG A B c | d ^e ^^f g | g ^f =e d | c B A G |]'
  },
};

export const STANDARD_SCALE_NAMES = Object.keys(SCALE_DICTIONARY).filter(k => k !== 'G');
// Actually, let's just make a list of unique names.
export const UNIQUE_SCALE_NAMES = Array.from(new Set(Object.values(SCALE_DICTIONARY).map(s => s.name))).sort();

/**
 * Extracts the base scale name by removing any appended octave information.
 * Example: "G Major - 2 Octaves" -> "G Major"
 */
export function getBaseScaleName(scaleStr: string): string {
  return scaleStr.replace(/\s*-\s*\d+\s*Octave[s]?$/, '').trim();
}

/**
 * Extracts the requested octave count from a string.
 */
export function getOctaveCount(scaleStr: string): number {
  const match = scaleStr.match(/-\s*(\d+)\s*Octave/);
  return match ? parseInt(match[1], 10) : 1;
}

function shiftNoteUpOctave(note: string): string {
  const match = note.match(/^([\^\=_]?)([A-Ga-g])([\,\']*)$/);
  if (!match) return note;
  const acc = match[1];
  let letter = match[2];
  let mods = match[3];

  if (mods.includes(',')) {
    mods = mods.replace(',', '');
  } else if (letter >= 'A' && letter <= 'G') {
    letter = letter.toLowerCase();
  } else {
    mods += "'";
  }
  return `${acc}${letter}${mods}`;
}

function shiftNoteDownOctave(note: string): string {
  const match = note.match(/^([\^\=_]?)([A-Ga-g])([\,\']*)$/);
  if (!match) return note;
  const acc = match[1];
  let letter = match[2];
  let mods = match[3];

  if (mods.includes("'")) {
    mods = mods.replace("'", "");
  } else if (letter >= 'a' && letter <= 'g') {
    letter = letter.toUpperCase();
  } else {
    mods += ",";
  }
  return `${acc}${letter}${mods}`;
}

function shiftNotesBy(notes: string[], numOctaves: number): string[] {
  let shifted = [...notes];
  if (numOctaves > 0) {
    for (let o = 0; o < numOctaves; o++) {
      shifted = shifted.map(shiftNoteUpOctave);
    }
  } else if (numOctaves < 0) {
    for (let o = 0; o < -numOctaves; o++) {
      shifted = shifted.map(shiftNoteDownOctave);
    }
  }
  return shifted;
}

/**
 * Generates an ABC notation string extended to N octaves dynamically
 * by repeating and shifting the base scale's notes.
 */
export function generateMultiOctaveABC(baseDef: ScaleDefinition, octaves: number): string {
  if (octaves === 1) return baseDef.abc;

  // Assume the last line of the ABC string contains the notes
  const lines = baseDef.abc.split('\n');
  const preamble = lines.slice(0, lines.length - 1).join('\n');
  const notesLine = lines[lines.length - 1];

  // Extract clean notes by splitting at spaces and removing barlines
  const cleanLine = notesLine.replace(/\|\]?/g, '').trim();
  const notes = cleanLine.split(/\s+/).filter(n => n.length > 0);

  // Identify ascending and descending halves
  // Standard base structures have 16 notes: 8 ascending, 8 descending
  const halfLen = Math.floor(notes.length / 2);
  const ascHalf = notes.slice(0, halfLen);
  const descHalf = notes.slice(halfLen);

  const shiftBaseDown = /^(E |E min|F|G)/.test(baseDef.name) || baseDef.name === 'G';

  const finalAscend: string[] = [];
  // For each additional octave, we want the first (length-1) notes
  for (let i = 0; i < octaves; i++) {
    const shiftAmt = shiftBaseDown ? i - 1 : i;
    // All passes except last, take 7 notes. Last pass, take 8 to cap it.
    if (i === octaves - 1) {
      finalAscend.push(...shiftNotesBy(ascHalf, shiftAmt));
    } else {
      finalAscend.push(...shiftNotesBy(ascHalf.slice(0, ascHalf.length - 1), shiftAmt));
    }
  }

  const finalDescend: string[] = [];
  // For descending, we do exactly the reverse
  for (let i = octaves - 1; i >= 0; i--) {
    const shiftAmt = shiftBaseDown ? i - 1 : i;
    if (i === octaves - 1) {
      finalDescend.push(...shiftNotesBy(descHalf, shiftAmt));
    } else {
      // For subsequent octaves down, we skip the root note at the top since
      // the previous segment just landed on it (or actually skip the top note).
      // Wait, in descending base `c B A G | F E D C`, `c` is the top note.
      // So if we just finished `c ... C`, the next block down would be `C ... C,`
      // We should omit the first note of the lower segment to avoid repeating the junction
      finalDescend.push(...shiftNotesBy(descHalf.slice(1, descHalf.length), shiftAmt));
    }
  }

  const allNotes = finalAscend.concat(finalDescend);

  // Group by 4 into measures!
  const measures: string[] = [];
  for (let i = 0; i < allNotes.length; i += 4) {
    measures.push(allNotes.slice(i, i + 4).join(' '));
  }

  return `${preamble}\n${measures.join(' | ')} |]`;
}

