import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Antigravity AI™ | TradingView-Grade Crypto & Stock Prediction Terminal',
  description: 'Real-time financial market confluence prediction, live news sentiment analysis, and TradingView charting.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} h-full bg-[#0e1118] text-[#e6ebf2]`}>
        {children}
      </body>
    </html>
  );
}
