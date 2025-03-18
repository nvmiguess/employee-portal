import './globals.css';
import type { Metadata } from 'next';
import RealtimeProvider from '../components/RealtimeProvider';
import DarkModeToggle from '../components/DarkModeToggle';

export const metadata: Metadata = {
  title: 'Employee Portal',
  description: 'Manage your company employees',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Check for stored theme preference
              const storedTheme = localStorage.getItem('theme');
              
              if (storedTheme === 'dark') {
                document.documentElement.classList.add('dark');
              } else if (storedTheme === 'light') {
                document.documentElement.classList.remove('dark');
              } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                // Fall back to system preference if no stored preference
                document.documentElement.classList.add('dark');
              }
            })();
          `,
        }} />
      </head>
      <body className="h-full dark:bg-gray-900">
        <RealtimeProvider>
          <DarkModeToggle />
          {children}
        </RealtimeProvider>
      </body>
    </html>
  )
}
