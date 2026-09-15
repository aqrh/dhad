"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatPriceIQD } from "@/lib/format-price";
import { useCart } from "@/features/cart/cart-provider";

export function CartContent() {
  const t = useTranslations("cart");
  const locale = useLocale();

  const {
    items,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    total,
  } = useCart();

  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <>
        <section className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-neutral-100">
            <HugeiconsIcon
              icon={ShoppingBag01Icon}
              size={52}
              strokeWidth={1.3}
              className="text-black/30"
            />
          </div>

          <h2 className="mt-6 text-xl font-black">
            {t("emptyTitle")}
          </h2>

          <p className="mt-2 max-w-[280px] text-sm leading-6 text-black/45">
            {t("emptyDescription")}
          </p>

          <Link
            href={`/${locale}/products`}
            className="mt-7 flex h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-black text-white"
          >
            {t("startShopping")}
          </Link>
        </section>

        <CheckoutBar
          total={0}
          disabled
          locale={locale}
        />
      </>
    );
  }

  return (
    <>
      <section className="space-y-4 px-4 py-5">
        {items.map((item) => (
          <article
            key={item.variantId}
            className="flex gap-4 border-b border-black/10 pb-4"
          >
            <Link
              href={`/${locale}/products/${item.id}`}
              className="relative h-[125px] w-[100px] shrink-0 overflow-hidden rounded-2xl bg-neutral-100"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="100px"
                className="object-cover"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/${locale}/products/${item.id}`}
                    className="line-clamp-2 text-sm font-black"
                  >
                    {item.name}
                  </Link>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-black/50">
                    <span>
                      {t("size")}: {item.size}
                    </span>

                    <span>
                      {t("color")}: {item.color}
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] text-black/35">
                    {item.sku}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-black">
                  ${formatPriceIQD(item.price * item.quantity)}
                </p>
              </div>

              <div className="mt-auto flex items-end justify-between gap-3">
  <button
    type="button"
    onClick={() =>
      removeItem(item.variantId)
    }
    className="text-xs font-semibold text-black/45 underline underline-offset-4"
  >
    {t("remove")}
  </button>

  <div className="flex flex-col items-end gap-1">
    {item.quantity >= item.maxStock && (
      <p className="text-[10px] font-semibold text-black/40">
        Max stock reached
      </p>
    )}

    <div className="flex h-10 items-center rounded-full border border-black/10 bg-neutral-50">
      <button
        type="button"
        onClick={() =>
          decreaseQuantity(
            item.variantId
          )
        }
        className="flex h-10 w-10 items-center justify-center text-xl font-medium"
        aria-label="Decrease quantity"
      >
        −
      </button>

      <span className="min-w-7 text-center text-sm font-black">
        {item.quantity}
      </span>

      <button
        type="button"
        disabled={
          item.quantity >=
          item.maxStock
        }
        onClick={() =>
          increaseQuantity(
            item.variantId
          )
        }
        className="flex h-10 w-10 items-center justify-center text-xl font-medium disabled:cursor-not-allowed disabled:text-black/20"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  </div>
</div>
            </div>
          </article>
        ))}
      </section>

      <CheckoutBar
        total={total}
        disabled={false}
        locale={locale}
      />
    </>
  );
}

function CheckoutBar({
  total,
  disabled,
  locale,
}: {
  total: number;
  disabled: boolean;
  locale: string;
}) {
  const t = useTranslations("cart");

  return (
    <div className="fixed inset-x-0 bottom-[72px] z-40 border-t border-black/10 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-black/45">
            {t("total")}
          </p>

          <p className="text-lg font-black">
            ${formatPriceIQD(total)}
          </p>
        </div>

        {disabled ? (
          <button
            type="button"
            disabled
            className="h-13 min-w-[165px] rounded-full bg-black/10 px-6 text-sm font-black text-black/25"
          >
            {t("checkout")}
          </button>
        ) : (
          <Link
            href={`/${locale}/checkout`}
            className="flex h-13 min-w-[165px] items-center justify-center rounded-full bg-black px-6 text-sm font-black text-white"
          >
            {t("checkout")}
          </Link>
        )}
      </div>
    </div>
  );
}