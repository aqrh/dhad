"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPriceIQD } from "@/lib/format-price";
import {
  useLocale,
} from "next-intl";

import {
  useState,
} from "react";

import type {
  AdminOrder,
  AdminOrderStatus,
} from "@/lib/api/admin-orders";

import {
  updateAdminOrderStatus,
} from "@/lib/api/admin-orders";

type Props = {
  initialOrder: AdminOrder;
};

const nextStatuses: Record<
  AdminOrderStatus,
  AdminOrderStatus[]
> = {
  PENDING: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function AdminOrderManager({
  initialOrder,
}: Props) {
  const locale =
    useLocale();

  const [
    order,
    setOrder,
  ] =
    useState(initialOrder);

  const [
    updating,
    setUpdating,
  ] =
    useState<AdminOrderStatus | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  async function changeStatus(
    status: AdminOrderStatus
  ) {
    if (
      updating ||
      status === order.status
    ) {
      return;
    }

    setUpdating(status);
    setError(null);

    try {
      const updated =
        await updateAdminOrderStatus(
          order.id,
          status
        );

      setOrder(updated);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update order."
      );
    } finally {
      setUpdating(null);
    }
  }

  const allowedNextStatuses =
    nextStatuses[order.status];

  const canCancel =
    order.status === "PENDING" ||
    order.status === "PROCESSING";

  const itemCount =
    order.items.reduce(
      (total, item) =>
        total +
        item.quantity,
      0
    );

  return (
    <main className="min-h-screen bg-white px-4 pb-28 pt-6">
      <div className="mx-auto max-w-md">
        <Link
          href={`/${locale}/admin/orders`}
          className="text-sm font-bold"
        >
          ← Orders
        </Link>

        <div className="mt-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-black/35">
              ADMIN
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Order #
              {String(
                order.id
              ).padStart(
                4,
                "0"
              )}
            </h1>

            <p className="mt-1 text-sm text-black/45">
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}
            </p>
          </div>

          <StatusBadge
            status={
              order.status
            }
          />
        </div>

        {/* STATUS */}
        <section className="mt-7">
          <h2 className="text-lg font-black">
            Order Status
          </h2>

          <div className="mt-3 space-y-3">
            {allowedNextStatuses.map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  disabled={
                    updating !== null
                  }
                  onClick={() =>
                    changeStatus(status)
                  }
                  className="h-12 w-full rounded-full bg-black px-4 text-xs font-black text-white disabled:opacity-40"
                >
                  {updating === status
                    ? "Updating..."
                    : status === "PROCESSING"
                      ? "Start Processing"
                      : status === "SHIPPED"
                        ? "Mark as Shipped"
                        : "Mark as Delivered"}
                </button>
              )
            )}

            {canCancel && (
              <button
                type="button"
                disabled={
                  updating !== null
                }
                onClick={() =>
                  changeStatus(
                    "CANCELLED"
                  )
                }
                className="h-12 w-full rounded-full border border-red-200 bg-red-50 px-4 text-xs font-black text-red-600 disabled:opacity-40"
              >
                {updating ===
                "CANCELLED"
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>
            )}

            {allowedNextStatuses.length ===
              0 &&
              !canCancel && (
                <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-medium text-black/60">
                  {order.status ===
                  "DELIVERED"
                    ? "This order has been delivered."
                    : "This order has been cancelled."}
                </div>
              )}
          </div>

          {error && (
            <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
        </section>

        {/* CUSTOMER */}
        <section className="mt-8 border-t border-black/10 pt-6">
          <h2 className="text-lg font-black">
            Customer
          </h2>

          <div className="mt-4 rounded-[22px] bg-neutral-100 p-4">
            <p className="font-black">
              {order.fullName}
            </p>

            <p className="mt-2 text-sm text-black/55">
              {order.phone}
            </p>

            <p className="mt-1 text-xs text-black/40">
              {order.userId
                ? `Account #${order.userId}`
                : "Guest order"}
            </p>
          </div>
        </section>

        {/* SHIPPING */}
        <section className="mt-8 border-t border-black/10 pt-6">
          <h2 className="text-lg font-black">
            Shipping
          </h2>

          <div className="mt-4 rounded-[22px] border border-black/10 p-4">
            <p className="text-sm font-bold">
              {order.governorate}
              {" · "}
              {order.city}
            </p>

            <p className="mt-2 text-sm text-black/60">
              {order.address}
            </p>

            {order.notes && (
              <div className="mt-4 rounded-2xl bg-neutral-100 p-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-black/40">
                  Notes
                </p>

                <p className="mt-1 text-sm">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ITEMS */}
        <section className="mt-8 border-t border-black/10 pt-6">
          <h2 className="text-lg font-black">
            Items
          </h2>

          <div className="mt-4 space-y-3">
            {order.items.map(
              (item) => {
                const image =
                  item.product
                    .images[0]
                    ?.url;

                return (
                  <article
                    key={item.id}
                    className="flex gap-4 rounded-[22px] border border-black/10 p-3"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                      {image ? (
                        <Image
                          src={image}
                          alt={
                            item.product
                              .name
                          }
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-black/30">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black">
                        {
                          item.product
                            .name
                        }
                      </p>

                      <p className="mt-1 text-xs text-black/45">
                        {item.variant
                          .color ||
                          "—"}
                        {" · "}
                        {item.variant
                          .size ||
                          "—"}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-black/35">
                        {
                          item.variant
                            .sku
                        }
                      </p>

                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-xs font-bold">
                          Qty{" "}
                          {
                            item.quantity
                          }
                        </span>

                        <span className="font-black">
                          ${formatPriceIQD(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>

        {/* TOTALS */}
        <section className="mt-8 border-t border-black/10 pt-6">
          <div className="space-y-3">
            <TotalRow
              label="Subtotal"
              value={
                order.subtotal
              }
            />

            <TotalRow
              label="Delivery"
              value={
                order.delivery
              }
            />

            <div className="border-t border-black/10 pt-3">
              <TotalRow
                label="Total"
                value={
                  order.total
                }
                strong
              />
            </div>
          </div>

          <p className="mt-5 text-xs text-black/40">
            Created{" "}
            {new Date(
              order.createdAt
            ).toLocaleString(
              locale
            )}
          </p>
        </section>
      </div>
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-neutral-100 px-3 py-2 text-[10px] font-black">
      {status}
    </span>
  );
}

function TotalRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          strong
            ? "font-black"
            : "text-sm text-black/55"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-black"
            : "text-sm font-bold"
        }
      >
        {formatPriceIQD(value)}
      </span>
    </div>
  );
}