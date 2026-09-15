"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

import type {
  AdminOrder,
} from "@/lib/api/admin-orders";
import { formatPriceIQD } from "@/lib/format-price";

type Props = {
  orders: AdminOrder[];
};

export function AdminOrdersList({
  orders,
}: Props) {
  const locale = useLocale();

  const pending =
    orders.filter(
      (order) =>
        order.status ===
        "PENDING"
    ).length;

  const processing =
    orders.filter(
      (order) =>
        order.status ===
        "PROCESSING"
    ).length;

  return (
    <main className="min-h-screen bg-white px-4 pb-28 pt-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-black/35">
              IRAQ HERITAGE
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Orders
            </h1>

            <p className="mt-1 text-sm text-black/45">
              Admin Management
            </p>
          </div>

          <Link
            href={`/${locale}/admin/products`}
            className="rounded-full border border-black/10 px-3 py-2 text-xs font-black"
          >
            Products
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Summary
            label="Orders"
            value={orders.length}
          />

          <Summary
            label="Pending"
            value={pending}
          />

          <Summary
            label="Processing"
            value={processing}
          />
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-black">
              All Orders
            </h2>

            <span className="text-xs font-bold text-black/40">
              {orders.length} total
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl bg-neutral-100 px-4 py-8 text-center text-sm text-black/45">
              No orders yet.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(
                (order) => {
                  const firstItem =
                    order.items[0];

                  const image =
                    firstItem
                      ?.product
                      .images[0]
                      ?.url;

                  const itemCount =
                    order.items.reduce(
                      (
                        total,
                        item
                      ) =>
                        total +
                        item.quantity,
                      0
                    );

                  return (
                    <article
                      key={order.id}
                      className="rounded-[22px] border border-black/10 p-4"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-[96px] w-[78px] shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                          {image ? (
                            <Image
                              src={image}
                              alt={
                                firstItem
                                  .product
                                  .name
                              }
                              fill
                              sizes="78px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-black/30">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-black/40">
                                Order #
                                {String(
                                  order.id
                                ).padStart(
                                  4,
                                  "0"
                                )}
                              </p>

                              <h3 className="mt-1 text-sm font-black">
                                {
                                  order.fullName
                                }
                              </h3>
                            </div>

                            <StatusBadge
                              status={
                                order.status
                              }
                            />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-black/45">
                            <span>
                              {itemCount}{" "}
                              {itemCount ===
                              1
                                ? "item"
                                : "items"}
                            </span>

                            <span>
                              {
                                order.phone
                              }
                            </span>

                            <span>
                              {new Date(
                                order.createdAt
                              ).toLocaleDateString(
                                locale
                              )}
                            </span>
                          </div>

                          <div className="mt-3 flex items-end justify-between gap-3">
                            <p className="font-black">
                              ${formatPriceIQD(order.total)}
                            </p>

                            <Link
                              href={`/${locale}/admin/orders/${order.id}`}
                              className="rounded-full bg-black px-4 py-2 text-xs font-black text-white"
                            >
                              Manage
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-neutral-100 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-black/40">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black">
      {status}
    </span>
  );
}