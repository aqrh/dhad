'use client';

import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import {
  Home01Icon,
  HeartFreeIcons,
  ShoppingBag01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import {HugeiconsIcon} from '@hugeicons/react';
import { useCart } from "@/features/cart/cart-provider";

export function MobileBottomNav() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const { itemCount } = useCart();

  const items = [
    {
      href: `/${locale}`,
      label: t('home'),
      icon: Home01Icon,
    },
    {
      href: `/${locale}/favorites`,
      label: t('favorites'),
      icon: HeartFreeIcons,
    },
    {
      href: `/${locale}/cart`,
      label: t('cart'),
      icon: ShoppingBag01Icon,
    },
    {
      href: `/${locale}/account`,
      label: t('account'),
      icon: UserIcon,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-[var(--surface)]/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-[72px] max-w-md items-center justify-around px-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-navy)]"
          >
            <div className="relative">
  <HugeiconsIcon
    icon={item.icon}
    size={21}
    strokeWidth={1.8}
  />

  {item.href.endsWith("/cart") && itemCount > 0 && (
    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-burgundy)] px-1 text-[9px] font-black text-white">
      {itemCount > 99 ? "99+" : itemCount}
    </span>
  )}
</div>

            <span className="text-[10px] font-medium">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}