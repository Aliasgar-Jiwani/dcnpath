import React from 'react';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { ProgressProvider } from './ProgressProvider';
import { AppRoutes } from './routes';

export function App() {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ProgressProvider>
    </ThemeProvider>
  );
}

export default App;
