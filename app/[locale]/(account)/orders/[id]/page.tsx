import Image from "next/image";
import Link from "next/link";

import { cookies } from "next/headers";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getTranslations,
} from "next-intl/server";

import type {
  Order,
} from "@/lib/api/orders";
import { formatPriceIQD } from "@/lib/format-price";

const API_URL =
  process.env.API_URL;

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

async function getOrder(
  id: number
): Promise<
  Order | null | "unauthorized"
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
    return "unauthorized";
  }

  const response = await fetch(
    `${API_URL}/orders/${id}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (response.status === 401) {
    return "unauthorized";
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load order: ${response.status}`
    );
  }

  return response.json();
}

export default async function OrderDetailPage({
  params,
}: Props) {
  const { locale, id } =
    await params;

  const orderId =
    Number(id);

  if (
    !Number.isInteger(
      orderId
    ) ||
    orderId < 1
  ) {
    notFound();
  }

  const order =
    await getOrder(orderId);

  if (
    order ===
    "unauthorized"
  ) {
    redirect(
      `/${locale}/register`
    );
  }

  if (!order) {
    notFound();
  }

  const t =
    await getTranslations(
      "orders"
    );

  const orderNumber =
    `IH-${String(
      order.id
    ).padStart(4, "0")}`;

  const date =
    new Date(
      order.createdAt
    ).toLocaleDateString(
      locale === "ar"
        ? "ar-IQ"
        : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

  const status =
    formatStatus(
      order.status,
      t
    );

  return (
    <main className="min-h-screen bg-white px-4 pb-28 pt-6">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div>
          <Link
            href={`/${locale}/orders`}
            className="text-sm font-bold underline underline-offset-4"
          >
            {t("backToOrders")}
          </Link>

          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-black/35">
            IRAQ HERITAGE
          </p>

          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-black/40">
                {t("order")}
              </p>

              <h1 className="mt-1 text-2xl font-black">
                {orderNumber}
              </h1>
            </div>

            <span className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-black">
              {status}
            </span>
          </div>

          <p className="mt-2 text-sm text-black/45">
            {date}
          </p>
        </div>

        {/* ITEMS */}
        <section className="mt-8">
          <h2 className="text-xl font-black">
            {t("items")}
          </h2>

          <div className="mt-4 space-y-4">
            {order.items.map(
              (item) => {
                const image =
                  item.product
                    .images[0]
                    ?.url ??
                  "/images/products/product-1.jpeg";

                return (
                  <article
                    key={
                      item.id
                    }
                    className="flex gap-4 rounded-[22px] border border-black/10 p-4"
                  >
                    <div className="relative h-[110px] w-[90px] shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                      <Image
                        src={image}
                        alt={
                          item
                            .product
                            .name
                        }
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-black">
                        {
                          item
                            .product
                            .name
                        }
                      </h3>

                      <div className="mt-2 space-y-1 text-xs text-black/45">
                        {item
                          .variant
                          .size && (
                          <p>
                            {t(
                              "size"
                            )}
                            :{" "}
                            {
                              item
                                .variant
                                .size
                            }
                          </p>
                        )}

                        {item
                          .variant
                          .color && (
                          <p>
                            {t(
                              "color"
                            )}
                            :{" "}
                            {
                              item
                                .variant
                                .color
                            }
                          </p>
                        )}

                        <p>
                          {t(
                            "quantity"
                          )}
                          :{" "}
                          {
                            item.quantity
                          }
                        </p>

                        <p>
                          {
                            item
                              .variant
                              .sku
                          }
                        </p>
                      </div>

                      <p className="mt-3 font-black">
                        {formatPriceIQD(item.price * item.quantity)}
                      </p>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>

        {/* SHIPPING */}
        <section className="mt-8 rounded-[24px] bg-neutral-100 p-5">
          <h2 className="text-lg font-black">
            {t(
              "shippingAddress"
            )}
          </h2>

          <div className="mt-4 text-sm leading-6 text-black/60">
            <p className="font-bold text-black">
              {order.fullName}
            </p>

            <p>
              {order.phone}
            </p>

            <p className="mt-2">
              {
                order.governorate
              }
              , {order.city}
            </p>

            <p>
              {order.address}
            </p>

            {order.notes && (
              <p className="mt-3 text-xs text-black/45">
                {order.notes}
              </p>
            )}
          </div>
        </section>

        {/* TOTAL */}
        <section className="mt-6 rounded-[24px] border border-black/10 p-5">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-black/50">
                {t(
                  "subtotal"
                )}
              </span>

              <span className="font-bold">
                {formatPriceIQD(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-black/50">
                {t(
                  "delivery"
                )}
              </span>

              <span className="font-bold">
                {formatPriceIQD(order.delivery)}
              </span>
            </div>

            <div className="border-t border-black/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-black">
                  {t(
                    "total"
                  )}
                </span>

                <span className="text-xl font-black">
                  {formatPriceIQD(order.total)}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatStatus(
  status: string,
  t: (
    key: string
  ) => string
) {
  switch (
    status.toUpperCase()
  ) {
    case "PENDING":
      return t("pending");

    case "PROCESSING":
      return t(
        "processing"
      );

    case "SHIPPED":
      return t("shipped");

    case "DELIVERED":
      return t(
        "delivered"
      );

    case "CANCELLED":
      return t(
        "cancelled"
      );

    default:
      return status;
  }
}