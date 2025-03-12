import './globals.css';
import RealtimeProvider from '../components/RealtimeProvider';

export default function RealtimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </body>
    </html>
  );
} 