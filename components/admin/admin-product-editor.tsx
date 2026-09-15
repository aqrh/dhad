"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  deleteAdminProduct,
} from "@/lib/api/admin-products";

import type {
  ProductCategory,
} from "@/lib/api/admin-products";
import type {
  ProductAudience,
} from "@/lib/api/products";

import {
  addAdminVariant,
  removeAdminProductImage,
  removeAdminVariant,
  updateAdminProduct,
  updateAdminVariant,
  uploadAdminProductImage
} from "@/lib/api/admin-products";

import type { ApiProduct } from "@/lib/api/products";

type Props = {
  product: ApiProduct;
};

export function AdminProductEditor({
  product,
}: Props) {
  const locale = useLocale();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState(product.active);

  const [removingImageId, setRemovingImageId] =
    useState<number | null>(null);
  const [imageError, setImageError] =
    useState<string | null>(null);

    const [variantError, setVariantError] =
  useState<string | null>(null);

const [addingVariant, setAddingVariant] =
  useState(false);

const [
  editingVariantId,
  setEditingVariantId,
] = useState<number | null>(null);

const [
  removingVariantId,
  setRemovingVariantId,
] = useState<number | null>(null);

const [selectedImage, setSelectedImage] =
  useState<File | null>(null);

const [uploadAlt, setUploadAlt] =
  useState("");

const [uploadingImage, setUploadingImage] =
  useState(false);

const [imageInputKey, setImageInputKey] =
  useState(0);

const [
  deletingProduct,
  setDeletingProduct,
] = useState(false);

const [
  deleteError,
  setDeleteError,
] = useState<string | null>(
  null,
);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const price = Number(form.get("price"));
    const category = String(
      form.get("category") ?? product.category
    ) as ProductCategory;
    const audience = String(
      form.get("audience") ??
        product.audience
    ) as ProductAudience;

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Enter a valid price in IQD.");
      return;
    }

  const deliveryPriceText = String(
    form.get("deliveryPrice") ?? ""
  ).trim();

  const deliveryPrice =
    deliveryPriceText === ""
      ? null
      : Number(deliveryPriceText);

  if (
    deliveryPrice !== null &&
    (
      !Number.isInteger(deliveryPrice) ||
      deliveryPrice < 0
    )
  ) {
    setError(
      "Enter a valid delivery price in IQD."
    );
    return;
  }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await updateAdminProduct(product.id, {
        name: String(form.get("name") ?? ""),
        slug: String(form.get("slug") ?? ""),
        description: String(
          form.get("description") ?? ""
        ),
        price: Math.round(price),
        active,
        audience,
        category,
        deliveryPrice,
      });

      setSaved(true);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveImage(
    imageId: number
  ) {
    const confirmed = window.confirm(
      "Remove this product image?"
    );

    if (!confirmed) {
      return;
    }

    setRemovingImageId(imageId);
    setImageError(null);

    try {
      await removeAdminProductImage(imageId);
      router.refresh();
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : "Could not remove image."
      );
    } finally {
      setRemovingImageId(null);
    }
  }

  async function handleAddVariant(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (addingVariant) {
    return;
  }

  const formElement =
    event.currentTarget;

  const formData =
    new FormData(formElement);

  const size = String(
    formData.get("size") ?? ""
  ).trim();

  const color = String(
    formData.get("color") ?? ""
  ).trim();

  const manualSku = String(
    formData.get("sku") ?? ""
  ).trim();

  const generatedSku = [
    product.slug,
    size,
    color,
  ]
    .filter(Boolean)
    .join("-")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "-");

  const sku =
    manualSku || generatedSku;

  const stock = Number(
    formData.get("stock") ?? 0
  );

  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    setVariantError(
      "Enter valid stock."
    );
    return;
  }

  const priceText = String(
    formData.get(
      "variantPrice"
    ) ?? ""
  ).trim();

  const variantPrice =
    priceText === ""
      ? null
      : Number(priceText);

  if (
    variantPrice !== null &&
    (
      !Number.isInteger(
        variantPrice
      ) ||
      variantPrice < 0
    )
  ) {
    setVariantError(
      "Enter a valid variant price in IQD."
    );
    return;
  }

  setAddingVariant(true);
  setVariantError(null);

  try {
    await addAdminVariant(
      product.id,
      {
        sku,
        size:
          size || undefined,
        color:
          color || undefined,
        stock,

        ...(variantPrice !== null && {
          price: variantPrice,
        }),
      }
    );

    formElement.reset();
    router.refresh();
  } catch (error) {
    setVariantError(
      error instanceof Error
        ? error.message
        : "Could not add variant."
    );
  } finally {
    setAddingVariant(false);
  }
}

