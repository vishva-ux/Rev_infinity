import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'REV∞ — Autonomous Revenue Intelligence',
  description: 'AI-powered revenue recovery platform for merchants. Detect, simulate, recover.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <Sidebar />
          <div className="main-content">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
