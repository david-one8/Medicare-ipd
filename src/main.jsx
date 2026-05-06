import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { configureBoneyard } from 'boneyard-js/react';
import './index.css';

import App from './App';
import { AuthProvider } from './context/AuthContext';

configureBoneyard({
  animate: 'shimmer',
  color: '#e5e7eb',
  shimmerColor: '#f3f4f6',
  speed: '1.6s',
  transition: true,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
