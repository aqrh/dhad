import { getTranslations } from "next-intl/server";

import { RegisterForm } from "@/components/auth/register-form";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-10">
          <p className="text-xs font-bold tracking-[0.2em] text-black/35">
            IRAQ HERITAGE
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {t("createAccount")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-black/50">
            {t("registerDescription")}
          </p>
        </div>

        <RegisterForm />
        <MobileBottomNav />
      </div>
    </main>
  );
}