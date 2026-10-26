import type { Unit } from './types';

export const unit3: Unit = {
  id: 'unit-3',
  number: 3,
  title: 'Multiplexing and Error Control',
  courseOutcome: 'CO3',
  hours: 9,
  objectives: [
    'Explain FDM, WDM, and TDM multiplexing techniques',
    'Describe the telephone system multiplexing hierarchy',
    'Identify types of errors in data communication',
    'Implement VRC, LRC, CRC, and checksum error detection',
    'Understand Hamming code for error correction',
  ],
  topics: [
    {
      id: 'u3-mux',
      title: 'Multiplexing',
      summary: 'FDM, WDM, synchronous TDM, and statistical TDM.',
      body: `**Multiplexing** is the set of techniques that allows the simultaneous transmission of multiple signals across a single data link. In a multiplexed system, n lines share the bandwidth of one link. The device that combines the signals is a **multiplexer (MUX)** at the sending end, and the device that separates them is a **demultiplexer (DEMUX)** at the receiving end.

Multiplexing is essential because the capacity of most transmission media far exceeds what is required for a single signal. Without multiplexing, a 1 GHz fibre-optic cable carrying a single 4 kHz voice call would waste 99.9996% of its capacity.

**Frequency-Division Multiplexing (FDM)** is an analog technique where the available bandwidth of a link is divided into frequency bands, each allocated to a separate signal. Each sender modulates its signal onto a different carrier frequency (f₁, f₂, f₃, …), and these modulated signals are combined. To prevent interference between adjacent channels, **guard bands** — unused frequency ranges — separate the channels. The total bandwidth required is: B_total = n × B_channel + (n − 1) × B_guard. At the receiver, bandpass filters separate each channel's carrier frequency. A classic example is broadcast radio: AM stations occupy different carrier frequencies within the 535–1705 kHz band.

**Wavelength-Division Multiplexing (WDM)** is conceptually the same as FDM but operates on optical fibre using different wavelengths (colours) of light. Each signal is assigned a distinct wavelength using laser or LED sources, and a prism or diffraction grating combines them onto a single fibre. Dense WDM (DWDM) can multiplex over 160 wavelengths on a single fibre, each carrying 10 Gbps or more. WDM is the backbone technology of modern Internet infrastructure.

**Synchronous Time-Division Multiplexing (Sync TDM)** is a digital technique where each source is assigned a fixed, recurring time slot within a repeating frame, regardless of whether the source has data to send. If a source is idle, its slot is transmitted empty (wasted bandwidth). Each frame also includes one or more synchronization (framing) bits. The data rate of the output link must be at least n times the data rate of each input: R_link ≥ n × R_source. Sync TDM is the foundation of the digital telephone hierarchy (T-1, E-1 lines).

**Statistical (Asynchronous) TDM** improves on sync TDM by dynamically allocating slots only to active sources that have data to send. Each slot carries an address header identifying the source, adding overhead, but eliminating wasted slots. The output link capacity can be less than the sum of all input capacities because statistically not all sources transmit simultaneously. This is also known as **statistical multiplexing** or **asynchronous TDM**.`,
      formulas: [
        'FDM Total Bandwidth: B = n × B_ch + (n−1) × B_guard',
        'Sync TDM Link Rate: R_link ≥ n × R_source',
        'TDM Efficiency = (Used Slots / Total Slots) × 100%',
      ],
      keyPoints: [
        'FDM divides bandwidth into non-overlapping frequency bands separated by guard bands',
        'WDM is FDM for optical fibre — uses different wavelengths of light; DWDM supports 160+ channels',
        'Sync TDM assigns fixed time slots per frame; idle sources waste bandwidth',
        'Statistical TDM dynamically assigns slots to active sources only, improving efficiency',
        'Multiplexer (MUX) combines; Demultiplexer (DEMUX) separates',
      ],
      textbookRef: 'Forouzan, Ch. 6',
      sim: 'multiplexing',
    },
    {
      id: 'u3-telephone',
      title: 'Telephone System',
      summary: 'The PSTN multiplexing hierarchy.',
      body: `The **Public Switched Telephone Network (PSTN)** uses a hierarchical time-division multiplexing scheme to transport thousands of voice calls over high-capacity digital trunk lines. The foundation is a single **DS-0 (Digital Signal Level 0)** channel: one voice call digitised at 8,000 samples/sec × 8 bits/sample = **64 kbps**.

**T-1 (DS-1) Line:** The T-1 carrier multiplexes 24 DS-0 channels using synchronous TDM. Each T-1 frame consists of 24 time slots of 8 bits each, plus 1 framing bit, totalling 24 × 8 + 1 = 193 bits per frame. With 8,000 frames transmitted per second, the total data rate is 193 × 8,000 = **1.544 Mbps**. T-1 lines are the backbone of the North American and Japanese telephone networks.

**E-1 Line:** The European equivalent multiplexes 30 voice channels plus 1 signalling channel and 1 synchronisation channel (32 channels total). Each E-1 frame has 32 × 8 = 256 bits per frame, yielding 256 × 8,000 = **2.048 Mbps**.

Higher-level multiplexing combines multiple T-1 (or E-1) lines:
- **T-2 (DS-2):** 4 × T-1 = 96 voice channels = **6.312 Mbps**
- **T-3 (DS-3):** 28 × T-1 = 672 voice channels = **44.736 Mbps**
- **T-4 (DS-4):** 168 × T-1 = 4,032 voice channels = **274.176 Mbps**

**SONET/SDH** (Synchronous Optical NETwork / Synchronous Digital Hierarchy) provides standardised optical fibre transport. The base rate STS-1/OC-1 carries **51.84 Mbps**. STS-3/OC-3 (STM-1 in SDH) operates at 155.52 Mbps, and STS-48/OC-48 (STM-16) operates at 2.488 Gbps. SONET uses a frame structure of 810 bytes transmitted every 125 μs (matching the 8,000 Hz sampling rate).

The hierarchy ensures that a single optical backbone can carry hundreds of thousands of simultaneous voice calls by recursively multiplexing lower-level streams into higher-level containers.`,
      formulas: [
        'DS-0 = 64 kbps (8000 samples/s × 8 bits)',
        'T-1 Frame = 24 × 8 + 1 = 193 bits → 1.544 Mbps',
        'E-1 Frame = 32 × 8 = 256 bits → 2.048 Mbps',
        'T-3 = 28 × T-1 = 44.736 Mbps',
      ],
      keyPoints: [
        'DS-0 = 64 kbps, one digitised voice channel',
        'T-1 (DS-1) = 24 channels × 64 kbps + framing = 1.544 Mbps',
        'E-1 = 32 channels × 64 kbps = 2.048 Mbps (European standard)',
        'T-3 (DS-3) = 672 channels = 44.736 Mbps',
        'SONET/SDH: STS-1 = 51.84 Mbps base rate for optical transport',
      ],
      textbookRef: 'Forouzan, Ch. 6',
    },
    {
      id: 'u3-errors',
      title: 'Types of Errors',
      summary: 'Single-bit and burst errors.',
      body: `During transmission across any physical medium, electromagnetic interference, signal degradation, and hardware imperfections can alter the bits of data. Any such alteration is called a **transmission error**. Understanding error types is essential for selecting appropriate detection and correction mechanisms.

**Single-Bit Error:** In a single-bit error, only one bit of a data unit (a byte, character, or frame) is changed from 1 to 0 or from 0 to 1. This is relatively rare in serial data transmission because the duration of noise is usually much longer than the duration of a single bit. Single-bit errors are more common in parallel transmission where each bit travels on a separate wire, and a noise burst may affect only one wire. A single-bit error is the simplest form of error and can be detected by basic parity checking.

**Burst Error:** A burst error means that two or more bits in the data unit have been altered. Burst errors are far more common than single-bit errors in serial communication because the duration of an electromagnetic interference event (such as a lightning strike or motor spark) typically spans several bit intervals. A burst of length B means that the first and last corrupted bits are B positions apart — the bits in between may or may not be corrupted. For example, at 1 Mbps, a 1-millisecond noise burst can affect 1,000 bits.

**Burst error length** is measured from the first corrupted bit to the last corrupted bit, inclusive. The bits between the first and last error positions need not all be in error — they may or may not have changed. This makes burst errors harder to detect and correct than single-bit errors.

The probability and severity of errors depend on the channel's **signal-to-noise ratio (SNR)**, the transmission medium (wireless channels are noisier than fibre), and the data rate (higher rates mean shorter bit durations, making them more susceptible to noise).

The **Bit Error Rate (BER)** is the ratio of errored bits to the total number of bits transmitted. A typical BER for copper-wire LANs is 10⁻⁷ (one error per 10 million bits), while optical fibre achieves BER of 10⁻¹² or better.`,
      formulas: [
        'BER = Number of error bits / Total bits transmitted',
        'Burst length = position of last error − position of first error + 1',
      ],
      keyPoints: [
        'Single-bit error: exactly one bit flipped; rare in serial transmission',
        'Burst error: two or more bits corrupted; dominant in serial communication',
        'Burst length = from first to last corrupted bit (inclusive)',
        'Noise burst duration × data rate = number of potentially affected bits',
        'BER: copper LAN ≈ 10⁻⁷; optical fibre ≈ 10⁻¹²',
      ],
      textbookRef: 'Forouzan, Ch. 9',
    },
    {
      id: 'u3-parity',
      title: 'VRC and LRC',
      summary: 'Parity-based error detection.',
      body: `Parity checking is one of the simplest and oldest methods of error detection. The core idea: append a redundant bit (the **parity bit**) to a data unit so that the total number of 1-bits satisfies a predetermined rule.

**VRC (Vertical Redundancy Check)** — also known as simple parity check — appends a single parity bit to the end of each data unit (usually a 7-bit ASCII character). In **even parity**, the parity bit is chosen so that the total number of 1s in the unit (including the parity bit) is even. In **odd parity**, the total number of 1s is made odd.

For example, with even parity: Data = 1100001 (ASCII 'a') → count of 1s = 3 (odd) → parity bit = 1 → Transmitted: 11000011. If during transmission one bit flips, the receiver counts the 1s and finds an odd number, detecting the error.

VRC can detect **all single-bit errors** (flipping any one bit changes the parity). However, VRC **cannot detect even numbers of errors** — if two bits flip, the parity remains correct. VRC has a detection reliability of about 50% for burst errors.

**LRC (Longitudinal Redundancy Check)** — also called 2D parity or block parity — extends VRC by organising data into a matrix (rows of characters) and computing parity for both rows (VRC) and columns (LRC). Each character gets a VRC bit (row parity), and an additional block check character (BCC) is formed by computing parity down each column across all characters.

The combination of VRC + LRC creates a two-dimensional parity matrix that can detect:
- All single-bit errors (caught by both row and column parity)
- All double-bit errors
- All odd-number-of-bit errors
- Most burst errors

Additionally, 2D parity can **correct single-bit errors** by identifying the exact row and column of the error. However, certain patterns of four-bit errors (forming a rectangle in the matrix) go undetected.`,
      formulas: [
        'Even parity bit = XOR of all data bits',
        'VRC overhead = 1 bit per character',
        'LRC overhead = 1 block check character + 1 bit per character',
      ],
      keyPoints: [
        'VRC (even/odd parity): one parity bit per character; detects all single-bit errors',
        'VRC fails to detect even numbers of bit errors',
        'LRC: 2D parity matrix = VRC (row parity) + column parity across characters',
        '2D parity detects all single, double, and odd-count errors',
        '2D parity can correct single-bit errors by pinpointing exact row and column',
      ],
      textbookRef: 'Forouzan, Ch. 9',
      sim: 'parity-lrc',
    },
    {
      id: 'u3-crc',
      title: 'CRC',
      summary: 'Cyclic Redundancy Check using polynomial division.',
      body: `The **Cyclic Redundancy Check (CRC)** is a powerful error detection method based on binary polynomial division (modulo-2 arithmetic). CRC is the standard error detection mechanism used in Ethernet (IEEE 802.3), WiFi (802.11), HDLC, and virtually all modern data link protocols.

The algorithm works as follows:
1. The data block is treated as a binary polynomial D(x). For example, data 1001 represents x³ + 1.
2. A **generator polynomial** G(x) of degree r is agreed upon by sender and receiver. For example, G(x) = x³ + 1 is represented as 1001 (r = 3).
3. **At the sender:** Append r zero bits to the data (equivalent to multiplying D(x) by x^r). Divide the augmented data by G(x) using modulo-2 long division (XOR instead of subtraction). The remainder R(x) of this division (r bits) is the CRC.
4. The sender transmits D(x) followed by R(x) — this is the codeword T(x) = D(x) × x^r + R(x). By construction, T(x) is exactly divisible by G(x).
5. **At the receiver:** Divide the received codeword by G(x). If the remainder is zero, no detectable error occurred. If the remainder is non-zero (the **syndrome**), an error is detected.

**Modulo-2 arithmetic** uses XOR: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0. There is no carry or borrow. This makes CRC computation extremely fast in hardware using shift registers and XOR gates.

CRC is far more powerful than parity:
- CRC can detect **all single-bit errors** if G(x) has more than one term.
- CRC can detect **all double-bit errors** if G(x) is not divisible by (x+1).
- CRC can detect **all burst errors of length ≤ r** (degree of the generator).
- CRC detects **most burst errors of length > r** with probability 1 − 2^(−r).

Standard generator polynomials: CRC-8 (x⁸+x²+x+1), CRC-16 (x¹⁶+x¹⁵+x²+1), CRC-32 (used in Ethernet, 33 bits).`,
      formulas: [
        'CRC = Data × x^r mod Generator(x)',
        'Codeword T(x) = Data(x) × x^r + Remainder(x)',
        'Receiver check: T(x) mod G(x) = 0 → no error',
        'Burst detection: detects all bursts of length ≤ r',
      ],
      keyPoints: [
        'CRC uses modulo-2 polynomial division (XOR-based)',
        'Sender appends r zeros to data, divides by generator, appends remainder',
        'Receiver divides received codeword by same generator; zero remainder = no error',
        'Detects all single-bit, double-bit, odd-count, and burst errors ≤ r bits',
        'CRC-32 (Ethernet): generator polynomial of degree 32, detects bursts up to 32 bits',
      ],
      textbookRef: 'Forouzan, Ch. 9',
      sim: 'crc-division',
    },
    {
      id: 'u3-checksum',
      title: 'Checksum',
      summary: "One's complement checksum.",
      body: `The **checksum** is an error detection method used at the transport and network layers, most notably in the Internet Protocol (IP), TCP, and UDP headers. While CRC operates at the data link layer using polynomial arithmetic, the checksum uses simple **one's complement arithmetic** for quick software computation.

**Sender-Side Algorithm:**
1. Divide the data into fixed-size segments (typically 16-bit words).
2. Add all segments together using binary addition.
3. If a carry (overflow) is generated beyond the word size, wrap it around by adding it back to the sum. This is called **end-around carry** or **wraparound carry**.
4. Take the **one's complement** (bitwise NOT) of the final sum — this is the checksum.
5. Append the checksum to the data and transmit.

**Receiver-Side Verification:**
1. The receiver adds all received segments, including the checksum, using the same one's complement addition.
2. If the result is all 1s (e.g., FFFF for 16-bit), the data is accepted as error-free.
3. If the result is anything other than all 1s, an error is detected.

**Why one's complement?** One's complement arithmetic treats positive zero and negative zero as the same value and automatically wraps carry bits, making it byte-order independent. The algorithm is simple enough to implement in a few lines of code without requiring hardware XOR shift registers like CRC.

**Limitations:** The checksum is weaker than CRC. It cannot detect errors where two segments are swapped, or where compensating errors occur in the same bit position across different segments. For example, if bit 5 of word 1 flips from 0 to 1 and bit 5 of word 2 flips from 1 to 0, the column sum remains unchanged. Despite these limitations, the checksum is widely used because it is fast to compute in software and provides adequate protection when combined with CRC at lower layers.`,
      formulas: [
        'Checksum = One\'s complement of (sum of all data words with wraparound carry)',
        'Receiver: sum of all words + checksum = all 1s → valid',
        'Wraparound: if sum > max_value, add carry back to LSB',
      ],
      keyPoints: [
        "One's complement sum: add all 16-bit words, wrap carry around",
        'Checksum = bitwise NOT of the wrapped sum',
        'Receiver adds all words (including checksum); result should be all 1s',
        'Used in IP, TCP, UDP headers for quick software-based error detection',
        'Weaker than CRC: cannot detect swapped segments or same-position compensating errors',
      ],
      textbookRef: 'Forouzan, Ch. 9',
      sim: 'checksum',
    },
    {
      id: 'u3-hamming',
      title: 'Hamming Code',
      summary: 'Error correction with redundant bits.',
      body: `**Hamming Code** is a forward error correction (FEC) technique that not only detects errors but can automatically **correct single-bit errors** without retransmission. Developed by Richard Hamming at Bell Labs in 1950, it is one of the most widely studied error correction codes and forms the foundation for more advanced codes like Reed-Solomon.

**How many redundancy bits are needed?**
For m data bits, we need r parity (redundancy) bits such that:
$$2^r \\ge m + r + 1$$
This ensures that the r syndrome bits can uniquely identify any one of (m + r) possible error positions, plus the "no error" case. For example, for m = 4 data bits, we need r = 3 parity bits (since 2³ = 8 ≥ 4 + 3 + 1 = 8).

**Parity bit placement:**
Parity bits are placed at positions that are powers of 2: positions 1, 2, 4, 8, 16, …. Data bits fill the remaining positions (3, 5, 6, 7, 9, 10, 11, …).

**Parity bit calculation (even parity):**
Each parity bit at position 2^k covers all positions whose binary representation has a 1 in bit position k:
- P1 (position 1): covers positions 1, 3, 5, 7, 9, 11, … (binary positions with bit 0 = 1)
- P2 (position 2): covers positions 2, 3, 6, 7, 10, 11, … (binary positions with bit 1 = 1)
- P4 (position 4): covers positions 4, 5, 6, 7, 12, 13, … (binary positions with bit 2 = 1)
- P8 (position 8): covers positions 8, 9, 10, 11, 12, 13, 14, 15 (binary positions with bit 3 = 1)

**Error detection and correction at the receiver:**
The receiver recalculates each parity bit. The results form the **syndrome** — a binary number where each bit indicates whether the corresponding parity check passed (0) or failed (1). If the syndrome is 0, no error occurred. If the syndrome is non-zero, its decimal value gives the exact **position of the single-bit error**, which can then be corrected by flipping that bit.

**Hamming Distance:** The minimum Hamming distance d_min of a code determines its error capabilities: it can detect (d_min − 1) errors and correct ⌊(d_min − 1)/2⌋ errors. Standard Hamming code has d_min = 3 (detects 2, corrects 1). Adding an overall parity bit yields SEC-DED (Single Error Correction, Double Error Detection) with d_min = 4.`,
      formulas: [
        'Redundancy: 2^r ≥ m + r + 1',
        'Total codeword length: n = m + r',
        'Parity positions: 1, 2, 4, 8, 16, … (powers of 2)',
        'Syndrome ≠ 0 → error at position = syndrome value',
        'Hamming distance d_min = 3: detects 2 errors, corrects 1',
      ],
      keyPoints: [
        'Hamming code corrects single-bit errors and detects double-bit errors',
        'Parity bits placed at power-of-2 positions (1, 2, 4, 8, …)',
        'Each parity bit covers positions whose binary index includes that power of 2',
        'Syndrome = recalculated parity checks; non-zero syndrome = error position',
        'Hamming distance d_min = 3 for standard Hamming; d_min = 4 with overall parity (SEC-DED)',
      ],
      textbookRef: 'Forouzan, Ch. 9',
      sim: 'hamming',
    },
  ],
};
