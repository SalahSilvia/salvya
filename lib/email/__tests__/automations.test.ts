import { describe, expect, it } from "vitest";
import {
  FULFILLMENT_EMAIL_TEMPLATE,
  FULFILLMENT_FOLLOW_UP,
  buildUserMergeContext,
} from "@/lib/email/automations";
import { EMAIL_TEMPLATE_IDS } from "@/lib/email/defaults";
import { TEMPLATE_CATEGORY } from "@/lib/email/template-catalog";
import { TEMPLATE_SENDER_ALIAS } from "@/lib/email/resend-brand";

describe("email automations", () => {
  it("maps fulfillment statuses to templates", () => {
    expect(FULFILLMENT_EMAIL_TEMPLATE.preparing).toBe("order_preparing");
    expect(FULFILLMENT_EMAIL_TEMPLATE.shipped).toBe("order_shipped");
    expect(FULFILLMENT_FOLLOW_UP.delivered).toContain("order_review_request");
  });

  it("has a sender alias for every template", () => {
    for (const id of EMAIL_TEMPLATE_IDS) {
      expect(TEMPLATE_SENDER_ALIAS[id]).toBeTruthy();
      expect(TEMPLATE_CATEGORY[id]).toBeTruthy();
    }
  });

  it("builds user merge context with cart url", () => {
    const ctx = buildUserMergeContext({
      email: "a@b.com",
      customerName: "Sam Jones",
      cartUrl: "https://salvyastore.com/bag",
    });
    expect(ctx.customer_name).toBe("Sam");
    expect(ctx.cart_url).toContain("bag");
  });
});
