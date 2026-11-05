import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IIT Bombay Placement Tracker | Applied Companies, Test Status & Notes',
  description:
    'Private tracker for IIT Bombay campus placements (campus.placements.iitb.ac.in). Track applied companies, tests given/not given, and comments locally in your browser.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}

