import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import styles from './Layout.module.css';

const unitLinks = [
  { id: 'unit-1', num: '1', title: 'Data Comm' },
  { id: 'unit-2', num: '2', title: 'Encoding' },
  { id: 'unit-3', num: '3', title: 'Multiplexing' },
  { id: 'unit-4', num: '4', title: 'Data Link' },
  { id: 'unit-5', num: '5', title: 'LAN' },
];

/* Inline Lucide-style SVG icons for consistency */
function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>D</span>
            <span className={styles.logoText}>DCNPath</span>
          </Link>
        </div>

        {/* Top Navigation Bar */}
        <nav className={styles.headerNav} aria-label="Course Units">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <HomeIcon />
            <span>Home</span>
          </NavLink>

          <div className={styles.navDivider} aria-hidden="true" />

          {unitLinks.map((u) => {
            const isUnitActive = location.pathname.startsWith(`/unit/${u.id}`);
            return (
              <NavLink
                key={u.id}
                to={`/unit/${u.id}`}
                className={`${styles.navLink} ${isUnitActive ? styles.navLinkActive : ''}`}
                title={`Unit ${u.num}: ${u.title}`}
              >
                <span className={styles.navUnitBadge}>U{u.num}</span>
                <span className={styles.navUnitTitle}>{u.title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.headerRight}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