async function handleUpdateVariant(
  event: FormEvent<HTMLFormElement>,
  variantId: number
) {
  event.preventDefault();

  const form = new FormData(
    event.currentTarget
  );

  const stockValue = Number(
    form.get("stock")
  );

  const priceText = String(
  form.get("variantPrice") ?? ""
).trim();

const variantPrice =
  priceText === ""
    ? null
    : Number(priceText);

if (
  variantPrice !== null &&
  (
    !Number.isInteger(variantPrice) ||
    variantPrice < 0
  )
) {
  setVariantError(
    "Enter a valid variant price in IQD."
  );

  return;
}

  setEditingVariantId(
    variantId
  );

  setVariantError(null);

  try {
    await updateAdminVariant(
      variantId,
      {
        sku: String(
          form.get("sku") ?? ""
        ).trim(),

        size: String(
          form.get("size") ?? ""
        ).trim(),

        color: String(
          form.get("color") ?? ""
        ).trim(),

        stock: stockValue,

        ...(variantPrice !== null && {
          price: variantPrice,
        }),
      }
    );

    router.refresh();
  } catch (error) {
    setVariantError(
      error instanceof Error
        ? error.message
        : "Could not update variant."
    );
  } finally {
    setEditingVariantId(
      null
    );
  }
}

async function handleRemoveVariant(
  variantId: number
) {
  const confirmed =
    window.confirm(
      "Remove this variant?"
    );

  if (!confirmed) {
    return;
  }

  setRemovingVariantId(
    variantId
  );

  setVariantError(null);

  try {
    await removeAdminVariant(
      variantId
    );

    router.refresh();
  } catch (error) {
    setVariantError(
      error instanceof Error
        ? error.message
        : "Could not remove variant."
    );
  } finally {
    setRemovingVariantId(
      null
    );
  }
}

async function handleUploadImage(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (!selectedImage || uploadingImage) {
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(selectedImage.type)) {
    setImageError(
      "Choose a JPEG, PNG, or WebP image."
    );
    return;
  }

  if (selectedImage.size > 8 * 1024 * 1024) {
    setImageError(
      "Image must be smaller than 8 MB."
    );
    return;
  }

  setUploadingImage(true);
  setImageError(null);

  try {
    await uploadAdminProductImage(
      product.id,
      selectedImage,
      uploadAlt.trim() || product.name
    );

    setSelectedImage(null);
    setUploadAlt("");
    setImageInputKey(
      (value) => value + 1
    );

    router.refresh();
  } catch (error) {
    setImageError(
      error instanceof Error
        ? error.message
        : "Could not upload image."
    );
  } finally {
    setUploadingImage(false);
  }
}

