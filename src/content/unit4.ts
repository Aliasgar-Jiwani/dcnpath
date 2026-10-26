import type { Unit } from './types';

export const unit4: Unit = {
  id: 'unit-4',
  number: 4,
  title: 'Data Link Control',
  courseOutcome: 'CO4',
  hours: 9,
  objectives: [
    'Explain line discipline, flow control, and error control mechanisms',
    'Compare Stop-and-Wait, Go-Back-N, and Selective Repeat ARQ protocols',
    'Understand HDLC framing, bit stuffing, and frame types',
    'Differentiate asynchronous and synchronous data link protocols',
  ],
  topics: [
    {
      id: 'u4-line-discipline',
      title: 'Line Discipline',
      summary: 'ENQ/ACK and poll/select.',
      body: `**Line discipline** is the set of procedures that coordinates which device is allowed to transmit at any given time. Without line discipline, multiple devices could transmit simultaneously, causing garbled data. Line discipline establishes a framework for orderly, controlled communication.

There are two primary approaches to line discipline: **ENQ/ACK** for point-to-point links and **Poll/Select** for multipoint links.

**ENQ/ACK (Enquiry/Acknowledgment):**
Used on dedicated point-to-point connections. When a device wishes to send data, it first sends an **ENQ (Enquiry)** control frame to request permission. If the receiving device is ready to accept data, it responds with an **ACK (Acknowledgment)**. The sender then begins transmitting data frames. If the receiver is not ready (e.g., buffers are full), it responds with a **NAK (Negative Acknowledgment)** and the sender must wait and retry.

ENQ/ACK operates in two modes: **contention mode** (either party can initiate with ENQ, and conflicts are resolved by timeout and retry) and **non-contention mode** (one device is designated as primary and always initiates communication).

**Poll/Select:**
Used on multipoint links where one **primary** (controller) device communicates with multiple **secondary** devices sharing a single line. The primary uses two commands:
- **Poll:** The primary asks a secondary device, "Do you have data to send?" If the secondary has data, it responds with the data. If not, it sends a "nothing to send" response. The primary systematically polls each secondary in round-robin fashion.
- **Select:** The primary tells a secondary device, "I have data for you; are you ready to receive?" The secondary responds with ACK if ready, NAK if not.

In poll/select, only the primary can initiate communication. Secondaries never transmit unsolicited data. This eliminates collisions but concentrates control in a single device, making the primary a single point of failure.`,
      formulas: [],
      keyPoints: [
        'ENQ/ACK for point-to-point: sender sends ENQ, receiver replies ACK or NAK',
        'Poll/Select for multipoint: primary controls all communication',
        'Poll = "Do you have data?" (primary asks secondary)',
        'Select = "I have data for you, are you ready?" (primary to secondary)',
        'Secondaries never transmit without being polled by the primary',
      ],
      textbookRef: 'Forouzan, Ch. 10',
    },
    {
      id: 'u4-flow-control',
      title: 'Flow Control',
      summary: 'Stop-and-Wait and sliding window.',
      body: `**Flow control** is a set of procedures that tells the sender how much data it can transmit before waiting for an acknowledgment from the receiver. Its purpose is to prevent the receiver from being overwhelmed by data arriving faster than it can process. Without flow control, a fast sender can overflow a slow receiver's buffer, causing data loss.

**Stop-and-Wait Flow Control:**
The simplest flow control mechanism. The sender transmits one frame and then stops and waits for an acknowledgment (ACK) from the receiver before sending the next frame. The receiver processes the frame, and when ready for more data, sends an ACK. This is extremely reliable but very inefficient because the link sits idle while the sender waits for acknowledgment — the utilisation depends heavily on the propagation delay.

The utilisation (efficiency) of Stop-and-Wait is:
$$U = \\frac{t_{frame}}{t_{frame} + 2 \\times t_{prop}} = \\frac{1}{1 + 2a}$$
where a = t_prop / t_frame. For long-distance, high-speed links (large propagation delay), Stop-and-Wait wastes most of the channel capacity.

**Sliding Window Flow Control:**
To improve efficiency, the sliding window protocol allows the sender to transmit multiple frames before needing an acknowledgment. The sender maintains a **send window** of size W — it can have up to W unacknowledged frames outstanding. The receiver maintains a **receive window** and sends cumulative acknowledgments.

Frames are numbered using a **sequence number** field of m bits, allowing sequence numbers from 0 to 2^m − 1. The maximum window size depends on the protocol:
- For **Go-Back-N**: W ≤ 2^m − 1
- For **Selective Repeat**: W ≤ 2^(m−1)

The sender window slides forward as ACKs are received. If the sender transmits all W frames and hasn't received any ACK, it must stop (window is "closed"). As ACKs arrive, the window "opens" and the sender can transmit more frames.

Sliding window dramatically improves link utilisation. With an optimal window size W = 1 + 2a (where a = propagation delay / frame transmission time), the link can be kept continuously busy (pipelining).`,
      formulas: [
        'Stop-and-Wait Utilization: U = 1 / (1 + 2a), where a = t_prop / t_frame',
        'Sliding Window: W ≤ 2^m − 1 (Go-Back-N)',
        'Sliding Window: W ≤ 2^(m−1) (Selective Repeat)',
        'Optimal Window Size: W = 1 + 2a (for full utilisation)',
      ],
      keyPoints: [
        'Flow control prevents receiver buffer overflow from fast senders',
        'Stop-and-Wait: send 1 frame, wait for ACK; simple but inefficient on long links',
        'Sliding window: send up to W frames before needing ACK; enables pipelining',
        'Sequence numbers use m-bit field: 0 to 2^m − 1',
        'Utilisation improves from U = 1/(1+2a) to nearly 100% with optimal window size',
      ],
      textbookRef: 'Forouzan, Ch. 10',
    },
    {
      id: 'u4-error-control',
      title: 'Error Control (ARQ)',
      summary: 'Stop-and-Wait, Go-Back-N, and Selective Repeat ARQ.',
      body: `**Error control** combines error detection with retransmission to achieve reliable delivery over unreliable links. The general mechanism is called **ARQ (Automatic Repeat Request)**. If the receiver detects an error (using CRC or checksum), or if a frame is lost, the receiver triggers retransmission of the affected frame(s).

Error control uses four key mechanisms: error detection (CRC/checksum), positive acknowledgment (ACK), negative acknowledgment (NAK), and timeout retransmission.

**Stop-and-Wait ARQ:**
The sender transmits one frame and starts a timer. If the receiver gets the frame without error, it sends an ACK. If the frame is corrupted, the receiver sends a NAK (or discards the frame silently). If the timer expires before receiving any response (frame or ACK was lost), the sender retransmits the frame. Stop-and-Wait ARQ uses alternating sequence numbers 0 and 1 to prevent duplicates: if the receiver gets a frame with the same sequence number as the last accepted frame, it discards the duplicate and resends the ACK.

**Go-Back-N ARQ (GBN):**
The sender can transmit up to N frames without acknowledgment (sliding window of size N). If the receiver detects an error in frame k, it discards frame k and all subsequent frames (k+1, k+2, …), even if they arrive correctly. The receiver sends a NAK for frame k, and the sender goes back to frame k and retransmits it and all following frames. This is why it's called "Go-Back-N": on error, the sender goes back N frames.

The maximum window size for GBN is **N ≤ 2^m − 1**, where m is the number of bits in the sequence number field. The receiver window is always 1 (it only accepts frames in order). GBN is simpler to implement than Selective Repeat but wastes bandwidth when errors occur because correctly received frames are discarded and retransmitted.

**Selective Repeat ARQ (SR):**
Only the specific erroneous frame is retransmitted — correctly received out-of-order frames are buffered at the receiver and resequenced. The receiver window is larger than 1, allowing it to accept frames out of order.

The maximum window size for SR is **N ≤ 2^(m−1)**. This stricter limit prevents ambiguity: if the window were larger, new frames and retransmissions could have overlapping sequence numbers, making it impossible for the receiver to distinguish between a new frame and a retransmission.

Selective Repeat is more bandwidth-efficient than GBN (only erroneous frames are retransmitted) but requires more complex receiver logic (out-of-order buffering and sorting).`,
      formulas: [
        'GBN: Window Size N ≤ 2^m − 1',
        'SR: Window Size N ≤ 2^(m−1)',
        'Throughput GBN ≈ N / (1 + 2a) when no errors',
        'Throughput SR ≈ 1 − P (where P = frame error probability)',
      ],
      keyPoints: [
        'ARQ = error detection + ACK/NAK + timeout retransmission',
        'Stop-and-Wait ARQ: send 1, wait, uses sequence 0/1 to prevent duplicates',
        'Go-Back-N: sender retransmits frame k and all subsequent; window ≤ 2^m − 1',
        'Selective Repeat: only erroneous frame retransmitted; window ≤ 2^(m−1)',
        'GBN: simpler but wastes bandwidth on error; SR: efficient but complex receiver',
      ],
      textbookRef: 'Forouzan, Ch. 11',
      sim: 'arq-simulator',
    },
    {
      id: 'u4-protocols',
      title: 'Asynchronous & Synchronous Protocols',
      summary: 'Character-oriented and bit-oriented protocols.',
      body: `Data link protocols can be classified based on their framing approach into **asynchronous (character-oriented)** and **synchronous (bit-oriented)** categories.

**Asynchronous Protocols (Character-Oriented):**
In asynchronous transmission, data is sent character by character. Each character is framed individually with a start bit (logic 0) and one or more stop bits (logic 1). Between characters, the line is in an idle state (continuous 1s). The start bit signals the beginning of a new character, allowing the receiver to synchronise its clock for the duration of that character.

The most important character-oriented protocol is **BSC (Binary Synchronous Communication)**, also known as **BISYNC**, developed by IBM in 1967. BISYNC uses special control characters for framing:
- **SYN** (synchronisation): used to synchronise the receiver's clock
- **SOH** (Start of Header): marks the beginning of the header section
- **STX** (Start of Text): marks the beginning of the data section
- **ETX** (End of Text): marks the end of the data section

A BISYNC frame structure is: SYN | SYN | SOH | Header | STX | Data | ETX | BCC

The problem with character-oriented protocols is **transparency**: if the data happens to contain a byte pattern identical to ETX (end of text), the receiver will incorrectly interpret it as the end of the frame. **Byte stuffing** solves this by inserting an escape character (DLE — Data Link Escape) before any control character that appears in the data. At the receiver, the DLE is removed and the following byte is treated as data, not a control character.

**Synchronous Protocols (Bit-Oriented):**
Bit-oriented protocols like **HDLC (High-level Data Link Control)** and **SDLC (Synchronous Data Link Control)** frame data as a continuous stream of bits rather than characters. These protocols are more efficient and flexible because the data field can be any length (not constrained to character boundaries) and the framing is done with a special bit pattern (flag) rather than special characters.

SDLC was developed by IBM for SNA networks. HDLC, standardised by ISO, is the basis for many modern protocols including PPP (Point-to-Point Protocol used for Internet dial-up and DSL), LAPB (used in X.25), and LAPD (used in ISDN).`,
      formulas: [
        'Async overhead = (start + stop bits) / total bits per character',
        'Async efficiency: 8/(8+2) = 80% for 1 start + 1 stop bit',
      ],
      keyPoints: [
        'Asynchronous: each character individually framed with start/stop bits',
        'BISYNC: character-oriented; uses SYN, SOH, STX, ETX control characters',
        'Byte stuffing inserts DLE before control characters appearing in data',
        'Synchronous: continuous bit stream; HDLC/SDLC use flag-based framing',
        'Bit-oriented protocols are more efficient and not constrained to byte boundaries',
      ],
      textbookRef: 'Forouzan, Ch. 11',
    },
    {
      id: 'u4-hdlc',
      title: 'HDLC Framing',
      summary: 'HDLC frame structure and bit stuffing.',
      body: `**HDLC (High-level Data Link Control)** is the most important bit-oriented synchronous data link protocol, standardised by ISO (ISO 13239). HDLC forms the basis for numerous derived protocols including PPP, LAPB, LAPD, and LLC.

**HDLC Frame Structure:**
Every HDLC frame is delimited by a special 8-bit **flag** sequence: **01111110** (0x7E). The complete frame format is:

| Flag | Address | Control | Data (Information) | FCS | Flag |
| 01111110 | 8+ bits | 8 or 16 bits | Variable | 16 or 32 bits | 01111110 |

- **Flag (8 bits):** 01111110 — marks the beginning and end of the frame. A single flag can serve as the closing flag of one frame and the opening flag of the next.
- **Address (8 or more bits):** Identifies the secondary station in an unbalanced configuration. In a balanced configuration (using LAPB), it identifies the destination. An address of 11111111 is the broadcast address.
- **Control (8 or 16 bits):** Defines the frame type and carries sequence numbers and ACK information.
- **Data (Information):** Variable-length payload.
- **FCS (Frame Check Sequence):** 16-bit or 32-bit CRC for error detection, typically using CRC-CCITT (x¹⁶+x¹²+x⁵+1).

**HDLC Frame Types:**
1. **I-frame (Information):** Carries user data and piggybacked acknowledgments. Contains N(S) (send sequence number) and N(R) (receive sequence number for ACK).
2. **S-frame (Supervisory):** Provides flow and error control without carrying data. Subtypes: RR (Receive Ready = ACK), RNR (Receive Not Ready = flow control stop), REJ (Reject = Go-Back-N NAK), SREJ (Selective Reject = Selective Repeat NAK).
3. **U-frame (Unnumbered):** Used for link management — establishing, maintaining, and disconnecting the data link. Examples: SABM (Set Asynchronous Balanced Mode), DISC (Disconnect), UA (Unnumbered Acknowledgment).

**Bit Stuffing:**
Since the flag pattern 01111110 is used as a delimiter, it must never appear inside the frame's data. HDLC uses **bit stuffing**: the sender scans the outgoing bit stream and inserts a **0** after every sequence of **five consecutive 1s** in the address, control, data, or FCS fields. The receiver performs the reverse — **bit unstuffing** — by removing any 0 that follows five consecutive 1s. This guarantees that six consecutive 1s (which would match the flag) never appear in the payload.

Bit stuffing is transparent to the upper layers and adds minimal overhead (at most one extra bit per five data bits in the worst case).`,
      formulas: [
        'HDLC Flag = 01111110 (0x7E)',
        'Bit stuffing: insert 0 after every 5 consecutive 1s',
        'Max bit stuffing overhead ≈ 20% (worst case: all 1s data)',
        'FCS: CRC-CCITT x¹⁶ + x¹² + x⁵ + 1',
      ],
      keyPoints: [
        'HDLC frame: Flag | Address | Control | Data | FCS | Flag',
        'Flag = 01111110; bit stuffing prevents flag appearance in data',
        'I-frames carry data + piggybacked ACK; S-frames for flow/error control; U-frames for link management',
        'Bit stuffing: insert 0 after five consecutive 1s; receiver removes it',
        'HDLC is the basis for PPP, LAPB, LAPD, and LLC protocols',
      ],
      textbookRef: 'Forouzan, Ch. 11',
      sim: 'hdlc-framing',
    },
  ],
};
