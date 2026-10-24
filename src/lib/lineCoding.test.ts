import { describe, it, expect } from 'vitest';
import { lineCode, sanitizeBitString } from './lineCoding';

describe('Line Coding Schemes (Forouzan Ch. 4)', () => {
  it('sanitizes input and strips non-binary characters', () => {
    expect(sanitizeBitString('10 11-0a')).toBe('10110');
    expect(sanitizeBitString('')).toBe('');
  });

  it('handles empty input gracefully', () => {
    const res = lineCode('', 'NRZ-L');
    expect(res.segments.length).toBe(0);
    expect(res.dcComponent).toBe(0);
    expect(res.totalTransitions).toBe(0);
  });

  it('encodes NRZ-L according to Forouzan: 0 is positive (+1), 1 is negative (-1)', () => {
    const res = lineCode('010', 'NRZ-L');
    expect(res.segments[0].firstHalfLevel).toBe(1);
    expect(res.segments[0].secondHalfLevel).toBe(1);
    expect(res.segments[1].firstHalfLevel).toBe(-1);
    expect(res.segments[1].secondHalfLevel).toBe(-1);
    expect(res.segments[2].firstHalfLevel).toBe(1);
    expect(res.segments[2].secondHalfLevel).toBe(1);
  });

  it('encodes NRZ-I: bit 1 inverts previous state, bit 0 maintains state', () => {
    // Starting level is 1
    // Bit '1' -> inverts to -1
    // Bit '0' -> stays -1
    // Bit '1' -> inverts to 1
    const res = lineCode('101', 'NRZ-I');
    expect(res.segments[0].firstHalfLevel).toBe(-1);
    expect(res.segments[1].firstHalfLevel).toBe(-1);
    expect(res.segments[2].firstHalfLevel).toBe(1);
  });

  it('encodes RZ: always returns to zero in the second half of every bit interval', () => {
    const res = lineCode('10', 'RZ');
    // Bit 1: +1 then 0
    expect(res.segments[0].firstHalfLevel).toBe(1);
    expect(res.segments[0].secondHalfLevel).toBe(0);
    // Bit 0: -1 then 0
    expect(res.segments[1].firstHalfLevel).toBe(-1);
    expect(res.segments[1].secondHalfLevel).toBe(0);
  });

  it('encodes Manchester (IEEE 802.3): 0 is high-to-low (+1 to -1), 1 is low-to-high (-1 to +1)', () => {
    const res = lineCode('01', 'Manchester');
    // Bit 0
    expect(res.segments[0].firstHalfLevel).toBe(1);
    expect(res.segments[0].secondHalfLevel).toBe(-1);
    // Bit 1
    expect(res.segments[1].firstHalfLevel).toBe(-1);
    expect(res.segments[1].secondHalfLevel).toBe(1);

    // Guaranteed zero DC component
    expect(res.dcComponent).toBe(0);
  });

  it('encodes Differential Manchester with mid-bit clock transitions', () => {
    const res = lineCode('010', 'DiffManchester');
    // Every bit must have a mid-bit transition
    res.segments.forEach((seg) => {
      expect(seg.hasMidTransition).toBe(true);
      expect(seg.firstHalfLevel).not.toBe(seg.secondHalfLevel);
    });
    expect(res.dcComponent).toBe(0);
  });

  it('encodes AMI: bit 0 is 0V; bit 1 alternates polarity (+1, -1)', () => {
    const res = lineCode('01101', 'AMI');
    // Bit 0 -> 0
    expect(res.segments[0].firstHalfLevel).toBe(0);
    // Bit 1 -> +1
    expect(res.segments[1].firstHalfLevel).toBe(1);
    // Bit 1 -> -1 (inverted)
    expect(res.segments[2].firstHalfLevel).toBe(-1);
    // Bit 0 -> 0
    expect(res.segments[3].firstHalfLevel).toBe(0);
    // Bit 1 -> +1 (inverted back)
    expect(res.segments[4].firstHalfLevel).toBe(1);
  });

  it('encodes MLT-3 cycling through 0, +1, 0, -1', () => {
    const res = lineCode('11110', 'MLT-3');
    // Starts at 0, first 1 transitions to +1
    expect(res.segments[0].firstHalfLevel).toBe(1);
    // Second 1 transitions to 0
    expect(res.segments[1].firstHalfLevel).toBe(0);
    // Third 1 transitions to -1
    expect(res.segments[2].firstHalfLevel).toBe(-1);
    // Fourth 1 transitions to 0
    expect(res.segments[3].firstHalfLevel).toBe(0);
    // Fifth is 0 -> no transition, stays 0
    expect(res.segments[4].firstHalfLevel).toBe(0);
  });
});
