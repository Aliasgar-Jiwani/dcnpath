import React from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../app/ProgressProvider';
import { ProgressRing } from '../ProgressBar/ProgressBar';
import type { Unit } from '../../content/types';
import styles from './UnitCard.module.css';

const unitColors: Record<number, string> = {
  1: 'var(--color-unit-1)',
  2: 'var(--color-unit-2)',
  3: 'var(--color-unit-3)',
  4: 'var(--color-unit-4)',
  5: 'var(--color-unit-5)',
};

interface UnitCardProps {
  unit: Unit;
}

export function UnitCard({ unit }: UnitCardProps) {
  const { getUnitProgress } = useProgress();
  const up = getUnitProgress(unit.id);
  const totalTopics = unit.topics.length;
  const completedTopics = up.completedTopicIds.length;
  const progress = totalTopics > 0 ? completedTopics / totalTopics : 0;
  const color = unitColors[unit.number] ?? 'var(--color-accent-500)';

  return (
    <Link
      to={`/unit/${unit.id}`}
      className={styles.card}
      style={{ '--card-color': color } as React.CSSProperties}
    >
      <div
        className={styles.accentBar}
        style={{ background: color }}
      />

      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <div className={styles.unitNumber} style={{ color }}>
            Unit {unit.number}
          </div>
          <h3 className={styles.cardTitle}>{unit.title}</h3>
          <span className={styles.coBadge}>{unit.courseOutcome} · {unit.hours}h</span>
        </div>
        <ProgressRing
          progress={progress}
          size={56}
          strokeWidth={4}
          color={color}
        />
      </div>

      <div className={styles.cardObjectives}>
        {unit.objectives.slice(0, 3).map((obj, i) => (
          <div key={i} className={styles.objective}>
            <span className={styles.objectiveBullet}>•</span>
            <span>{obj}</span>
          </div>
        ))}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.topicCount}>
          {completedTopics}/{totalTopics} topics completed
        </span>
        <span className={styles.continueBtn} style={{ background: color }}>
          <span>{completedTopics > 0 ? 'Continue' : 'Start Unit'}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
