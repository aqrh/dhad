"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPriceIQD } from "@/lib/format-price";
import {
  HeartIcon,
} from "@hugeicons/core-free-icons";

import {
  HugeiconsIcon,
} from "@hugeicons/react";

import {
  useLocale,
} from "next-intl";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  addFavorite,
  removeFavorite,
} from "@/lib/api/favorites";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image: string;
  href?: string;
  totalStock: number;

  initialFavorite?: boolean;
};

export const ProductCard = ({
  id,
  name,
  price,
  image,
  href = "#",
  totalStock,
  initialFavorite = false,
}: ProductCardProps) => {
  const locale = useLocale();
  const router = useRouter();

  const outOfStock = totalStock <= 0;

  const [
    isFavorite,
    setIsFavorite,
  ] = useState(
    initialFavorite
  );

  const [
    pending,
    setPending,
  ] = useState(false);


  const handleFavorite = async () => {
    if (pending) {
      return;
    }

    const productId =
      Number(id);

    if (
      !Number.isInteger(
        productId
      )
    ) {
      return;
    }

    setPending(true);

    try {
      if (isFavorite) {
        await removeFavorite(
          productId
        );

        setIsFavorite(false);
      } else {
        await addFavorite(
          productId
        );

        setIsFavorite(true);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Not authenticated"
      ) {
        router.push(
          `/${locale}/register`
        );

        return;
      }

      console.error(
        "Favorite failed:",
        error
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="group relative">
      {/* Image */}
      <div className="relative">
        <Link
          href={href}
          className="block"
        >
          <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-[#eeeae2]">
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </Link>

        {/* Favorite */}
        <button
          type="button"
          disabled={pending}
          onClick={
            handleFavorite
          }
          aria-pressed={
            isFavorite
          }
          aria-label={
            isFavorite
              ? `Remove ${name} from favorites`
              : `Add ${name} to favorites`
          }
          className={`absolute right-1 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition ${
            isFavorite
              ? "bg-black text-white"
              : "bg-white/90 text-black"
          } ${
            pending
              ? "opacity-50"
              : "hover:scale-105"
          }`}
        >
          <HugeiconsIcon
            icon={HeartIcon}
            size={18}
            strokeWidth={
              isFavorite
                ? 2.4
                : 1.8
            }
          />
        </button>
      </div>

      {/* Information */}
      <div className="mt-3 px-1">
        <div className="-mt-3 flex h-16 w-24 items-start justify-between rounded">
          <div>
            <p className="text-sm leading-5">
              {name}
            </p>

            <p className={`mt-1 text-xs font-bold ${outOfStock ? "text-red-600"
              : "text-black/40"
            }`}
            >
              {outOfStock ? "Out Of Stock" : `${totalStock} in stock`}
            </p>
            <div>
              <p className="mt-1 text-sm text-(--text-secondary)">
                {formatPriceIQD(price)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};