'use client';

import Link from 'next/link';
import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {
  Menu01Icon,
  Cancel01Icon,
  UserIcon,
  Globe02Icon,
  Notification03Icon,
  HelpCircleIcon,
  Tag01Icon,
  InformationCircleIcon,
  Wallet01Icon,
  ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';
import {HugeiconsIcon} from '@hugeicons/react';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations('nav');

  const otherLocale = locale === 'ar' ? 'en' : 'ar';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface-muted)] lg:hidden"
        aria-label="Open menu"
      >
        <HugeiconsIcon icon={Menu01Icon} size={22} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute inset-y-0 start-0 w-[min(88vw,380px)] overflow-y-auto bg-[var(--background)] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-5">
              <Link
                href={`/${locale}`}
                onClick={() => setOpen(false)}
                className="leading-none"
              >
                <span className="block text-lg font-extrabold tracking-[0.18em]">
                  IRAQ
                </span>
                <span className="block text-[10px] font-semibold tracking-[0.35em] text-[var(--brand-gold)]">
                  HERITAGE
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface-muted)]"
                aria-label="Close menu"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={22} />
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-[var(--brand-navy)] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <HugeiconsIcon icon={UserIcon} size={22} />
                </div>

                <div>
                  <p className="font-semibold">
                    {locale === 'ar' ? 'مرحباً بك' : 'Welcome'}
                  </p>

                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setOpen(false)}
                    className="mt-1 block text-sm text-white/70"
                  >
                    {locale === 'ar'
                      ? 'تسجيل الدخول أو إنشاء حساب'
                      : 'Login or create an account'}
                  </Link>
                </div>
              </div>
            </div>

            <nav className="mt-6">
              <MenuLink
                href={`/${locale}`}
                icon={ShoppingBag01Icon}
                label={t('home')}
                onClick={() => setOpen(false)}
              />

              <MenuLink
                href={`/${locale}/collections`}
                icon={Tag01Icon}
                label={t('collections')}
                onClick={() => setOpen(false)}
              />

              <MenuLink
                href={`/${locale}/favorites`}
                icon={UserIcon}
                label={t('favorites')}
                onClick={() => setOpen(false)}
              />

              <MenuLink
                href={`/${locale}/cart`}
                icon={ShoppingBag01Icon}
                label={t('cart')}
                onClick={() => setOpen(false)}
              />

              <MenuLink
                href={`/${locale}/account`}
                icon={UserIcon}
                label={t('account')}
                onClick={() => setOpen(false)}
              />

              <div className="my-4 border-t" />

              <MenuLink
                href="#"
                icon={Notification03Icon}
                label={locale === 'ar' ? 'الإشعارات' : 'Notifications'}
              />

              <MenuLink
                href="#"
                icon={HelpCircleIcon}
                label={locale === 'ar' ? 'المساعدة' : 'Help'}
              />

              <MenuLink
                href="#"
                icon={Wallet01Icon}
                label={locale === 'ar' ? 'المحفظة' : 'Wallet'}
              />

              <MenuLink
                href="#"
                icon={InformationCircleIcon}
                label={locale === 'ar' ? 'قصتنا وإرثنا' : 'Our Heritage'}
              />

              <div className="my-4 border-t" />

              <Link
                href={`/${otherLocale}`}
                className="flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium hover:bg-[var(--surface-muted)]"
              >
                <HugeiconsIcon icon={Globe02Icon} size={20} />
                <span>
                  {locale === 'ar'
                    ? 'English'
                    : 'العربية'}
                </span>
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof ShoppingBag01Icon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium hover:bg-[var(--surface-muted)]"
    >
      <HugeiconsIcon icon={icon} size={20} />
      <span>{label}</span>
    </Link>
  );
}