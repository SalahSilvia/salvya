export type SizeChartRow = {
  size: string;
  halfChestCm: number;
  lengthCm: number;
};

/** Reference garment measurements (unisex oversize block). */
export const SIZE_CHART_ROWS: readonly SizeChartRow[] = [
  { size: "XS", halfChestCm: 52, lengthCm: 66 },
  { size: "S", halfChestCm: 55, lengthCm: 69 },
  { size: "M", halfChestCm: 58, lengthCm: 72 },
  { size: "L", halfChestCm: 61, lengthCm: 75 },
  { size: "XL", halfChestCm: 64, lengthCm: 78 },
  { size: "2XL", halfChestCm: 67, lengthCm: 81 },
] as const;

export function cmToInches(cm: number, decimals = 1): number {
  return Math.round((cm / 2.54) * 10 ** decimals) / 10 ** decimals;
}

/** Full chest circumference of garment ≈ 2 × half chest (flat). */
export function garmentFullChestCm(row: SizeChartRow): number {
  return row.halfChestCm * 2;
}

export type SizeSuggestion = {
  size: string;
  garmentFullChestCm: number;
  note: string;
};

/**
 * Pick a Salvya label size from **body** chest circumference (cm), with optional ease for oversize drape.
 * `easeRatio` 1.0 = garment full chest must be ≥ body chest; 1.08 ≈ roomy oversize default.
 */
export function suggestSizeFromBodyChest(bodyChestCm: number, easeRatio = 1.06): SizeSuggestion | null {
  if (!Number.isFinite(bodyChestCm) || bodyChestCm <= 0) return null;
  const target = bodyChestCm * easeRatio;
  const sorted = [...SIZE_CHART_ROWS].sort((a, b) => garmentFullChestCm(a) - garmentFullChestCm(b));
  const pick = sorted.find((row) => garmentFullChestCm(row) >= target);
  if (pick) {
    const easePct = Math.round(((garmentFullChestCm(pick) / bodyChestCm - 1) * 100 + Number.EPSILON) * 10) / 10;
    return {
      size: pick.size,
      garmentFullChestCm: garmentFullChestCm(pick),
      note: `Garment chest ≈ ${garmentFullChestCm(pick)} cm (${easePct}% room vs your measurement).`,
    };
  }
  const largest = sorted[sorted.length - 1];
  return {
    size: largest.size,
    garmentFullChestCm: garmentFullChestCm(largest),
    note:
      "Your chest measurement is above our chart’s largest grade. 2XL is still the widest we list—expect a closer fit than a smaller body in 2XL.",
  };
}

export function chartAsTsv(unit: "cm" | "in"): string {
  const h1 =
    unit === "cm"
      ? "Size\tHalf chest (cm)\tLength (cm)\tGarment chest (cm)"
      : "Size\tHalf chest (in)\tLength (in)\tGarment chest (in)";
  const lines = SIZE_CHART_ROWS.map((row) => {
    if (unit === "cm") {
      return `${row.size}\t${row.halfChestCm}\t${row.lengthCm}\t${garmentFullChestCm(row)}`;
    }
    return `${row.size}\t${cmToInches(row.halfChestCm)}\t${cmToInches(row.lengthCm)}\t${cmToInches(garmentFullChestCm(row))}`;
  });
  return [h1, ...lines].join("\n");
}
