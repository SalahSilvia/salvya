import { describe, expect, it } from "vitest";
import {
  buildResendHeaders,
  isMarketingEmailTemplate,
} from "@/lib/email/deliverability";

describe("deliverability", () => {
  it("marks welcome as marketing for List-Unsubscribe", () => {
    expect(isMarketingEmailTemplate("welcome_account")).toBe(true);
    expect(isMarketingEmailTemplate("order_confirmation")).toBe(false);
  });

  it("adds List-Unsubscribe for marketing templates only", () => {
    const marketing = buildResendHeaders({
      templateId: "welcome_account",
      supportEmail: "support@salvyastore.com",
      siteOrigin: "https://salvyastore.com",
    });
    expect(marketing["List-Unsubscribe"]).toContain("support@salvyastore.com");

    const transactional = buildResendHeaders({
      templateId: "order_confirmation",
      supportEmail: "support@salvyastore.com",
      siteOrigin: "https://salvyastore.com",
    });
    expect(transactional["List-Unsubscribe"]).toBeUndefined();
  });
});
