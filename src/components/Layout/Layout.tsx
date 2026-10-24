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

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className={styles.layout}>
      {/* ── Header ── */}
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
            <span>🏠 Home</span>
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
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* ── Main Full-Width Content ── */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
