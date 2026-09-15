import { getTranslations } from "next-intl/server";

import { CartContent } from "@/components/cart/cart-content";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default async function CartPage() {
  const t = await getTranslations("cart");

  return (
    <>
      <main className="min-h-screen bg-white pb-40">
        <header className="flex h-16 items-center justify-center border-b border-black/5 px-4">
          <h1 className="text-lg font-black">
            {t("title")}
          </h1>
        </header>

        <CartContent />
      </main>

      <MobileBottomNav />
    </>
  );
}