import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { hasLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { QueryProvider } from '@/components/shared/QueryProvider';
import { RegisterSW } from '@/components/shared/RegisterSW';
import { APP_NAME } from '@/lib/constants';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Finanzas personales inteligentes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
