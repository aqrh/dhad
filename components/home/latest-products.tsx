import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/products/product-card";

const products = [
  {
    id: "1",
    name: "Beige Polo Crop Top",
    price: 24,
    image: "/images/products/product-1.jpeg",
    totalStock: 12,
  },
  {
    id: "2",
    name: "Two-piece Set",
    price: 35,
    image: "/images/products/product-2.jpeg",
    totalStock: 12,
  },
  {
    id: "3",
    name: "Burgundy Dress",
    price: 30,
    image: "/images/products/product-3.jpg",
    totalStock: 12,
  },
  {
    id: "4",
    name: "Black Polo T-Shirt",
    price: 45,
    image: "/images/products/product-4.jpg",
    totalStock: 12,
  },
    {
    id: "5",
    name: "Two-piece Set",
    price: 30,
    image: "/images/products/product-2.jpeg",
    totalStock: 12,
  },
    {
    id: "6",
    name: "Two-piece Set",
    price: 28,
    image: "/images/products/product-2.jpeg",
    totalStock: 12,
  },
];

export const LatestProducts = async () => {
  const t = await getTranslations("home");
  const locale = await getLocale();

  return (
    <section className="py-8">
      <Container>
        <div className="mb-4 flex items-end justify-between">
          <Link
            href={`/${locale}/products`}
            className="text-base font-black italic text-[var(--brand-gold)]"
          >
            {t("viewAll")}
          </Link>

          <div className="text-end">
            <h2 className="text-xl font-black leading-tight">
              {t("latest")}
            </h2>

            <p className="text-sm font-bold mb-2">
              {t("collection")}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] bg-white px-1 py-3 w-full -mt-5 overflow-hidden">
          <div className="w-full overflow-x-auto scrollbar-non snap-x snap-mandatory">
            <div className="flex max-w-1 gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-25 shrink-0 snap-start"
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    totalStock={product.totalStock}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded px-4 py-4 w-full"/>
      </Container>
    </section>
  );
};