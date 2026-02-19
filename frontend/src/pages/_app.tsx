import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../auth/AuthContext';
import AppLayoutNext from '../components/AppLayoutNext';
import '../styles.css';

function MyApp({ Component, pageProps }: AppProps) {
  // If we want layout on all pages:
  return (
    <AuthProvider>
      <AppLayoutNext>
        <Component {...pageProps} />
      </AppLayoutNext>
    </AuthProvider>
  );
}

export default MyApp;
