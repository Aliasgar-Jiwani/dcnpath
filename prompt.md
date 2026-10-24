You are a senior front-end engineer and an educator in computer networks. Build "DCNPath", an interactive learning platform for the course SMC3TE105: Data Communication and Networks (MCA, G H Raisoni SkillTech University, Nagpur), using React + Vite. It is a teaching tool for students and for a professor to project in class. Every concept should be something the student can manipulate, not just read.

## 1. Tech stack
- Vite + React 18 + TypeScript, plain CSS Modules or CSS variables (no heavy UI kit)
- react-router-dom (HashRouter, so it works on GitHub Pages)
- State: React Context + useReducer. Persist progress in localStorage, wrapped in try/catch
- Diagrams and waveforms: hand-written SVG React components (no chart library unless truly needed)
- Animation: requestAnimationFrame hooks or CSS transitions. Respect prefers-reduced-motion
- Testing: Vitest for all algorithm code in /src/lib (required, see section 6)
- Deploy: GitHub Pages via a GitHub Actions workflow. Set vite.config base from an env variable (default "/dcnpath/")

## 2. Folder structure
src/
  app/ (App.tsx, routes.tsx, ThemeProvider, ProgressProvider)
  components/ (Layout, Sidebar, TopicAccordion, Callout, Formula, QuizCard, SimControls, ProgressBar, SvgCanvas)
  content/ (unit1.ts ... unit5.ts, quizBank.ts) - all course content as typed data, never hard-coded in JSX
  features/
    unit1/ (TopologyExplorer, SignalViewer)
    unit2/ (LineCoding, Modulation, Sampling, ChannelCapacity)
    unit3/ (Multiplexing, ParityLrc, CrcDivision, Checksum, Hamming)
    unit4/ (ArqSimulator, HdlcFraming)
    unit5/ (CsmaCd, TokenRing, SwitchingCompare, IsdnChannels)
  lib/ (pure, tested algorithm functions, no React imports)
  hooks/ (useLocalStorage, useAnimationLoop, useTheme)
  styles/

