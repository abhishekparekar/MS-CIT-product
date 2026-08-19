// src/index.js - ✅ ONLY Router here
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ Import here
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ ONLY Router in entire app */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
