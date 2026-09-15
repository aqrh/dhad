import type {
  ApiProduct,
  ProductAudience,
  ProductImage,
  ProductVariant,
} from "@/lib/api/products";

/* =========================
   PRODUCTS
========================= */

export type CreateAdminProductInput = {
  slug: string;
  name: string;
  description?: string;
  category?: ProductCategory;
  audience?: ProductAudience;

  price: number;
  deliveryPrice?: number;

  active?: boolean;

  images?: {
    url: string;
    alt?: string;
    position?: number;
  }[];

  variants?: {
    sku: string;
    size?: string;
    color?: string;

    // cents
    price?: number;

    stock: number;
  }[];
};

export type UpdateAdminProductInput = {
  slug?: string;
  name?: string;
  description?: string;
  category?: ProductCategory;
  audience?: ProductAudience;

  // cents
  price?: number;
  deliveryPrice?: number | null;

  active?: boolean;
};

export type ProductCategory =
  | "TSHIRT"
  | "HOODIE"
  | "SHIRT"
  | "JACKET"
  | "SUIT"
  | "JEANS_BOTTOM";

export async function createAdminProduct(
  input: CreateAdminProductInput
): Promise<ApiProduct> {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Could not create product")
    );
  }

  return data;
}

export async function updateAdminProduct(
  productId: number,
  input: UpdateAdminProductInput
): Promise<ApiProduct> {
  const response = await fetch(
    `/api/admin/products/${productId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Could not update product")
    );
  }

  return data;
}

/* =========================
   PRODUCT IMAGES
========================= */

export type CreateAdminProductImageInput = {
  url: string;
  alt?: string;
  position?: number;
};

export async function addAdminProductImage(
  productId: number,
  input: CreateAdminProductImageInput
): Promise<ProductImage> {
  const response = await fetch(
    `/api/admin/products/${productId}/images`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Could not add image")
    );
  }

  return data;
}

export async function uploadAdminProductImage(
  productId: number,
  file: File,
  alt?: string
): Promise<ProductImage> {
  const formData = new FormData();

  formData.append("file", file);

  if (alt?.trim()) {
    formData.append("alt", alt.trim());
  }

  const response = await fetch(
    `/api/admin/products/${productId}/images/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Could not upload image")
    );
  }

  return data;
}

export async function removeAdminProductImage(
  imageId: number
): Promise<void> {
  const response = await fetch(
    `/api/admin/products/images/${imageId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Could not remove image")
    );
  }
}

/* =========================
   PRODUCT VARIANTS
========================= */

export type CreateAdminVariantInput = {
  sku: string;
  size?: string;
  color?: string;

  // cents
  price?: number;

  stock: number;
};

export type UpdateAdminVariantInput = {
  sku?: string;
  size?: string;
  color?: string;

  // cents
  price?: number;

  stock?: number;
};

export async function addAdminVariant(
  productId: number,
  input: CreateAdminVariantInput
): Promise<ProductVariant> {
  const response = await fetch(
    `/api/admin/products/${productId}/variants`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Could not add variant")
    );
  }

  return data;
}

export async function updateAdminVariant(
  variantId: number,
  input: UpdateAdminVariantInput
): Promise<ProductVariant> {
  const response = await fetch(
    `/api/admin/products/variants/${variantId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Could not update variant")
    );
  }

  return data;
}

export async function removeAdminVariant(
  variantId: number
): Promise<void> {
  const response = await fetch(
    `/api/admin/products/variants/${variantId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Could not remove variant")
    );
  }
}

/* =========================
   ERROR HANDLING
========================= */

function getErrorMessage(
  data: unknown,
  fallback: string
) {
  if (
    typeof data !== "object" ||
    data === null ||
    !("message" in data)
  ) {
    return fallback;
  }

  const message = (
    data as {
      message?: unknown;
    }
  ).message;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    return message
      .filter(
        (value): value is string =>
          typeof value === "string"
      )
      .join(", ");
  }

  return fallback;
}

export async function deleteAdminProduct(
  productId: number,
): Promise<void> {
  const response = await fetch(
    `/api/admin/products/${productId}`,
    {
      method: "DELETE",
    },
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not delete product",
      ),
    );
  }
}
