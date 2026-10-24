import { describe, it, expect } from 'vitest';
import {
  modulateDigital,
  analogAm,
  analogFm,
  QAM4_POINTS,
  QAM16_POINTS,
} from './modulation';

describe('Modulation Algorithms (Forouzan Ch. 5)', () => {
  it('modulates digital bits into symbols for ASK, FSK, BPSK', () => {
    const ask = modulateDigital('10', 'ASK', 5, 1);
    expect(ask.symbols[0].amplitude).toBe(1.0);
    expect(ask.symbols[1].amplitude).toBe(0.2);

    const fsk = modulateDigital('10', 'FSK', 5, 1);
    expect(fsk.symbols[0].frequency).toBeGreaterThan(fsk.symbols[1].frequency);

    const bpsk = modulateDigital('01', 'BPSK', 5, 1);
    expect(bpsk.symbols[0].phaseDegrees).toBe(0);
    expect(bpsk.symbols[1].phaseDegrees).toBe(180);
  });

  it('maps symbols to 4-QAM and 16-QAM constellations', () => {
    expect(QAM4_POINTS.length).toBe(4);
    expect(QAM16_POINTS.length).toBe(16);

    const qam4 = modulateDigital('00011110', '4-QAM', 4, 2);
    expect(qam4.bitsPerSymbol).toBe(2);
    expect(qam4.symbols.length).toBe(4); // 8 bits / 2 = 4 symbols
  });

  it('computes analog AM and FM instantaneous values', () => {
    const am = analogAm(0, 100, 10, 0.8, 1.0);
    // At t = 0: message = cos(0) = 1, envelope = 1 * (1 + 0.8 * 1) = 1.8, carrier = 1 -> modulated = 1.8
    expect(am.envelope).toBeCloseTo(1.8, 4);
    expect(am.modulated).toBeCloseTo(1.8, 4);

    const fm = analogFm(0, 100, 10, 2.0, 1.0);
    expect(fm.instantFreq).toBeCloseTo(120, 1); // fc + beta * fm * 1 = 100 + 2 * 10 = 120
  });
});
