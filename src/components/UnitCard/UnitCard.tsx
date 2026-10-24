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
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: color,
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        }}
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
            {obj}
          </div>
        ))}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.topicCount}>
          {completedTopics}/{totalTopics} topics
        </span>
        <span className={styles.continueBtn} style={{ background: color }}>
          {completedTopics > 0 ? 'Continue' : 'Start'} →
        </span>
      </div>
    </Link>
  );
}
