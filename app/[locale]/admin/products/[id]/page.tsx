import { cookies } from "next/headers";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import type {
  ApiProduct,
} from "@/lib/api/products";

import {
  AdminProductEditor,
} from "@/components/admin/admin-product-editor";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

async function getProduct(
  id: string
): Promise<ApiProduct | null> {
  if (!API_URL) {
    return null;
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
      `${API_URL}/admin/products/${id}`,
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
      `Could not load product: ${response.status}`
    );
  }

  return response.json();
}

export default async function AdminProductPage({
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

  const product =
    await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <AdminProductEditor
      product={product}
    />
  );
}