import './main.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';
import App from './pages/app';
import Onboard from './pages/onboard';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Onboard />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
