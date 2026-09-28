import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { OrdersList } from "@/components/account/orders-list";
import type { Order } from "@/lib/api/orders";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

async function getUserOrders(): Promise<
  Order[] | null
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
    return null;
  }

  const response = await fetch(
    `${API_URL}/orders`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load orders: ${response.status}`
    );
  }

  return response.json();
}

export default async function OrdersPage({
  params,
}: Props) {
  const { locale } = await params;

  const t =
    await getTranslations(
      "orders"
    );

  const orders =
    await getUserOrders();

  if (!orders) {
    redirect(
      `/${locale}/register`
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-24 pt-6">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.2em] text-black/35">
            IRAQ HERITAGE
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {t("title")}
          </h1>
        </div>

        <OrdersList
          orders={orders}
        />
      </div>
    </main>
  );
}