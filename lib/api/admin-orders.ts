export type AdminOrderImage = {
  id: number;
  url: string;
  alt: string | null;
  position: number;
  productId: number;
};

export type AdminOrderProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: AdminOrderImage[];
};

export type AdminOrderVariant = {
  id: number;
  sku: string;
  size: string | null;
  color: string | null;
  price: number | null;
  stock: number;
  productId: number;
};

export type AdminOrderItem = {
  id: number;
  quantity: number;
  price: number;

  orderId: number;
  productId: number;
  variantId: number;

  product: AdminOrderProduct;
  variant: AdminOrderVariant;
};

export type AdminOrder = {
  id: number;
  status: AdminOrderStatus;

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

  items: AdminOrderItem[];

  createdAt: string;
  updatedAt: string;
};

export type AdminOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export async function updateAdminOrderStatus(
  orderId: number,
  status: AdminOrderStatus
): Promise<AdminOrder> {
  const response = await fetch(
    `/api/admin/orders/${orderId}/status`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status,
      }),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : "Could not update order status";

    throw new Error(message);
  }

  return data;
}