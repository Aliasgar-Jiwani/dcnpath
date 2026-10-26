import React from 'react';
import styles from './Callout.module.css';

type CalloutVariant = 'info' | 'tip' | 'warning' | 'error';

function CalloutIcon({ variant }: { variant: CalloutVariant }) {
  switch (variant) {
    case 'info':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'tip':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2v1" />
          <path d="M12 21v1" />
          <path d="M4.93 4.93l.7.7" />
          <path d="M18.36 18.36l.7.7" />
          <path d="M2 12h1" />
          <path d="M21 12h1" />
          <path d="M4.93 19.07l.7-.7" />
          <path d="M18.36 5.64l.7-.7" />
          <circle cx="12" cy="12" r="5" />
        </svg>
      );
    case 'warning':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'error':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
  }
}

interface CalloutProps {
  variant?: CalloutVariant;
  children: React.ReactNode;
}

export function Callout({ variant = 'info', children }: CalloutProps) {
  return (
    <div className={`${styles.callout} ${styles[variant]}`} role="note">
      <span className={styles.icon}>
        <CalloutIcon variant={variant} />
      </span>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
