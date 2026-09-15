export type FavoriteProductImage = {
  id: number;
  url: string;
  alt: string | null;
  position: number;
  productId: number;
};

export type FavoriteProduct = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;

  images: FavoriteProductImage[];

  createdAt: string;
  updatedAt: string;
};

export type Favorite = {
  userId: number;
  productId: number;
  createdAt: string;

  product: FavoriteProduct;
};

export async function getFavorites(): Promise<
  Favorite[]
> {
  const response = await fetch(
    "/api/favorites",
    {
      cache: "no-store",
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not load favorites"
      )
    );
  }

  return data;
}

export async function addFavorite(
  productId: number
) {
  const response = await fetch(
    `/api/favorites/${productId}`,
    {
      method: "POST",
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not add favorite"
      )
    );
  }

  return data;
}

export async function removeFavorite(
  productId: number
) {
  const response = await fetch(
    `/api/favorites/${productId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not remove favorite"
      )
    );
  }

  return data;
}

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