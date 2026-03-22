import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SOCIONET',
  description: 'Next-generation decentralized social super app prototype',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
