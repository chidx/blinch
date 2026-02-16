/**
 * Root layout for Next.js 16 app
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blinch - Bitcoin Cash Interactive Blinks',
  description: 'Interactive Bitcoin Cash Blinks protocol',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
