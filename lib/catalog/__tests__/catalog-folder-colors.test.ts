import { describe, expect, it } from "vitest";
import {
  buildFolderColorImport,
  inferFolderColorKey,
  inferFolderImageAngle,
} from "@/lib/catalog/catalog-folder-colors";

describe("catalog-folder-colors", () => {
  it("detects black and white in filenames", () => {
    expect(inferFolderColorKey("hoodie-black-oversize-front.png")).toBe("black");
    expect(inferFolderColorKey("front-white-hoodie.png")).toBe("white");
    expect(inferFolderColorKey("hoodie-back-whiteoversize.png")).toBe("white");
    expect(inferFolderColorKey("front-back-hoodie.png")).toBe(null);
  });

  it("maps folder naming to correct front/back angles", () => {
    expect(inferFolderImageAngle("hoodie-back-black--oversize.png")).toBe("front");
    expect(inferFolderImageAngle("hoodie-front-back-black-size-oversize.png")).toBe("back");
    expect(inferFolderImageAngle("back-black-hoodie-oversize.png")).toBe("back");
    expect(inferFolderImageAngle("hoodie-black-oversize-front.png")).toBe("front");
    expect(inferFolderImageAngle("hoodie-white-back.png")).toBe("back");
    expect(inferFolderImageAngle("front-back-hoodie.png")).toBe("front");
  });

  it("builds black and white colorways with correct front/back slots", () => {
    const files = [
      "hoodie-back-black--oversize.png",
      "hoodie-back-whiteoversize.png",
      "hoodie-front-back-black-size-oversize.png",
      "hoodie-front-back-white-size-oversize.png",
    ];
    const { colors } = buildFolderColorImport(files, (f) => `https://cdn/${f}`);
    expect(colors).toHaveLength(2);

    const black = colors.find((c) => c.id === "black");
    const white = colors.find((c) => c.id === "white");
    expect(black?.front).toContain("hoodie-back-black");
    expect(black?.back).toContain("front-back-black");
    expect(white?.front).toContain("hoodie-back-white");
    expect(white?.back).toContain("front-back-white");
  });

  it("assigns standard back-black + front-back pair to one colorway", () => {
    const files = ["back-black hoodie.png", "front-back-hoodie.png"];
    const { colors } = buildFolderColorImport(files, (f) => `https://cdn/${f}`);
    expect(colors).toHaveLength(1);
    expect(colors[0]?.back).toContain("back-black");
    expect(colors[0]?.front).toContain("front-back-hoodie");
  });

  it("assigns bleu lovesalgoat style filenames", () => {
    const files = ["back-black-hoodie-oversize.png", "hoodie-black-oversize-front.png"];
    const { colors } = buildFolderColorImport(files, (f) => `https://cdn/${f}`);
    expect(colors[0]?.back).toContain("back-black-hoodie");
    expect(colors[0]?.front).toContain("oversize-front");
  });
});
