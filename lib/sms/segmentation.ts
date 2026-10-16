// GSM 03.38 character sets. Anything outside them forces UCS-2 (1s2u mt=1).
const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
// Each of these costs two septets (escape + char).
const GSM7_EXTENDED = "^{}\\[~]|€\f";

const GSM7_BASIC_SET = new Set(GSM7_BASIC);
const GSM7_EXTENDED_SET = new Set(GSM7_EXTENDED);

// 1s2u accepts at most 5 concatenated parts per message.
export const MAX_PARTS = 5;

const LIMITS = {
  GSM7: { single: 160, multi: 153 },
  UNICODE: { single: 70, multi: 67 },
} as const;

export type SmsEncoding = keyof typeof LIMITS;

export type Segmentation = {
  encoding: SmsEncoding;
  /** Septets for GSM-7, UTF-16 code units for Unicode. */
  units: number;
  parts: number;
};

export function isGsm7(text: string): boolean {
  for (const char of text) {
    if (!GSM7_BASIC_SET.has(char) && !GSM7_EXTENDED_SET.has(char)) {
      return false;
    }
  }
  return true;
}

function gsm7Units(text: string): number {
  let units = 0;
  for (const char of text) {
    units += GSM7_EXTENDED_SET.has(char) ? 2 : 1;
  }
  return units;
}

export function segment(
  text: string,
  requested: "auto" | "gsm7" | "unicode" = "auto",
): Segmentation {
  const encoding: SmsEncoding =
    requested === "unicode" || (requested === "auto" && !isGsm7(text))
      ? "UNICODE"
      : "GSM7";

  // String#length counts UTF-16 code units, which is what UCS-2 parts hold
  // (an emoji outside the BMP takes two).
  const units = encoding === "GSM7" ? gsm7Units(text) : text.length;
  const limit = LIMITS[encoding];
  const parts = units <= limit.single ? 1 : Math.ceil(units / limit.multi);

  return { encoding, units, parts };
}

/** Largest message (in units) that still fits in MAX_PARTS parts. */
export function maxUnits(encoding: SmsEncoding): number {
  return LIMITS[encoding].multi * MAX_PARTS;
}

/**
 * 1s2u expects Unicode bodies as UTF-16BE hex, 4 hex digits per code unit
 * (their doc example "0627062D..." is Arabic).
 */
export function toUcs2Hex(text: string): string {
  let hex = "";
  for (let i = 0; i < text.length; i++) {
    hex += text.charCodeAt(i).toString(16).toUpperCase().padStart(4, "0");
  }
  return hex;
}
