"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckoutPageLoading } from "@/components/shop/CheckoutLoadingPanel";

export function BagCheckoutLoading() {
  const t = useTranslations("checkout");
  return <CheckoutPageLoading message={t("bagLoading")} />;
}

export function BagCheckoutError({ message }: { message: string }) {
  const t = useTranslations("checkout");
  const tErrors = useTranslations("errors");
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f4f6fb] px-4">
      <div className="max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_12px_40px_-16px_rgba(15,23,42,0.15)]">
        <div className="h-1 w-full bg-gradient-to-r from-rose-400 to-rose-500" aria-hidden />
        <div className="p-6 text-center">
          <p className="text-[15px] font-semibold text-slate-900">{tErrors("generic")}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{message}</p>
          <Link
            href="/preview-bag"
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white shadow-[0_10px_28px_-12px_rgba(45,107,255,0.45)]"
          >
            {t("backToBag")}
          </Link>
        </div>
      </div>
    </div>
  );
}