## 3. Content model (src/content)
type Topic = { id; title; summary; body (markdown-like string); formulas?: string[]; keyPoints: string[]; textbookRef: string (e.g. "Forouzan, Ch. 4"); sim?: SimId }
type Unit = { id; number; title; courseOutcome: "CO1".."CO5"; hours: 9; topics: Topic[]; objectives: string[] }
type Question = { id; unitId; co; bloomLevel: "BT1".."BT6"; verb (the Bloom's verb the stem starts with, e.g. Define, Explain, Calculate, Compare); stem; options: string[4]; correctIndex; explanation; difficulty: 1|2|3 }
Use exactly this syllabus, unit by unit:
- Unit 1 Introduction to Data Communication: components, networks, protocols and standards, line configuration, topology, transmission mode, analog and digital signals, periodic/aperiodic, time and frequency domains, composite signals
- Unit 2 Encoding and Modulating: digital-to-digital, analog-to-digital, digital-to-analog, analog-to-analog, digital data transmission, DTE-DCE interface, modems, cable modems, guided and unguided media, transmission impairment, performance, wavelength, Shannon capacity, media comparison
- Unit 3 Multiplexing: many-to-one/one-to-many, FDM, WDM, TDM, telephone system; error detection and correction: types of errors, VRC, LRC, CRC, checksum, error correction
- Unit 4 Data Link Control: line discipline, flow control, error control, asynchronous and synchronous protocols, character-oriented and bit-oriented protocols, link access procedures
- Unit 5 Local Area Networks: Ethernet and other Ethernet networks, token bus, token ring, FDDI, comparison, IEEE 802.6 (DQDB), SMDS, switching (circuit, packet, message), ISDN (services, history, subscriber access)
Textbook: Behrouz A. Forouzan, Data Communication and Networking (2/e). References: Stallings, Schweber, Freeg, Comer.
Write real explanatory content for every topic (3 to 6 short paragraphs or key points each), not placeholders.

## 4. Pages and navigation
- Home: hero, 5 unit cards (title, CO tag, progress ring, "Continue" button), overall progress, "Resume where you left off"
- Unit page: left sidebar with topics (sticky), topic content, then the unit's simulators in tabs, then the unit quiz. Next/previous topic buttons
- Quiz page: filter by unit, CO, Bloom's level and difficulty. Modes: Practice (instant feedback and explanation) and Test (timed, results at the end with per-CO and per-BT breakdown)
- Glossary page: searchable list of all key terms (generated from content)
- Formula sheet page: all formulas (Shannon, Nyquist, Hamming bits, CRC polynomial, sliding-window efficiency, etc.) with a small calculator for each
- Teacher mode (toggle in header): larger fonts, hides the sidebar, a "lecture path" that follows the teaching plan (9 lectures per unit, 3 per week), a presenter timer, and keyboard shortcuts (arrow keys for next/prev topic)
- Light/dark theme (respect system setting plus a manual toggle), fully responsive down to 360 px, keyboard accessible, WCAG AA contrast, aria labels on all SVG simulators

## 5. Simulators (the core of the product)
Each simulator has a controls panel, a live SVG visualisation, a "What is happening?" explanation panel that updates with every change, a Reset button, and a "Show me the steps" toggle. All logic lives in /src/lib, and components only render it.

Unit 1
- TopologyExplorer: mesh, star, ring, bus, tree; 3 to 12 devices; click a device or link to fail it; show the effect (isolated nodes, network split, single point of failure), link count n(n-1)/2, ports per device, cost comparison table
- SignalViewer: sliders for amplitude, frequency and phase of up to 3 sine waves; shows each component, the composite signal, and the frequency-domain bar chart together; periodic vs aperiodic examples; bandwidth readout

Unit 2
- LineCoding: bit string input; NRZ-L, NRZ-I, RZ, Manchester, differential Manchester, AMI, MLT-3 (draw all selected schemes stacked for comparison); highlight transitions, show the DC-component and self-synchronisation notes
- Modulation: ASK, FSK, PSK, QAM constellation (4-QAM and 16-QAM) with a bit-to-symbol mapping, plus AM and FM of an analog message; sliders for carrier frequency and bit rate
- Sampling (PCM): draggable sample rate over a signal; Nyquist line; aliasing demonstration; quantisation levels slider; shows the quantisation error and the resulting bit rate
- ChannelCapacity: Shannon and Nyquist calculators with a live graph of capacity vs SNR and vs bandwidth; unit conversions (dB to ratio); media comparison table (twisted pair, coax, fibre, microwave, satellite) with attenuation, bandwidth and cost

Unit 3
- Multiplexing: animated FDM (frequency bands with guard bands), WDM (coloured wavelengths through a prism), synchronous TDM (frames, slots, framing bits) and statistical TDM; users can add or remove sources and see slot usage and wasted slots
- ParityLrc: VRC (even/odd) and a 2D LRC grid; click bits to inject errors and see which errors are detected and which escape
- CrcDivision: user enters data and a generator (as binary or as a polynomial); shows modulo-2 long division step by step with an animated XOR; shows the transmitted codeword; an "inject error" step verifies that the receiver's remainder is non-zero; burst-error detection explanation
- Checksum: 16-bit and 8-bit one's complement checksum with wrap-around carry, step by step, sender and receiver views
- Hamming: Hamming code for 4 to 11 data bits (compute r from 2^r >= m + r + 1); even parity; click a bit to flip it; show the syndrome and the corrected bit; show a 2-error case where the code fails

Unit 4
- ArqSimulator: Stop-and-Wait, Go-Back-N and Selective Repeat on a sender/receiver timeline (frames and ACKs animate along arrows); controls: window size, frame count, loss/damage per frame (click to lose a frame or an ACK), timeout; live metrics (transmissions, efficiency, throughput); sequence-number and window-size limits (N <= 2^m - 1 for GBN, 2^(m-1) for SR) with a warning when violated
- HdlcFraming: build an HDLC frame (flag, address, control, data, FCS, flag); bit stuffing and unstuffing step by step; an I/S/U frame control-field decoder; compare with character-oriented BISYNC byte stuffing; asynchronous start/stop framing demo
- Also include simple ENQ/ACK and poll/select line discipline diagrams

Unit 5
- CsmaCd: several stations on a shared bus; animated carrier sense, collision, jam signal and binary exponential back-off; metrics (collisions, utilisation); contrasts with CSMA/CA in one explanatory panel
- TokenRing: a token circulating; stations queue frames; Token Ring vs Token Bus comparison; FDDI dual-ring fault wrap-around demo
- SwitchingCompare: circuit vs packet (datagram and virtual circuit) vs message switching; animate the same message crossing a 4-hop network; show setup time, propagation, queueing and total delay; a calculator for delay
- IsdnChannels: BRI (2B+D) and PRI (23B+D / 30B+D) channel diagram, NT1/TE/TA reference points, and rates; include a short IEEE 802.6 DQDB and SMDS explainer card

## 6. Algorithms and tests (src/lib)
Implement as pure functions with typed inputs and outputs, and write Vitest tests with known textbook examples:
lineCode(bits, scheme) -> level array; modulate(bits, scheme, params); shannon(B, snrDb); nyquist(B, L); pcm(signal, rate, bits); crc(data, generator) returning steps; checksum(words, width); hamming(data) and hammingDecode(codeword); parity helpers; bitStuff/unstuff; arqSimulate(protocol, N, windowSize, lossSet, ackLossSet, timeout) returning an event timeline; csmaSimulate(seed, stations, load); delay calculators.
Use seeded random numbers so lessons are reproducible. Test edge cases: empty input, invalid characters, a generator that is shorter than 2 bits, a window larger than the allowed maximum.

## 7. Quiz system
- Seed at least 15 questions per unit (75 total), spread across BT1 to BT4, tagged with CO and difficulty, each with an explanation
- Every stem must begin with the Bloom's Taxonomy verb for its level (Define, List, Explain, Describe, Calculate, Apply, Compare, Analyse, etc.). Never start a question with "What is/are"
- Shuffle options, no repeated questions inside one session, store the best score per unit and per CO, and show a CO attainment summary on the home page
- Export results as JSON and a printable summary page

## 8. Quality bar
- Lighthouse performance and accessibility scores of 90 or more, route-level code splitting (React.lazy) so each unit's simulators load on demand
- No console errors, strict TypeScript, ESLint + Prettier, no any
- Every simulator works with keyboard only and on touch screens
- Simulation state is reducible and resettable. Never mutate props
- Add a README with setup, scripts, content-editing guide (how to add a topic, a question or a simulator) and deployment steps

## 9. Build order (do these in sequence and stop after each for review)
1. Scaffold, theme, layout, routing, content types, Unit 1 content, progress persistence
2. /src/lib algorithms with tests for Units 1 to 3, then Unit 1 and Unit 2 simulators
3. Unit 3 simulators, quiz engine and the 75-question bank
4. Unit 4 and Unit 5 simulators
5. Glossary, formula sheet, teacher mode, CO attainment dashboard
6. Polish: accessibility audit, performance, README, GitHub Actions deployment

Start with step 1 now. Before writing code, show me the final file tree and a short list of any assumptions you made.