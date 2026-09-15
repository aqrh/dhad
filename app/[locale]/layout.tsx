import {IBM_Plex_Sans_Arabic, Manrope} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '@/app/globals.css';
import { CartProvider } from '@/features/cart/cart-provider';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-plex-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const {locale} = await params;

  if (!routing.locales.includes(locale as 'ar' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${manrope.variable} ${plexArabic.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
          {children}
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}