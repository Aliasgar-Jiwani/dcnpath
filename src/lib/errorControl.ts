/**
 * Error Detection and Correction Algorithms
 * VRC, LRC, CRC Modulo-2, Checksum (One's complement), and Hamming Code
 * Forouzan Chapter 9
 */

/* ─── 1. Parity (VRC) & 2D Parity (LRC) ─── */

export type ParityMode = 'even' | 'odd';

/**
 * Calculates parity bit for a bit string.
 * Even parity: total count of 1s (including parity bit) is even.
 * Odd parity: total count of 1s (including parity bit) is odd.
 */
export function computeVrc(bits: string, mode: ParityMode = 'even'): number {
  const ones = (bits.match(/1/g) || []).length;
  if (mode === 'even') {
    return ones % 2 === 0 ? 0 : 1;
  } else {
    return ones % 2 === 0 ? 1 : 0;
  }
}

export interface LrcResult {
  matrix: number[][]; // original data rows
  rowParities: number[]; // VRC for each row
  colParities: number[]; // LRC block check character for each column
  overallParity: number;
}

/**
 * Computes 2D Parity (LRC + VRC) over an array of equal-length binary strings.
 */
export function computeLrc(rows: string[], mode: ParityMode = 'even'): LrcResult {
  if (rows.length === 0 || !rows[0]) {
    return { matrix: [], rowParities: [], colParities: [], overallParity: 0 };
  }
  const colLength = rows[0].length;
  const matrix: number[][] = rows.map((r) =>
    r.padEnd(colLength, '0').split('').map((c) => (c === '1' ? 1 : 0))
  );

  const rowParities = matrix.map((row) =>
    computeVrc(row.join(''), mode)
  );

  const colParities: number[] = [];
  for (let c = 0; c < colLength; c++) {
    const colBits = matrix.map((row) => row[c]).join('');
    colParities.push(computeVrc(colBits, mode));
  }

  const overallParity = computeVrc(rowParities.join(''), mode);

  return {
    matrix,
    rowParities,
    colParities,
    overallParity,
  };
}

/* ─── 2. CRC (Cyclic Redundancy Check) ─── */

export interface CrcStep {
  stepIndex: number;
  currentDividend: string;
  divisor: string;
  appliedXor: boolean;
  quotientBit: '0' | '1';
  intermediateRemainder: string;
}

export interface CrcResult {
  data: string;
  generator: string;
  augmentedData: string;
  steps: CrcStep[];
  quotient: string;
  remainder: string;
  codeword: string;
}

/**
 * Converts polynomial string like "x^4 + x + 1" or "x^3 + 1" into binary string.
 */
export function polynomialToBinary(poly: string): string {
  // If already pure binary, return it
  if (/^[01]+$/.test(poly.trim())) return poly.trim();

  const clean = poly.toLowerCase().replace(/\s+/g, '');
  const terms = clean.split('+');
  let maxDegree = 0;
  const degrees = new Set<number>();

  terms.forEach((term) => {
    if (term === '1') {
      degrees.add(0);
    } else if (term === 'x') {
      degrees.add(1);
      if (1 > maxDegree) maxDegree = 1;
    } else if (term.startsWith('x^')) {
      const deg = parseInt(term.replace('x^', ''), 10);
      if (!isNaN(deg)) {
        degrees.add(deg);
        if (deg > maxDegree) maxDegree = deg;
      }
    }
  });

  if (maxDegree < 1) return '11'; // default fallback

  const bits: string[] = [];
  for (let d = maxDegree; d >= 0; d--) {
    bits.push(degrees.has(d) ? '1' : '0');
  }
  return bits.join('');
}

/**
 * Modulo-2 binary long division step-by-step.
 */
