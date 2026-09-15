"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const handleLogout = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not log out"
        );
      }

      router.push(
        `/${locale}/register`
      );

      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="w-full rounded-2xl border border-black/10 px-4 py-4 text-sm font-bold disabled:opacity-40"
    >
      {loading
        ? t("loggingOut")
        : t("logout")}
    </button>
  );
}