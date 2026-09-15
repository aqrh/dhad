import {
  cookies,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import type {
  ApiProduct,
} from "@/lib/api/products";

import {
  AdminProductsDashboard,
} from "@/components/admin/admin-products-dashboard";

const API_URL =
  process.env.API_URL;

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

async function getAdminProducts(): Promise<
  ApiProduct[]
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
      `${API_URL}/admin/products`,
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
      `Failed to load admin products: ${response.status}`
    );
  }

  return response.json();
}

export default async function AdminProductsPage({
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

  const products =
    await getAdminProducts();

  return (
    <AdminProductsDashboard
      initialProducts={
        products
      }
    />
  );
}