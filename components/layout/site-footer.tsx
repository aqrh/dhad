import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export const SiteFooter = async () => {
  const t = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <footer className="mt-10 border-t border-black/10 bg-white px-4 pb-24 pt-8 lg:pb-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8">
          <h2 className="text-lg font-black tracking-[0.18em]">
            IRAQ
          </h2>

          <p className="text-xs font-bold tracking-[0.3em] text-[var(--brand-gold)]">
            HERITAGE
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="flex flex-col gap-3">
            <Link href={`/${locale}`}>
              {t("home")}
            </Link>

            <Link href={`/${locale}/collections`}>
              {t("collections")}
            </Link>

            <Link href={`/${locale}/about`}>
              {t("about")}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <Link href={`/${locale}/favorites`}>
              {t("favorites")}
            </Link>

            <Link href={`/${locale}/cart`}>
              {t("cart")}
            </Link>

            <Link href={`/${locale}/account`}>
              {t("account")}
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-black/10 pt-4">
          <p className="text-xs text-black/50">
            © 2026 IRAQ HERITAGE
          </p>
        </div>
      </div>
    </footer>
  );
};