export type ProductImage = {
  id: number;
  url: string;
  alt: string | null;
  position: number;
  productId: number;
};

export type ProductVariant = {
  id: number;
  sku: string;
  size: string | null;
  color: string | null;
  price: number | null;
  stock: number;
  productId: number;
};

export type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  deliveryPrice: number | null;

  category: ProductCategory;
  audience: ProductAudience;

  images: ProductImage[];
  variants: ProductVariant[];

  createdAt: string;
  updatedAt: string;
};

export type ProductCategory =
  | "TSHIRT"
  | "HOODIE"
  | "SHIRT"
  | "JACKET"
  | "SUIT"
  | "JEANS_BOTTOM";

export type ProductAudience =
  | "MEN"
  | "WOMEN"
  | "UNISEX";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProducts(
  category?: ProductCategory,
  audience?: ProductAudience
): Promise<ApiProduct[]> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }

  const url = new URL("/products", API_URL);

  if (category) {
    url.searchParams.set("category", category);
  }

  if (audience) {
    url.searchParams.set("audience", audience);
  }

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load products: ${response.status}`
    );
  }

  return response.json();
}

export async function getProduct(
  id: number
): Promise<ApiProduct | null> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }

  const response = await fetch(
    `${API_URL}/products/${id}`,
    {
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch product: ${response.status}`
    );
  }

  return response.json();
}