// Session-level types for Auditone Test. The clinical data shapes (audiogram, impedance, speech
// audiometry) come from AudiometricReport in phase 1b; until then they are stored as plain JSON.

export const APP_VERSION = "auditone-0.1.0";

export type Sex = "male" | "female" | "unspecified";
export type AgeGroup = "<18" | "18-39" | "40-59" | "60+" | "unspecified";
export type Lang = "es" | "en";

export interface SessionInfo {
  sex: Sex;
  ageGroup: AgeGroup;
  lang: Lang;
}

/** Transducer used for the test. */
export interface DeviceInfo {
  transducer?: "insert" | "earbuds" | "supra-aural" | "circumaural" | "unknown";
  connection?: "wired" | "wireless" | "unknown";
  model?: string;
  /** Calibration profile used (clinic mode only). */
  calibrationProfileId?: string;
}

export interface QualityInfo {
  /** Difference between the 1 kHz test and retest (dB). */
  retest1kDb?: number;
  falsePositiveRate?: number;
  warnings?: string[];
}

export type JsonObject = Record<string, unknown>;
