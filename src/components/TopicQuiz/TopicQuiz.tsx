import { useState, useMemo } from 'react';
import { useProgress } from '../../app/ProgressProvider';
import { getQuestionsForTopic, calculateMastery } from '../../content/quizBank';
import styles from './TopicQuiz.module.css';

interface TopicQuizProps {
  topicId: string;
  unitId: string;
  topicTitle?: string;
  unitColor?: string;
  onCompleteTopic?: () => void;
}

const letterLabels = ['A', 'B', 'C', 'D'];

export function TopicQuiz({
  topicId,
  unitId,
  topicTitle,
  unitColor = 'var(--color-accent-500)',
  onCompleteTopic,
}: TopicQuizProps) {
  const { getUnitProgress, recordTopicQuiz, completeTopic } = useProgress();
  const up = getUnitProgress(unitId);
  const existingScore = up.topicScores?.[topicId];

  const questions = useMemo(() => getQuestionsForTopic(topicId), [topicId]);

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // If no questions exist for this topic (fallback)
  if (questions.length === 0) {
    return (
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.titleRow}>
              <span className={styles.quizHeaderIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a9 9 0 0 1 9 9c0 3.6-2.4 6.7-6 8.2V21a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.8C5.4 17.7 3 14.6 3 11a9 9 0 0 1 9-9z" />
                  <path d="M9 22h6" />
                </svg>
              </span>
              <h3 className={styles.quizTitle}>Topic Knowledge Check</h3>
            </div>
            <span className={styles.quizSub}>Testing learning objectives for this topic</span>
          </div>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
          Interactive practice questions for this section are being updated. Check back shortly!
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  if (!currentQ) return null;

  const hasSelected = selectedAnswers[currentIdx] !== undefined;
  const selectedOption = selectedAnswers[currentIdx];

  // Calculate current running or final score
  const score = Object.entries(selectedAnswers).reduce((acc, [idxStr, choice]) => {
    const q = questions[Number(idxStr)];
    return q && choice === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const mastery = calculateMastery(score, questions.length);

  // Handle selecting an option
  const handleSelectOption = (optIdx: number) => {
    if (hasSelected) return; // Prevent changing after answer is locked
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx,
    }));
  };

  // Move to next question
  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Finished all questions! Record score
      recordTopicQuiz(unitId, topicId, score, questions.length);
      if (score / questions.length >= 0.66) {
        completeTopic(unitId, topicId);
        onCompleteTopic?.();
      }
      setIsFinished(true);
    }
  };

  // Move to previous question
  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  // Reset quiz
  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsFinished(false);
    setShowReview(false);
  };

  return (
    <section className={styles.quizContainer} aria-label="Topic Knowledge Check Quiz">
      {/* ─── Quiz Section Header ─── */}
      <header className={styles.quizHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <span className={styles.quizHeaderIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a9 9 0 0 1 9 9c0 3.6-2.4 6.7-6 8.2V21a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.8C5.4 17.7 3 14.6 3 11a9 9 0 0 1 9-9z" />
                <path d="M9 22h6" />
              </svg>
            </span>
            <h3 className={styles.quizTitle}>
              Topic Mastery Quiz: {topicTitle || 'Knowledge Check'}
            </h3>
          </div>
          <span className={styles.quizSub}>
            Test your understanding of core concepts, formulas, and textbook definitions
          </span>
        </div>

        <div className={styles.badgesRow}>
          <span className={`${styles.badge} ${styles.coBadge}`}>
            {currentQ.co}
          </span>
          <span className={styles.badge} style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
            {questions.length} Questions
          </span>
          {existingScore && (
            <span className={`${styles.badge} ${styles.masteredBadge}`} title="Your saved quiz record">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {existingScore.passed ? 'Mastered' : 'Attempted'} ({existingScore.score}/{existingScore.total})
            </span>
          )}
        </div>
      </header>

      {/* ─── SCENARIO A: RESULTS VIEW ─── */}
      {isFinished ? (
        <div className={styles.resultsCard}>
          <div className={styles.scoreCircle} style={{ background: unitColor }}>
            <span className={styles.scoreValue}>{score}</span>
            <span className={styles.scoreTotal}>of {questions.length}</span>
          </div>

          <h4 className={styles.resultsTitle}>{mastery.label}</h4>

          <p className={styles.resultsDesc}>
            {mastery.isMastered
              ? `Great job! You answered ${score} of ${questions.length} questions correctly (${mastery.percentage}%). You have demonstrated solid comprehension of this topic.`
              : `You scored ${score} of ${questions.length} (${mastery.percentage}%). Review the key formulas and takeaways above, then retake the quiz to complete mastery.`}
          </p>

          {mastery.isMastered && (
            <div className={styles.completionBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Topic Marked Complete in Syllabus Tracker</span>
            </div>
          )}

          <div className={styles.resultsActions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleRetake}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Retake Quiz</span>
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setShowReview((v) => !v)}
            >
              <span>{showReview ? 'Hide Explanations' : 'Review Questions & Explanations'}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: showReview ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Review Drawer */}
          {showReview && (
            <div className={styles.reviewSection}>
              {questions.map((q, qIdx) => {
                const userChoice = selectedAnswers[qIdx];
                const isCorrect = userChoice === q.correctIndex;
                return (
                  <div key={q.id} className={styles.reviewItem}>
                    <div className={styles.reviewItemHeader}>
                      <span>Question {qIdx + 1} ({q.bloomLevel})</span>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {isCorrect ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Correct
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Incorrect
                          </>
                        )}
                      </span>
                    </div>
                    <p className={styles.reviewStem}>{q.stem}</p>
                    <div style={{ marginTop: 'var(--sp-1)' }}>
                      <p className={styles.reviewChoice}>
                        <strong>Your answer:</strong> {userChoice !== undefined ? q.options[userChoice] : 'Not answered'}
                      </p>
                      {!isCorrect && (
                        <p className={styles.reviewChoice} style={{ color: 'var(--color-success)' }}>
                          <strong>Correct answer:</strong> {q.options[q.correctIndex]}
                        </p>
                      )}
                    </div>
                    <div className={styles.explanationBox} style={{ marginTop: 'var(--sp-2)' }}>
                      <div className={styles.explanationHeader}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>Explanation</span>
                      </div>
                      <p className={styles.explanationText}>{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ─── SCENARIO B: QUESTION VIEW ─── */
        <div className={styles.questionCard}>
          {/* Progress Indicator */}
          <div className={styles.stepBarContainer}>
            <div className={styles.stepHeader}>
              <span>
                Question {currentIdx + 1} of {questions.length}
              </span>
              <div className={styles.stepDots}>
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.stepDot} ${
                      i === currentIdx
                        ? styles.stepDotActive
                        : selectedAnswers[i] !== undefined
                        ? styles.stepDotCompleted
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Question Metadata */}
          <div className={styles.questionMeta}>
            <span className={styles.verbBadge}>{currentQ.verb}</span>
            <span className={`${styles.badge} ${styles.bloomBadge}`}>
              {currentQ.bloomLevel}
            </span>
            <span className={`${styles.badge} ${styles.difficultyBadge}`}>
              {currentQ.difficulty === 1 ? 'Easy' : currentQ.difficulty === 2 ? 'Medium' : 'Challenging'}
            </span>
          </div>

          {/* Question Prompt */}
          <h4 className={styles.questionStem}>{currentQ.stem}</h4>

          {/* 4 Multiple Choice Options */}
          <div className={styles.optionsGrid} role="radiogroup" aria-label="Multiple choice options">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isCorrectOpt = optIdx === currentQ.correctIndex;

              let optionStyle = styles.optionBtn;
              if (hasSelected) {
                if (isSelected && isCorrectOpt) {
                  optionStyle = `${styles.optionBtn} ${styles.optionCorrect}`;
                } else if (isSelected && !isCorrectOpt) {
                  optionStyle = `${styles.optionBtn} ${styles.optionIncorrect}`;
                } else if (isCorrectOpt) {
                  optionStyle = `${styles.optionBtn} ${styles.optionCorrect}`;
                } else {
                  optionStyle = `${styles.optionBtn} ${styles.optionDimmed}`;
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  className={optionStyle}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={hasSelected}
                  aria-checked={isSelected}
                  role="radio"
                >
                  <span className={styles.letterBadge}>{letterLabels[optIdx]}</span>
                  <span className={styles.optionText}>{option}</span>

                  {hasSelected && isCorrectOpt && (
                    <span className={`${styles.feedbackIcon} ${styles.feedbackIconCorrect}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Correct
                    </span>
                  )}
                  {hasSelected && isSelected && !isCorrectOpt && (
                    <span className={`${styles.feedbackIcon} ${styles.feedbackIconIncorrect}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Incorrect
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Expandable Pedagogical Explanation Box */}
          {hasSelected && (
            <div className={styles.explanationBox}>
              <div className={styles.explanationHeader}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Concept Breakdown &amp; Explanation</span>
              </div>
              <p className={styles.explanationText}>{currentQ.explanation}</p>
            </div>
          )}

          {/* Bottom Actions Bar */}
          <footer className={styles.quizActions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handlePrev}
              disabled={currentIdx === 0}
              style={{ visibility: currentIdx > 0 ? 'visible' : 'hidden' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Previous</span>
            </button>

            {hasSelected && (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNext}
              >
                <span>
                  {currentIdx < questions.length - 1
                    ? 'Next Question'
                    : 'Complete Quiz & View Results'}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </footer>
        </div>
      )}
    </section>
  );
}
