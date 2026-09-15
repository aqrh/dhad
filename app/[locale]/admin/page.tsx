import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import type {
  ApiProduct,
} from "@/lib/api/products";

import type {
  AdminOrder,
} from "@/lib/api/admin-orders";
import { formatPriceIQD } from "@/lib/format-price";

const API_URL = process.env.API_URL;

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

async function getAdminData(
  token: string
): Promise<{
  products: ApiProduct[];
  orders: AdminOrder[];
}> {
  if (!API_URL) {
    throw new Error(
      "API_URL is not configured"
    );
  }

  const [
    productsResponse,
    ordersResponse,
  ] = await Promise.all([
    fetch(
      `${API_URL}/admin/products`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
        cache: "no-store",
      }
    ),

    fetch(
      `${API_URL}/admin/orders`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
        cache: "no-store",
      }
    ),
  ]);

  if (!productsResponse.ok) {
    throw new Error(
      `Could not load products: ${productsResponse.status}`
    );
  }

  if (!ordersResponse.ok) {
    throw new Error(
      `Could not load orders: ${ordersResponse.status}`
    );
  }

  const products: ApiProduct[] =
    await productsResponse.json();

  const orders: AdminOrder[] =
    await ordersResponse.json();

  return {
    products,
    orders,
  };
}

export default async function AdminPage({
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

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "auth_token"
    )?.value;

  if (!token) {
    redirect(
      `/${locale}/register`
    );
  }

  const {
    products,
    orders,
  } = await getAdminData(
    token
  );

  const activeProducts =
    products.filter(
      (product) =>
        product.active
    );

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "PENDING"
    );

  const lowStockVariants =
    activeProducts.flatMap(
      (product) =>
        product.variants
          .filter(
            (variant) =>
              variant.stock <= 5
          )
          .map(
            (variant) => ({
              ...variant,
              productName:
                product.name,
              productId:
                product.id,
            })
          )
    );

  const recentOrders =
    orders.slice(0, 5);

  return (
    <main className="min-h-screen bg-white px-4 pb-28 pt-6">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-black/35">
            IRAQ HERITAGE
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Admin
          </h1>

          <p className="mt-1 text-sm text-black/45">
            Store Management
          </p>
        </div>

        {/* STATS */}
        <div className="mt-7 grid grid-cols-2 gap-3">
          <StatCard
            label="Products"
            value={
              products.length
            }
            detail={`${activeProducts.length} active`}
          />

          <StatCard
            label="Orders"
            value={
              orders.length
            }
            detail="All orders"
          />

          <StatCard
            label="Pending"
            value={
              pendingOrders.length
            }
            detail="Needs attention"
          />

          <StatCard
            label="Low Stock"
            value={
              lowStockVariants.length
            }
            detail="5 units or less"
          />
        </div>

        {/* QUICK ACTIONS */}
        <section className="mt-8">
          <h2 className="text-xl font-black">
            Management
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href={`/${locale}/admin/products`}
              className="rounded-[22px] bg-black p-5 text-white"
            >
              <p className="text-lg font-black">
                Products
              </p>

              <p className="mt-2 text-xs text-white/60">
                Products, photos,
                variants & stock
              </p>
            </Link>

            <Link
              href={`/${locale}/admin/orders`}
              className="rounded-[22px] bg-neutral-100 p-5"
            >
              <p className="text-lg font-black">
                Orders
              </p>

              <p className="mt-2 text-xs text-black/45">
                Customers, shipping
                & status
              </p>
            </Link>
          </div>
        </section>

        {/* PENDING */}
        <section className="mt-8 border-t border-black/10 pt-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black">
                Pending Orders
              </h2>

              <p className="mt-1 text-xs text-black/40">
                Orders waiting to be
                processed
              </p>
            </div>

            <Link
              href={`/${locale}/admin/orders`}
              className="text-xs font-black underline underline-offset-4"
            >
              View All
            </Link>
          </div>

          {pendingOrders.length ===
          0 ? (
            <div className="mt-4 rounded-2xl bg-neutral-100 px-4 py-6 text-center text-sm text-black/45">
              No pending orders.
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {pendingOrders
                .slice(0, 3)
                .map(
                  (order) => (
                    <Link
                      key={order.id}
                      href={`/${locale}/admin/orders/${order.id}`}
                      className="flex items-center justify-between rounded-2xl border border-black/10 p-4"
                    >
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

                        <p className="mt-1 text-sm font-black">
                          {
                            order.fullName
                          }
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black">
                          {formatPriceIQD(order.total)}
                        </p>

                        <p className="mt-1 text-[10px] font-black">
                          PENDING
                        </p>
                      </div>
                    </Link>
                  )
                )}
            </div>
          )}
        </section>

        {/* LOW STOCK */}
        <section className="mt-8 border-t border-black/10 pt-6">
          <h2 className="text-xl font-black">
            Low Stock
          </h2>

          <p className="mt-1 text-xs text-black/40">
            Active product variants
            with 5 units or less
          </p>

          {lowStockVariants.length ===
          0 ? (
            <div className="mt-4 rounded-2xl bg-neutral-100 px-4 py-6 text-center text-sm text-black/45">
              Stock levels look good.
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {lowStockVariants
                .slice(0, 5)
                .map(
                  (variant) => (
                    <Link
                      key={
                        variant.id
                      }
                      href={`/${locale}/admin/products/${variant.productId}`}
                      className="flex items-center justify-between rounded-2xl border border-black/10 p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">
                          {
                            variant.productName
                          }
                        </p>

                        <p className="mt-1 text-xs text-black/45">
                          {variant.color ||
                            "—"}
                          {" · "}
                          {variant.size ||
                            "—"}
                        </p>

                        <p className="mt-1 text-[10px] text-black/35">
                          {
                            variant.sku
                          }
                        </p>
                      </div>

                      <div className="ml-3 shrink-0 rounded-full bg-neutral-100 px-3 py-2 text-xs font-black">
                        {variant.stock}{" "}
                        left
                      </div>
                    </Link>
                  )
                )}
            </div>
          )}
        </section>

        {/* RECENT */}
        <section className="mt-8 border-t border-black/10 pt-6">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-black">
              Recent Orders
            </h2>

            <Link
              href={`/${locale}/admin/orders`}
              className="text-xs font-black underline underline-offset-4"
            >
              View All
            </Link>
          </div>

          {recentOrders.length ===
          0 ? (
            <div className="mt-4 rounded-2xl bg-neutral-100 px-4 py-6 text-center text-sm text-black/45">
              No orders yet.
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {recentOrders.map(
                (order) => (
                  <Link
                    key={order.id}
                    href={`/${locale}/admin/orders/${order.id}`}
                    className="flex items-center justify-between rounded-2xl border border-black/10 p-4"
                  >
                    <div>
                      <p className="text-xs font-bold text-black/40">
                        #
                        {String(
                          order.id
                        ).padStart(
                          4,
                          "0"
                        )}
                      </p>

                      <p className="mt-1 text-sm font-black">
                        {
                          order.fullName
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-black">
                        $
                        {(
                          order.total /
                          100
                        ).toFixed(
                          2
                        )}
                      </p>

                      <p className="mt-1 text-[10px] font-black text-black/45">
                        {
                          order.status
                        }
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] bg-neutral-100 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-black/40">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-black/40">
        {detail}
      </p>
    </div>
  );
}