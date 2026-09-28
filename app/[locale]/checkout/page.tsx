import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import type { Address } from "@/lib/api/addresses";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getSavedAddresses(): Promise<Address[]> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }

  const cookieStore = await cookies();

  const token =
    cookieStore.get("auth_token")?.value;

  // Guest checkout
  if (!token) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/addresses`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  // Invalid/expired login:
  // just let checkout continue as guest for now.
  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load saved addresses: ${response.status}`
    );
  }

  return response.json();
}

export default async function CheckoutPage() {
  const t =
    await getTranslations("checkout");

  const savedAddresses =
    await getSavedAddresses();

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-md">
        <div className="px-4 pt-6">
          <p className="text-xs font-bold tracking-[0.2em] text-black/35">
            IRAQ HERITAGE
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {t("title")}
          </h1>
        </div>

        <CheckoutForm
          savedAddresses={savedAddresses}
        />
      </div>
    </main>
  );
}