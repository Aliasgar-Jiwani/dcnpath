/**
 * Line Coding Schemes
 * NRZ-L, NRZ-I, RZ, Manchester, Differential Manchester, AMI, MLT-3
 * Forouzan Chapter 4
 */

export type LineCodeScheme =
  | 'NRZ-L'
  | 'NRZ-I'
  | 'RZ'
  | 'Manchester'
  | 'DiffManchester'
  | 'AMI'
  | 'MLT-3';

export interface BitSegment {
  bitIndex: number;
  bitValue: '0' | '1';
  firstHalfLevel: number; // -1, 0, +1
  secondHalfLevel: number; // -1, 0, +1
  hasStartTransition: boolean;
  hasMidTransition: boolean;
}

export interface LineCodeResult {
  scheme: LineCodeScheme;
  bits: string;
  segments: BitSegment[];
  /** Continuous sequence of levels sampled at 2 samples per bit [0.25, 0.75] */
  levelSamples: number[];
  /** Average signal level across the transmission (DC component indicator) */
  dcComponent: number;
  /** Total number of transitions (evaluates synchronization ability) */
  totalTransitions: number;
  /** Maximum consecutive bit intervals without any transition */
  maxNoTransitionStreak: number;
  dcNote: string;
  syncNote: string;
}

/**
 * Validates and sanitizes a binary bit string.
 * Strips whitespace, errors or ignores non-0/1 characters.
 */
export function sanitizeBitString(input: string): string {
  return input.replace(/[^01]/g, '');
}

/**
 * Pure function: Encodes a bit string according to the selected line coding scheme.
 */
