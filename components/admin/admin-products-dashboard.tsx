"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import type {
  ProductCategory,
} from "@/lib/api/admin-products";

import type {
  ProductAudience,
} from "@/lib/api/products";

import {
  createAdminProduct,
  uploadAdminProductImage,
} from "@/lib/api/admin-products";
import type { ApiProduct } from "@/lib/api/products";
import { formatPriceIQD } from "@/lib/format-price";

type Props = {
  initialProducts: ApiProduct[];
};

export function AdminProductsDashboard({
  initialProducts,
}: Props) {
  const locale = useLocale();
  const router = useRouter();

  const [products, setProducts] =
    useState<ApiProduct[]>(initialProducts);

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const [selectedImages, setSelectedImages] =
    useState<File[]>([]);

  const [imageInputKey, setImageInputKey] =
    useState(0);

  const handleCreate = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const category = String(
      data.get("category") ?? "TSHIRT") as ProductCategory;
    const audience = String(
      data.get("audience") ?? "UNISEX"
    ) as ProductAudience;

    const name = String(
      data.get("name") ?? ""
    ).trim();

    const slug = String(
      data.get("slug") ?? ""
    ).trim();

    const description = String(
      data.get("description") ?? ""
    ).trim();

    const price = Number(
      data.get("price")
    );

    const deliveryPriceText = String(
    data.get("deliveryPrice") ?? ""
    ).trim();

  const deliveryPrice =
    deliveryPriceText === ""
      ? undefined
      : Number(deliveryPriceText);

  if (
    deliveryPrice !== undefined &&
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

    if (!name) {
      setError("Product name is required.");
      return;
    }

    if (!slug) {
      setError("Slug is required.");
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Enter a valid price.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const product = await createAdminProduct({
        name,
        slug,
        description: description || undefined,
        price,
        active: true,
        category,
        audience,
        images: [],
        variants: [],
        ...(deliveryPrice !== undefined && {
          deliveryPrice,
        }),
      });

      const uploadedImages = [];

      for (const file of selectedImages) {
        const uploadedImage =
          await uploadAdminProductImage(
            product.id,
            file,
            name
          );

        uploadedImages.push(uploadedImage);
      }

      const productWithImages: ApiProduct = {
        ...product,
        images: uploadedImages,
      };

      setProducts((current) => [
        productWithImages,
        ...current,
      ]);

      form.reset();
      setSelectedImages([]);
      setImageInputKey((value) => value + 1);
      setCreating(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create product."
      );
    } finally {
      setSaving(false);
    }
  };

  function handlePhotoSelection(
    files: File[]
  ) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const invalidFile = files.find(
      (file) =>
        !allowedTypes.includes(file.type) ||
        file.size > 8 * 1024 * 1024
    );

    if (invalidFile) {
      setError(
        "Photos must be JPEG, PNG, or WebP and smaller than 8 MB each."
      );
      setSelectedImages([]);
      return false;
    }

    setError(null);
    setSelectedImages(files);
    return true;
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-28 pt-6">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-black/35">
              IRAQ HERITAGE
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Products
            </h1>

            <p className="mt-1 text-sm text-black/45">
              Admin Management
            </p>
          </div>

          <span className="rounded-full bg-black px-3 py-2 text-xs font-black text-white">
            <a href={`/${locale}/admin`}>ADMIN</a>
          </span>
        </div>

        {/* SUMMARY */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <Summary
            label="Products"
            value={products.length}
          />

          <Summary
            label="Active"
            value={
              products.filter(
                (product) => product.active
              ).length
            }
          />

          <Summary
            label="Stock"
            value={products.reduce(
              (total, product) =>
                total +
                product.variants.reduce(
                  (sum, variant) =>
                    sum + variant.stock,
                  0
                ),
              0
            )}
          />
        </div>

        {/* CREATE */}
        {creating ? (
          <form
            onSubmit={handleCreate}
            className="mt-6 space-y-4 rounded-[24px] border border-black/10 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">
                New Product
              </h2>

              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setError(null);
                  setSelectedImages([]);
                  setImageInputKey(
                    (value) => value + 1
                  );
                }}
                className="text-xs font-bold underline underline-offset-4"
              >
                Cancel
              </button>
            </div>

            <AdminField
              name="name"
              label="Product Name"
              placeholder="Heritage Oversized Shirt"
              required
            />

            <AdminField
              name="slug"
              label="Slug"
              placeholder="heritage-oversized-shirt"
              required
            />

            <div>

              <div>
                <label htmlFor="category"
                  className="mb-2 block text-xs font-bold"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  defaultValue="TSHIRT"
                  className="h-13 w-full mb-2 rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-non focus:border-black"
                  >
                    <option value="TSHIRT">
                      TShirt
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
                      SUIT
                    </option>
                    <option value="BOTTOM/JEANS">
                    Jeans / Bottom
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
                  defaultValue="UNISEX"
                  className="h-13 w-full mb-2 rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
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

              <label
                htmlFor="description"
                className="mb-2 block text-xs font-bold"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full resize-none rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-base outline-none focus:border-black"
              />
            </div>

            <AdminField
              name="price"
              label="Price IQD"
              type="number"
              placeholder="48000"
              step="0.01"
              min="0"
              required
            />
            <div>
  <label
    htmlFor="deliveryPrice"
    className="mb-2 block text-xs font-bold"
  >
    Delivery Price (IQD)
  </label>

  <input
    id="deliveryPrice"
    name="deliveryPrice"
    type="number"
    min="0"
    step="1"
    placeholder="Use default"
    className="h-13 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
  />

  <p className="mt-2 text-xs text-black/40">
    Leave blank to use the default delivery price.
  </p>
</div>

            <div>
              <label
                htmlFor="product-images"
                className="mb-2 block text-xs font-bold"
              >
                Product Photos
              </label>

              <input
                key={imageInputKey}
                id="product-images"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                multiple
                onChange={(event) => {
                  const files = Array.from(
                    event.target.files ?? []
                  );

                  const valid =
                    handlePhotoSelection(files);

                  if (!valid) {
                    event.target.value = "";
                  }
                }}
                className="block w-full rounded-2xl border border-black/10 bg-neutral-50 px-3 py-3 text-sm"
              />

              <p className="mt-2 text-xs text-black/40">
                JPEG, PNG or WebP · maximum 8 MB each
              </p>
            </div>

            {selectedImages.length > 0 && (
              <div className="space-y-2 rounded-2xl bg-neutral-100 p-4">
                <p className="text-xs font-black">
                  {selectedImages.length}{" "}
                  {selectedImages.length === 1
                    ? "photo"
                    : "photos"}{" "}
                  selected
                </p>

                {selectedImages.map(
                  (file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="truncate">
                        {file.name}
                      </span>

                      <span className="shrink-0 text-black/40">
                        {(
                          file.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </span>
                    </div>
                  )
                )}
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="h-14 w-full rounded-full bg-black text-sm font-black text-white disabled:bg-black/30"
            >
              {saving
                ? "Creating & Uploading..."
                : "Create Product"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setError(null);
            }}
            className="mt-6 h-14 w-full rounded-full bg-black text-sm font-black text-white"
          >
            + Add Product
          </button>
        )}

        {/* PRODUCTS */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-black">
              All Products
            </h2>

            <span className="text-xs font-bold text-black/40">
              {products.length} total
            </span>
          </div>

          <div className="space-y-3">
            {products.map((product) => {
              const image =
                product.images[0]?.url ??
                "/images/products/product-1.jpeg";

              const stock =
                product.variants.reduce(
                  (total, variant) =>
                    total + variant.stock,
                  0
                );

              return (
                <article
                  key={product.id}
                  className="rounded-[22px] border border-black/10 p-4"
                >
                  <div className="flex gap-4">
                    <div className="relative h-[110px] w-[90px] shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-black">
                            {product.name}
                          </h3>

                          <p className="mt-1 truncate text-[11px] text-black/40">
                            {product.slug}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
                            product.active
                              ? "bg-black text-white"
                              : "bg-neutral-100 text-black/40"
                          }`}
                        >
                          {product.active
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>
                      </div>
                      <div>
                        <label
                          htmlFor="category"
                          className="mb-2 block text-xs font-bold"
                        >
                          Category
                        </label>
                        <p>{`{${product.category}}`}</p>
                    </div>
                    <div>
                      <label htmlFor="audience"
                      className="mb-2 blcok text-xs font-bold">
                        Audience
                      </label>
                      <p>{`{${product.audience}`}</p>
                    </div>

                      <p className="mt-3 font-black">
                        {formatPriceIQD(product.price)}
                      </p>
                      <p className="text-xs text-black/45">
                        Delivery:{" "}
                        {product.deliveryPrice === null
                          ? "Default"
                          : formatPriceIQD(
                            product.deliveryPrice
                            )}
                      </p>

                      <div className="mt-2 flex gap-3 text-[11px] text-black/45">
                        <span>
                          {product.variants.length} variants
                        </span>

                        <span>
                          {stock} in stock
                        </span>

                        <span>
                          {product.images.length} images
                        </span>
                      </div>

                      <a
                        href={`/${locale}/admin/products/${product.id}`}
                        className="mt-3 inline-block rounded-full bg-black px-4 py-2 text-xs font-black text-white"
                      >
                        Manage Product
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
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

type AdminFieldProps = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
};

function AdminField({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  step,
  min,
}: AdminFieldProps) {
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
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className="h-13 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
      />
    </div>
  );
}
