
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'
import './globals.css';
import { cn } from '@/lib/utils';
import { ClientLayout } from './client-layout';

const inter = Inter({ subsets: ['latin'], variable: "--font-sans" })

export const metadata: Metadata = {
  title: 'StreamCart',
  description: 'Your one-stop shop for live shopping. Discover, engage, and buy in real-time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
