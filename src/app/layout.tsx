import './globals.css';
import type { Metadata } from 'next';
import RealtimeProvider from '../components/RealtimeProvider';

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
    <html lang="en">
      <body>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </body>
    </html>
  )
}
