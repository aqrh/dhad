import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AddressesList } from "@/components/account/addresses-list";
import type { Address } from "@/lib/api/addresses";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

async function getInitialAddresses(): Promise<
  Address[] | null
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
    `${API_URL}/addresses`,
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
      `Failed to load addresses: ${response.status}`
    );
  }

  return response.json();
}

export default async function AddressesPage({
  params,
}: Props) {
  const { locale } = await params;

  const t =
    await getTranslations(
      "addresses"
    );

  const addresses =
    await getInitialAddresses();

  if (!addresses) {
    redirect(
      `/${locale}/register`
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-24 pt-6">
      <div className="mx-auto max-w-md">
        <div className="mb-7">
          <p className="text-xs font-bold tracking-[0.2em] text-black/35">
            IRAQ HERITAGE
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {t("title")}
          </h1>
        </div>

        <AddressesList
          initialAddresses={
            addresses
          }
        />
      </div>
    </main>
  );
}