import { useState, useMemo, useCallback } from 'react';
import {
  bitStuff,
  bitUnstuff,
  byteStuff,
  byteUnstuff,
} from '../../lib/framing';
import { crcDivide } from '../../lib/errorControl';
import { SimControls } from '../../components/SimControls/SimControls';
import styles from './HdlcFramingSim.module.css';

type FrameType = 'I-Frame' | 'S-Frame' | 'U-Frame';

export function HdlcFramingSim() {
  const [activeTab, setActiveTab] = useState<'bit' | 'byte'>('bit');

  // Bit stuffing state
  const [rawBits, setRawBits] = useState<string>('0111111011111001111101');
  const [frameType, setFrameType] = useState<FrameType>('I-Frame');
  const [addressHex, setAddressHex] = useState<string>('FF');
  const [showSteps, setShowSteps] = useState<boolean>(false);

  // Byte stuffing state
  const [byteInput, setByteInput] = useState<string>('A FLAG B ESC C FLAG D');

  // Bit stuffing results
  const stuffResult = useMemo(() => {
    return bitStuff(rawBits);
  }, [rawBits]);

  const unstuffResult = useMemo(() => {
    return bitUnstuff(stuffResult.stuffed);
  }, [stuffResult.stuffed]);

  // Compute 16-bit CRC-CCITT FCS for the frame
  const fcsBits = useMemo(() => {
    try {
      const divisor = '10001000000100001'; // x^16 + x^12 + x^5 + 1
      const res = crcDivide(stuffResult.stuffed.padEnd(8, '0'), divisor);
      return res.remainder.padStart(16, '0');
    } catch {
      return '1011001011001001';
    }
  }, [stuffResult.stuffed]);

  // Byte stuffing results
  const byteTokens = useMemo(() => {
    return byteInput.trim().split(/\s+/).filter(Boolean);
  }, [byteInput]);

  const byteStuffResult = useMemo(() => {
    return byteStuff(byteTokens, 'FLAG', 'ESC');
  }, [byteTokens]);

  const byteUnstuffResult = useMemo(() => {
    return byteUnstuff(byteStuffResult.stuffed, 'ESC');
  }, [byteStuffResult.stuffed]);

  const handleReset = useCallback(() => {
    setRawBits('0111111011111001111101');
    setFrameType('I-Frame');
    setAddressHex('FF');
    setByteInput('A FLAG B ESC C FLAG D');
  }, []);

  return (
    <div className={styles.container}>
      <SimControls
        title="HDLC Framing & Stuffing Simulator"
        explanation={
          <div>
            <strong>
              {activeTab === 'bit'
                ? 'Bit-Oriented HDLC Framing (ISO 13239)'
                : 'Character-Oriented Byte Stuffing (BISYNC / PPP)'}
            </strong>
            <p style={{ marginTop: 'var(--sp-1)', marginBottom: 0 }}>
              {activeTab === 'bit'
                ? 'To ensure the delimiter FLAG 01111110 never appears in the data, a 0 is stuffed whenever five consecutive 1s occur. The receiver strips any 0 that follows five 1s.'
                : 'Byte stuffing solves data transparency in character-oriented protocols by prepending an ESC byte before any literal FLAG or ESC byte in the payload.'}
            </p>
          </div>
        }
        steps={
          <div>
            <h4>Framing Derivation Rules</h4>
            {activeTab === 'bit' ? (
              <ul>
                <li>
                  <strong>HDLC Flag:</strong> <code>01111110</code> (0x7E) marks beginning and end.
                </li>
                <li>
                  <strong>Bit Stuffing rule:</strong> Scan stream: if 5 consecutive 1s occur, insert a <code>0</code> immediately.
                </li>
                <li>
                  <strong>Bit Unstuffing rule:</strong> Scan received stream: after 5 consecutive 1s, if next bit is <code>0</code>, discard it. If next bit is <code>1</code>, check for 6th bit: if 0, it is Flag; if 1, it is an abort/error sequence.
                </li>
              </ul>
            ) : (
              <ul>
                <li>
                  <strong>Flag Byte:</strong> Delimits frame boundaries (e.g. <code>FLAG</code> or <code>0x7E</code>).
                </li>
                <li>
                  <strong>Escape Byte:</strong> When <code>FLAG</code> or <code>ESC</code> appears as raw data, prepend <code>ESC</code>.
                </li>
                <li>
                  <strong>Receiver:</strong> Upon reading <code>ESC</code>, drop the ESC byte and treat the next byte literally.
                </li>
              </ul>
            )}
          </div>
        }
        showSteps={showSteps}
        onToggleSteps={() => setShowSteps((v) => !v)}
        onReset={handleReset}
      >
        <div className={styles.tabRow}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'bit' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('bit')}
          >
            HDLC Bit Stuffing (Bit-Oriented)
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'byte' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('byte')}
          >
            BISYNC Byte Stuffing (Character-Oriented)
          </button>
        </div>
      </SimControls>

      {/* ─── TAB 1: HDLC BIT STUFFING ─── */}
      {activeTab === 'bit' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              Sender Bit-Stream &amp; Presets
            </span>
            <span className={styles.badge}>
              Flag: <code>01111110</code> (0x7E)
            </span>
          </div>

          <div className={styles.inputRow}>
            <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)' }}>
              Raw Bit Stream:
            </label>
            <input
              type="text"
              className={styles.textInput}
              value={rawBits}
              onChange={(e) => setRawBits(e.target.value.replace(/[^01]/g, ''))}
              placeholder="Enter 0s and 1s"
            />
          </div>

          {/* Quick presets */}
          <div className={styles.presetsRow}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Presets:</span>
            <button
              className={styles.presetBtn}
              onClick={() => setRawBits('0111111011111001111101')}
            >
              Mixed with 01111110 Flag
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setRawBits('1111111111')}
            >
              Ten Consecutive 1s
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setRawBits('0111110001111101')}
            >
              Multiple 5-Ones Blocks
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setRawBits('010101010101')}
            >
              Alternating (0 Stuffed)
            </button>
          </div>

          {/* ─── HDLC Frame Structure ─── */}
          <div className={styles.frameContainer}>
            <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', color: 'var(--color-text-secondary)' }}>
              Constructed HDLC Frame Format (ISO 13239)
            </div>

            <div className={styles.frameSections}>
              <div className={`${styles.frameField} ${styles.flagField}`}>
                <span className={styles.fieldName}>Open Flag</span>
                <span className={styles.fieldBits}>01111110</span>
                <span className={styles.fieldSize}>8 bits</span>
              </div>

              <div className={`${styles.frameField} ${styles.addressField}`}>
                <span className={styles.fieldName}>Address</span>
                <span className={styles.fieldBits}>0x{addressHex}</span>
                <span className={styles.fieldSize}>8 bits</span>
              </div>

              <div className={`${styles.frameField} ${styles.controlField}`}>
                <span className={styles.fieldName}>Control ({frameType})</span>
                <span className={styles.fieldBits}>
                  {frameType === 'I-Frame'
                    ? '00000000'
                    : frameType === 'S-Frame'
                    ? '10000000'
                    : '11000000'}
                </span>
                <span className={styles.fieldSize}>8 bits</span>
              </div>

              <div className={`${styles.frameField} ${styles.payloadField}`}>
                <span className={styles.fieldName}>Stuffed Payload Data</span>
                <span className={styles.fieldBits}>
                  {stuffResult.stuffed.slice(0, 32)}
                  {stuffResult.stuffed.length > 32 ? '…' : ''}
                </span>
                <span className={styles.fieldSize}>
                  {stuffResult.stuffed.length} bits ({stuffResult.fiveOnesCount} stuffed)
                </span>
              </div>

              <div className={`${styles.frameField} ${styles.fcsField}`}>
                <span className={styles.fieldName}>FCS (CRC-16)</span>
                <span className={styles.fieldBits}>{fcsBits}</span>
                <span className={styles.fieldSize}>16 bits</span>
              </div>

              <div className={`${styles.frameField} ${styles.flagField}`}>
                <span className={styles.fieldName}>Close Flag</span>
                <span className={styles.fieldBits}>01111110</span>
                <span className={styles.fieldSize}>8 bits</span>
              </div>
            </div>
          </div>

          {/* ─── Bit Stuffing Visual Breakdown ─── */}
          <div className={styles.bitStreamCard}>
            <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-text-secondary)' }}>
              Sender Output (Stuffed Stream with inserted &apos;0&apos; highlighted)
            </div>

            <div className={styles.bitRow}>
              {stuffResult.stuffed.split('').map((bit, idx) => {
                const isStuffed = stuffResult.stuffedIndices.includes(idx);
                return (
                  <span
                    key={idx}
                    className={`${styles.bitToken} ${isStuffed ? styles.stuffedBit : ''}`}
                    title={isStuffed ? `Stuffed 0 at position ${idx}` : `Bit ${idx}`}
                  >
                    {bit}
                  </span>
                );
              })}
            </div>

            <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
              Receiver Decoder (Unstuffed Stream, stripped &apos;0&apos; removed)
            </div>

            <div className={styles.bitRow}>
              {unstuffResult.unstuffed.split('').map((bit, idx) => (
                <span key={idx} className={styles.bitToken}>
                  {bit}
                </span>
              ))}
            </div>
          </div>

          {/* ─── Stuffing Statistics ─── */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span>Original Payload Length</span>
              <span>{stuffResult.original.length} bits</span>
            </div>
            <div className={styles.statItem}>
              <span>Stuffed 0s Inserted</span>
              <span style={{ color: '#10b981' }}>{stuffResult.fiveOnesCount}</span>
            </div>
            <div className={styles.statItem}>
              <span>Transmitted Stream Length</span>
              <span>{stuffResult.stuffed.length} bits</span>
            </div>
            <div className={styles.statItem}>
              <span>Stuffing Overhead</span>
              <span style={{ color: 'var(--color-accent-400)' }}>
                {stuffResult.original.length > 0
                  ? ((stuffResult.fiveOnesCount / stuffResult.original.length) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: BISYNC BYTE STUFFING ─── */}
      {activeTab === 'byte' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              BISYNC / PPP Character Stuffing
            </span>
            <span className={styles.badge}>
              Escape Byte: <code>ESC</code> (0x1B / DLE)
            </span>
          </div>

          <div className={styles.inputRow}>
            <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)' }}>
              Payload Characters (space-separated):
            </label>
            <input
              type="text"
              className={styles.textInput}
              value={byteInput}
              onChange={(e) => setByteInput(e.target.value)}
              placeholder="e.g. A FLAG B ESC C"
            />
          </div>

          <div className={styles.presetsRow}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Presets:</span>
            <button
              className={styles.presetBtn}
              onClick={() => setByteInput('A FLAG B ESC C FLAG D')}
            >
              Contains FLAG and ESC
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setByteInput('ESC ESC FLAG FLAG')}
            >
              Back-to-back Special Bytes
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setByteInput('HELLO WORLD DATA LINK')}
            >
              Plain text (No Escaping)
            </button>
          </div>

          <div className={styles.bitStreamCard}>
            <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-text-secondary)' }}>
              Stuffed Transmission Byte Stream (Sender):
            </div>
            <div className={styles.bitRow}>
              <span className={`${styles.bitToken} ${styles.flagField}`} style={{ width: 'auto', padding: '0 8px' }}>
                FLAG
              </span>
              {byteStuffResult.stuffed.map((token, i) => (
                <span
                  key={i}
                  className={`${styles.bitToken} ${
                    token === 'ESC' ? styles.stuffedBit : token === 'FLAG' ? styles.flagField : ''
                  }`}
                  style={{ width: 'auto', padding: '0 8px' }}
                >
                  {token}
                </span>
              ))}
              <span className={`${styles.bitToken} ${styles.flagField}`} style={{ width: 'auto', padding: '0 8px' }}>
                FLAG
              </span>
            </div>

            <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
              Recovered Payload at Receiver:
            </div>
            <div className={styles.bitRow}>
              {byteUnstuffResult.unstuffed.map((token, i) => (
                <span
                  key={i}
                  className={styles.bitToken}
                  style={{ width: 'auto', padding: '0 8px' }}
                >
                  {token}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span>Original Characters</span>
              <span>{byteTokens.length}</span>
            </div>
            <div className={styles.statItem}>
              <span>ESC Bytes Inserted</span>
              <span style={{ color: '#10b981' }}>{byteStuffResult.escapedCount}</span>
            </div>
            <div className={styles.statItem}>
              <span>Transmitted Characters</span>
              <span>{byteStuffResult.stuffed.length + 2} (including 2 Flags)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
