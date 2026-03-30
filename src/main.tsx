import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConsentProvider } from './contexts/ConsentContext';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <ConsentProvider>
          <App />
        </ConsentProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
);
