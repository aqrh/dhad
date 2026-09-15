'use client';

import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import {
  Search01Icon,
  ShoppingBag01Icon,
  UserIcon,
  Globe02Icon,
  HeartFreeIcons,
} from '@hugeicons/core-free-icons';
import {HugeiconsIcon} from '@hugeicons/react';
import {Container} from './container';
import { MobileMenu } from  "./mobile-menu";

export function SiteHeader() {
  const t = useTranslations('nav');
  const locale = useLocale();

  const otherLocale = locale === 'ar' ? 'ar' : 'ar';

  return (
    <header className="sticky top-0 z-50 border-b bg-[var(--background)]/95 backdrop-blur">
      <Container>
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Mobile menu */}
          <MobileMenu />

          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="shrink-0 text-center leading-none"
          >
            <span className="block text-[40px] font-semibold tracking-[0.35em] text-[var(--brand-gold)]">
              DHAD
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href={`/${locale}`}
              className="text-sm font-medium transition-opacity hover:opacity-60"
            >
              {t('home')}
            </Link>

            <Link
              href={`/${locale}/collections`}
              className="text-sm font-medium transition-opacity hover:opacity-60"
            >
              {t('collections')}
            </Link>

            <Link
              href={`/${locale}/about`}
              className="text-sm font-medium transition-opacity hover:opacity-60"
            >
              {t('about')}
            </Link>

            <Link
              href={`/${locale}/contact`}
              className="text-sm font-medium transition-opacity hover:opacity-60"
            >
              {t('contact')}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link
              href={`/${locale}/search`}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface-muted)]"
              aria-label={t('search')}
            >
              <HugeiconsIcon icon={Search01Icon} size={21} />
            </Link>

            <Link
              href={`/${locale}/favorites`}
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface-muted)] sm:flex"
              aria-label={t('favorites')}
            >
              <HugeiconsIcon icon={HeartFreeIcons} size={21} />
            </Link>

            <Link
              href={`/${locale}/account`}
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface-muted)] sm:flex"
              aria-label={t('account')}
            >
              <HugeiconsIcon icon={UserIcon} size={21} />
            </Link>

            <Link
              href={`/${locale}/cart`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface-muted)]"
              aria-label={t('cart')}
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} size={21} />

              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-burgundy)] px-1 text-[9px] font-bold text-white">
                0
              </span>
            </Link>

            {/* Language */}
            <Link
              href={`/${otherLocale}`}
              className="hidden h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold hover:bg-[var(--surface-muted)] md:flex"
            >
              <HugeiconsIcon icon={Globe02Icon} size={17} />
              {otherLocale.toUpperCase()}
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}