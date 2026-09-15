"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  useRouter,
} from "next/navigation";

import {
  updateProfile,
} from "@/lib/api/auth";

type Props = {
  initialName: string | null;
  initialEmail: string | null;
};

export function EditProfileForm({
  initialName,
  initialEmail,
}: Props) {
  const t =
    useTranslations("account");

  const router =
    useRouter();

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const handleSubmit = async (
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

    const name = String(
      formData.get("name") ?? ""
    ).trim();

    const email = String(
      formData.get("email") ?? ""
    ).trim();

    setError(null);
    setSaving(true);

    try {
      await updateProfile({
        name,
        email,
      });

      setEditing(false);

      /*
       * Refresh the server Account page
       * so it reloads the user from Nest.
       */
      router.refresh();
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );
      } else {
        setError(
          t("profileUpdateFailed")
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setEditing(true);
          setError(null);
        }}
        className="mt-4 text-sm font-bold underline underline-offset-4"
      >
        {t("editProfile")}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 space-y-3 border-t border-black/10 pt-5"
    >
      <div>
        <label
          htmlFor="profile-name"
          className="mb-2 block text-xs font-bold"
        >
          {t("name")}
        </label>

        <input
          id="profile-name"
          name="name"
          type="text"
          defaultValue={
            initialName ?? ""
          }
          className="h-13 w-full rounded-2xl border border-black/10 bg-white px-4 text-base outline-none focus:border-black"
        />
      </div>

      <div>
        <label
          htmlFor="profile-email"
          className="mb-2 block text-xs font-bold"
        >
          {t("email")}
        </label>

        <input
          id="profile-email"
          name="email"
          type="email"
          defaultValue={
            initialEmail ?? ""
          }
          className="h-13 w-full rounded-2xl border border-black/10 bg-white px-4 text-base outline-none focus:border-black"
        />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setEditing(false);
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
            ? t("savingProfile")
            : t("saveProfile")}
        </button>
      </div>
    </form>
  );
}