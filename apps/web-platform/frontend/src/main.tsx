import React from 'react';
import ReactDOM from 'react-dom/client';
import { inject as injectAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from './App';
import './index.css';

// Initialize Vercel Analytics and Speed Insights
injectAnalytics();
injectSpeedInsights();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
