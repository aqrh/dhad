export type CreateOrderItem = {
  variantId: number;
  quantity: number;
};

export type CreateOrderInput = {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  notes?: string;
  items: CreateOrderItem[];
};

export type OrderVariant = {
  id: number;
  sku: string;
  size: string | null;
  color: string | null;
  price: number | null;
  stock: number;
  productId: number;
};

export type CreatedOrder = {
  id: number;
  status: string;
  subtotal: number;
  delivery: number;
  total: number;
};

export type OrderProductImage = {
  id: number;
  url: string;
  alt: string | null;
  position: number;
  productId: number;
};

export type OrderProduct = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;

  images: OrderProductImage[];

  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: number;
  quantity: number;
  price: number;

  orderId: number;
  productId: number;
  variantId: number;

  product: OrderProduct;
  variant: OrderVariant;
};

export type Order = {
  id: number;
  status: string;

  subtotal: number;
  delivery: number;
  total: number;

  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  notes: string | null;

  userId: number | null;

  items: OrderItem[];

  createdAt: string;
  updatedAt: string;
};

export async function getOrders(): Promise<
  Order[]
> {
  const response = await fetch(
    "/api/orders",
    {
      cache: "no-store",
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getOrderErrorMessage(
        data,
        "Could not load orders"
      )
    );
  }

  return data;
}

function getOrderErrorMessage(
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

export async function createOrder(
  input: CreateOrderInput
): Promise<CreatedOrder> {
  const response = await fetch(
    "/api/orders",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getOrderErrorMessage(
        data,
        `Failed to create order: ${response.status}`
      )
    );
  }

  return data as CreatedOrder;
}