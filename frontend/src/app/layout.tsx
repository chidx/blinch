/**
 * Root layout for Next.js 16 app
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blinch - Bitcoin Cash Interactive Blinks',
  description: 'Interactive Bitcoin Cash Blinks protocol',
  icons: {
    icon: [
      { url: '/icon-md.png', sizes: '256x256', type: 'image/png' },
      { url: '/icon-lg.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-lg.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
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
