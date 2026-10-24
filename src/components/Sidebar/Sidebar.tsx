import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useProgress } from '../../app/ProgressProvider';
import { unit1 } from '../../content/unit1';
import { unit2 } from '../../content/unit2';
import { unit3 } from '../../content/unit3';
import { unit4 } from '../../content/unit4';
import { unit5 } from '../../content/unit5';
import type { Unit } from '../../content/types';
import styles from './Sidebar.module.css';

const units: Unit[] = [unit1, unit2, unit3, unit4, unit5];

const unitColors: Record<number, string> = {
  1: 'var(--color-unit-1)',
  2: 'var(--color-unit-2)',
  3: 'var(--color-unit-3)',
  4: 'var(--color-unit-4)',
  5: 'var(--color-unit-5)',
};

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { unitId } = useParams();
  const { getUnitProgress } = useProgress();
  const [openUnits, setOpenUnits] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (unitId) initial.add(unitId);
    return initial;
  });

  const toggleUnit = (id: string) => {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={styles.sidebar}>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
        }
        end
        onClick={onNavigate}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Home
      </NavLink>

      <div className={styles.divider} />
      <div className={styles.sectionTitle}>Course Units</div>

      {units.map((unit) => {
        const isOpen = openUnits.has(unit.id);
        const up = getUnitProgress(unit.id);
        const completedCount = up.completedTopicIds.length;
        const totalCount = unit.topics.length;

        return (
          <div key={unit.id} className={styles.unitAccordion}>
            <button
              className={styles.unitHeader}
              onClick={() => toggleUnit(unit.id)}
              aria-expanded={isOpen}
              aria-controls={`topics-${unit.id}`}
            >
              <span
                className={styles.unitDot}
                style={{ backgroundColor: unitColors[unit.number] }}
              />
              <span>
                {unit.number}. {unit.title}
              </span>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)', marginLeft: 'auto', marginRight: 'var(--sp-2)' }}>
                {completedCount}/{totalCount}
              </span>
              <svg
                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div
              id={`topics-${unit.id}`}
              className={`${styles.topicList} ${isOpen ? styles.topicListOpen : ''}`}
            >
              <NavLink
                to={`/unit/${unit.id}`}
                className={({ isActive }) =>
                  `${styles.topicItem} ${isActive ? styles.topicItemActive : ''}`
                }
                end
                onClick={onNavigate}
              >
                Overview
              </NavLink>
              {unit.topics.map((topic) => {
                const isCompleted = up.completedTopicIds.includes(topic.id);
                return (
                  <NavLink
                    key={topic.id}
                    to={`/unit/${unit.id}/topic/${topic.id}`}
                    className={({ isActive }) =>
                      `${styles.topicItem} ${isActive ? styles.topicItemActive : ''}`
                    }
                    onClick={onNavigate}
                  >
                    {isCompleted && <span className={styles.completedIcon}>✓</span>}
                    {topic.title}
                  </NavLink>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
