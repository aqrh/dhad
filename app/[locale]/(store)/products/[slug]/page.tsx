import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { formatPriceIQD } from "@/lib/format-price";
import { ProductOptions } from "@/components/products/product-options";
import { getProduct } from "@/lib/api/products";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("products");

  const id = Number(slug);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const image =
    product.images[0]?.url ??
    "/images/products/placeholder.jpg";

  return (
    <main className="pb-36">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        <Image
          src={image}
          alt={
            product.images[0]?.alt ??
            product.name
          }
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <section className="px-4 pt-5">
        <p className="text-[11px] font-bold tracking-[0.2em] text-black/40">
          IRAQ HERITAGE
        </p>

        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="max-w-[70%] text-2xl font-black">
            {product.name}
          </h1>

          <p className="text-xl font-black">
            {formatPriceIQD(product.price)}
          </p>
        </div>

        <p className="mt-3 text-sm leading-6 text-black/55">
          {product.description ?? t("description")}
        </p>

        <ProductOptions
          locale={locale}
          product={{
            id: String(product.id),
            name: product.name,
            basePrice: product.price,
            image,
            deliveryPrice: product.deliveryPrice,
            variants: product.variants,
          }}
        />
        <MobileBottomNav />
      </section>
    </main>
  );
}