export function crcDivide(data: string, generator: string, isAugmented = false): CrcResult {
  const cleanData = data.replace(/[^01]/g, '') || '1001';
  let cleanGen = generator.replace(/[^01]/g, '');
  if (!cleanGen || cleanGen.length < 2 || !cleanGen.startsWith('1')) {
    cleanGen = '1011'; // standard fallback
  }

  const r = cleanGen.length - 1; // degree of generator polynomial
  const augmentedData = isAugmented ? cleanData : cleanData + '0'.repeat(r);

  const steps: CrcStep[] = [];
  let quotient = '';
  let cur = augmentedData.slice(0, cleanGen.length);

  for (let i = cleanGen.length; i <= augmentedData.length; i++) {
    const isOne = cur[0] === '1';
    quotient += isOne ? '1' : '0';

    let xorResult = '';
    const divisor = isOne ? cleanGen : '0'.repeat(cleanGen.length);

    for (let k = 0; k < cleanGen.length; k++) {
      xorResult += cur[k] === divisor[k] ? '0' : '1';
    }

    // Drop leading bit and bring down next bit if available
    const remainderSoFar = xorResult.slice(1);
    const nextBit = i < augmentedData.length ? augmentedData[i] : '';
    const nextDividend = remainderSoFar + nextBit;

    steps.push({
      stepIndex: i - cleanGen.length,
      currentDividend: cur,
      divisor,
      appliedXor: isOne,
      quotientBit: isOne ? '1' : '0',
      intermediateRemainder: remainderSoFar,
    });

    cur = nextDividend;
  }

  const lastStep = steps[steps.length - 1];
  const remainder = cur.length > 0 ? cur : (lastStep ? lastStep.intermediateRemainder : '');
  const finalRemainder = remainder.padStart(r, '0').slice(-r);
  const codeword = cleanData + finalRemainder;

  return {
    data: cleanData,
    generator: cleanGen,
    augmentedData,
    steps,
    quotient,
    remainder: finalRemainder,
    codeword,
  };
}

/**
 * Verifies codeword at receiver: calculates remainder of codeword / generator.
 * Remainder is all zeros if transmission had no error.
 */
export function crcVerify(codeword: string, generator: string): {
  isValid: boolean;
  remainder: string;
  syndrome: string;
} {
  const result = crcDivide(codeword, generator, true);
  const isZero = !result.remainder.includes('1');
  return {
    isValid: isZero,
    remainder: result.remainder,
    syndrome: result.remainder,
  };
}

/* ─── 3. Checksum (Internet One's Complement) ─── */

export interface ChecksumStep {
  wordIndex: number;
  wordHex: string;
  wordBin: string;
  runningSum: number;
  wrappedSum: number;
  carryOut: number;
}

export interface ChecksumResult {
  width: 8 | 16;
  words: number[];
  steps: ChecksumStep[];
  sum: number;
  checksum: number;
  checksumHex: string;
  checksumBin: string;
}

/**
 * Calculates 8-bit or 16-bit Internet Checksum using one's complement sum.
 */
export function calculateChecksum(
  rawWords: (string | number)[],
  width: 8 | 16 = 16
): ChecksumResult {
  const maxVal = Math.pow(2, width) - 1;
  const mask = maxVal;

  const words = rawWords.map((w) => {
    if (typeof w === 'number') return w & mask;
    const parsed = w.startsWith('0x') ? parseInt(w, 16) : parseInt(w, 2);
    return isNaN(parsed) ? 0 : parsed & mask;
  });

  const steps: ChecksumStep[] = [];
  let currentSum = 0;

  words.forEach((word, idx) => {
    const rawSum = currentSum + word;
    // Wrap around carry: carry = rawSum >> width
    const carry = rawSum >> width;
    const wrapped = (rawSum & mask) + carry;

    steps.push({
      wordIndex: idx,
      wordHex: word.toString(16).toUpperCase().padStart(width / 4, '0'),
      wordBin: word.toString(2).padStart(width, '0'),
      runningSum: rawSum,
      wrappedSum: wrapped,
      carryOut: carry,
    });

    currentSum = wrapped;
  });

  // Final one's complement inversion
  const checksum = ~currentSum & mask;

  return {
    width,
    words,
    steps,
    sum: currentSum,
    checksum,
    checksumHex: checksum.toString(16).toUpperCase().padStart(width / 4, '0'),
    checksumBin: checksum.toString(2).padStart(width, '0'),
  };
}

/**
 * Receiver checksum verification: sums words including the checksum.
 * If valid, sum is all 1s and complement is 0.
 */
export function verifyChecksum(
  wordsWithChecksum: (string | number)[],
  width: 8 | 16 = 16
): { isValid: boolean; finalSum: number; complement: number } {
  const res = calculateChecksum(wordsWithChecksum, width);
  const isValid = res.checksum === 0;
  return {
    isValid,
    finalSum: res.sum,
    complement: res.checksum,
  };
}

/* ─── 4. Hamming Code (SEC-DED) ─── */

export interface HammingEncodeResult {
  dataBits: string;
  m: number; // data bit count
  r: number; // parity bit count
  totalBits: number; // m + r
  codeword: string;
  parityPositions: number[]; // 1-indexed (1, 2, 4, 8...)
  dataPositions: number[]; // 1-indexed
  positionDetails: {
    position: number;
    isParity: boolean;
    bitValue: '0' | '1';
    coveredPositions?: number[];
  }[];
}

