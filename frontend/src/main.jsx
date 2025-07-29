// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';      
import { store } from './app/store';      
import { GoogleOAuthProvider } from '@react-oauth/google';      

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId="524179187669-fv1m428gts5bto6v01i20vo5oj855qlb.apps.googleusercontent.com">
      <App />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);
