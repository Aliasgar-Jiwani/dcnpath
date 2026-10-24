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
            <h3 className={styles.quizTitle}>🧠 Topic Mastery Quiz</h3>
            <span className={styles.quizSub}>Testing learning objectives for this topic</span>
          </div>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
          Interactive questions for this section are being updated. Check back shortly!
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
            <span style={{ fontSize: '1.25rem' }}>🧠</span>
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
              {existingScore.passed ? '✓ Mastered' : 'Attempted'} ({existingScore.score}/{existingScore.total})
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
              ? `Excellent work! You answered ${score} out of ${questions.length} questions correctly (${mastery.percentage}%). You have demonstrated solid comprehension of this topic.`
              : `You scored ${score} out of ${questions.length} (${mastery.percentage}%). Review the key formulas and textbook takeaways above, then retake the quiz to achieve complete mastery.`}
          </p>

          {mastery.isMastered && (
            <div className={styles.completionBadge}>
              <span>✓ Topic Marked Complete in Syllabus Tracker</span>
            </div>
          )}

          <div className={styles.resultsActions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleRetake}
            >
              <span>🔄 Retake Quiz</span>
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setShowReview((v) => !v)}
            >
              <span>{showReview ? 'Hide Explanations ▲' : 'Review All Questions & Explanations ▼'}</span>
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
                        }}
                      >
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
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
                      <div className={styles.explanationHeader}>💡 Explanation</div>
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
              {currentQ.difficulty === 1 ? '● Easy' : currentQ.difficulty === 2 ? '●● Medium' : '●●● Challenging'}
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
                      ✓ Correct
                    </span>
                  )}
                  {hasSelected && isSelected && !isCorrectOpt && (
                    <span className={`${styles.feedbackIcon} ${styles.feedbackIconIncorrect}`}>
                      ✗ Incorrect
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
                <span>💡 Concept Breakdown &amp; Explanation</span>
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
              <span>← Previous</span>
            </button>

            {hasSelected && (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNext}
              >
                <span>
                  {currentIdx < questions.length - 1
                    ? 'Next Question →'
                    : 'Complete Quiz & View Results 🏆'}
                </span>
              </button>
            )}
          </footer>
        </div>
      )}
    </section>
  );
}