export function lineCode(rawBits: string, scheme: LineCodeScheme): LineCodeResult {
  const bits = sanitizeBitString(rawBits);
  if (bits.length === 0) {
    return {
      scheme,
      bits: '',
      segments: [],
      levelSamples: [],
      dcComponent: 0,
      totalTransitions: 0,
      maxNoTransitionStreak: 0,
      dcNote: 'No data to transmit.',
      syncNote: 'No clocking information.',
    };
  }

  const segments: BitSegment[] = [];
  let prevLevel = 1; // Default starting state for NRZ-I / MLT-3
  let amiSign = 1; // Alternating polarity for AMI: starts with +1

  // MLT-3 state sequence: 0 -> +1 -> 0 -> -1 -> 0
  // Direction tracking: 1 means moving towards +1, -1 means moving towards -1
  let mltLevel = 0;
  let mltNextDirection = 1; // +1 or -1

  for (let i = 0; i < bits.length; i++) {
    const bit = bits[i] as '0' | '1';
    const prevSeg = i > 0 ? segments[i - 1] : undefined;
    let firstHalf = 0;
    let secondHalf = 0;
    let hasStartTrans = false;
    let hasMidTrans = false;

    switch (scheme) {
      case 'NRZ-L': {
        // Forouzan standard: 0 -> +1 (positive level), 1 -> -1 (negative level)
        const lvl = bit === '0' ? 1 : -1;
        firstHalf = lvl;
        secondHalf = lvl;
        hasMidTrans = false;
        hasStartTrans = prevSeg ? prevSeg.secondHalfLevel !== firstHalf : false;
        break;
      }

      case 'NRZ-I': {
        // Bit 1 causes inversion at bit start; Bit 0 causes no inversion
        if (bit === '1') {
          prevLevel = prevLevel === 1 ? -1 : 1;
          hasStartTrans = true;
        } else {
          hasStartTrans = false;
        }
        firstHalf = prevLevel;
        secondHalf = prevLevel;
        hasMidTrans = false;
        break;
      }

      case 'RZ': {
        // Return to zero:
        // Bit 1: +1 for first half, 0 for second half
        // Bit 0: -1 for first half, 0 for second half
        if (bit === '1') {
          firstHalf = 1;
        } else {
          firstHalf = -1;
        }
        secondHalf = 0;
        hasStartTrans = prevSeg ? prevSeg.secondHalfLevel !== firstHalf : true;
        hasMidTrans = true; // always transitions to 0 in middle
        break;
      }

      case 'Manchester': {
        // IEEE 802.3 standard:
        // Bit 0: High-to-low transition (+1 then -1)
        // Bit 1: Low-to-high transition (-1 then +1)
        if (bit === '0') {
          firstHalf = 1;
          secondHalf = -1;
        } else {
          firstHalf = -1;
          secondHalf = 1;
        }
        hasMidTrans = true;
        hasStartTrans = prevSeg ? prevSeg.secondHalfLevel !== firstHalf : false;
        break;
      }

      case 'DiffManchester': {
        // Transition at start if bit is 0, no transition at start if bit is 1.
        // Always transition in middle.
        if (i === 0 || !prevSeg) {
          prevLevel = bit === '0' ? -1 : 1;
          hasStartTrans = false;
        } else {
          if (bit === '0') {
            // Invert previous trailing level at bit start
            prevLevel = prevSeg.secondHalfLevel === 1 ? -1 : 1;
            hasStartTrans = true;
          } else {
            // Keep previous trailing level at bit start
            prevLevel = prevSeg.secondHalfLevel;
            hasStartTrans = false;
          }
        }
        firstHalf = prevLevel;
        secondHalf = prevLevel === 1 ? -1 : 1;
        hasMidTrans = true;
        break;
      }

      case 'AMI': {
        // Alternate Mark Inversion:
        // Bit 0: 0V
        // Bit 1: Alternates between +1V and -1V
        if (bit === '0') {
          firstHalf = 0;
          secondHalf = 0;
        } else {
          firstHalf = amiSign;
          secondHalf = amiSign;
          amiSign = amiSign === 1 ? -1 : 1; // flip for next 1
        }
        hasMidTrans = false;
        hasStartTrans = prevSeg ? prevSeg.secondHalfLevel !== firstHalf : false;
        break;
      }

      case 'MLT-3': {
        // Multi-Line Transmission 3:
        // Bit 0: No transition (keep current level)
        // Bit 1: Transition to next level: 0 -> +1 -> 0 -> -1 -> 0
        if (bit === '1') {
          hasStartTrans = true;
          if (mltLevel === 0) {
            mltLevel = mltNextDirection;
          } else if (mltLevel === 1) {
            mltLevel = 0;
            mltNextDirection = -1;
          } else if (mltLevel === -1) {
            mltLevel = 0;
            mltNextDirection = 1;
          }
        } else {
          hasStartTrans = false;
        }
        firstHalf = mltLevel;
        secondHalf = mltLevel;
        hasMidTrans = false;
        break;
      }
    }

    segments.push({
      bitIndex: i,
      bitValue: bit,
      firstHalfLevel: firstHalf,
      secondHalfLevel: secondHalf,
      hasStartTransition: hasStartTrans,
      hasMidTransition: hasMidTrans,
    });
  }

  // Calculate metrics
  const levelSamples: number[] = [];
  let sumLevels = 0;
  let totalTransitions = 0;
  let maxNoTransitionStreak = 0;
  let currentStreak = 0;

  segments.forEach((seg) => {
    levelSamples.push(seg.firstHalfLevel, seg.secondHalfLevel);
    sumLevels += seg.firstHalfLevel + seg.secondHalfLevel;

    if (seg.hasStartTransition) totalTransitions++;
    if (seg.hasMidTransition) totalTransitions++;

    if (!seg.hasStartTransition && !seg.hasMidTransition) {
      currentStreak++;
      if (currentStreak > maxNoTransitionStreak) {
        maxNoTransitionStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  });

  const dcComponent = sumLevels / (segments.length * 2);

  // Diagnostic notes for educators and students
  let dcNote = '';
  let syncNote = '';

  switch (scheme) {
    case 'NRZ-L':
      dcNote = Math.abs(dcComponent) > 0.3
        ? 'High DC component present when 0s or 1s dominate. Transformer coupling may fail.'
        : 'Moderate DC component; sensitive to unbalances between 0s and 1s.';
      syncNote = 'Poor self-synchronization: long runs of identical bits have 0 transitions.';
      break;

    case 'NRZ-I':
      dcNote = 'Significant DC component if the bit stream contains long streaks of 0s.';
      syncNote = 'Synchronizes on 1s; long runs of 0s still cause receiver clock drift.';
      break;

    case 'RZ':
      dcNote = 'Non-zero DC bias because every pulse returns to zero in the second half.';
      syncNote = 'High self-synchronization (mid-bit transition on every 1 and 0), but requires double bandwidth.';
      break;

    case 'Manchester':
      dcNote = 'Zero DC component! Every bit interval has balanced positive and negative halves.';
      syncNote = 'Excellent self-synchronization: guaranteed mid-bit transition for every bit.';
      break;

    case 'DiffManchester':
      dcNote = 'Zero DC component! Balanced half-intervals eliminate baseline drift.';
      syncNote = 'Superior clock recovery: mid-bit transition provides clock; start transition provides data.';
      break;

    case 'AMI':
      dcNote = 'Zero DC component for long runs of 1s due to alternating polarity. Eliminates baseline wander.';
      syncNote = 'Clock drift occurs during long strings of consecutive 0s (solvable with scrambling like B8ZS/HDB3).';
      break;

    case 'MLT-3':
      dcNote = 'Low average DC component because voltage cycles symmetrically through +1, 0, -1, 0.';
      syncNote = 'Maximum fundamental frequency is only 1/4 the bit rate, reducing bandwidth requirements significantly.';
      break;
  }

  return {
    scheme,
    bits,
    segments,
    levelSamples,
    dcComponent: Number(dcComponent.toFixed(3)),
    totalTransitions,
    maxNoTransitionStreak,
    dcNote,
    syncNote,
  };
}
