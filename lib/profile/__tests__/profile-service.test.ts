import { describe, expect, it } from "vitest";
import { mergeProfileDetails, parseProfileDetails } from "@/lib/profile/profile-service";

describe("profile-service", () => {
  it("parses empty profile", () => {
    expect(parseProfileDetails(null)).toEqual({
      displayName: "",
      username: "",
      bio: "",
      phone: "",
      country: "",
      avatarUrl: null,
      coverUrl: null,
    });
  });

  it("merges and trims fields", () => {
    const base = parseProfileDetails({ displayName: "Ada" });
    const next = mergeProfileDetails(base, {
      username: "@fan",
      bio: "  hello  ",
    });
    expect(next.displayName).toBe("Ada");
    expect(next.username).toBe("fan");
    expect(next.bio).toBe("hello");
  });
});
