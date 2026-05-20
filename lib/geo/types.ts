export type GeoConfidence = "HIGH" | "MEDIUM" | "LOW";

export type GeoDetectSource =
  | "edge"
  | "ip"
  | "manual"
  | "dev"
  | "timezone"
  | "tz-offset"
  | "accept-language"
  | "cookie"
  | "currency-hint";

export type DevOverrideSource = "env" | "query" | "localStorage" | "header";

export type GeoSignalTrace = {
  country: string;
  source: GeoDetectSource;
  weight: number;
};

export type GeoSignalScores = {
  edge: number;
  ip: number;
  timezone: number;
  locale: number;
};

export type GeoResolution = {
  country: string | null;
  confidence: GeoConfidence | null;
  source: GeoDetectSource | null;
  weakDetection: boolean;
  /** May write pref + geo_resolved cookies (IP/manual/dev only). */
  persistable: boolean;
  signals: GeoSignalTrace[];
  reason: string;
  overrideSource: DevOverrideSource | null;
  edgeCountry: string | null;
  ipCountry: string | null;
  timezone: string | null;
  tzOffsetMinutes: number | null;
  acceptLanguage: string | null;
  browserLocaleCountry: string | null;
  scores: GeoSignalScores;
  isLocalDev: boolean;
  edgeAvailable: boolean;
  ipAvailable: boolean;
};

export type GeoDetectResult = {
  country: string;
  source: GeoDetectSource;
};

export type GeoResolveTrace = GeoResolution;
