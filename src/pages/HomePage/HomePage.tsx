import React from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../app/ProgressProvider';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { UnitCard } from '../../components/UnitCard/UnitCard';
import { unit1 } from '../../content/unit1';
import { unit2 } from '../../content/unit2';
import { unit3 } from '../../content/unit3';
import { unit4 } from '../../content/unit4';
import { unit5 } from '../../content/unit5';
import type { Unit } from '../../content/types';
import styles from './HomePage.module.css';

const allUnits: Unit[] = [unit1, unit2, unit3, unit4, unit5];

/* Lucide-style SVG icons */
function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

export function HomePage() {
  const { progress, getUnitProgress } = useProgress();

  // Calculate overall progress
  const totalTopics = allUnits.reduce((sum, u) => sum + u.topics.length, 0);
  const completedTopics = allUnits.reduce(
    (sum, u) => sum + getUnitProgress(u.id).completedTopicIds.length,
    0
  );
  const overallProgress = totalTopics > 0 ? completedTopics / totalTopics : 0;

  const hasProgress = completedTopics > 0;
  const resumeUnitId = progress.lastVisitedUnitId;
  const resumeTopicId = progress.lastVisitedTopicId;

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Data Communication &amp; Networks</h1>
        <p className={styles.heroSub}>
          Explore, simulate, and master every concept in data communication and networking
          through interactive lessons, visual simulators, and topic quizzes.
        </p>
        <div className={styles.heroMeta}>
          <span className={styles.heroMetaItem}>
            <BookIcon /> 5 Units
          </span>
          <span className={styles.heroMetaItem}>
            <FlaskIcon /> 17 Simulators
          </span>
          <span className={styles.heroMetaItem}>
            <BrainIcon /> 96 Questions
          </span>
          <span className={styles.heroMetaItem}>
            <ClockIcon /> 45 Hours
          </span>
        </div>

        {hasProgress && resumeUnitId && resumeTopicId && (
          <Link
            to={`/unit/${resumeUnitId}/topic/${resumeTopicId}`}
            className={styles.resumeBtn}
          >
            <PlayIcon /> Resume where you left off
          </Link>
        )}
      </section>

      {/* Overall Progress */}
      <section className={styles.overallProgress}>
        <div className={styles.overallHeader}>
          <span className={styles.overallTitle}>Overall Progress</span>
          <span className={styles.overallPercent}>
            {completedTopics}/{totalTopics} topics ({Math.round(overallProgress * 100)}%)
          </span>
        </div>
        <ProgressBar
          progress={overallProgress}
          color="linear-gradient(90deg, var(--color-accent-500), var(--color-unit-3))"
          height={8}
        />
      </section>

      {/* Unit Cards */}
      <h2 className={styles.sectionTitle}>Course Units</h2>
      <div className={styles.unitsGrid}>
        {allUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  );
}
