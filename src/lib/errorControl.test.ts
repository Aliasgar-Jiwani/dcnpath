import { describe, it, expect } from 'vitest';
import {
  computeVrc,
  computeLrc,
  crcDivide,
  crcVerify,
  polynomialToBinary,
  calculateChecksum,
  verifyChecksum,
  calculateHammingRedundancy,
  hammingEncode,
  hammingDecode,
} from './errorControl';

describe('Error Detection and Correction Algorithms (Forouzan Ch. 9)', () => {
  it('computes simple parity (VRC) for even and odd modes', () => {
    // '1011001' has four 1s (even)
    expect(computeVrc('1011001', 'even')).toBe(0);
    expect(computeVrc('1011001', 'odd')).toBe(1);

    // '1110000' has three 1s (odd)
    expect(computeVrc('1110000', 'even')).toBe(1);
    expect(computeVrc('1110000', 'odd')).toBe(0);
  });

  it('computes 2D Parity (LRC) across rows and columns', () => {
    const rows = ['1001', '1100', '0110'];
    const lrc = computeLrc(rows, 'even');
    expect(lrc.matrix.length).toBe(3);
    expect(lrc.rowParities.length).toBe(3);
    expect(lrc.colParities.length).toBe(4);
  });

  it('parses polynomial representation to binary generator', () => {
    expect(polynomialToBinary('x^3 + x^2 + 1')).toBe('1101');
    expect(polynomialToBinary('x^4 + x + 1')).toBe('10011');
    expect(polynomialToBinary('1101')).toBe('1101');
  });

  it('performs CRC modulo-2 division and verifies codeword at receiver', () => {
    // Textbook Example: Data = 100100, Generator = 1101 (degree 3)
    const crc = crcDivide('100100', '1101');
    expect(crc.remainder.length).toBe(3);
    expect(crc.codeword).toBe('100100' + crc.remainder);

    // Receiver check without error -> remainder must be '000'
    const cleanCheck = crcVerify(crc.codeword, '1101');
    expect(cleanCheck.isValid).toBe(true);
    expect(cleanCheck.remainder).toBe('000');

    // Receiver check with bit error injected -> remainder must be non-zero
    const corruptedCodeword =
      crc.codeword[0] === '1' ? '0' + crc.codeword.slice(1) : '1' + crc.codeword.slice(1);
    const errorCheck = crcVerify(corruptedCodeword, '1101');
    expect(errorCheck.isValid).toBe(false);
    expect(errorCheck.remainder).not.toBe('000');
  });

  it('calculates Internet Checksum with wrap-around carry and verifies receiver', () => {
    // Words: [0x4500, 0x003c, 0x1c46, 0x4000]
    const words = [0x4500, 0x003c, 0x1c46, 0x4000];
    const result = calculateChecksum(words, 16);
    expect(result.checksum).toBeGreaterThan(0);
    expect(result.checksum).toBeLessThanOrEqual(0xffff);

    // Receiver adds data words + checksum
    const receiverCheck = verifyChecksum([...words, result.checksum], 16);
    expect(receiverCheck.isValid).toBe(true);
    expect(receiverCheck.complement).toBe(0);

    // Corrupted word fails verification
    const corruptedWords = [0x4500, 0x003d, 0x1c46, 0x4000, result.checksum];
    const failCheck = verifyChecksum(corruptedWords, 16);
    expect(failCheck.isValid).toBe(false);
  });

  it('calculates Hamming code redundancy bit requirements (2^r >= m + r + 1)', () => {
    // For m = 4 data bits: 2^3 = 8 >= 4 + 3 + 1 = 8 -> r = 3 (Hamming 7,4)
    expect(calculateHammingRedundancy(4)).toBe(3);
    // For m = 7 data bits: 2^4 = 16 >= 7 + 4 + 1 = 12 -> r = 4 (Hamming 11,7)
    expect(calculateHammingRedundancy(7)).toBe(4);
    // For m = 11 data bits: 2^4 = 16 = 11 + 4 + 1 = 16 -> r = 4 (Hamming 15,11)
    expect(calculateHammingRedundancy(11)).toBe(4);
  });

  it('encodes data with Hamming code and corrects single-bit transmission errors', () => {
    const data = '1011';
    const encoded = hammingEncode(data);
    expect(encoded.totalBits).toBe(7); // 4 data + 3 parity
    expect(encoded.m).toBe(4);
    expect(encoded.r).toBe(3);

    // Receiver verifies original clean codeword
    const cleanDecode = hammingDecode(encoded.codeword);
    expect(cleanDecode.hasError).toBe(false);
    expect(cleanDecode.errorPosition).toBe(0);
    expect(cleanDecode.extractedData).toBe(data);

    // Flip bit at position 5 (1-indexed)
    const codeArr = encoded.codeword.split('');
    codeArr[4] = codeArr[4] === '1' ? '0' : '1'; // 0-indexed index 4 is 1-indexed position 5
    const corrupted = codeArr.join('');

    const errorDecode = hammingDecode(corrupted);
    expect(errorDecode.hasError).toBe(true);
    expect(errorDecode.errorPosition).toBe(5);
    expect(errorDecode.correctedCodeword).toBe(encoded.codeword);
    expect(errorDecode.extractedData).toBe(data);
  });
});
