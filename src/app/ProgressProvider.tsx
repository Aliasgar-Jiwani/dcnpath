import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import type { ProgressState, UnitProgress, CourseOutcome } from '../content/types';

/* ─── Initial State ─── */
const initialProgress: ProgressState = {
  units: {},
  lastVisitedTopicId: null,
  lastVisitedUnitId: null,
};

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem('dcnpath-progress');
    if (raw) return JSON.parse(raw) as ProgressState;
  } catch {
    // corrupted data — start fresh
  }
  return initialProgress;
}

function saveProgress(state: ProgressState) {
  try {
    localStorage.setItem('dcnpath-progress', JSON.stringify(state));
  } catch {
    // storage full — silent fail
  }
}

/* ─── Actions ─── */
type ProgressAction =
  | { type: 'COMPLETE_TOPIC'; unitId: string; topicId: string }
  | { type: 'RECORD_TOPIC_QUIZ'; unitId: string; topicId: string; score: number; total: number }
  | { type: 'SET_LAST_VISITED'; unitId: string; topicId: string }
  | { type: 'SET_BEST_SCORE'; unitId: string; score: number }
  | { type: 'SET_CO_SCORE'; unitId: string; co: CourseOutcome; score: number }
  | { type: 'RESET_UNIT'; unitId: string }
  | { type: 'RESET_ALL' };

function getUnitProgress(state: ProgressState, unitId: string): UnitProgress {
  return state.units[unitId] ?? {
    completedTopicIds: [],
    bestScore: null,
    coScores: {},
    topicScores: {},
  };
}

/* ─── Reducer ─── */
function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'COMPLETE_TOPIC': {
      const up = getUnitProgress(state, action.unitId);
      if (up.completedTopicIds.includes(action.topicId)) return state;
      return {
        ...state,
        units: {
          ...state.units,
          [action.unitId]: {
            ...up,
            completedTopicIds: [...up.completedTopicIds, action.topicId],
          },
        },
      };
    }
    case 'RECORD_TOPIC_QUIZ': {
      const up = getUnitProgress(state, action.unitId);
      const passed = action.score / Math.max(action.total, 1) >= 0.66;
      const completedTopicIds = passed && !up.completedTopicIds.includes(action.topicId)
        ? [...up.completedTopicIds, action.topicId]
        : up.completedTopicIds;

      const updatedScores = {
        ...(up.topicScores || {}),
        [action.topicId]: {
          score: action.score,
          total: action.total,
          passed,
          completedAt: new Date().toISOString(),
        },
      };

      return {
        ...state,
        units: {
          ...state.units,
          [action.unitId]: {
            ...up,
            completedTopicIds,
            topicScores: updatedScores,
          },
        },
      };
    }
    case 'SET_LAST_VISITED':
      return {
        ...state,
        lastVisitedUnitId: action.unitId,
        lastVisitedTopicId: action.topicId,
      };
    case 'SET_BEST_SCORE': {
      const up = getUnitProgress(state, action.unitId);
      if (up.bestScore !== null && up.bestScore >= action.score) return state;
      return {
        ...state,
        units: {
          ...state.units,
          [action.unitId]: { ...up, bestScore: action.score },
        },
      };
    }
    case 'SET_CO_SCORE': {
      const up = getUnitProgress(state, action.unitId);
      return {
        ...state,
        units: {
          ...state.units,
          [action.unitId]: {
            ...up,
            coScores: { ...up.coScores, [action.co]: action.score },
          },
        },
      };
    }
    case 'RESET_UNIT': {
      const { [action.unitId]: _, ...rest } = state.units;
      void _;
      return { ...state, units: rest };
    }
    case 'RESET_ALL':
      return initialProgress;
    default:
      return state;
  }
}

/* ─── Context ─── */
interface ProgressContextValue {
  progress: ProgressState;
  completeTopic: (unitId: string, topicId: string) => void;
  recordTopicQuiz: (unitId: string, topicId: string, score: number, total: number) => void;
  setLastVisited: (unitId: string, topicId: string) => void;
  setBestScore: (unitId: string, score: number) => void;
  setCoScore: (unitId: string, co: CourseOutcome, score: number) => void;
  resetUnit: (unitId: string) => void;
  resetAll: () => void;
  getUnitProgress: (unitId: string) => UnitProgress;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, dispatch] = useReducer(progressReducer, undefined, loadProgress);

  // Persist on every change
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const completeTopic = useCallback(
    (unitId: string, topicId: string) => dispatch({ type: 'COMPLETE_TOPIC', unitId, topicId }),
    []
  );
  const recordTopicQuiz = useCallback(
    (unitId: string, topicId: string, score: number, total: number) =>
      dispatch({ type: 'RECORD_TOPIC_QUIZ', unitId, topicId, score, total }),
    []
  );
  const setLastVisited = useCallback(
    (unitId: string, topicId: string) => dispatch({ type: 'SET_LAST_VISITED', unitId, topicId }),
    []
  );
  const setBestScore = useCallback(
    (unitId: string, score: number) => dispatch({ type: 'SET_BEST_SCORE', unitId, score }),
    []
  );
  const setCoScore = useCallback(
    (unitId: string, co: CourseOutcome, score: number) =>
      dispatch({ type: 'SET_CO_SCORE', unitId, co, score }),
    []
  );
  const resetUnit = useCallback(
    (unitId: string) => dispatch({ type: 'RESET_UNIT', unitId }),
    []
  );
  const resetAll = useCallback(() => dispatch({ type: 'RESET_ALL' }), []);

  const getUnitProgressFn = useCallback(
    (unitId: string): UnitProgress =>
      progress.units[unitId] ?? { completedTopicIds: [], bestScore: null, coScores: {}, topicScores: {} },
    [progress]
  );

  const value = useMemo(
    () => ({
      progress,
      completeTopic,
      recordTopicQuiz,
      setLastVisited,
      setBestScore,
      setCoScore,
      resetUnit,
      resetAll,
      getUnitProgress: getUnitProgressFn,
    }),
    [progress, completeTopic, recordTopicQuiz, setLastVisited, setBestScore, setCoScore, resetUnit, resetAll, getUnitProgressFn]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}
