import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export const GenderSections = async () => {
  const t = await getTranslations("home");
  const locale = await getLocale();

  return (
    <section className="px-4 py-8">
      <div className="grid grid-cols-2 gap-3">

        {/* MEN */}
        <Link
          href={`/${locale}/categories/men`}
          className="relative h-[82px] overflow-hidden rounded-full"
        >
          <Image
            src="/images/categories/men.jpg"
            alt={t("men")}
            fill
            sizes="50vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/20" />

          <span className="absolute inset-0 z-10 flex items-center justify-center text-base font-black italic text-white">
            {t("men")}
          </span>
        </Link>

        {/* WOMEN */}
        <Link
          href={`/${locale}/categories/women`}
          className="relative h-[82px] overflow-hidden rounded-full"
        >
          <Image
            src="/images/categories/women.jpg"
            alt={t("women")}
            fill
            sizes="50vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/20" />

          <span className="absolute inset-0 z-10 flex items-center justify-center text-base font-black italic text-white">
            {t("women")}
          </span>
        </Link>

      </div>
    </section>
  );
};