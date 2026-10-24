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
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Data Communication &amp; Networks</h1>
        <p className={styles.heroSub}>
          An interactive learning platform for SMC3TE105 — explore, simulate, and master every concept
          in data communication and networking.
        </p>
        <div className={styles.heroMeta}>
          <span className={styles.heroMetaItem}>📚 5 Units</span>
          <span className={styles.heroMetaItem}>🧪 17 Simulators</span>
          <span className={styles.heroMetaItem}>🧠 96 Topic Questions</span>
          <span className={styles.heroMetaItem}>⏱ 45 Hours</span>
        </div>

        {hasProgress && resumeUnitId && resumeTopicId && (
          <Link
            to={`/unit/${resumeUnitId}/topic/${resumeTopicId}`}
            className={styles.resumeBtn}
          >
            ▶ Resume where you left off
          </Link>
        )}
      </section>

      {/* ── Overall Progress ── */}
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

      {/* ── Unit Cards ── */}
      <h2 className={styles.sectionTitle}>Course Units</h2>
      <div className={styles.unitsGrid}>
        {allUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  );
}
