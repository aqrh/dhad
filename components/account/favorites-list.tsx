"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  useState,
} from "react";

import {
  removeFavorite,
  type Favorite,
} from "@/lib/api/favorites";
import { formatPriceIQD } from "@/lib/format-price";

type Props = {
  initialFavorites: Favorite[];
};

export function FavoritesList({
  initialFavorites,
}: Props) {
  const t =
    useTranslations(
      "favorites"
    );

  const locale =
    useLocale();

  const [
    favorites,
    setFavorites,
  ] = useState<Favorite[]>(
    initialFavorites
  );

  const [
    removingId,
    setRemovingId,
  ] = useState<
    number | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const handleRemove = async (
    productId: number
  ) => {
    if (
      removingId !== null
    ) {
      return;
    }

    setError(null);
    setRemovingId(
      productId
    );

    try {
      await removeFavorite(
        productId
      );

      setFavorites(
        (current) =>
          current.filter(
            (favorite) =>
              favorite.productId !==
              productId
          )
      );
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );
      } else {
        setError(
          t("removeFailed")
        );
      }
    } finally {
      setRemovingId(
        null
      );
    }
  };

  if (
    favorites.length === 0
  ) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-black">
          {t("empty")}
        </h2>

        <p className="mt-2 text-sm text-black/45">
          {t(
            "emptyDescription"
          )}
        </p>

        <Link
          href={`/${locale}/products`}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-black text-white"
        >
          {t("shopProducts")}
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-6">
        {favorites.map(
          (favorite) => {
            const product =
              favorite.product;

            const image =
              product.images[0]
                ?.url ??
              "/images/products/product-1.jpeg";

            return (
              <article
                key={
                  product.id
                }
              >
                <Link
                  href={`/${locale}/products/${product.id}`}
                  className="block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-neutral-100">
                    <Image
                      src={
                        image
                      }
                      alt={
                        product
                          .images[0]
                          ?.alt ??
                        product.name
                      }
                      fill
                      sizes="50vw"
                      className="object-cover"
                    />
                  </div>

                  <h2 className="mt-3 line-clamp-2 text-sm font-black">
                    {
                      product.name
                    }
                  </h2>

                  <p className="mt-1 text-sm font-black">
                    {formatPriceIQD(product.price)}
                  </p>
                </Link>

                <button
                  type="button"
                  disabled={
                    removingId ===
                    product.id
                  }
                  onClick={() =>
                    handleRemove(
                      product.id
                    )
                  }
                  className="mt-2 text-xs font-bold underline underline-offset-4 disabled:opacity-40"
                >
                  {removingId ===
                  product.id
                    ? t(
                        "removing"
                      )
                    : t(
                        "remove"
                      )}
                </button>
              </article>
            );
          }
        )}
      </div>
    </>
  );
}