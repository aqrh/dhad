"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import type {
  Order,
} from "@/lib/api/orders";
import { MobileBottomNav } from "../layout/mobile-bottom-nav";

type Props = {
  orders: Order[];
};

export function OrdersList({
  orders,
}: Props) {
  const t =
    useTranslations("orders");

  const locale =
    useLocale();

  const formatStatus = (
    status: string
  ) => {
    switch (
      status.toUpperCase()
    ) {
      case "PENDING":
        return t("pending");

      case "PROCESSING":
        return t("processing");

      case "SHIPPED":
        return t("shipped");

      case "DELIVERED":
        return t("delivered");

      case "CANCELLED":
        return t("cancelled");

      default:
        return status;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-black">
          {t("empty")}
        </h2>

        <p className="mt-2 text-sm text-black/45">
          {t(
            "emptyDescription"
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const firstItem =
          order.items[0];

        const image =
          firstItem?.product
            .images[0]?.url ??
          "/images/products/product-1.jpeg";

        const itemCount =
          order.items.reduce(
            (total, item) =>
              total +
              item.quantity,
            0
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
              month: "short",
              day: "numeric",
            }
          );

        return (
          <Link
            key={order.id}
            href={`/${locale}/orders/${order.id}`}
            className="block rounded-[22px] border border-black/10 p-4"
          >
            <div className="flex gap-4">
              <div className="relative h-[90px] w-[75px] shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                <Image
                  src={image}
                  alt={
                    firstItem
                      ?.product
                      .name ?? ""
                  }
                  fill
                  sizes="75px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-black/40">
                      {t(
                        "order"
                      )}
                    </p>

                    <h2 className="mt-1 font-black">
                      {
                        orderNumber
                      }
                    </h2>
                  </div>

                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold">
                    {formatStatus(
                      order.status
                    )}
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div className="text-xs text-black/45">
                    <p>
                      {date}
                    </p>

                    <p className="mt-1">
                      {
                        itemCount
                      }{" "}
                      {t(
                        "items"
                      )}
                    </p>
                  </div>

                  <p className="font-black">
                    $
                    {(
                      order.total /
                      100
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
      <MobileBottomNav />
    </div>
  );
}