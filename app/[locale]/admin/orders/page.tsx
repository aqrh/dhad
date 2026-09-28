import { cookies } from "next/headers";
import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  AdminOrdersList,
} from "@/components/admin/admin-orders-list";

import type {
  AdminOrder,
} from "@/lib/api/admin-orders";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

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

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

async function getAdminOrders(): Promise<
  AdminOrder[]
> {
  if (!API_URL) {
    throw new Error(
      "API_URL is not configured"
    );
  }

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "auth_token"
    )?.value;

  if (!token) {
    return [];
  }

  const response =
    await fetch(
      `${API_URL}/admin/orders`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      `Failed to load admin orders: ${response.status}`
    );
  }

  return response.json();
}

export default async function AdminOrdersPage({
  params,
}: Props) {
  const { locale } =
    await params;

  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      `/${locale}/register`
    );
  }

  if (
    user.role !== "ADMIN"
  ) {
    redirect(
      `/${locale}/account`
    );
  }

  const orders =
    await getAdminOrders();

  return (
    <AdminOrdersList
      orders={orders}
    />
  );
}