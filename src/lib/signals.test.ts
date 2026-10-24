import { describe, it, expect } from 'vitest';
import {
  nyquist,
  shannon,
  snrDbToLinear,
  snrLinearToDb,
  calculateBandwidth,
  pcm,
  sineValue,
  compositeSineValue,
} from './signals';

describe('Signal and Channel Capacity Formulas (Forouzan Ch. 3 & 4)', () => {
  it('calculates Nyquist bit rate for noiseless channel: C = 2B log2(L)', () => {
    // Forouzan textbook example: B = 3000 Hz, 2 signal levels (L = 2)
    // C = 2 * 3000 * log2(2) = 6000 bps
    expect(nyquist(3000, 2)).toBe(6000);

    // 4 signal levels: C = 2 * 3000 * 2 = 12000 bps
    expect(nyquist(3000, 4)).toBe(12000);

    // Edge cases
    expect(nyquist(0, 2)).toBe(0);
    expect(nyquist(1000, 1)).toBe(0);
  });

  it('converts between SNR in dB and linear power ratio correctly', () => {
    // 0 dB = 1
    expect(snrDbToLinear(0)).toBeCloseTo(1, 4);
    // 10 dB = 10
    expect(snrDbToLinear(10)).toBeCloseTo(10, 4);
    // 20 dB = 100
    expect(snrDbToLinear(20)).toBeCloseTo(100, 4);
    // 30 dB = 1000
    expect(snrDbToLinear(30)).toBeCloseTo(1000, 4);

    expect(snrLinearToDb(1)).toBeCloseTo(0, 4);
    expect(snrLinearToDb(100)).toBeCloseTo(20, 4);
    expect(snrLinearToDb(0)).toBe(0);
  });

  it('calculates Shannon channel capacity: C = B log2(1 + SNR)', () => {
    // Example: B = 3000 Hz, SNR = 3162 (approx 35 dB)
    // C = 3000 * log2(1 + 3162) = 3000 * log2(3163) ~= 34,860 bps
    const cap = shannon(3000, 35);
    expect(Math.round(cap)).toBeCloseTo(34860, -2);

    // Noiseless / extremely high SNR test
    expect(shannon(1000, 0)).toBeCloseTo(1000, 1); // log2(1+1) = 1 -> 1000 bps

    // Edge cases
    expect(shannon(0, 20)).toBe(0);
  });

  it('calculates bandwidth from composite sine wave frequencies', () => {
    const components = [
      { amplitude: 5, frequency: 100, phase: 0 },
      { amplitude: 3, frequency: 500, phase: 90 },
      { amplitude: 1, frequency: 300, phase: 180 },
    ];
    const bw = calculateBandwidth(components);
    expect(bw.minFreq).toBe(100);
    expect(bw.maxFreq).toBe(500);
    expect(bw.bandwidth).toBe(400);

    // Empty or zero-amplitude components
    expect(calculateBandwidth([]).bandwidth).toBe(0);
  });

  it('computes instantaneous sine and composite wave values', () => {
    const comp = { amplitude: 2, frequency: 1, phase: 0 };
    // t = 0: sin(0) = 0
    expect(sineValue(comp, 0)).toBeCloseTo(0, 4);
    // t = 0.25 (1/4 cycle): sin(pi/2) = 1 -> 2
    expect(sineValue(comp, 0.25)).toBeCloseTo(2, 4);

    const comp2 = { amplitude: 1, frequency: 1, phase: 0 };
    expect(compositeSineValue([comp, comp2], 0.25)).toBeCloseTo(3, 4);
  });

  it('performs PCM uniform quantization and bit encoding', () => {
    // Simple 1 Hz test wave
    const signal = (t: number) => Math.sin(2 * Math.PI * t);
    const result = pcm(signal, 8, 1, 3); // 8 samples/sec, 1 sec, 3 bits (8 levels)

    expect(result.bitsPerSample).toBe(3);
    expect(result.quantLevels).toBe(8);
    expect(result.bitRate).toBe(24); // 8 * 3 bps
    expect(result.samples.length).toBe(9); // t = 0 to 1 at dt = 1/8

    // Each sample should have a 3-character binary code
    result.samples.forEach((s) => {
      expect(s.binaryCode).toMatch(/^[01]{3}$/);
      expect(s.quantizedLevel).toBeGreaterThanOrEqual(0);
      expect(s.quantizedLevel).toBeLessThan(8);
    });
  });
});
