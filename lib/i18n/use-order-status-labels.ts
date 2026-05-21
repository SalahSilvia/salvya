"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { OrderFulfillmentStatus } from "@/lib/orders/types";

export function useOrderStatusLabels() {
  const t = useTranslations("orders");

  return useMemo(() => {
    const label = (status: OrderFulfillmentStatus): string => {
      if (status === "preparing") return t("statusPreparingShort");
      if (status === "shipped") return t("statusShippedShort");
      if (status === "delivered") return t("statusDeliveredShort");
      if (status === "cancelled") return t("statusCancelledShort");
      return t("statusConfirmedShort");
    };
    const headline = (status: OrderFulfillmentStatus): string => {
      if (status === "preparing") return t("statusPreparing");
      if (status === "shipped") return t("statusShipped");
      if (status === "delivered") return t("statusDelivered");
      if (status === "cancelled") return t("statusCancelled");
      return t("statusConfirmed");
    };
    return { label, headline };
  }, [t]);
}
