/**
 * Digital and Analog Modulation Schemes
 * ASK, FSK, BPSK, 4-QAM, 16-QAM, AM, and FM
 * Forouzan Chapter 5
 */

export type DigitalModScheme = 'ASK' | 'FSK' | 'BPSK' | '4-QAM' | '16-QAM';

export interface ConstellationPoint {
  symbolBits: string;
  i: number; // In-phase (I) amplitude
  q: number; // Quadrature (Q) amplitude
  phaseDegrees: number;
  magnitude: number;
}

export interface ModulatedSymbol {
  symbolIndex: number;
  bits: string;
  amplitude: number;
  frequency: number;
  phaseDegrees: number;
  constellation: ConstellationPoint;
}

/**
 * 4-QAM (QPSK) constellation points (Gray coded)
 */
export const QAM4_POINTS: ConstellationPoint[] = [
  { symbolBits: '00', i: -1, q: -1, phaseDegrees: 225, magnitude: Math.SQRT2 },
  { symbolBits: '01', i: -1, q: 1, phaseDegrees: 135, magnitude: Math.SQRT2 },
  { symbolBits: '11', i: 1, q: 1, phaseDegrees: 45, magnitude: Math.SQRT2 },
  { symbolBits: '10', i: 1, q: -1, phaseDegrees: 315, magnitude: Math.SQRT2 },
];

/**
 * 16-QAM constellation points (4 bits per symbol, Gray coded on 4x4 grid)
 */
export const QAM16_POINTS: ConstellationPoint[] = (() => {
  const levels = [-3, -1, 1, 3];
  const gray2 = ['00', '01', '11', '10'];
  const points: ConstellationPoint[] = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const iVal = levels[c] ?? 0;
      const qVal = levels[3 - r] ?? 0;
      const bits = (gray2[c] ?? '') + (gray2[r] ?? '');
      const mag = Math.hypot(iVal, qVal);
      let angle = (Math.atan2(qVal, iVal) * 180) / Math.PI;
      if (angle < 0) angle += 360;

      points.push({
        symbolBits: bits,
        i: iVal,
        q: qVal,
        phaseDegrees: Number(angle.toFixed(1)),
        magnitude: Number(mag.toFixed(2)),
      });
    }
  }
  return points;
})();

/**
 * Modulates a binary string into symbols with amplitude, frequency, and phase.
 */
