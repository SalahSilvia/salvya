import { describe, expect, it } from "vitest";
import { mergeEmailText } from "@/lib/email/merge";

describe("mergeEmailText", () => {
  it("replaces known tags and leaves unknown tags", () => {
    const out = mergeEmailText("Hi {{customer_name}}, order {{order_number}} {{unknown}}", {
      customer_name: "Alex",
      order_number: "SVY-1",
    });
    expect(out).toBe("Hi Alex, order SVY-1 {{unknown}}");
  });
});
