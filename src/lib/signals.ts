/**
 * Signal and Channel Capacity pure algorithm functions
 * Units 1 & 2
 */

export interface SineComponent {
  amplitude: number; // Volts
  frequency: number; // Hz
  phase: number; // Degrees (0-360)
}

/**
 * Calculates instantaneous value of a sine wave:
 * v(t) = A * sin(2 * pi * f * t + phase_radians)
 */
export function sineValue(comp: SineComponent, t: number): number {
  const phaseRad = (comp.phase * Math.PI) / 180;
  return comp.amplitude * Math.sin(2 * Math.PI * comp.frequency * t + phaseRad);
}

/**
 * Calculates instantaneous value of a composite sine signal:
 * v_composite(t) = sum(v_i(t))
 */
export function compositeSineValue(components: SineComponent[], t: number): number {
  return components.reduce((sum, comp) => sum + sineValue(comp, t), 0);
}

/**
 * Bandwidth calculation for a composite periodic signal:
 * Bandwidth = Highest frequency - Lowest frequency.
 * If single frequency, bandwidth of the fundamental component is its frequency or 0.
 */
export function calculateBandwidth(components: SineComponent[]): {
  minFreq: number;
  maxFreq: number;
  bandwidth: number;
} {
  const active = components.filter((c) => c.amplitude > 0 && c.frequency > 0);
  if (active.length === 0) {
    return { minFreq: 0, maxFreq: 0, bandwidth: 0 };
  }
  const freqs = active.map((c) => c.frequency);
  const minFreq = Math.min(...freqs);
  const maxFreq = Math.max(...freqs);
  return {
    minFreq,
    maxFreq,
    bandwidth: maxFreq - minFreq,
  };
}

/**
 * Nyquist Bit Rate for a noiseless channel:
 * C = 2 * B * log2(L)
 * @param bandwidth Bandwidth B in Hertz
 * @param signalLevels Number of discrete signal levels L (>= 2)
 */
export function nyquist(bandwidth: number, signalLevels: number): number {
  if (bandwidth <= 0 || signalLevels < 2) return 0;
  return 2 * bandwidth * Math.log2(signalLevels);
}

/**
 * Converts SNR in decibels to linear power ratio:
 * SNR_linear = 10^(SNR_dB / 10)
 */
export function snrDbToLinear(snrDb: number): number {
  return Math.pow(10, snrDb / 10);
}

/**
 * Converts linear SNR power ratio to decibels:
 * SNR_dB = 10 * log10(SNR_linear)
 */
export function snrLinearToDb(snrLinear: number): number {
  if (snrLinear <= 0) return 0;
  return 10 * Math.log10(snrLinear);
}

/**
 * Shannon Capacity for a noisy channel:
 * C = B * log2(1 + SNR_linear)
 * @param bandwidth Bandwidth B in Hertz
 * @param snrDb Signal-to-Noise Ratio in dB
 */
export function shannon(bandwidth: number, snrDb: number): number {
  if (bandwidth <= 0) return 0;
  const snrLinear = snrDbToLinear(snrDb);
  return bandwidth * Math.log2(1 + snrLinear);
}

export interface PcmSamplePoint {
  t: number;
  analogValue: number;
  normalizedValue: number; // 0 to 1
  quantizedLevel: number; // 0 to L-1
  quantizedValue: number;
  quantizationError: number;
  binaryCode: string;
}

export interface PcmResult {
  samples: PcmSamplePoint[];
  quantLevels: number;
  bitsPerSample: number;
  bitRate: number; // bps = sampleRate * bitsPerSample
  maxQuantizationError: number;
  snrDbEstimated: number; // 6.02 * n + 1.76 dB
}

/**
 * Pulse Code Modulation (PCM) sampling and uniform quantization
 * @param signalFn Function returning signal amplitude between -Vmax and +Vmax
 * @param sampleRate Number of samples per second (Hz)
 * @param duration Total signal duration in seconds
 * @param quantBits Number of bits per sample (e.g. 3 bits = 8 levels)
 * @param vMax Peak amplitude (default 1.0V)
 */
export function pcm(
  signalFn: (t: number) => number,
  sampleRate: number,
  duration: number,
  quantBits: number,
  vMax: number = 1.0
): PcmResult {
  const bits = Math.max(1, Math.min(8, Math.floor(quantBits)));
  const quantLevels = Math.pow(2, bits);
  const delta = (2 * vMax) / quantLevels; // step size

  const sampleInterval = 1 / sampleRate;
  const totalSamples = Math.floor(duration * sampleRate);
  const samples: PcmSamplePoint[] = [];

  let maxError = 0;

  for (let i = 0; i <= totalSamples; i++) {
    const t = i * sampleInterval;
    const analog = signalFn(t);
    // Clamp to [-vMax, vMax]
    const clamped = Math.max(-vMax, Math.min(vMax, analog));

    // Shift to [0, 2*vMax]
    const shifted = clamped + vMax;
    // Quantize level: 0 to quantLevels - 1
    const rawLevel = Math.floor(shifted / delta);
    const level = Math.max(0, Math.min(quantLevels - 1, rawLevel));

    // Reconstruction value at midpoint of the interval
    const quantized = -vMax + (level + 0.5) * delta;
    const error = analog - quantized;
    if (Math.abs(error) > maxError) {
      maxError = Math.abs(error);
    }

    const binaryCode = level.toString(2).padStart(bits, '0');

    samples.push({
      t,
      analogValue: analog,
      normalizedValue: (clamped + vMax) / (2 * vMax),
      quantizedLevel: level,
      quantizedValue: quantized,
      quantizationError: error,
      binaryCode,
    });
  }

  // Theoretical SNR for uniform quantization: SNR_dB = 6.02 * n + 1.76
  const snrDbEstimated = 6.02 * bits + 1.76;

  return {
    samples,
    quantLevels,
    bitsPerSample: bits,
    bitRate: sampleRate * bits,
    maxQuantizationError: maxError,
    snrDbEstimated,
  };
}