export function modulateDigital(
  bits: string,
  scheme: DigitalModScheme,
  carrierFreq: number = 5,
  bitRate: number = 1
): {
  symbols: ModulatedSymbol[];
  baudRate: number;
  bitsPerSymbol: number;
} {
  const clean = bits.replace(/[^01]/g, '') || '1011';
  const symbols: ModulatedSymbol[] = [];

  let bitsPerSymbol = 1;
  if (scheme === '4-QAM') bitsPerSymbol = 2;
  if (scheme === '16-QAM') bitsPerSymbol = 4;

  const baudRate = bitRate / bitsPerSymbol;

  // Pad bit string if needed to match symbol boundaries
  const padded =
    clean.length % bitsPerSymbol === 0
      ? clean
      : clean + '0'.repeat(bitsPerSymbol - (clean.length % bitsPerSymbol));

  for (let i = 0; i < padded.length; i += bitsPerSymbol) {
    const symBits = padded.slice(i, i + bitsPerSymbol);
    let amp = 1;
    let freq = carrierFreq;
    let phase = 0;
    let constellation: ConstellationPoint = {
      symbolBits: symBits,
      i: 1,
      q: 0,
      phaseDegrees: 0,
      magnitude: 1,
    };

    switch (scheme) {
      case 'ASK':
        // Bit 1: High amplitude (1.0), Bit 0: Low amplitude (0.2)
        amp = symBits === '1' ? 1.0 : 0.2;
        freq = carrierFreq;
        phase = 0;
        constellation = {
          symbolBits: symBits,
          i: amp,
          q: 0,
          phaseDegrees: 0,
          magnitude: amp,
        };
        break;

      case 'FSK':
        // Bit 1: high frequency fc + 2, Bit 0: low frequency fc - 2
        amp = 1.0;
        freq = symBits === '1' ? carrierFreq + 2 : Math.max(1, carrierFreq - 2);
        phase = 0;
        constellation = {
          symbolBits: symBits,
          i: 1,
          q: 0,
          phaseDegrees: 0,
          magnitude: 1,
        };
        break;

      case 'BPSK':
        // Bit 0: 0 deg, Bit 1: 180 deg
        amp = 1.0;
        freq = carrierFreq;
        phase = symBits === '1' ? 180 : 0;
        constellation = {
          symbolBits: symBits,
          i: symBits === '1' ? -1 : 1,
          q: 0,
          phaseDegrees: phase,
          magnitude: 1,
        };
        break;

      case '4-QAM': {
        const fallback = QAM4_POINTS[0]!;
        const pt = QAM4_POINTS.find((p) => p.symbolBits === symBits) ?? fallback;
        amp = pt.magnitude / Math.SQRT2; // normalized
        freq = carrierFreq;
        phase = pt.phaseDegrees;
        constellation = pt;
        break;
      }

      case '16-QAM': {
        const fallback = QAM16_POINTS[0]!;
        const pt = QAM16_POINTS.find((p) => p.symbolBits === symBits) ?? fallback;
        amp = pt.magnitude / (3 * Math.SQRT2); // normalized
        freq = carrierFreq;
        phase = pt.phaseDegrees;
        constellation = pt;
        break;
      }
    }

    symbols.push({
      symbolIndex: Math.floor(i / bitsPerSymbol),
      bits: symBits,
      amplitude: amp,
      frequency: freq,
      phaseDegrees: phase,
      constellation,
    });
  }

  return { symbols, baudRate, bitsPerSymbol };
}

/**
 * Calculates continuous modulated signal sample at time t:
 * s(t) = A(t) * sin(2 * pi * f(t) * t + phase(t))
 */
export function getDigitalModSignal(
  symbols: ModulatedSymbol[],
  t: number,
  symbolDuration: number = 1.0
): number {
  if (symbols.length === 0) return 0;
  const symIdx = Math.min(
    symbols.length - 1,
    Math.max(0, Math.floor(t / symbolDuration))
  );
  const sym = symbols[symIdx];
  if (!sym) return 0;
  const phaseRad = (sym.phaseDegrees * Math.PI) / 180;
  return sym.amplitude * Math.sin(2 * Math.PI * sym.frequency * t + phaseRad);
}

/**
 * Analog Amplitude Modulation (AM):
 * s(t) = Ac * [1 + mu * cos(2 * pi * fm * t)] * cos(2 * pi * fc * t)
 */
export function analogAm(
  t: number,
  fc: number,
  fm: number,
  mu: number = 0.8,
  ac: number = 1.0
): { carrier: number; message: number; modulated: number; envelope: number } {
  const message = Math.cos(2 * Math.PI * fm * t);
  const carrier = Math.cos(2 * Math.PI * fc * t);
  const envelope = ac * (1 + mu * message);
  const modulated = envelope * carrier;
  return { carrier, message, modulated, envelope };
}

/**
 * Analog Frequency Modulation (FM):
 * s(t) = Ac * cos(2 * pi * fc * t + beta * sin(2 * pi * fm * t))
 */
export function analogFm(
  t: number,
  fc: number,
  fm: number,
  beta: number = 3.0,
  ac: number = 1.0
): { carrier: number; message: number; modulated: number; instantFreq: number } {
  const message = Math.cos(2 * Math.PI * fm * t);
  const carrier = Math.cos(2 * Math.PI * fc * t);
  const instantFreq = fc + beta * fm * message;
  const modulated = ac * Math.cos(2 * Math.PI * fc * t + beta * Math.sin(2 * Math.PI * fm * t));
  return { carrier, message, modulated, instantFreq };
}
