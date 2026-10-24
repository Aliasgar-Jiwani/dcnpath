/**
 * Framing Algorithms: HDLC Bit Stuffing and BISYNC Byte Stuffing
 * Forouzan Chapter 11
 */

export interface BitStuffResult {
  original: string;
  stuffed: string;
  stuffedIndices: number[]; // indices in stuffed string where '0' was inserted
  fiveOnesCount: number;
}

export interface BitUnstuffResult {
  stuffed: string;
  unstuffed: string;
  removedIndices: number[];
  hasFlagViolation: boolean;
}

/**
 * HDLC Bit Stuffing:
 * A 0 bit is stuffed into the data whenever 5 consecutive 1 bits are encountered,
 * ensuring the flag sequence '01111110' (0x7E) never appears inside the payload.
 */
export function bitStuff(rawBits: string): BitStuffResult {
  const clean = rawBits.replace(/[^01]/g, '');
  let stuffed = '';
  const stuffedIndices: number[] = [];
  let consecutiveOnes = 0;
  let fiveOnesCount = 0;

  for (let i = 0; i < clean.length; i++) {
    const bit = clean[i];
    stuffed += bit;

    if (bit === '1') {
      consecutiveOnes++;
      if (consecutiveOnes === 5) {
        // Stuff a '0'
        stuffed += '0';
        stuffedIndices.push(stuffed.length - 1);
        consecutiveOnes = 0; // reset counter after stuffing
        fiveOnesCount++;
      }
    } else {
      consecutiveOnes = 0;
    }
  }

  return {
    original: clean,
    stuffed,
    stuffedIndices,
    fiveOnesCount,
  };
}

/**
 * HDLC Bit Unstuffing:
 * Scans for five consecutive 1s followed by a 0. If found, removes the 0.
 * If five 1s followed by a 1, it may indicate a Flag or an error.
 */
export function bitUnstuff(stuffedBits: string): BitUnstuffResult {
  const clean = stuffedBits.replace(/[^01]/g, '');
  let unstuffed = '';
  const removedIndices: number[] = [];
  let consecutiveOnes = 0;
  let hasFlagViolation = false;

  for (let i = 0; i < clean.length; i++) {
    const bit = clean[i];

    if (consecutiveOnes === 5) {
      if (bit === '0') {
        // This is a stuffed bit — remove it
        removedIndices.push(i);
        consecutiveOnes = 0;
        continue;
      } else {
        // Six consecutive 1s! Flag sequence or error
        hasFlagViolation = true;
      }
    }

    unstuffed += bit;

    if (bit === '1') {
      consecutiveOnes++;
    } else {
      consecutiveOnes = 0;
    }
  }

  return {
    stuffed: clean,
    unstuffed,
    removedIndices,
    hasFlagViolation,
  };
}

/**
 * Character-Oriented Byte Stuffing (e.g. BISYNC, PPP):
 * Inserts ESC before any occurrence of FLAG or ESC in the payload.
 */
export function byteStuff(
  characters: string[],
  flag = 'FLAG',
  esc = 'ESC'
): { stuffed: string[]; escapedCount: number } {
  const stuffed: string[] = [];
  let escapedCount = 0;

  for (const char of characters) {
    if (char === flag || char === esc) {
      stuffed.push(esc);
      escapedCount++;
    }
    stuffed.push(char);
  }

  return { stuffed, escapedCount };
}

/**
 * Byte Unstuffing:
 * Removes ESC and takes the subsequent character literally.
 */
export function byteUnstuff(
  stuffed: string[],
  esc = 'ESC'
): { unstuffed: string[]; isValid: boolean } {
  const unstuffed: string[] = [];
  let i = 0;
  let isValid = true;

  while (i < stuffed.length) {
    const cur = stuffed[i];
    if (cur === undefined) break;

    if (cur === esc) {
      i++;
      const next = stuffed[i];
      if (next !== undefined) {
        unstuffed.push(next);
      } else {
        isValid = false; // trailing ESC with no byte following
      }
    } else {
      unstuffed.push(cur);
    }
    i++;
  }

  return { unstuffed, isValid };
}
