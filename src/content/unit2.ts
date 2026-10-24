import type { Unit } from './types';

export const unit2: Unit = {
  id: 'unit-2',
  number: 2,
  title: 'Encoding and Modulating',
  courseOutcome: 'CO2',
  hours: 9,
  objectives: [
    'Analyze digital-to-digital line coding schemes and evaluate their DC component and clock recovery characteristics',
    'Explain analog-to-digital conversion using Pulse Code Modulation (PCM) and Nyquist sampling theorem',
    'Differentiate digital-to-analog carrier modulation methods: ASK, FSK, PSK, and constellation mapping in QAM',
    'Compare analog-to-analog modulation techniques: AM, FM, and PM with their respective bandwidth requirements',
    'Evaluate guided (twisted pair, coax, fiber) and unguided (radio, microwave, infrared) transmission media',
    'Calculate channel capacity and data transmission limits using Shannon and Nyquist formulations',
  ],
  topics: [
    {
      id: 'u2-d2d',
      title: 'Digital-to-Digital Encoding (Line Coding)',
      summary: 'Mapping discrete binary data bits into discrete continuous electrical voltage pulses.',
      body: `Digital-to-digital conversion, commonly known as line coding, is the process of converting digital data (a sequence of binary 1s and 0s) into a digital signal (a sequence of discrete voltage pulses suitable for transmission across a physical medium).

When selecting or designing a line coding scheme, communication engineers must evaluate several critical metrics:
- **DC Component (Direct Current Bias):** When the voltage level in a digital signal remains constant for long intervals, the signal creates a low frequency component around zero Hertz. Transformers and AC-coupling capacitors commonly used in telephone and network transceivers block DC components. A signal with zero DC component eliminates baseline wander and allows long-distance electrical isolation.
- **Self-Synchronization (Clock Recovery):** The receiver's clock must match the sender's clock precisely in both frequency and phase. If the signal has frequent, predictable voltage transitions (such as at the start or middle of every bit interval), the receiver can synchronize its clock directly from the data stream.
- **Signal Levels & Bandwidth Efficiency:** Multi-level schemes (such as MLT-3) allow multiple bits to be transmitted per baud, significantly reducing the required transmission bandwidth.

Line coding schemes are broadly classified into unipolar, polar, bipolar, and multi-level:
- **NRZ-L (Non-Return to Zero - Level):** The level of the signal is determined directly by the state of the bit. In Forouzan's standard convention, binary 0 corresponds to a positive voltage (+V) and binary 1 corresponds to a negative voltage (-V). A major drawback is that long strings of identical bits generate large DC components and provide zero clock synchronization.
- **NRZ-I (Non-Return to Zero - Invert):** An inversion of the voltage occurs at the beginning of the bit interval if the bit is a 1; no inversion occurs if the bit is a 0. While it solves synchronization for runs of 1s, runs of consecutive 0s still produce clock drift.
- **RZ (Return to Zero):** Uses three voltage levels (+V, 0, -V). The signal returns to zero volts halfway through every bit interval. While providing clock synchronization on every single bit, it requires double the bandwidth of NRZ schemes.
- **Manchester (IEEE 802.3 Ethernet):** Combines clock and data by guaranteeing a transition in the exact middle of every bit interval. A binary 0 is represented by a high-to-low transition (+V to -V), while a binary 1 is represented by a low-to-high transition (-V to +V). Manchester achieves completely zero DC component and perfect synchronization.
- **Differential Manchester (Token Ring):** The mid-bit transition provides clock synchronization. The presence of a transition at the start of the bit interval denotes binary 0, whereas the absence of a start transition denotes binary 1.
- **AMI (Alternate Mark Inversion):** A bipolar scheme where binary 0 is represented by 0 volts, and binary 1s alternate between positive and negative polarities (+V and -V). Alternating polarity guarantees zero DC bias for long streams of 1s.
- **MLT-3 (Multi-Level Transmit-3):** Uses three voltage levels (+V, 0, -V) and transitions cyclically (0 → +V → 0 → -V → 0) only on binary 1s. Binary 0 produces no transition. Used in 100Base-TX Fast Ethernet because its maximum fundamental frequency is only one-fourth of the bit rate.`,
      keyPoints: [
        'Line coding converts binary bit sequences into digital voltage waveforms.',
        'DC component causes baseline wander; Manchester and Diff Manchester guarantee zero DC.',
        'Self-synchronization requires frequent voltage transitions; Manchester transitions mid-bit for every bit.',
        'AMI alternates polarity for 1s, preventing DC accumulation; MLT-3 reduces bandwidth by cycling across 3 levels.',
      ],
      textbookRef: 'Forouzan, Ch. 4 §4.1',
      sim: 'line-coding',
    },
    {
      id: 'u2-a2d',
      title: 'Analog-to-Digital Conversion (PCM)',
      summary: 'Digitizing continuous real-world analog signals using sampling, quantization, and binary encoding.',
      body: `Analog-to-digital conversion (ADC) translates a continuous-time, continuous-amplitude physical waveform (such as voice audio or sensor signals) into a discrete-time, discrete-amplitude binary stream. The most prevalent technique in telecommunications is Pulse Code Modulation (PCM).

PCM consists of three sequential operations:
1. **Sampling (Pulse Amplitude Modulation - PAM):** The continuous analog signal is sampled at uniform periodic intervals of $T_s$ seconds, converting the continuous curve into a series of discrete PAM pulses.
2. **Quantization:** The infinite continuous range of PAM amplitudes is mapped into a finite number $L = 2^n$ of discrete quantization levels. The difference between the actual analog sample value and the assigned quantization level is the **quantization error (noise)**.
3. **Encoding:** Each quantized level is represented as an $n$-bit binary word.

The cornerstone of all digital signal processing is the **Nyquist Sampling Theorem**:
An analog signal with highest frequency $f_{max}$ can be completely and accurately reconstructed from its samples if and only if the sampling frequency $f_s$ satisfies:
$$f_s \\ge 2 \\times f_{max}$$
The rate $2 f_{max}$ is termed the **Nyquist Rate**.

If a signal is sampled below the Nyquist rate ($f_s < 2 f_{max}$), a phenomenon called **aliasing** occurs. High-frequency signal components fold back into the lower frequency spectrum, masquerading as false low frequencies that irreversibly distort the reconstructed signal.

The theoretical Signal-to-Quantization-Noise Ratio (SQNR) for a uniform PCM quantizer with $n$ bits per sample is:
$$\\text{SNR}_{dB} = 6.02 \\times n + 1.76 \\text{ dB}$$
Each additional bit of quantization improves the signal quality by approximately 6 dB (doubling dynamic precision). In standard digital telephony (DS0 / PCM 64 kbps), voice signals band-limited to 4 kHz are sampled at 8,000 samples/second with 8 bits per sample, yielding $8000 \\times 8 = 64,000$ bps. Non-uniform quantization (**companding** using μ-law in North America/Japan and A-law in Europe) is applied to provide higher resolution for quiet voice signals.`,
      formulas: [
        'Nyquist Sampling Rate: f_s ≥ 2 × f_max',
        'Quantization Step Size: Δ = 2V_max / L',
        'Quantization SNR: SNR_dB = 6.02 × n + 1.76 dB',
        'PCM Digital Bit Rate: R_b = f_s × n bps',
      ],
      keyPoints: [
        'Nyquist Theorem mandates sampling at least twice the maximum signal frequency (f_s ≥ 2 f_max).',
        'Undersampling causes frequency aliasing where high frequencies fold into lower bands.',
        'Quantization assigns each sample to one of L = 2^n levels; quantization error is bounded by ±Δ/2.',
        'Standard telephone voice uses 8000 samples/sec × 8 bits/sample = 64 kbps (DS-0 channel).',
      ],
      textbookRef: 'Forouzan, Ch. 4 §4.2',
      sim: 'sampling-pcm',
    },
    {
      id: 'u2-d2a',
      title: 'Digital-to-Analog Modulation (ASK, FSK, PSK, QAM)',
      summary: 'Modulating radio-frequency analog carrier waves with digital information.',
      body: `Digital-to-analog conversion, or carrier modulation, modifies one or more characteristics of a high-frequency sinusoidal carrier wave ($s(t) = A \\sin(2\\pi f_c t + \\phi)$) to represent discrete digital data across bandpass channels such as telephone lines, cable coax, and wireless radio.

The primary digital modulation techniques include:
- **ASK (Amplitude Shift Keying):** The amplitude of the carrier wave is varied while frequency and phase remain constant. In Binary ASK (or On-Off Keying, OOK), bit 1 is represented by the presence of carrier and bit 0 by zero (or low) amplitude. ASK is highly susceptible to atmospheric noise and attenuation.
- **FSK (Frequency Shift Keying):** The frequency of the carrier is shifted between two distinct frequencies: $f_1 = f_c + \\Delta f$ for bit 1 and $f_2 = f_c - \\Delta f$ for bit 0. Amplitude and phase remain fixed. BFSK is widely used in high-frequency radio and early telephone modems (e.g. Bell 103).
- **PSK (Phase Shift Keying):** The phase of the carrier is altered to reflect binary states while amplitude and frequency remain constant. In BPSK (Binary PSK), bit 0 has phase $0^\\circ$ and bit 1 has phase $180^\\circ$ ($\\pi$ radians). In QPSK (Quadrature PSK), 2 bits are combined into 4 phase states ($45^\\circ, 135^\\circ, 225^\\circ, 315^\\circ$), doubling spectral efficiency.

**Quadrature Amplitude Modulation (QAM):**
QAM combines both amplitude and phase modulation, allowing multiple bits to be transmitted per signal unit (baud). A QAM system modulates two orthogonal carriers ($A_1 \\cos(2\\pi f_c t)$ and $A_2 \\sin(2\\pi f_c t)$) known as the In-phase (I) and Quadrature (Q) components.
- In **4-QAM** (equivalent to QPSK), 2 bits per symbol yield 4 states.
- In **16-QAM**, 4 bits per symbol produce 16 distinct constellation points arranged on a $4 \\times 4$ rectangular grid.
- Modern broadband cable modems and Wi-Fi networks utilize **64-QAM**, **256-QAM**, and **1024-QAM** to achieve multi-gigabit throughput.

A **Constellation Diagram** maps modulated symbols onto a 2D Cartesian plane where the horizontal axis represents In-phase (I) and the vertical axis represents Quadrature (Q). Gray coding is applied so that adjacent constellation points differ by only a single bit, minimizing bit error rate in the presence of noise.`,
      formulas: [
        'Baud Rate (Symbol Rate): S = N / r (where r = bits/symbol)',
        'Bandwidth for ASK/PSK: B = (1 + d) × S',
        'Bandwidth for FSK: B = 2Δf + (1 + d) × S',
      ],
      keyPoints: [
        'ASK alters carrier amplitude, FSK alters carrier frequency, and PSK alters carrier phase.',
        'Baud rate (symbols/sec) differs from bit rate (bits/sec): Bit Rate = Baud Rate × log₂(L).',
        'QAM combines amplitude and phase modulation on orthogonal I and Q sub-carriers.',
        'Constellation diagrams represent symbol states; Gray coding ensures adjacent points differ by 1 bit.',
      ],
      textbookRef: 'Forouzan, Ch. 5 §5.1',
      sim: 'modulation',
    },
    {
      id: 'u2-a2a',
      title: 'Analog-to-Analog Modulation (AM, FM, PM)',
      summary: 'Translating continuous low-frequency baseband signals to high-frequency radio spectra.',
      body: `Analog-to-analog modulation modulates a continuous high-frequency analog carrier wave with a continuous low-frequency analog message signal (such as human voice or broadcast audio). Modulation is essential because low-frequency signals cannot travel long distances through air; practical antenna dimensions are inversely proportional to frequency ($\\lambda = c / f$), requiring carrier frequencies in the megahertz or gigahertz range.

The three classical schemes are:
- **Amplitude Modulation (AM):** The instantaneous amplitude of the carrier varies linearly with the instantaneous value of the modulating message signal:
  $$s_{AM}(t) = A_c [1 + \\mu \\cdot m_n(t)] \\cos(2\\pi f_c t)$$
  The **modulation index** $\\mu = A_m / A_c$ governs the modulation depth. If $\\mu \\le 1$, the carrier envelope faithfully follows the message signal, enabling simple envelope detection with a diode. If $\\mu > 1$ (**over-modulation**), the envelope crosses zero, causing severe phase inversion and audio distortion. AM broadcast occupies the 535–1705 kHz band with a channel bandwidth of $B = 2 f_m$ (typically 10 kHz).
- **Frequency Modulation (FM):** The instantaneous frequency of the carrier varies directly with the message amplitude, while carrier amplitude remains constant:
  $$s_{FM}(t) = A_c \\cos\\left(2\\pi f_c t + \\beta \\sin(2\\pi f_m t)\\right)$$
  The modulation index is $\\beta = \\Delta f / f_m$, where $\\Delta f$ is the peak frequency deviation. FM provides outstanding noise immunity because amplitude spikes (from lightning, motors, or interference) do not affect frequency-encoded data.
- **Phase Modulation (PM):** The instantaneous phase of the carrier is proportional to the modulating signal. Mathematically, PM and FM are intimately related; PM is equivalent to FM where the message is differentiated before frequency modulation.

**Bandwidth Requirements (Carson's Rule):**
While an AM signal requires exactly twice the message bandwidth ($B_{AM} = 2 f_m$), FM theoretically generates an infinite number of Bessel sidebands. In practice, Carson's Rule gives the transmission bandwidth required to capture 98% of signal energy:
$$B_{FM} = 2(\\beta + 1) f_m = 2(\\Delta f + f_m)$$
Commercial FM broadcast (88–108 MHz) permits a peak deviation $\\Delta f = 75$ kHz with $f_m = 15$ kHz, requiring $2(75 + 15) = 180$ kHz (allocated 200 kHz channels including guard bands).`,
      formulas: [
        'AM Signal: s(t) = A_c [1 + μ cos(2π f_m t)] cos(2π f_c t)',
        'AM Bandwidth: B_AM = 2 × f_m',
        'FM Modulation Index: β = Δf / f_m',
        "Carson's Rule FM Bandwidth: B_FM = 2(β + 1) f_m = 2(Δf + f_m)",
      ],
      keyPoints: [
        'Modulation shifts baseband signals to high radio frequencies for efficient antenna radiation (λ = c/f).',
        'AM varies carrier amplitude; modulation index μ must not exceed 1 to avoid envelope distortion.',
        "FM varies instantaneous frequency; Carson's rule dictates required bandwidth: B = 2(Δf + f_m).",
        'FM delivers superior noise immunity over AM because noise predominantly affects amplitude, not frequency.',
      ],
      textbookRef: 'Forouzan, Ch. 5 §5.2',
    },
    {
      id: 'u2-media',
      title: 'Guided and Unguided Transmission Media',
      summary: 'Physical conduits and wireless electromagnetic spectra that carry data communication.',
      body: `The transmission medium is the physical path situated below the physical layer that transports electromagnetic energy from sender to receiver. Media are classified into **guided media** (bound by physical conductors) and **unguided media** (free space wireless propagation).

### Guided Media
1. **Twisted Pair Cable:** Consists of two insulated copper conductors twisted around each other in a helical spiral. Twisting ensures that both wires are exposed equally to external electromagnetic interference (EMI) and crosstalk from adjacent pairs; differential receiver circuits subtract out the common-mode noise.
   - **UTP (Unshielded Twisted Pair):** Standard in Ethernet LANs (Cat 5e up to 100 MHz/1 Gbps, Cat 6 up to 250 MHz/10 Gbps at short lengths, Cat 6a up to 500 MHz).
   - **STP (Shielded Twisted Pair):** Adds metallic foil shielding around pairs for noisy industrial environments.
2. **Coaxial Cable:** A central inner copper conductor surrounded by a dielectric insulator, an outer cylindrical braided conductor shield, and an outer protective sheath. Operates at higher frequencies than twisted pair and was widely used in legacy bus Ethernet (10Base5 Thicknet and 10Base2 Thinnet) and modern cable broadband (DOCSIS).
3. **Optical Fiber:** Employs light pulses traveling through a thin strand of ultra-pure silica glass or plastic. Works on the principle of **Total Internal Reflection**: light traveling in the central core (refractive index $n_1$) reflects completely off the outer cladding ($n_2$) whenever the angle of incidence exceeds the **critical angle** ($n_1 > n_2$).
   - **Multi-Mode Step-Index:** Multiple light rays travel along different reflected paths, suffering from modal dispersion.
   - **Multi-Mode Graded-Index:** Core density decreases outward, bending light into sinusoidal curves and reducing dispersion.
   - **Single-Mode Fiber (SMF):** Microscopic core diameter (8–10 μm) permits only a single axial light ray, completely eliminating modal dispersion. Used for long-haul telecommunications spanning hundreds of kilometers with negligible attenuation (0.2 dB/km).

### Unguided Media (Wireless)
Wireless communication utilizes electromagnetic waves propagating through the atmosphere or vacuum:
- **Radio Waves (3 kHz to 1 GHz):** Omnidirectional, penetrate walls, reflect off the ionosphere; used for AM/FM radio and cellular telephony.
- **Microwaves (1 GHz to 300 GHz):** Unidirectional line-of-sight propagation requiring focused parabolic dish antennas. Used for terrestrial microwave relay towers and satellite communication.
- **Infrared (300 GHz to 400 THz):** High-frequency light waves that cannot penetrate solid walls, preventing interference in adjacent rooms (used in remote controls and short-range IrDA).`,
      keyPoints: [
        'Twisted pair cancels external EMI through symmetrical twisting and differential signaling.',
        'Optical fiber transmits light via total internal reflection (n_core > n_cladding) with near-zero EMI.',
        'Single-mode fiber eliminates modal dispersion, enabling multi-gigabit long-haul transmission.',
        'Unguided wireless uses radio waves (omnidirectional), microwaves (line-of-sight), and infrared (short-range, line-of-sight).',
      ],
      textbookRef: 'Forouzan, Ch. 7',
    },
    {
      id: 'u2-impairment',
      title: 'Transmission Impairment, Performance & Capacity',
      summary: 'Signal degradation mechanisms and fundamental theoretical limits of communication channels.',
      body: `Signals traveling across any physical transmission medium inevitably degrade between transmitter and receiver. The three primary causes of transmission impairment are:
1. **Attenuation:** The progressive loss of signal energy as it travels through a medium due to electrical resistance or absorption. Amplifiers or repeaters must be introduced to restore signal amplitude. Attenuation is measured logarithmically in decibels:
   $$\\text{Loss}_{dB} = 10 \\log_{10}\\left(\\frac{P_2}{P_1}\\right)$$
2. **Distortion:** Changes in signal shape when a composite signal composed of multiple harmonic frequencies travels through a medium. Different frequency components experience different propagation speeds and attenuations, arriving at the receiver out of phase.
3. **Noise:** Unwanted external electrical energy coupled into the transmission line. Noise types include **Thermal Noise** (random agitation of electrons in conductors, proportional to temperature $N = k T B$), **Intermodulation Noise** (mixing of multiple frequencies on a non-linear channel), **Crosstalk** (inductive coupling from adjacent wire pairs), and **Impulse Noise** (sudden high-energy spikes from lightning or machinery).

### Channel Capacity Theorems
Channel capacity represents the theoretical upper bound on the data rate (bits per second) that can be reliably transmitted across a communication link:

**Nyquist Theorem (Noiseless Channel):**
Derived by Harry Nyquist in 1928 for an idealized, noise-free channel of bandwidth $B$ using $L$ discrete signal levels:
$$C = 2 B \\log_2(L) \\text{ bps}$$
To increase bit rate in a noiseless channel, one can either increase channel bandwidth $B$ or increase the number of signal voltage levels $L$.

**Shannon Capacity Theorem (Noisy Channel):**
In 1948, Claude Shannon introduced the fundamental limit of information theory for real-world channels corrupted by Gaussian thermal noise. Regardless of the number of signal levels or modulation scheme used, the maximum error-free capacity is:
$$C = B \\log_2(1 + \\text{SNR}_{linear}) \\text{ bps}$$
where $\\text{SNR}_{linear} = 10^{(\\text{SNR}_{dB} / 10)}$.

**Shannon's Crucial Implications:**
- Capacity is strictly bounded by channel bandwidth $B$ and signal-to-noise ratio SNR.
- High data rates cannot be achieved by arbitrarily increasing signal levels $L$, because noise creates an uncertainty threshold where adjacent voltage levels become indistinguishable.
- To transmit at higher data rates across a noisy channel, one must either broaden the bandwidth $B$ or increase transmitter signal power $S$ relative to noise $N$.`,
      formulas: [
        'Decibel Power Ratio: dB = 10 × log₁₀(P₂ / P₁)',
        'Decibel Voltage Ratio: dB = 20 × log₁₀(V₂ / V₁)',
        'Nyquist Bit Rate (Noiseless): C = 2B × log₂(L)',
        'Shannon Capacity (Noisy): C = B × log₂(1 + SNR)',
        'Thermal Noise Power: N = k × T × B',
      ],
      keyPoints: [
        'Transmission impairments comprise attenuation (loss of power), distortion (phase shifts), and noise (thermal, crosstalk, impulse).',
        'Nyquist theorem defines maximum noiseless bit rate: C = 2B log₂(L).',
        'Shannon theorem defines absolute noisy channel capacity: C = B log₂(1 + SNR).',
        'Increasing signal levels L in noisy channels eventually causes decision errors when level spacing falls below noise floor.',
      ],
      textbookRef: 'Forouzan, Ch. 3 §3.5–3.7',
      sim: 'channel-capacity',
    },
  ],
};
