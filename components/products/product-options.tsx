"use client";

import Link from "next/link";
import { formatPriceIQD } from "@/lib/format-price";
import {
  useMemo,
  useState,
} from "react";
import { useTranslations } from "next-intl";

import { useCart } from "@/features/cart/cart-provider";
import type {
  ProductVariant,
} from "@/lib/api/products";

type Props = {
  locale: string;

  product: {
    id: string;
    name: string;
    basePrice: number;
    image: string;
    variants: ProductVariant[];
    deliveryPrice: number | null;
  };
};

const sizeOrder = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

export function ProductOptions({
  locale,
  product,
}: Props) {
  const t =
    useTranslations("products");

  const { addItem } =
    useCart();

  const colors = useMemo(() => {
    return Array.from(
      new Set(
        product.variants
          .map(
            (variant) =>
              variant.color
          )
          .filter(
            (
              color
            ): color is string =>
              Boolean(color)
          )
      )
    );
  }, [product.variants]);

  const hasColors =
    colors.length > 0;

  const firstAvailableColor =
    useMemo(() => {
      return (
        colors.find((color) =>
          product.variants.some(
            (variant) =>
              variant.color ===
                color &&
              variant.stock > 0
          )
        ) ??
        colors[0] ??
        ""
      );
    }, [
      colors,
      product.variants,
    ]);

  const [
    selectedColor,
    setSelectedColor,
  ] = useState(
    firstAvailableColor
  );

  const [
    selectedSize,
    setSelectedSize,
  ] = useState("");

  const [
    added,
    setAdded,
  ] = useState(false);

  /*
   * All sizes for the selected
   * color are included here,
   * even when stock is 0.
   */
  const sizes = useMemo(() => {
    const values =
      product.variants
        .filter((variant) => {
          if (!hasColors) {
            return true;
          }

          return (
            variant.color ===
            selectedColor
          );
        })
        .map(
          (variant) =>
            variant.size
        )
        .filter(
          (
            size
          ): size is string =>
            Boolean(size)
        );

    return Array.from(
      new Set(values)
    ).sort((a, b) => {
      const aIndex =
        sizeOrder.indexOf(a);

      const bIndex =
        sizeOrder.indexOf(b);

      if (
        aIndex === -1 &&
        bIndex === -1
      ) {
        return a.localeCompare(b);
      }

      if (aIndex === -1) {
        return 1;
      }

      if (bIndex === -1) {
        return -1;
      }

      return aIndex - bIndex;
    });
  }, [
    product.variants,
    hasColors,
    selectedColor,
  ]);

  const selectedVariant =
    product.variants.find(
      (variant) => {
        const colorMatches =
          !hasColors ||
          variant.color ===
            selectedColor;

        return (
          colorMatches &&
          variant.size ===
            selectedSize &&
          variant.stock > 0
        );
      }
    );

    const totalStock = product.variants.reduce(
  (sum, variant) =>
    sum + variant.stock,
  0
  );

  const hasVariants =
    product.variants.length > 0;

  const productOutOfStock =
    !hasVariants || totalStock <= 0;

  const displayPrice =
    selectedVariant?.price ??
    product.basePrice;

  function isColorAvailable(
    color: string
  ) {
    return product.variants.some(
      (variant) =>
        variant.color === color &&
        variant.stock > 0
    );
  }

  function isSizeAvailable(
    size: string
  ) {
    return product.variants.some(
      (variant) => {
        const colorMatches =
          !hasColors ||
          variant.color ===
            selectedColor;

        return (
          colorMatches &&
          variant.size === size &&
          variant.stock > 0
        );
      }
    );
  }

  const handleColorChange = (
    color: string
  ) => {
    if (
      !isColorAvailable(color)
    ) {
      return;
    }

    setSelectedColor(color);
    setSelectedSize("");
    setAdded(false);
  };

  const handleSizeChange = (
    size: string
  ) => {
    if (
      !isSizeAvailable(size)
    ) {
      return;
    }

    setSelectedSize(size);
    setAdded(false);
  };

  const handleAddToCart =
    () => {

    if (
      productOutOfStock ||
      !selectedVariant ||
      selectedVariant.stock < 1
    ) {
        return;
      }
      if (!selectedVariant) {
        return;
      }

      addItem({
        id: product.id,

        maxStock: selectedVariant.stock,

        variantId:
          selectedVariant.id,

        sku:
          selectedVariant.sku,

        name: product.name,

        price:
          displayPrice,

        image:
          product.image,

        size:
          selectedVariant.size ??
          "",

        color:
          selectedVariant.color ??
          "",

        deliveryPrice: product.deliveryPrice,
      });

      setAdded(true);

      window.setTimeout(() => {
        setAdded(false);
      }, 1200);
    };

  return (
    <>
      {/* VARIANT PRICE */}
      {selectedVariant &&
        selectedVariant.price !==
          null && (
          <p className="mt-4 text-lg font-black">
            ${formatPriceIQD(displayPrice)}
          </p>
        )}

      {/* COLORS */}
      {hasColors && (
        <div className="mt-7">
          <h2 className="mb-3 text-sm font-black">
            {t("color")}
          </h2>

          <div className="flex flex-wrap gap-2">
            {colors.map(
              (color) => {
                const active =
                  selectedColor ===
                  color;

                const available =
                  isColorAvailable(
                    color
                  );

                return (
                  <button
                    key={color}
                    type="button"
                    disabled={
                      !available
                    }
                    onClick={() =>
                      handleColorChange(
                        color
                      )
                    }
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                      active
                        ? "border-black bg-black text-white"
                        : available
                          ? "border-black/15 bg-white"
                          : "border-black/10 bg-neutral-100 text-black/25 line-through"
                    }`}
                  >
                    {color}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* SIZES */}
      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black">
            {t("size")}
          </h2>

          <button
            type="button"
            className="text-xs font-semibold underline underline-offset-4"
          >
            {t("sizeGuide")}
          </button>
        </div>

        {sizes.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {sizes.map(
              (size) => {
                const active =
                  selectedSize ===
                  size;

                const available =
                  isSizeAvailable(
                    size
                  );

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={
                      !available
                    }
                    onClick={() =>
                      handleSizeChange(
                        size
                      )
                    }
                    className={`h-12 rounded-xl border text-sm font-black transition ${
                      active
                        ? "border-black bg-black text-white"
                        : available
                          ? "border-black/15 bg-white"
                          : "border-black/10 bg-neutral-100 text-black/25 line-through"
                    }`}
                  >
                    {size}
                  </button>
                );
              }
            )}
          </div>
        ) : (
          <p className="rounded-2xl bg-neutral-100 px-4 py-4 text-sm text-black/45">
            No sizes available.
          </p>
        )}
      </div>

      {/* STOCK */}
      {selectedVariant && (
        <p className="mt-3 text-xs text-black/45">
          {selectedVariant.stock}{" "}
          {t("inStock")}
        </p>
      )}

      {/* CUSTOMIZE */}
      <Link
        href={`/${locale}/design/${product.id}`}
        className="mt-7 flex h-14 items-center justify-center rounded-full border-2 border-black text-sm font-black"
      >
        {t("customize")}
      </Link>

      {/* ADD TO CART */}
      <div className="pointer-events-auto -mb-4 fixed inset-x-0 bottom-[72px] z-[100] border-t border-black/10 bg-white px-4 py-3">
        <button
          type="button"
          disabled={
            productOutOfStock ||
            !selectedVariant
          }
          onClick={
            handleAddToCart
          }
          className="h-14 w-full touch-manipulation rounded-full bg-black text-sm font-black text-white disabled:bg-black/15 disabled:text-black/30"
        >
          {added
            ? t("addedToCart")
            : selectedVariant
              ? t("addToCart")
              : t("selectSize")}
        </button>
      </div>
    </>
  );
}