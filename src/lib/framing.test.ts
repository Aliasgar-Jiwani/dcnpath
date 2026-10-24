import { describe, it, expect } from 'vitest';
import { bitStuff, bitUnstuff, byteStuff, byteUnstuff } from './framing';

describe('Framing: HDLC Bit Stuffing and BISYNC Byte Stuffing (Forouzan Ch. 11)', () => {
  it('stuffs a 0 after five consecutive 1s', () => {
    // 6 ones: '111111' -> '1111101'
    const res = bitStuff('111111');
    expect(res.stuffed).toBe('1111101');
    expect(res.fiveOnesCount).toBe(1);
    expect(res.stuffedIndices).toEqual([5]);

    // Ten ones: '1111111111' -> '111110111110'
    const res2 = bitStuff('1111111111');
    expect(res2.stuffed).toBe('111110111110');
    expect(res2.fiveOnesCount).toBe(2);
  });

  it('unstuffs bits accurately back to the original bit sequence', () => {
    const raw = '0111111011111100111110';
    const stuffed = bitStuff(raw);
    const unstuffed = bitUnstuff(stuffed.stuffed);
    expect(unstuffed.unstuffed).toBe(raw);
  });

  it('performs character-oriented byte stuffing and unstuffing with ESC', () => {
    const data = ['A', 'FLAG', 'B', 'ESC', 'C'];
    const stuffed = byteStuff(data);
    expect(stuffed.escapedCount).toBe(2);
    expect(stuffed.stuffed).toEqual(['A', 'ESC', 'FLAG', 'B', 'ESC', 'ESC', 'C']);

    const unstuffed = byteUnstuff(stuffed.stuffed);
    expect(unstuffed.isValid).toBe(true);
    expect(unstuffed.unstuffed).toEqual(data);
  });
});
