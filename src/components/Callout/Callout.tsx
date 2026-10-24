import React from 'react';
import styles from './Callout.module.css';

type CalloutVariant = 'info' | 'tip' | 'warning' | 'error';

const icons: Record<CalloutVariant, string> = {
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
  error: '❌',
};

interface CalloutProps {
  variant?: CalloutVariant;
  children: React.ReactNode;
}

export function Callout({ variant = 'info', children }: CalloutProps) {
  return (
    <div className={`${styles.callout} ${styles[variant]}`} role="note">
      <span className={styles.icon} aria-hidden="true">
        {icons[variant]}
      </span>
      <div>{children}</div>
    </div>
  );
}
