import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SOCIONET — Complete Product Definition',
  description:
    'A complete, deployable product blueprint for SOCIONET: decentralized identity, private communications, and AI-native social experiences.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
