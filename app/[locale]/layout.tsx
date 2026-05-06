import '../globals.scss';
import { ReactNode } from 'react';
import StoreProvider from '../../components/providers/StoreProvider';
import MuiThemeProvider from '../../src/components/providers/MuiThemeProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import LanguageSwitcher from 'src/components/LanguageSwitcher';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return {
    title: 'Next 15 Atomic Scaffold',
    description: 'Atomic design + Redux Toolkit + App Router',
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params in Next.js 15
  const { locale } = await params;
  
  // Load translations for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
          <NextIntlClientProvider messages={messages}>
            <MuiThemeProvider>
              <StoreProvider>
                <LanguageSwitcher />
                {children}
              </StoreProvider>
            </MuiThemeProvider>
          </NextIntlClientProvider>
      </body>
    </html>
  );
}