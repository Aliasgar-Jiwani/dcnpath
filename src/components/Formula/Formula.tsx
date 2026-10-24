import React from 'react';
import styles from './Formula.module.css';

interface FormulaProps {
  expression: string;
}

export function Formula({ expression }: FormulaProps) {
  return (
    <div className={styles.formula}>
      <span className={styles.formulaIcon} aria-hidden="true">ƒ</span>
      <code>{expression}</code>
    </div>
  );
}
