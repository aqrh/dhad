import { cookies } from "next/headers";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import type {
  AdminOrder,
} from "@/lib/api/admin-orders";

import {
  AdminOrderManager,
} from "@/components/admin/admin-order-manager";

const API_URL =
  process.env.API_URL;

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

async function getAdminOrder(
  id: string
): Promise<AdminOrder | null> {
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
    return null;
  }

  const response =
    await fetch(
      `${API_URL}/admin/orders/${id}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        cache: "no-store",
      }
    );

  if (
    response.status === 404
  ) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Could not load order: ${response.status}`
    );
  }

  return response.json();
}

export default async function AdminOrderPage({
  params,
}: Props) {
  const {
    locale,
    id,
  } = await params;

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

  if (
    !/^\d+$/.test(id)
  ) {
    notFound();
  }

  const order =
    await getAdminOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <AdminOrderManager
      initialOrder={order}
    />
  );
}