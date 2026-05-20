import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  formatResendFrom,
  resolveFromEmailForTemplate,
  SALVYA_EMAIL_ALIASES,
} from "@/lib/email/resend-brand";

describe("resend-config", () => {
  const prev = process.env.RESEND_API_KEY;

  beforeEach(() => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_NAME = "Salvya Team";
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = prev;
    delete process.env.RESEND_FROM_NAME;
  });

  it("routes order templates to orders@", () => {
    expect(resolveFromEmailForTemplate("order_confirmation")).toBe(SALVYA_EMAIL_ALIASES.orders.address);
    expect(resolveFromEmailForTemplate("order_shipped")).toBe(SALVYA_EMAIL_ALIASES.orders.address);
  });

  it("formats from header", () => {
    expect(formatResendFrom("Salvya Team", "hello@salvyastore.com")).toBe(
      "Salvya Team <hello@salvyastore.com>",
    );
  });
});
