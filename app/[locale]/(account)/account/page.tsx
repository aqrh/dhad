import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getLocale,
  getTranslations,
} from "next-intl/server";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import {
  EditProfileForm,
} from "@/components/account/edit-profile-form";

import {
  UserIcon,
  Location01Icon,
  PackageIcon,
  FavouriteIcon,
  PaintBoardIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import {
  HugeiconsIcon,
} from "@hugeicons/react";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  LogoutButton,
} from "@/components/auth/logout-button";

export default async function AccountPage() {
  const t =
    await getTranslations("account");

  const locale =
    await getLocale();

  /*
   * Read the HttpOnly auth cookie
   * and ask Nest for the real user.
   */
  const user =
    await getCurrentUser();

  /*
   * Account is protected.
   */
  if (!user) {
    redirect(
      `/${locale}/register`
    );
  }

  const items = [
    {
      label: t("orders"),
      href: `/${locale}/orders`,
      icon: PackageIcon,
    },
    {
      label: t("addresses"),
      href: `/${locale}/addresses`,
      icon: Location01Icon,
    },
    {
      label: t("designs"),
      href: `/${locale}/designs`,
      icon: PaintBoardIcon,
    },
    {
      label: t("favorites"),
      href: `/${locale}/favorites`,
      icon: FavouriteIcon,
    },
  ];

  return (
    <main className="min-h-screen bg-white px-4 pb-24 pt-6">
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-[0.2em] text-black/35">
            IRAQ HERITAGE
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {t("title")}
          </h1>
        </div>

        {/* REAL USER */}
        <section className="rounded-[24px] bg-neutral-100 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-white">
              <HugeiconsIcon
                icon={UserIcon}
                size={24}
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-black">
                {user.name ??
                  user.phone ??
                  "IRAQ HERITAGE"}
              </h2>

              {user.phone && (
                <p className="mt-1 text-sm text-black/50">
                  {user.phone}
                </p>
              )}

              {user.email && (
                <p className="mt-1 truncate text-xs text-black/40">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <EditProfileForm
            initialName={user.name}
            initialEmail={user.email}
            />
        </section>

        {/* ACCOUNT LINKS */}
        <nav className="mt-6 space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-16 items-center justify-between rounded-2xl border border-black/10 px-4"
            >
              <div className="flex items-center gap-3">
                <HugeiconsIcon
                  icon={item.icon}
                  size={21}
                />

                <span className="text-sm font-bold">
                  {item.label}
                </span>
              </div>

              <HugeiconsIcon
                icon={
                  ArrowRight01Icon
                }
                size={18}
                className="rtl:rotate-180"
              />
            </Link>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="mt-6">
          <LogoutButton />
          <MobileBottomNav />
        </div>
      </div>
    </main>
  );
}