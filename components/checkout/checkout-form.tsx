"use client";

import { formatPriceIQD } from "@/lib/format-price";
import {
  FormEvent,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  useCart,
} from "@/features/cart/cart-provider";

import {
  createOrder,
  type CreatedOrder,
} from "@/lib/api/orders";

import type {
  Address,
} from "@/lib/api/addresses";

type Props = {
  savedAddresses: Address[];
};

type ShippingForm = {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  notes: string;
};

export function CheckoutForm({
  savedAddresses,
}: Props) {
  const t =
    useTranslations("checkout");

  const {
    items,
    itemCount,
    total: subtotal,
    clearCart,
  } = useCart();

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<
    "cash" | "card"
  >("cash");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    createdOrder,
    setCreatedOrder,
  ] = useState<
    CreatedOrder | null
  >(null);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState<
    number | null
  >(
    savedAddresses[0]?.id ??
      null
  );

  const [
    shipping,
    setShipping,
  ] =
    useState<ShippingForm>(
      () => {
        const first =
          savedAddresses[0];

        if (first) {
          return {
            fullName:
              first.fullName,

            phone:
              first.phone,

            governorate:
              first.governorate,

            city:
              first.city,

            address:
              first.address,

            notes:
              first.notes ??
              "",
          };
        }

        return {
          fullName: "",
          phone: "",
          governorate: "",
          city: "",
          address: "",
          notes: "",
        };
      }
    );

  const normalizedGovernorate =
    shipping.governorate
      .trim()
      .toLowerCase();

  const hasGovernorate =
    normalizedGovernorate.length > 0;

  const defaultDelivery =
    !hasGovernorate
      ? 0
      : normalizedGovernorate ===
            "baghdad" ||
          normalizedGovernorate ===
            "بغداد"
        ? 5000
        : 7000;

  const delivery =
    !hasGovernorate ||
    items.length === 0
      ? 0
      : Math.max(
          ...items.map(
            (item) =>
              item.deliveryPrice ??
              defaultDelivery
          )
        );

  const checkoutTotal =
    subtotal + delivery;

  const selectSavedAddress = (
    address: Address
  ) => {
    setSelectedAddressId(
      address.id
    );

    setShipping({
      fullName:
        address.fullName,

      phone:
        address.phone,

      governorate:
        address.governorate,

      city:
        address.city,

      address:
        address.address,

      notes:
        address.notes ??
        "",
    });

    setError(null);
  };

  const useNewAddress = () => {
    setSelectedAddressId(
      null
    );

    setShipping({
      fullName: "",
      phone: "",
      governorate: "",
      city: "",
      address: "",
      notes: "",
    });

    setError(null);
  };

  const updateShipping = (
    field:
      keyof ShippingForm,
    value: string
  ) => {
    setShipping(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (
      paymentMethod ===
      "card"
    ) {
      setError(
        t(
          "cardNotAvailable"
        )
      );

      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const order =
        await createOrder({
          fullName:
            shipping.fullName.trim(),

          phone:
            shipping.phone.trim(),

          governorate:
            shipping.governorate.trim(),

          city:
            shipping.city.trim(),

          address:
            shipping.address.trim(),

          notes:
            shipping.notes.trim()
              ? shipping.notes.trim()
              : undefined,

          items: items.map(
            (item) => ({
              variantId:
                item.variantId,

              quantity:
                item.quantity,
            })
          ),
        });

      setCreatedOrder(
        order
      );

      clearCart();
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );
      } else {
        setError(
          t("orderFailed")
        );
      }
    } finally {
      setSubmitting(
        false
      );
    }
  };

  /*
   * Keep this before the
   * empty-cart check because
   * clearCart() runs after a
   * successful order.
   */
  if (createdOrder) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-6 text-center">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] text-black/35">
            IRAQ HERITAGE
          </p>

          <h2 className="mt-3 text-2xl font-black">
            {t(
              "orderPlacedTitle"
            )}
          </h2>

          <p className="mt-3 text-sm text-black/50">
            {t(
              "orderPlacedDescription"
            )}
          </p>

          <div className="mt-6 rounded-2xl bg-neutral-100 px-6 py-4">
            <p className="text-xs text-black/40">
              {t(
                "orderNumber"
              )}
            </p>

            <p className="mt-1 text-xl font-black">
              #
              {
                createdOrder.id
              }
            </p>
          </div>

          <p className="mt-4 text-lg font-black">
            {formatPriceIQD(
              createdOrder.total
            )}
          </p>
        </div>
      </div>
    );
  }

  if (
    items.length === 0
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        <div>
          <h2 className="text-xl font-black">
            {t(
              "emptyCart"
            )}
          </h2>

          <p className="mt-2 text-sm text-black/50">
            {t(
              "emptyCartDescription"
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="px-4 pb-8 pt-5"
    >
      {/* ADDRESS */}
      <section>
        <div className="mb-4">
          <p className="text-xs font-bold tracking-[0.15em] text-black/35">
            IRAQ HERITAGE
          </p>

          <h2 className="mt-1 text-xl font-black">
            {t(
              "shippingAddress"
            )}
          </h2>
        </div>

        {/* SAVED ADDRESSES */}
        {savedAddresses.length >
          0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-black">
              {t(
                "savedAddresses"
              )}
            </h3>

            <div className="space-y-2">
              {savedAddresses.map(
                (address) => {
                  const selected =
                    selectedAddressId ===
                    address.id;

                  return (
                    <button
                      key={
                        address.id
                      }
                      type="button"
                      onClick={() =>
                        selectSavedAddress(
                          address
                        )
                      }
                      className={`w-full rounded-2xl border p-4 text-start transition ${
                        selected
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-black">
                          {address.label ??
                            t(
                              "savedAddress"
                            )}
                        </span>

                        {selected && (
                          <span className="text-xs font-bold">
                            {t(
                              "selected"
                            )}
                          </span>
                        )}
                      </div>

                      <p
                        className={`mt-2 text-sm ${
                          selected
                            ? "text-white/70"
                            : "text-black/50"
                        }`}
                      >
                        {
                          address.fullName
                        }
                        {" · "}
                        {
                          address.phone
                        }
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          selected
                            ? "text-white/60"
                            : "text-black/40"
                        }`}
                      >
                        {
                          address.governorate
                        }
                        ,{" "}
                        {
                          address.city
                        }
                        {" · "}
                        {
                          address.address
                        }
                      </p>
                    </button>
                  );
                }
              )}
            </div>

            <button
              type="button"
              onClick={
                useNewAddress
              }
              className="mt-3 text-sm font-bold underline underline-offset-4"
            >
              {t(
                "useAnotherAddress"
              )}
            </button>
          </div>
        )}

        {/* SHIPPING FIELDS */}
        <div className="space-y-3">
          <Field
            label={t(
              "fullName"
            )}
            name="fullName"
            autoComplete="name"
            value={
              shipping.fullName
            }
            onChange={(
              value
            ) =>
              updateShipping(
                "fullName",
                value
              )
            }
          />

          <Field
            label={t(
              "phone"
            )}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={
              shipping.phone
            }
            onChange={(
              value
            ) =>
              updateShipping(
                "phone",
                value
              )
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label={t(
                "governorate"
              )}
              name="governorate"
              value={
                shipping.governorate
              }
              onChange={(
                value
              ) =>
                updateShipping(
                  "governorate",
                  value
                )
              }
            />

            <Field
              label={t(
                "city"
              )}
              name="city"
              value={
                shipping.city
              }
              onChange={(
                value
              ) =>
                updateShipping(
                  "city",
                  value
                )
              }
            />
          </div>

          <Field
            label={t(
              "address"
            )}
            name="address"
            autoComplete="street-address"
            value={
              shipping.address
            }
            onChange={(
              value
            ) =>
              updateShipping(
                "address",
                value
              )
            }
          />

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-xs font-bold"
            >
              {t(
                "notes"
              )}
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={
                shipping.notes
              }
              onChange={(
                event
              ) =>
                updateShipping(
                  "notes",
                  event.target
                    .value
                )
              }
              placeholder={t(
                "notesPlaceholder"
              )}
              className="w-full resize-none rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-base outline-none transition focus:border-black"
            />
          </div>
        </div>
      </section>

      {/* PAYMENT */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-black">
          {t(
            "paymentMethod"
          )}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setPaymentMethod(
                "cash"
              );

              setError(null);
            }}
            className={`min-h-14 rounded-2xl border px-3 text-sm font-bold ${
              paymentMethod ===
              "cash"
                ? "border-black bg-black text-white"
                : "border-black/10 bg-white"
            }`}
          >
            {t("cash")}
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentMethod(
                "card"
              );

              setError(null);
            }}
            className={`min-h-14 rounded-2xl border px-3 text-sm font-bold ${
              paymentMethod ===
              "card"
                ? "border-black bg-black text-white"
                : "border-black/10 bg-white"
            }`}
          >
            {t("card")}
          </button>
        </div>
      </section>

      {/* ORDER SUMMARY */}
      <section className="mt-8 rounded-[24px] bg-neutral-100 p-5">
        <h2 className="text-lg font-black">
          {t(
            "orderSummary"
          )}
        </h2>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-black/50">
              {t(
                "items"
              )}
            </span>

            <span className="font-bold">
              {itemCount}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-black/50">
              {t(
                "subtotal"
              )}
            </span>

            <span className="font-bold">
              {formatPriceIQD(
                subtotal
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-black/50">
              {t(
                "delivery"
              )}
            </span>

            <span className="font-bold">
              {hasGovernorate
                ? formatPriceIQD(
                    delivery
                  )
                : t(
                    "calculatedLater"
                  )}
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
                {formatPriceIQD(
                  checkoutTotal
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* CONFIRM */}
      <button
        type="submit"
        disabled={
          submitting
        }
        className="mt-5 h-14 w-full rounded-full bg-black text-sm font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/30"
      >
        {submitting
          ? t(
              "placingOrder"
            )
          : t(
              "placeOrder"
            )}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  type?: string;

  autoComplete?: string;

  inputMode?:
    | "text"
    | "tel"
    | "numeric";
};

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-bold"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        autoComplete={
          autoComplete
        }
        inputMode={
          inputMode
        }
        className="h-13 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none transition focus:border-black"
      />
    </div>
  );
}