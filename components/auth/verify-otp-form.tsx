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
  verifyOtp,
} from "@/lib/api/auth";

export function VerifyOtpForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [code, setCode] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    resending,
    setResending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null
  );

  const getPhone = () => {
    return (
      sessionStorage.getItem(
        "auth_phone"
      ) ?? ""
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      submitting ||
      code.length !== 6
    ) {
      return;
    }

    const phone = getPhone();

    if (!phone) {
      setError(
        t("phoneMissing")
      );

      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await verifyOtp(
        phone,
        code
      );

      /*
       * OTP succeeded and Next has
       * stored the JWT in the
       * HttpOnly auth_token cookie.
       */

      sessionStorage.removeItem(
        "auth_phone"
      );

      sessionStorage.removeItem(
        "auth_dev_code"
      );

      /*
       * Refresh lets server components
       * see the newly-created cookie.
       */
      router.refresh();

      router.push(
        `/${locale}/account`
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          t("verificationFailed")
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend =
    async () => {
      if (resending) {
        return;
      }

      const phone = getPhone();

      if (!phone) {
        setError(
          t("phoneMissing")
        );

        return;
      }

      setError(null);
      setSuccess(null);
      setResending(true);

      try {
        const result =
          await requestOtp(phone);

        /*
         * Development only.
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

        setCode("");

        setSuccess(
          t("codeResent")
        );
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setError(error.message);
        } else {
          setError(
            t("resendFailed")
          );
        }
      } finally {
        setResending(false);
      }
    };

  /*
   * Temporary development helper.
   *
   * This lets you test the OTP from
   * your phone without opening
   * browser developer tools.
   */
  const useDevelopmentCode =
    () => {
      const devCode =
        sessionStorage.getItem(
          "auth_dev_code"
        );

      if (devCode) {
        setCode(devCode);
        setError(null);
      } else {
        setError(
          t("devCodeMissing")
        );
      }
    };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="mb-2 block text-sm font-bold">
          {t(
            "verificationCode"
          )}
        </label>

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) =>
            setCode(
              event.target.value
                .replace(/\D/g, "")
                .slice(0, 6)
            )
          }
          placeholder="000000"
          className="h-14 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-center text-2xl font-black tracking-[0.4em] outline-none focus:border-black"
        />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-semibold">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={
          code.length !== 6 ||
          submitting
        }
        className="h-14 w-full rounded-full bg-black text-sm font-black text-white disabled:bg-black/15 disabled:text-black/30"
      >
        {submitting
          ? t("verifying")
          : t("verify")}
      </button>

      <button
        type="button"
        disabled={resending}
        onClick={handleResend}
        className="w-full text-center text-sm font-semibold underline underline-offset-4 disabled:opacity-40"
      >
        {resending
          ? t("resendingCode")
          : t("resendCode")}
      </button>

      {process.env.NEXT_PUBLIC_ENABLE_DEV_OTP !==
        "production" && (
        <button
          type="button"
          onClick={
            useDevelopmentCode
          }
          className="w-full text-center text-xs font-semibold text-black/40"
        >
          {t("useDevelopmentCode")}
        </button>
      )}
    </form>
  );
}