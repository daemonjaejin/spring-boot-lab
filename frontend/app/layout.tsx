import type { Metadata } from 'next';
import { AuthProvider } from '../src/auth/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Member Console',
  description: 'Management Console',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
