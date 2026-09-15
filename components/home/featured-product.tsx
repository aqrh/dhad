import {getTranslations} from "next-intl/server";
import {Container} from "@/components/layout/container";
import {ProductCard} from "@/components/products/product-card";
import Link from "next/link";
import { ShoppingBag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";


export const FeaturedProduct = async () => {
  const t = await getTranslations("home");
  const product =
  {
    id: "1",
    name: "",
    price: "$45.40",
    image: "/images/hero/featured/images.jpeg",
    href: "#",
  };


  return (
    <>
            <Link href={product.href} className="block max-w-20">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#eeeae2]">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            </div>
            </Link>

            <div className="mt-3 px-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold leading-5">
              {product.name}
            </h3>

            <button type="button" className="bg-white rounded-3xl ml-9 text-sm text-[var(--text-secondary)]">
              <div className="relative grid grid-cols-2 grid-rows-1 w-20 mr-2">
                <p className="text-sm">{product.price}</p>
                <HugeiconsIcon icon={ShoppingBag01Icon} className="size-5 mr-3"/>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
    );
};