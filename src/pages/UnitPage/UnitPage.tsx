import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProgress } from '../../app/ProgressProvider';
import { Formula } from '../../components/Formula/Formula';
import { unit1 } from '../../content/unit1';
import { unit2 } from '../../content/unit2';
import { unit3 } from '../../content/unit3';
import { unit4 } from '../../content/unit4';
import { unit5 } from '../../content/unit5';
import type { Unit, Topic } from '../../content/types';
import { SimulatorRenderer } from '../../features/SimulatorRenderer';
import { TopicQuiz } from '../../components/TopicQuiz/TopicQuiz';
import styles from './UnitPage.module.css';

const allUnits: Record<string, Unit> = {
  'unit-1': unit1,
  'unit-2': unit2,
  'unit-3': unit3,
  'unit-4': unit4,
  'unit-5': unit5,
};

const unitColors: Record<number, string> = {
  1: 'var(--color-unit-1)',
  2: 'var(--color-unit-2)',
  3: 'var(--color-unit-3)',
  4: 'var(--color-unit-4)',
  5: 'var(--color-unit-5)',
};

/** Simple markdown-like body renderer */
function renderFormattedBody(body: string) {
  const paragraphs = body.split(/\n\n+/);
  return paragraphs.map((para, idx) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={idx}>
          {trimmed.replace(/^###\s+/, '')}
        </h4>
      );
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split(/\n/).map((line) => line.replace(/^[-*]\s+/, ''));
      return (
        <ul key={idx}>
          {items.map((item, itemIdx) => (
            <li key={itemIdx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
    }

    return (
      <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
    );
  });
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');
}

type TopicViewMode = 'split' | 'simulator' | 'theory' | 'formulas' | 'quiz';

export function UnitPage() {
  const { unitId, topicId } = useParams<{ unitId: string; topicId?: string }>();
  const { getUnitProgress, completeTopic, setLastVisited } = useProgress();

  const [showObjectives, setShowObjectives] = useState(false);
  const [viewMode, setViewMode] = useState<TopicViewMode>('split');

  const currentUnit = unitId ? allUnits[unitId] : undefined;

  // Active topic is topicId or default to the first topic
  const activeTopic = useMemo<Topic | undefined>(() => {
    if (!currentUnit || currentUnit.topics.length === 0) return undefined;
    if (topicId) {
      return currentUnit.topics.find((t) => t.id === topicId) || currentUnit.topics[0];
    }
    return currentUnit.topics[0];
  }, [currentUnit, topicId]);

  // Synchronize initial viewMode when switching topics
  useEffect(() => {
    if (activeTopic) {
      setViewMode(activeTopic.sim ? 'split' : 'theory');
    }
  }, [activeTopic?.id, activeTopic?.sim]);

  // Track last visited
  useEffect(() => {
    if (currentUnit && activeTopic) {
      setLastVisited(currentUnit.id, activeTopic.id);
    }
  }, [currentUnit, activeTopic, setLastVisited]);

  if (!currentUnit) {
    return (
      <div className={styles.unitPage}>
        <div className={styles.card}>
          <h2>Unit Not Found</h2>
          <p>The requested course unit could not be located.</p>
          <Link to="/" className={styles.navCard}>← Back to Course Home</Link>
        </div>
      </div>
    );
  }

  const up = getUnitProgress(currentUnit.id);
  const color = unitColors[currentUnit.number] ?? 'var(--color-accent-500)';

  const activeIndex = activeTopic
    ? currentUnit.topics.findIndex((t) => t.id === activeTopic.id)
    : -1;
  const prevTopic = activeIndex > 0 ? currentUnit.topics[activeIndex - 1] : null;
  const nextTopic =
    activeIndex >= 0 && activeIndex < currentUnit.topics.length - 1
      ? currentUnit.topics[activeIndex + 1]
      : null;

  const isCompleted = activeTopic ? up.completedTopicIds.includes(activeTopic.id) : false;

  const toggleComplete = () => {
    if (activeTopic) {
      completeTopic(currentUnit.id, activeTopic.id);
    }
  };

  const progressPct = Math.round(
    (up.completedTopicIds.length / Math.max(currentUnit.topics.length, 1)) * 100
  );

  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [thumbWidthPercent, setThumbWidthPercent] = useState(100);
  const [showScrollTrack, setShowScrollTrack] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const updateScrollState = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const canLeft = el.scrollLeft > 4;
    const canRight = maxScroll > 4 && el.scrollLeft < maxScroll - 4;
    setCanScrollLeft(canLeft);
    setCanScrollRight(canRight);
    setShowScrollTrack(maxScroll > 10);

    if (maxScroll > 0) {
      const pct = (el.scrollLeft / maxScroll) * 100;
      setScrollPercent(Math.min(Math.max(pct, 0), 100));
      const ratio = el.clientWidth / el.scrollWidth;
      setThumbWidthPercent(Math.max(ratio * 100, 20));
    } else {
      setScrollPercent(0);
      setThumbWidthPercent(100);
    }
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = tabsRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    const timer = setTimeout(updateScrollState, 120);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      clearTimeout(timer);
    };
  }, [updateScrollState, currentUnit?.id]);

  useEffect(() => {
    if (tabsRef.current && activeTopic?.id) {
      const activeEl = tabsRef.current.querySelector<HTMLElement>(`[data-topic-id="${activeTopic.id}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTopic?.id]);

  const scrollNav = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      tabsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - tabsRef.current.offsetLeft;
    scrollLeftRef.current = tabsRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !tabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    tabsRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      className={styles.unitPage}
      style={{ '--hero-accent': color } as React.CSSProperties}
    >
      {/* ─── Breadcrumb Navigation ─── */}
      <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
        <ol className={styles.breadcrumbList}>
          <li>
            <Link to="/" className={styles.breadcrumbLink}>DCN Course</Link>
          </li>
          <li>/</li>
          <li>
            <span className={styles.breadcrumbLink}>Unit {currentUnit.number}</span>
          </li>
          {activeTopic && (
            <>
              <li>/</li>
              <li className={styles.breadcrumbCurrent}>{activeTopic.title}</li>
            </>
          )}
        </ol>

        {activeTopic?.textbookRef && (
          <span className={styles.textbookRef}>
            📖 {activeTopic.textbookRef}
          </span>
        )}
      </nav>

      {/* ─── Compact Hero Header ─── */}
      <section className={styles.unitHero}>
        <div className={styles.unitHeroTop}>
          <div className={styles.unitMetaBadges}>
            <span
              className={styles.unitNumberBadge}
              style={{ backgroundColor: color, color: '#fff' }}
            >
              Unit {currentUnit.number}
            </span>
            <span className={styles.coBadge}>{currentUnit.courseOutcome}</span>
            <span className={styles.coBadge}>{currentUnit.hours} Hours</span>
            <span className={styles.coBadge}>{currentUnit.topics.length} Topics</span>
          </div>

          <div className={styles.unitProgressStat}>
            <span>{progressPct}% Completed</span>
            <div className={styles.progressBarTrack} role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progressPct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        </div>

        <div className={styles.unitHeroMain}>
          <h1 className={styles.unitTitle}>{currentUnit.title}</h1>
          <button
            className={styles.objectivesToggleBtn}
            onClick={() => setShowObjectives((v) => !v)}
            aria-expanded={showObjectives}
          >
            <span>{showObjectives ? 'Hide Syllabus Objectives ▲' : 'View Course Objectives (CO) ▼'}</span>
          </button>
        </div>

        {/* Collapsible Objectives Drawer */}
        {showObjectives && (
          <div className={styles.objectivesDrawer}>
            <div className={styles.objectivesTitle}>
              Course Objectives &amp; Learning Outcomes ({currentUnit.courseOutcome})
            </div>
            <ul className={styles.objectivesGrid}>
              {currentUnit.objectives.map((obj, i) => (
                <li key={i} className={styles.objectiveItem}>
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ─── Topic Navigation Rail ─── */}
      <section className={styles.topicNavWrapper}>
        <div className={styles.topicNavHeader}>
          <span>Course Modules ({currentUnit.topics.length})</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            Select topic to explore
          </span>
        </div>

        <div className={styles.railContainer}>
          {/* Left Edge Fade */}
          <div
            className={`${styles.fadeLeft} ${canScrollLeft ? styles.fadeVisible : ''}`}
            aria-hidden="true"
          />

          {/* Left Navigation Arrow */}
          {canScrollLeft && (
            <button
              type="button"
              className={`${styles.scrollArrowBtn} ${styles.scrollArrowLeft}`}
              onClick={() => scrollNav('left')}
              aria-label="Scroll modules left"
              title="Previous modules"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Horizontal Topic Pill Rail */}
          <nav
            ref={tabsRef}
            className={styles.topicTabs}
            aria-label="Unit topics"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {currentUnit.topics.map((t, idx) => {
              const isActive = activeTopic?.id === t.id;
              const done = up.completedTopicIds.includes(t.id);
              const indexStr = String(idx + 1).padStart(2, '0');
              return (
                <Link
                  key={t.id}
                  to={`/unit/${currentUnit.id}/topic/${t.id}`}
                  data-topic-id={t.id}
                  onClick={(e) => {
                    if (hasMovedRef.current) {
                      e.preventDefault();
                    }
                  }}
                  className={`${styles.topicTab} ${isActive ? styles.topicTabActive : ''}`}
                >
                  <span className={styles.tabIndexBadge}>{indexStr}</span>
                  <span>{t.title}</span>
                  {t.sim && <span className={styles.simIndicatorBadge}>SIM</span>}
                  {up.topicScores?.[t.id]?.passed && (
                    <span className={styles.quizIndicatorBadge} title="Topic Quiz Mastered">⭐</span>
                  )}
                  {done && <span className={styles.checkMark}>✓</span>}
                </Link>
              );
            })}
          </nav>

          {/* Right Navigation Arrow */}
          {canScrollRight && (
            <button
              type="button"
              className={`${styles.scrollArrowBtn} ${styles.scrollArrowRight}`}
              onClick={() => scrollNav('right')}
              aria-label="Scroll modules right"
              title="Next modules"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Right Edge Fade */}
          <div
            className={`${styles.fadeRight} ${canScrollRight ? styles.fadeVisible : ''}`}
            aria-hidden="true"
          />
        </div>

        {/* Custom Sleek Scroll Indicator Track */}
        {showScrollTrack && (
          <div className={styles.scrollTrackContainer} aria-hidden="true">
            <div className={styles.scrollTrack}>
              <div
                className={styles.scrollThumb}
                style={{
                  width: `${thumbWidthPercent}%`,
                  left: `${(scrollPercent * (100 - thumbWidthPercent)) / 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* ─── Active Topic Toolbar ─── */}
      {activeTopic && (
        <header className={styles.topicToolbar}>
          <div className={styles.topicMainInfo}>
            <div className={styles.topicMetaRow}>
              {activeTopic.sim && (
                <span className={styles.simAvailableTag}>
                  ⚡ Interactive Simulation Available
                </span>
              )}
            </div>
            <h2 className={styles.topicMainTitle}>
              {String(activeIndex + 1).padStart(2, '0')}. {activeTopic.title}
            </h2>
          </div>

          <div className={styles.topicActions}>
            {/* View Mode Segmented Controls */}
            <div className={styles.modeSwitcher} role="tablist" aria-label="Topic layout views">
              {activeTopic.sim ? (
                <>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'split'}
                    className={`${styles.modeBtn} ${viewMode === 'split' ? styles.activeModeBtn : ''}`}
                    onClick={() => setViewMode('split')}
                    title="Side-by-side simulator and study notes"
                  >
                    <span>🔀 Split View</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'simulator'}
                    className={`${styles.modeBtn} ${viewMode === 'simulator' ? styles.activeModeBtn : ''}`}
                    onClick={() => setViewMode('simulator')}
                    title="Full-focus simulator workbench"
                  >
                    <span>🔬 Simulator</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'theory'}
                    className={`${styles.modeBtn} ${viewMode === 'theory' ? styles.activeModeBtn : ''}`}
                    onClick={() => setViewMode('theory')}
                    title="Detailed theory & textbook concepts"
                  >
                    <span>📖 Theory</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'theory' || viewMode === 'split'}
                  className={`${styles.modeBtn} ${viewMode === 'theory' || viewMode === 'split' ? styles.activeModeBtn : ''}`}
                  onClick={() => setViewMode('theory')}
                  title="Detailed theory & textbook concepts"
                >
                  <span>📖 Theory</span>
                </button>
              )}

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'formulas'}
                className={`${styles.modeBtn} ${viewMode === 'formulas' ? styles.activeModeBtn : ''}`}
                onClick={() => setViewMode('formulas')}
                title="Formulas & essential takeaways"
              >
                <span>⚡ Formulas</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'quiz'}
                className={`${styles.modeBtn} ${viewMode === 'quiz' ? styles.activeModeBtn : ''}`}
                onClick={() => setViewMode('quiz')}
                title="Topic knowledge check quiz"
              >
                <span>
                  🧠 Quiz
                  {up.topicScores?.[activeTopic.id]?.passed
                    ? ` ⭐ (${up.topicScores[activeTopic.id]?.score}/${up.topicScores[activeTopic.id]?.total})`
                    : ''}
                </span>
              </button>
            </div>

            {/* Complete Toggle Button */}
            <button
              className={`${styles.completeBtn} ${isCompleted ? styles.completedBtn : ''}`}
              onClick={toggleComplete}
              aria-label={isCompleted ? 'Mark topic as incomplete' : 'Mark topic as complete'}
            >
              <span>{isCompleted ? '✓ Completed' : '○ Mark Complete'}</span>
            </button>
          </div>
        </header>
      )}

      {/* ─── Topic Content / Workbench Area ─── */}
      {activeTopic && (
        <main className={styles.workbenchArea}>
          {/* VIEW MODE: QUIZ (Focused Mode) */}
          {viewMode === 'quiz' ? (
            <TopicQuiz
              topicId={activeTopic.id}
              unitId={currentUnit.id}
              topicTitle={activeTopic.title}
              unitColor={color}
            />
          ) : activeTopic.sim ? (
            /* SCENARIO 1: Topic HAS Simulator */
            <>
              {/* 1A. Split View (Side-by-side Workbench) */}
              {viewMode === 'split' && (
                <>
                  <div className={styles.splitLayout}>
                    {/* Left Column: Interactive Simulator */}
                    <div className={styles.splitSimPane}>
                      <div id={`sim-${activeTopic.sim}`} data-sim-id={activeTopic.sim}>
                        <SimulatorRenderer simId={activeTopic.sim} />
                      </div>
                    </div>

                    {/* Right Column: Sticky Study Notes & Formulas */}
                    <aside className={styles.splitStudyPane}>
                      {/* Core Concept Banner */}
                      <div className={styles.conceptBanner}>
                        <div className={styles.conceptTag}>Core Concept</div>
                        {activeTopic.summary}
                      </div>

                      {/* Key Formulas */}
                      {activeTopic.formulas && activeTopic.formulas.length > 0 && (
                        <div className={styles.card}>
                          <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>📐 Key Formulas</h3>
                          </div>
                          <div className={styles.formulasGrid}>
                            {activeTopic.formulas.map((expr, i) => (
                              <Formula key={i} expression={expr} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Essential Takeaways */}
                      {activeTopic.keyPoints && activeTopic.keyPoints.length > 0 && (
                        <div className={styles.card}>
                          <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>✦ Key Takeaways</h3>
                          </div>
                          <ul className={styles.keyPointsList}>
                            {activeTopic.keyPoints.map((point, i) => (
                              <li key={i} className={styles.keyPointItem}>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Textbook Reading Link/Drawer */}
                      <div className={styles.card}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.cardTitle}>📖 Textbook Theory</h3>
                          <button
                            type="button"
                            className={styles.objectivesToggleBtn}
                            onClick={() => setViewMode('theory')}
                          >
                            Read Full Text →
                          </button>
                        </div>
                        <div className={styles.topicBody}>
                          {renderFormattedBody(activeTopic.body.slice(0, 320) + '...')}
                        </div>
                      </div>
                    </aside>
                  </div>

                  {/* Knowledge Check Quiz Section */}
                  <TopicQuiz
                    topicId={activeTopic.id}
                    unitId={currentUnit.id}
                    topicTitle={activeTopic.title}
                    unitColor={color}
                  />
                </>
              )}

              {/* 1B. Simulator View (Full width workbench) */}
              {viewMode === 'simulator' && (
                <div className={styles.splitSimPane}>
                  <div className={styles.conceptBanner}>
                    <div className={styles.conceptTag}>Core Concept</div>
                    {activeTopic.summary}
                  </div>
                  <div id={`sim-${activeTopic.sim}`} data-sim-id={activeTopic.sim}>
                    <SimulatorRenderer simId={activeTopic.sim} />
                  </div>
                </div>
              )}

              {/* 1C. Theory View (Textbook focus) */}
              {viewMode === 'theory' && (
                <>
                  <div className={styles.splitLayout}>
                    <article className={styles.card}>
                      <div className={styles.conceptBanner}>
                        <div className={styles.conceptTag}>Core Concept</div>
                        {activeTopic.summary}
                      </div>
                      <div className={styles.topicBody}>
                        {renderFormattedBody(activeTopic.body)}
                      </div>
                    </article>

                    <aside className={styles.splitStudyPane}>
                      <div className={styles.card}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.cardTitle}>⚡ Hands-On Lab</h3>
                        </div>
                        <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>
                          This concept features an interactive SVG simulator to test and manipulate parameters in real time.
                        </p>
                        <button
                          type="button"
                          className={styles.completeBtn}
                          style={{
                            background: 'var(--color-accent-500)',
                            color: 'white',
                            borderColor: 'var(--color-accent-500)',
                            width: '100%',
                            justifyContent: 'center',
                            marginTop: 'var(--sp-1)',
                          }}
                          onClick={() => setViewMode('split')}
                        >
                          Launch Simulator Workbench 🚀
                        </button>
                      </div>

                      {activeTopic.formulas && activeTopic.formulas.length > 0 && (
                        <div className={styles.card}>
                          <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>📐 Key Formulas</h3>
                          </div>
                          <div className={styles.formulasGrid}>
                            {activeTopic.formulas.map((expr, i) => (
                              <Formula key={i} expression={expr} />
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTopic.keyPoints && activeTopic.keyPoints.length > 0 && (
                        <div className={styles.card}>
                          <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>✦ Key Takeaways</h3>
                          </div>
                          <ul className={styles.keyPointsList}>
                            {activeTopic.keyPoints.map((point, i) => (
                              <li key={i} className={styles.keyPointItem}>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </aside>
                  </div>

                  {/* Knowledge Check Quiz Section */}
                  <TopicQuiz
                    topicId={activeTopic.id}
                    unitId={currentUnit.id}
                    topicTitle={activeTopic.title}
                    unitColor={color}
                  />
                </>
              )}

              {/* 1D. Formulas View */}
              {viewMode === 'formulas' && (
                <>
                  <div className={styles.splitLayout}>
                    <div className={styles.card}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>📐 Formulations &amp; Derivations</h3>
                      </div>
                      {activeTopic.formulas && activeTopic.formulas.length > 0 ? (
                        <div className={styles.formulasGrid}>
                          {activeTopic.formulas.map((expr, i) => (
                            <Formula key={i} expression={expr} />
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)' }}>
                          No specific mathematical formulas defined for this qualitative topic.
                        </p>
                      )}
                    </div>

                    <div className={styles.card}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>✦ Essential Takeaways</h3>
                      </div>
                      <ul className={styles.keyPointsList}>
                        {activeTopic.keyPoints.map((point, i) => (
                          <li key={i} className={styles.keyPointItem}>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Knowledge Check Quiz Section */}
                  <TopicQuiz
                    topicId={activeTopic.id}
                    unitId={currentUnit.id}
                    topicTitle={activeTopic.title}
                    unitColor={color}
                  />
                </>
              )}
            </>
          ) : (
            /* SCENARIO 2: Non-Simulator Topic (Bento 2-Column Study Layout) */
            <>
              {viewMode === 'formulas' ? (
                <div className={styles.splitLayout}>
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>📐 Formulations &amp; Derivations</h3>
                    </div>
                    {activeTopic.formulas && activeTopic.formulas.length > 0 ? (
                      <div className={styles.formulasGrid}>
                        {activeTopic.formulas.map((expr, i) => (
                          <Formula key={i} expression={expr} />
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)' }}>
                        No specific mathematical formulas defined for this qualitative topic.
                      </p>
                    )}
                  </div>

                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>✦ Essential Takeaways</h3>
                    </div>
                    <ul className={styles.keyPointsList}>
                      {activeTopic.keyPoints.map((point, i) => (
                        <li key={i} className={styles.keyPointItem}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className={styles.splitLayout}>
                  {/* Main Content Article */}
                  <article className={styles.card}>
                    <div className={styles.conceptBanner}>
                      <div className={styles.conceptTag}>Core Concept</div>
                      {activeTopic.summary}
                    </div>

                    <div className={styles.topicBody}>
                      {renderFormattedBody(activeTopic.body)}
                    </div>
                  </article>

                  {/* Sidebar: Takeaways & Formulas */}
                  <aside className={styles.splitStudyPane}>
                    {activeTopic.formulas && activeTopic.formulas.length > 0 && (
                      <div className={styles.card}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.cardTitle}>📐 Key Formulas</h3>
                        </div>
                        <div className={styles.formulasGrid}>
                          {activeTopic.formulas.map((expr, i) => (
                            <Formula key={i} expression={expr} />
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTopic.keyPoints && activeTopic.keyPoints.length > 0 && (
                      <div className={styles.card}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.cardTitle}>✦ Key Takeaways</h3>
                        </div>
                        <ul className={styles.keyPointsList}>
                          {activeTopic.keyPoints.map((point, i) => (
                            <li key={i} className={styles.keyPointItem}>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </aside>
                </div>
              )}

              {/* Knowledge Check Quiz Section */}
              <TopicQuiz
                topicId={activeTopic.id}
                unitId={currentUnit.id}
                topicTitle={activeTopic.title}
                unitColor={color}
              />
            </>
          )}

          {/* ─── Navigation Footer ─── */}
          <footer className={styles.navFooter}>
            {prevTopic ? (
              <Link
                to={`/unit/${currentUnit.id}/topic/${prevTopic.id}`}
                className={styles.navCard}
              >
                <span className={styles.navDirection}>← Previous Topic</span>
                <span className={styles.navTitle}>{prevTopic.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {nextTopic ? (
              <Link
                to={`/unit/${currentUnit.id}/topic/${nextTopic.id}`}
                className={`${styles.navCard} ${styles.navCardNext}`}
              >
                <span className={styles.navDirection}>Next Topic →</span>
                <span className={styles.navTitle}>{nextTopic.title}</span>
              </Link>
            ) : (
              <Link
                to="/"
                className={`${styles.navCard} ${styles.navCardNext}`}
              >
                <span className={styles.navDirection}>Unit Completed 🎉</span>
                <span className={styles.navTitle}>Return to Course Home</span>
              </Link>
            )}
          </footer>
        </main>
      )}
    </div>
  );
}
