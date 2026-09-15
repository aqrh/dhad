"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  createAddress,
  deleteAddress,
  updateAddress,
  type Address,
} from "@/lib/api/addresses";

type Props = {
  initialAddresses: Address[];
};

export function AddressesList({
  initialAddresses,
}: Props) {
  const t =
    useTranslations("addresses");

  const [
    addresses,
    setAddresses,
  ] = useState<Address[]>(
    initialAddresses
  );

  const [
    adding,
    setAdding,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState<number | null>(
    null
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<number | null>(
    null
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const handleCreate = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    setError(null);
    setSaving(true);

    try {
      const newAddress =
        await createAddress({
          label: String(
            formData.get("label") ?? ""
          ).trim(),

          fullName: String(
            formData.get(
              "fullName"
            ) ?? ""
          ).trim(),

          phone: String(
            formData.get("phone") ?? ""
          ).trim(),

          governorate: String(
            formData.get(
              "governorate"
            ) ?? ""
          ).trim(),

          city: String(
            formData.get("city") ?? ""
          ).trim(),

          address: String(
            formData.get("address") ?? ""
          ).trim(),

          notes: String(
            formData.get("notes") ?? ""
          ).trim(),
        });

      setAddresses(
        (current) => [
          newAddress,
          ...current,
        ]
      );

      form.reset();
      setAdding(false);
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setError(error.message);
      } else {
        setError(
          t("saveFailed")
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (
    event: FormEvent<HTMLFormElement>,
    id: number
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    setError(null);
    setSaving(true);

    try {
      const updated =
        await updateAddress(
          id,
          {
            label: String(
              formData.get(
                "label"
              ) ?? ""
            ).trim(),

            fullName: String(
              formData.get(
                "fullName"
              ) ?? ""
            ).trim(),

            phone: String(
              formData.get(
                "phone"
              ) ?? ""
            ).trim(),

            governorate: String(
              formData.get(
                "governorate"
              ) ?? ""
            ).trim(),

            city: String(
              formData.get(
                "city"
              ) ?? ""
            ).trim(),

            address: String(
              formData.get(
                "address"
              ) ?? ""
            ).trim(),

            notes: String(
              formData.get(
                "notes"
              ) ?? ""
            ).trim(),
          }
        );

      setAddresses(
        (current) =>
          current.map(
            (address) =>
              address.id === id
                ? updated
                : address
          )
      );

      setEditingId(null);
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setError(error.message);
      } else {
        setError(
          t("updateFailed")
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    if (
      deletingId !== null
    ) {
      return;
    }

    setError(null);
    setDeletingId(id);

    try {
      await deleteAddress(id);

      setAddresses(
        (current) =>
          current.filter(
            (address) =>
              address.id !== id
          )
      );

      if (editingId === id) {
        setEditingId(null);
      }
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setError(error.message);
      } else {
        setError(
          t("deleteFailed")
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {addresses.length === 0 &&
        !adding && (
          <div className="rounded-[22px] bg-neutral-100 px-5 py-8 text-center">
            <p className="font-black">
              {t("emptyTitle")}
            </p>

            <p className="mt-2 text-sm text-black/45">
              {t(
                "emptyDescription"
              )}
            </p>
          </div>
        )}

      <div className="space-y-3">
        {addresses.map(
          (address) => {
            if (
              editingId ===
              address.id
            ) {
              return (
                <form
                  key={
                    address.id
                  }
                  onSubmit={(
                    event
                  ) =>
                    handleUpdate(
                      event,
                      address.id
                    )
                  }
                  className="space-y-3 rounded-[24px] border border-black/10 p-4"
                >
                  <h2 className="text-lg font-black">
                    {t(
                      "editAddress"
                    )}
                  </h2>

                  <AddressField
                    name="label"
                    label={t(
                      "label"
                    )}
                    defaultValue={
                      address.label ??
                      ""
                    }
                    required={
                      false
                    }
                  />

                  <AddressField
                    name="fullName"
                    label={t(
                      "fullName"
                    )}
                    defaultValue={
                      address.fullName
                    }
                  />

                  <AddressField
                    name="phone"
                    label={t(
                      "phone"
                    )}
                    type="tel"
                    defaultValue={
                      address.phone
                    }
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <AddressField
                      name="governorate"
                      label={t(
                        "governorate"
                      )}
                      defaultValue={
                        address.governorate
                      }
                    />

                    <AddressField
                      name="city"
                      label={t(
                        "city"
                      )}
                      defaultValue={
                        address.city
                      }
                    />
                  </div>

                  <AddressField
                    name="address"
                    label={t(
                      "address"
                    )}
                    defaultValue={
                      address.address
                    }
                  />

                  <div>
                    <label className="mb-2 block text-xs font-bold">
                      {t(
                        "notes"
                      )}
                    </label>

                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={
                        address.notes ??
                        ""
                      }
                      className="w-full resize-none rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-base outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      disabled={
                        saving
                      }
                      onClick={() => {
                        setEditingId(
                          null
                        );
                        setError(
                          null
                        );
                      }}
                      className="h-13 rounded-full border border-black/15 text-sm font-black"
                    >
                      {t(
                        "cancel"
                      )}
                    </button>

                    <button
                      type="submit"
                      disabled={
                        saving
                      }
                      className="h-13 rounded-full bg-black text-sm font-black text-white disabled:bg-black/30"
                    >
                      {saving
                        ? t(
                            "updating"
                          )
                        : t(
                            "update"
                          )}
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <article
                key={address.id}
                className="rounded-[22px] border border-black/10 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {address.label && (
                      <span className="inline-flex rounded-full bg-black px-3 py-1 text-[11px] font-black text-white">
                        {
                          address.label
                        }
                      </span>
                    )}

                    <h2 className="mt-3 text-base font-black">
                      {
                        address.fullName
                      }
                    </h2>

                    <p className="mt-1 text-sm text-black/50">
                      {
                        address.phone
                      }
                    </p>

                    <p className="mt-2 text-sm leading-6 text-black/60">
                      {
                        address.governorate
                      }
                      ,{" "}
                      {
                        address.city
                      }

                      <br />

                      {
                        address.address
                      }
                    </p>

                    {address.notes && (
                      <p className="mt-2 text-xs text-black/40">
                        {
                          address.notes
                        }
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(
                          address.id
                        );

                        setAdding(
                          false
                        );

                        setError(
                          null
                        );
                      }}
                      className="text-xs font-bold underline underline-offset-4"
                    >
                      {t("edit")}
                    </button>

                    <button
                      type="button"
                      disabled={
                        deletingId ===
                        address.id
                      }
                      onClick={() =>
                        handleDelete(
                          address.id
                        )
                      }
                      className="text-xs font-bold text-red-600 underline underline-offset-4 disabled:opacity-40"
                    >
                      {deletingId ===
                      address.id
                        ? t(
                            "deleting"
                          )
                        : t(
                            "delete"
                          )}
                    </button>
                  </div>
                </div>
              </article>
            );
          }
        )}
      </div>

      {adding ? (
        <form
          onSubmit={handleCreate}
          className="mt-5 space-y-3 rounded-[24px] border border-black/10 p-4"
        >
          <h2 className="text-lg font-black">
            {t("newAddress")}
          </h2>

          <AddressField
            name="label"
            label={t("label")}
            required={false}
          />

          <AddressField
            name="fullName"
            label={t(
              "fullName"
            )}
          />

          <AddressField
            name="phone"
            label={t("phone")}
            type="tel"
          />

          <div className="grid grid-cols-2 gap-3">
            <AddressField
              name="governorate"
              label={t(
                "governorate"
              )}
            />

            <AddressField
              name="city"
              label={t("city")}
            />
          </div>

          <AddressField
            name="address"
            label={t(
              "address"
            )}
          />

          <div>
            <label className="mb-2 block text-xs font-bold">
              {t("notes")}
            </label>

            <textarea
              name="notes"
              rows={3}
              className="w-full resize-none rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-base outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
              className="h-13 rounded-full border border-black/15 text-sm font-black"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-13 rounded-full bg-black text-sm font-black text-white disabled:bg-black/30"
            >
              {saving
                ? t("saving")
                : t("save")}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setEditingId(null);
            setError(null);
          }}
          className="mt-5 h-14 w-full rounded-full border-2 border-black text-sm font-black"
        >
          + {t("addAddress")}
        </button>
      )}
    </>
  );
}

type AddressFieldProps = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
};

function AddressField({
  name,
  label,
  type = "text",
  required = true,
  defaultValue,
}: AddressFieldProps) {
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
        required={required}
        defaultValue={
          defaultValue
        }
        className="h-13 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
      />
    </div>
  );
}