async function handleDeleteProduct() {
  console.log("Executing");
  if (deletingProduct) {
    console.log("Deleting already");
    return;
  }

  setDeletingProduct(true);
  setDeleteError(null);

  try {
    await deleteAdminProduct(
      product.id,
    );

    router.push(
      `/${locale}/admin/products`,
    );

    router.refresh();
  } catch (error) {
    setDeleteError(
      error instanceof Error
        ? error.message
        : "Could not delete product.",
    );

    setDeletingProduct(false);
  }
}

  const stock = product.variants.reduce(
    (total, variant) => total + variant.stock,
    0
  );

  return (
    <main className="min-h-screen bg-white px-4 pb-28 pt-6">
      <div className="mx-auto max-w-md">
        <Link
          href={`/${locale}/admin/products`}
          className="text-sm font-bold"
        >
          ← Products
        </Link>

        <div className="mt-6">
          <p className="text-xs font-bold tracking-[0.2em] text-black/35">
            ADMIN
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Edit Product
          </h1>

          <p className="mt-1 text-sm text-black/45">
            Product #{product.id}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Stat
            label="Variants"
            value={product.variants.length}
          />

          <Stat
            label="Stock"
            value={stock}
          />

          <Stat
            label="Images"
            value={product.images.length}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <Field
            name="name"
            label="Product Name"
            defaultValue={product.name}
            required
          />

          <Field
            name="slug"
            label="Slug"
            defaultValue={product.slug}
            required
          />

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-xs font-bold"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={product.description ?? ""}
              className="w-full resize-none rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-base outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-xs font-bold"
            >
              Category
            </label>

            <select
              id="category"
              name="category"
              defaultValue={product.category}
              className="h-13 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
            >
            <option value="TSHIRT">
              T-Shirt
            </option>

            <option value="HOODIE">
              Hoodie
            </option>

            <option value="SHIRT">
              Shirt
            </option>

            <option value="JACKET">
                Jacket
            </option>

            <option value="SUIT">
                Suits
            </option>

            <option value="JEANS_BOTTOM">
              Jeans / Bottoms
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="audience"
            className="mb-2 block text-xs font-bold"
          >
            Audience
          </label>

          <select
            id="audience"
            name="audience"
            defaultValue={product.audience}
            className="h-13 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
          >
            <option value="MEN">
              Men
            </option>

            <option value="WOMEN">
              Women
            </option>

            <option value="UNISEX">
            Unisex
            </option>
          </select>
        </div>

          <Field
            name="price"
            label="Base Price (IQD)"
            type="number"
            min="0"
            step="1"
            defaultValue={String(product.price)}
            required
          />

          <Field
  name="deliveryPrice"
  label="Delivery Price (IQD)"
  type="number"
  min="0"
  step="1"
  defaultValue={
    product.deliveryPrice === null
      ? ""
      : String(product.deliveryPrice)
  }
/>

<p className="-mt-3 text-xs text-black/40">
  Leave blank to use the default delivery price.
</p>

          <div className="rounded-2xl border border-black/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black">
                  Product Status
                </p>

                <p className="mt-1 text-xs text-black/45">
                  Inactive products are hidden from customers.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActive((value) => !value)
                }
                className={`rounded-full px-4 py-2 text-xs font-black ${
                  active
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-black"
                }`}
              >
                {active ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {saved && (
            <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-semibold">
              Product saved.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="h-14 w-full rounded-full bg-black text-sm font-black text-white disabled:bg-black/30"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

         <section className="mt-10 border-t border-black/10 pt-6">
  <div>
    <h2 className="text-xl font-black">
      Inventory
    </h2>

    <p className="mt-1 text-sm text-black/45">
      {product.variants.length} variants ·{" "}
      {stock} total units
    </p>
  </div>

  <div className="mt-5 space-y-3">
    {product.variants.map(
      (variant) => (
        <form
          key={variant.id}
          onSubmit={(event) =>
            handleUpdateVariant(
              event,
              variant.id
            )
          }
          className="rounded-[22px] border border-black/10 p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-black">
                {variant.color ||
                  "No color"}{" "}
                ·{" "}
                {variant.size ||
                  "No size"}
              </p>

              <p className="mt-1 text-[11px] text-black/40">
                Variant #{variant.id}
              </p>
            </div>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black">
              {variant.stock} in stock
            </span>
          </div>

          <div className="space-y-3">
            <InventoryField
              name="sku"
              label="SKU"
              defaultValue={
                variant.sku
              }
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <InventoryField
                name="size"
                label="Size"
                defaultValue={
                  variant.size ??
                  ""
                }
              />

              <InventoryField
                name="color"
                label="Color"
                defaultValue={
                  variant.color ??
                  ""
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InventoryField
                name="stock"
                label="Stock"
                type="number"
                min="0"
                step="1"
                defaultValue={String(
                  variant.stock
                )}
                required
              />

              <InventoryField
                name="variantPrice"
                label="Price (IQD)"
                type="number"
                min="0"
                step="1"
                defaultValue={
                  variant.price ===
                  null
                    ? ""
                    : String(variant.price)
                }
                placeholder="Base price"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="submit"
              disabled={
                editingVariantId ===
                variant.id
              }
              className="h-11 rounded-full bg-black text-xs font-black text-white disabled:bg-black/30"
            >
              {editingVariantId ===
              variant.id
                ? "Saving..."
                : "Save"}
            </button>

            <button
              type="button"
              disabled={
                removingVariantId ===
                variant.id
              }
              onClick={() =>
                handleRemoveVariant(
                  variant.id
                )
              }
              className="h-11 rounded-full border border-red-200 text-xs font-black text-red-600 disabled:opacity-40"
            >
              {removingVariantId ===
              variant.id
                ? "Removing..."
                : "Remove"}
            </button>
          </div>
        </form>
      )
    )}
  </div>

  {variantError && (
    <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {variantError}
    </div>
  )}

  <form
    onSubmit={handleAddVariant}
    className="mt-6 space-y-4 rounded-[22px] border border-black/10 p-4"
  >
    <div>
      <h3 className="font-black">
        Add Variant
      </h3>

      <p className="mt-1 text-xs text-black/45">
        Add another size, color, or SKU.
      </p>
    </div>

    <label
  htmlFor="variant-sku"
  className="mb-2 block text-xs font-bold"
>
  SKU
</label>

<input
  id="variant-sku"
  name="sku"
  type="text"
  placeholder="Auto-generated if left empty"
  className="h-13 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
/>

    <div>
  <label
    htmlFor="variant-size"
    className="mb-2 block text-xs font-bold"
  >
    Size
  </label>

  <select
    id="variant-size"
    name="size"
    defaultValue=""
    required
    className="h-13 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
  >
    <option value="" disabled>
      Choose size
    </option>

    <option value="XS">XS</option>
    <option value="S">S</option>
    <option value="M">M</option>
    <option value="L">L</option>
    <option value="XL">XL</option>
    <option value="XXL">XXL</option>
  </select>
</div>
      <div>
      <InventoryField
        name="color"
        label="Color"
        placeholder="Black"
      />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <InventoryField
        name="stock"
        label="Stock"
        type="number"
        min="0"
        step="1"
        defaultValue="0"
        required
      />

      <InventoryField
        name="variantPrice"
        label="Price (IQD)"
        type="number"
        min="0"
        step="1"
        placeholder="Base price"
      />
    </div>

    <button
      type="submit"
      disabled={addingVariant}
      className="h-13 w-full rounded-full bg-black text-sm font-black text-white disabled:bg-black/30"
    >
      {addingVariant
        ? "Adding..."
        : "+ Add Variant"}
    </button>
  </form>
</section>

        <section className="mt-8 border-t border-black/10 pt-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black">
                Images
              </h2>

              <p className="mt-1 text-sm text-black/45">
                {product.images.length} product images
              </p>
            </div>
          </div>

          {product.images.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {product.images.map((image) => (
                <article
                  key={image.id}
                  className="overflow-hidden rounded-[20px] border border-black/10"
                >
                  <div className="relative aspect-4/5 bg-neutral-100">
                    <Image
                      src={image.url}
                      alt={image.alt ?? product.name}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />

                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black">
                      #{image.position + 1}
                    </span>
                  </div>

                  <div className="p-3">
                    <p className="truncate text-xs font-semibold">
                      {image.alt || "Product image"}
                    </p>

                    <p className="mt-1 truncate text-[10px] text-black/40">
                      {image.url}
                    </p>

                    <button
                      type="button"
                      disabled={
                        removingImageId === image.id
                      }
                      onClick={() =>
                        handleRemoveImage(image.id)
                      }
                      className="mt-3 h-10 w-full rounded-full border border-red-200 text-xs font-black text-red-600 disabled:opacity-40"
                    >
                      {removingImageId === image.id
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-neutral-100 px-4 py-6 text-center text-sm text-black/45">
              No product images yet.
            </div>
          )}

          <form
  onSubmit={handleUploadImage}
  className="mt-6 space-y-4 rounded-[22px] border border-black/10 p-4"
>
  <div>
    <h3 className="font-black">
      Upload Photo
    </h3>

    <p className="mt-1 text-xs text-black/45">
      Add another product photo.
    </p>
  </div>

  <div>
    <label
      htmlFor="product-image-file"
      className="mb-2 block text-xs font-bold"
    >
      Photo
    </label>

    <input
      key={imageInputKey}
      id="product-image-file"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={(event) => {
        setSelectedImage(
          event.target.files?.[0] ?? null
        );
        setImageError(null);
      }}
      className="block w-full rounded-2xl border border-black/10 bg-neutral-50 px-3 py-3 text-sm"
    />
  </div>

  {selectedImage && (
    <div className="rounded-2xl bg-neutral-100 px-4 py-3">
      <p className="truncate text-sm font-bold">
        {selectedImage.name}
      </p>

      <p className="mt-1 text-xs text-black/45">
        {(
          selectedImage.size /
          1024 /
          1024
        ).toFixed(2)}{" "}
        MB
      </p>
    </div>
  )}

  <div>
    <label
      htmlFor="upload-alt"
      className="mb-2 block text-xs font-bold"
    >
      Alt Text
    </label>

    <input
      id="upload-alt"
      type="text"
      value={uploadAlt}
      onChange={(event) =>
        setUploadAlt(event.target.value)
      }
      placeholder="Front view"
      className="h-13 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
    />
  </div>

  {imageError && (
    <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {imageError}
    </div>
  )}

  <button
    type="submit"
    disabled={!selectedImage || uploadingImage}
    className="h-13 w-full rounded-full bg-black text-sm font-black text-white disabled:bg-black/30"
  >
    {uploadingImage
      ? "Uploading..."
      : "Upload Photo"}
  </button>
</form>
<section className="mt-10 border-t border-red-200 pt-6">
  <h2 className="text-lg font-black text-red-700">
    Danger Zone
  </h2>

  <p className="mt-2 text-sm leading-6 text-black/50">
    Permanently removes this
    product, its variants,
    favorites, and images.
  </p>

  <p className="mt-1 text-xs text-black/40">
    Products with existing
    order history cannot be
    deleted.
  </p>

  {deleteError && (
    <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {deleteError}
    </div>
  )}

  <button
    type="button"
    disabled={
      deletingProduct
    }
    onClick={
      handleDeleteProduct
    }
    className="mt-4 h-13 w-full rounded-full border border-red-300 bg-red-50 text-sm font-black text-red-700 disabled:opacity-40"
  >
    {deletingProduct
      ? "Deleting..."
      : "Delete Product Permanently"}
  </button>
</section>
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-neutral-100 p-3">
      <p className="text-[10px] font-bold uppercase text-black/40">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

type FieldProps = {
  name: string;
  label: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
};

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  required = false,
  min,
  step,
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
        defaultValue={defaultValue}
        required={required}
        min={min}
        step={step}
        className="h-13 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
      />
    </div>
  );
}

type InventoryFieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
};

function InventoryField({
  name,
  label,
  defaultValue,
  placeholder,
  type = "text",
  required = false,
  min,
  step,
}: InventoryFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold">
        {label}
      </label>

      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="h-11 w-full rounded-xl border border-black/10 bg-neutral-50 px-3 text-sm outline-none focus:border-black"
      />
    </div>
  );
}