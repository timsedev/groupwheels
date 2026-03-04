import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Group Spinner',
  description: 'Randomly assign people to groups using a spin wheel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.className}>
      <body className="antialiased min-h-screen flex flex-col app-body">
        {/* Header */}
        <header className="app-header w-full px-6 py-4 flex items-center">
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="app-footer w-full text-center py-4 text-sm">
          created by{' '}
          <a
            href="https://deploid.app"
            target="_blank"
            rel="noopener noreferrer"
            className="deploid-link font-semibold"
          >
            Deploid
          </a>{' '}
          2026
        </footer>
      </body>
    </html>
  );
}