export interface HammingDecodeResult {
  receivedCodeword: string;
  r: number;
  syndromeBits: string; // e.g. "011"
  errorPosition: number; // 0 means no error, >0 means 1-indexed error bit
  hasError: boolean;
  correctedCodeword: string;
  extractedData: string;
}

/**
 * Finds minimum parity bits r such that 2^r >= m + r + 1
 */
export function calculateHammingRedundancy(m: number): number {
  let r = 1;
  while (Math.pow(2, r) < m + r + 1) {
    r++;
  }
  return r;
}

/**
 * Encodes m data bits (4 to 11 bits) into a standard Hamming codeword with even parity.
 */
export function hammingEncode(data: string): HammingEncodeResult {
  const cleanData = data.replace(/[^01]/g, '') || '1011';
  const m = cleanData.length;
  const r = calculateHammingRedundancy(m);
  const n = m + r;

  const parityPositions: number[] = [];
  for (let i = 0; i < r; i++) {
    parityPositions.push(Math.pow(2, i));
  }

  const dataPositions: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (!parityPositions.includes(i)) {
      dataPositions.push(i);
    }
  }

  // Populate array with 1-indexed positions
  const codeArray: ('0' | '1' | null)[] = new Array(n + 1).fill(null);

  // Place data bits (from left to right or right to left standard)
  dataPositions.forEach((pos, idx) => {
    codeArray[pos] = cleanData[idx] as '0' | '1';
  });

  // Calculate each parity bit
  const parityCoverage: Record<number, number[]> = {};

  parityPositions.forEach((p) => {
    const covered: number[] = [];
    let countOnes = 0;

    for (let pos = 1; pos <= n; pos++) {
      if ((pos & p) !== 0) {
        covered.push(pos);
        if (codeArray[pos] === '1') {
          countOnes++;
        }
      }
    }

    parityCoverage[p] = covered;
    // Even parity: make total 1s in covered set even
    codeArray[p] = countOnes % 2 === 0 ? '0' : '1';
  });

  const codeword = codeArray.slice(1).join('');

  const positionDetails = [];
  for (let pos = 1; pos <= n; pos++) {
    const isParity = parityPositions.includes(pos);
    positionDetails.push({
      position: pos,
      isParity,
      bitValue: codeArray[pos] as '0' | '1',
      coveredPositions: isParity ? parityCoverage[pos] : undefined,
    });
  }

  return {
    dataBits: cleanData,
    m,
    r,
    totalBits: n,
    codeword,
    parityPositions,
    dataPositions,
    positionDetails,
  };
}

/**
 * Decodes received Hamming codeword, calculates syndrome, and corrects single-bit error.
 */
export function hammingDecode(received: string): HammingDecodeResult {
  const cleanReceived = received.replace(/[^01]/g, '');
  const n = cleanReceived.length;
  // estimate r from n: 2^r >= n + 1
  let r = 1;
  while (Math.pow(2, r) <= n) {
    r++;
  }

  const codeArray = ['_', ...cleanReceived.split('')]; // 1-indexed

  // Calculate syndrome bits
  let syndrome = 0;
  const syndromeBitArray: number[] = [];

  for (let i = 0; i < r; i++) {
    const p = Math.pow(2, i);
    let countOnes = 0;
    for (let pos = 1; pos <= n; pos++) {
      if ((pos & p) !== 0) {
        if (codeArray[pos] === '1') countOnes++;
      }
    }
    const parityVal = countOnes % 2;
    syndromeBitArray.unshift(parityVal); // high order first
    if (parityVal !== 0) {
      syndrome += p;
    }
  }

  const hasError = syndrome > 0;
  const errorPosition = syndrome;

  // Correct error if within valid range
  const correctedArray = [...codeArray];
  if (hasError && errorPosition <= n) {
    correctedArray[errorPosition] = codeArray[errorPosition] === '1' ? '0' : '1';
  }

  const correctedCodeword = correctedArray.slice(1).join('');

  // Extract data bits (non-power-of-2 positions)
  const parityPositions = new Set<number>();
  for (let i = 0; i < r; i++) {
    parityPositions.add(Math.pow(2, i));
  }

  let extractedData = '';
  for (let pos = 1; pos <= n; pos++) {
    if (!parityPositions.has(pos)) {
      extractedData += correctedArray[pos];
    }
  }

  return {
    receivedCodeword: cleanReceived,
    r,
    syndromeBits: syndromeBitArray.join(''),
    errorPosition,
    hasError,
    correctedCodeword,
    extractedData,
  };
}
