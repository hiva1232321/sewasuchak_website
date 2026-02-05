import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SewaSuchak - Empowering Communities',
  description: 'Report, track, and resolve public infrastructure issues with community power.',
};

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="antialiased min-h-screen relative selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
        <div className="fixed inset-0 z-[-1] bg-[url('/grid.svg')] opacity-20 pointer-events-none" />

        <Navbar />

        <main className="relative z-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
