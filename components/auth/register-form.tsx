"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  useRouter,
} from "next/navigation";

import {
  requestOtp,
} from "@/lib/api/auth";

export function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const countryCode = "+964";

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const localPhone = String(
      formData.get("phone") ?? ""
    )
      .trim()
      .replace(/\s+/g, "");

    const phone =
      `${countryCode}${localPhone}`;

    setError(null);
    setSubmitting(true);

    try {
      const result =
        await requestOtp(phone);

      /*
       * Save phone temporarily so
       * the verify page knows which
       * number is being verified.
       */
      sessionStorage.setItem(
        "auth_phone",
        phone
      );

      /*
       * Development only:
       * our backend returns devCode
       * until an SMS provider exists.
       */
      if (result.devCode) {
        sessionStorage.setItem(
          "auth_dev_code",
          result.devCode
        );
      } else {
        sessionStorage.removeItem(
          "auth_dev_code"
        );
      }

      router.push(
        `/${locale}/verify`
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Could not send verification code"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-bold">
          {t("phone")}
        </label>

        <div className="flex gap-2">
          <div className="flex h-14 min-w-[88px] items-center justify-center rounded-2xl border border-black/10 bg-neutral-50 text-sm font-bold">
            {countryCode}
          </div>

          <input
            type="tel"
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="7XXXXXXXXX"
            className="h-14 min-w-0 flex-1 rounded-2xl border border-black/10 bg-neutral-50 px-4 text-base outline-none focus:border-black"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="h-14 w-full rounded-full bg-black text-sm font-black text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/30"
      >
        {submitting
          ? t("sendingCode")
          : t("continue")}
      </button>

      <p className="text-center text-xs leading-5 text-black/40">
        {t("termsText")}
      </p>
    </form>
  );
}