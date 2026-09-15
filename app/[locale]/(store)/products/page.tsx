import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { getProducts } from "@/lib/api/products";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { cookies } from "next/headers";
import type{
  ProductCategory,
  ProductAudience,
} from "@/lib/api/products";

type Props = {
  params: Promise<{
    locale: string;
  }>;

  searchParams: Promise<{
    category?: string;
    audience?: string;
  }>;
};

const API_URL =
  process.env.API_URL;

const categories: {
  value: ProductCategory | null;
  label: string;
}[] = [
  {
    value: null,
    label: "All",
  },
  {
    value: "TSHIRT",
    label: "T-Shirts",
  },
  {
    value: "HOODIE",
    label: "Hoodies",
  },
  {
    value: "SHIRT",
    label: "Shirts",
  },
  {
    value: "JACKET",
    label: "Jackets",
  },
  {
    value: "SUIT",
    label: "Suits",
  },
  {
    value: "JEANS_BOTTOM",
    label: "Jeans / Bottoms",
  },
];

const allowedCategories =
  new Set<ProductCategory>(
    categories
      .map(
        (category) =>
          category.value
      )
      .filter(
        (
          value
        ): value is ProductCategory =>
          value !== null
      )
  );

  const allowedAudiences =
  new Set<ProductAudience>([
    "MEN",
    "WOMEN",
    "UNISEX",
  ]);



async function getFavoriteProductIds() {
  if (!API_URL) {
    return new Set<number>();
  }

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "auth_token"
    )?.value;

  if (!token) {
    return new Set<number>();
  }

  try {
    const response =
      await fetch(
        `${API_URL}/favorites`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

    if (!response.ok) {
      return new Set<number>();
    }

    const favorites: Array<{
      productId: number;
    }> =
      await response.json();

    return new Set(
      favorites.map(
        (favorite) =>
          favorite.productId
      )
    );
  } catch {
    return new Set<number>();
  }
}

export default async function ProductsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const t = await getTranslations("products");

  const favoriteProductIds =
  await getFavoriteProductIds();

  const {
    category: rawCategory,
    audience: rawAudience,
  } = await searchParams;
  const category: ProductCategory | undefined =
    rawCategory &&
    allowedCategories.has(
      rawCategory as ProductCategory
    )
      ? (
          rawCategory as ProductCategory
        )
      : undefined;
  const audience: ProductAudience | undefined =
    rawAudience && allowedAudiences.has(
      rawAudience as ProductAudience
    ) ? (rawAudience as ProductAudience) : undefined;

    const products = await getProducts(category, audience);
    const categoryLabels: Record<ProductCategory, string> = {
  TSHIRT: "T-Shirts",
  HOODIE: "Hoodies",
  SHIRT: "Shirts",
  JACKET: "Jackets",
  SUIT: "Suits",
  JEANS_BOTTOM: "Jeans / Bottoms",
};

const audienceLabel =
  audience === "MEN"
    ? "Men"
    : audience === "WOMEN"
      ? "Women"
      : null;

const pageTitle =
  audienceLabel && category
    ? `${audienceLabel} · ${categoryLabels[category]}`
    : audienceLabel
      ? audienceLabel
      : category
        ? categoryLabels[category]
        : "All Products";

  return (
    <main className="px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-black/40">
            IRAQ HERITAGE
          </p>

          <h1 className="mt-1 text-3xl font-black italic">
            {t("products")}
          </h1>
        </div>

        <p className="text-sm text-black/50">
          {products.length} {t("items")}
        </p>
      </div>
    <div className="mt-6">


  <h1 className="mt-1 text-2xl font-black tracking-tight">
    {pageTitle}
  </h1>

  <p className="mt-1 text-sm text-black/50">
    {products.length}{" "}
    {products.length === 1
      ? "product"
      : "products"}
  </p>
</div>
    <div className="mt-5 flex gap-2">
    {[
      { label: "All", value: null },
      { label: "Men", value: "MEN" },
      { label: "Women", value: "WOMEN" },
    ].map((item) => {
      const selected =
        item.value === null
          ? !audience
          : audience === item.value;

      const params = new URLSearchParams();

    // Preserve the current category
      if (category) {
        params.set("category", category);
      }

    // Set audience only for Men / Women
      if (item.value) {
       params.set("audience", item.value);
      }

      const query = params.toString();

      const href = query
        ? `/${locale}/products?${query}`
        : `/${locale}/products`;

      return (
        <Link
        key={item.value ?? "ALL"}
        href={href}
        className={`flex-1 rounded-2xl px-4 py-3 text-center text-sm font-black transition ${
          selected
            ? "bg-black text-white"
            : "border border-black/10 bg-white text-black"
        }`}
        >
          {item.label}
          </Link>
          );
        })}
      </div>
      <div className="-mx-4 mt-5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2">
          {categories.map(
            (item) => {
              const selected = item.value === null ? !category : category === item.value;
              const params =
                new URLSearchParams();
              if(item.value) {
                params.set("category", item.value);
              }
              if(audience) {
                params.set("audience", audience);
              }

              const query = params.toString();

              const href = query ? `/${locale}/products?${query}`
                : `/${locale}/products`;

            return (
              <Link
                key={
                  item.value ??
                  "ALL"
                }
                href={href}
                className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-black transition ${
                  selected
                    ? "bg-black text-white"
                    : "border border-black/10 bg-white text-black"
                }`}
              >
                {item.label}
              </Link>
            );
          }
        )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-7">
  {products.map((product) => {
    return (
      <ProductCard
        key={product.id}
        id={String(product.id)}
        name={product.name}
        price={product.price}
        image={
          product.images[0]?.url ??
          "/images/products/burgundy_brand.jpeg"
        }
        href={`/${locale}/products/${product.id}`}
        initialFavorite={
          favoriteProductIds.has(
            product.id
          )
        }
      />
    );
  })}
  <MobileBottomNav />
</div>
    </main>
  );
}