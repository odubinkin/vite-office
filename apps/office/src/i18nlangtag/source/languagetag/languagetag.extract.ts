/** @fileoverview Complete LanguageTagImpl::simpleExtract over logical UTF16 fields; extraction deliberately does not validate subtag contents. */
import { equalAscii, lower, upper } from "../isolang/isolang.tables";

/** Original private extraction decisions, in declaration order. */
export enum Extraction {
  EXTRACTED_NONE,
  EXTRACTED_LSC,
  EXTRACTED_LV,
  EXTRACTED_LR,
  EXTRACTED_C_LOCALE,
  EXTRACTED_X,
  EXTRACTED_X_JOKER,
  EXTRACTED_KNOWN_BAD,
}

/** Original five mutable Unicode output references, represented by logical UTF16 value slots. */
export interface LanguageTagExtractionFields {
  language: string;
  script: string;
  country: string;
  region: string;
  variants: string;
}

/** Original complete structural extractor, not a BCP47 validator or canonicalizer. Private/joker results retain caller outputs; failed extraction clears them. @param tag - Logical native UTF16 input. @param fields - Original mutable outputs. @returns Native extraction decision. */
export function simpleExtract(tag: string, fields: LanguageTagExtractionFields): Extraction {
  let result = Extraction.EXTRACTED_NONE;
  const length = tag.length,
    h1 = tag.indexOf("-"),
    h2 = h1 < 0 ? -1 : tag.indexOf("-", h1 + 1),
    h3 = h2 < 0 ? -1 : tag.indexOf("-", h2 + 1),
    h4 = h3 < 0 ? -1 : tag.indexOf("-", h3 + 1);
  /** Writes all original output references in field order. @param language - Language. @param script - Script. @param country - Alpha country. @param region - Numeric region slot. @param variants - Remaining variants. @returns Nothing. */
  const assign =
    /** Assigns extracted logical values. @param language - Language. @param script - Script. @param country - Country. @param region - Region. @param variants - Variants. @returns Nothing. */ (
      language: string,
      script: string,
      country: string,
      region: string,
      variants: string,
    ): void => {
      fields.language = language;
      fields.script = script;
      fields.country = country;
      fields.region = region;
      fields.variants = variants;
    };
  if (length === 1 && tag[0] === "*") result = Extraction.EXTRACTED_X_JOKER;
  else if (h1 === 1 && tag[0] === "x") result = Extraction.EXTRACTED_X;
  else if (length === 1 && tag[0] === "C") {
    result = Extraction.EXTRACTED_C_LOCALE;
    assign("C", "", "", "", "");
  } else if (length === 2 || length === 3) {
    if (h1 < 0) {
      assign(lower(tag), "", "", "", "");
      result = Extraction.EXTRACTED_LSC;
    }
  } else if ((h1 === 2 && length === 5) || (h1 === 3 && length === 6)) {
    if (h2 < 0) {
      assign(lower(tag.slice(0, h1)), "", upper(tag.slice(h1 + 1, h1 + 3)), "", "");
      result = Extraction.EXTRACTED_LSC;
    }
  } else if ((h1 === 2 && length === 6) || (h1 === 3 && length === 7)) {
    if (h2 < 0) {
      assign(lower(tag.slice(0, h1)), "", "", tag.slice(h1 + 1, h1 + 4), "");
      result = Extraction.EXTRACTED_LR;
    }
  } else if ((h1 === 2 && length === 7) || (h1 === 3 && length === 8)) {
    if (h2 < 0) {
      const c = tag[h1 + 1] as string;
      if ("0" <= c && c <= "9") {
        assign(lower(tag.slice(0, h1)), "", "", "", tag.slice(h1 + 1));
        result = Extraction.EXTRACTED_LV;
      } else {
        assign(
          lower(tag.slice(0, h1)),
          upper(tag.slice(h1 + 1, h1 + 2)) + lower(tag.slice(h1 + 2, h1 + 5)),
          "",
          "",
          "",
        );
        result = Extraction.EXTRACTED_LSC;
      }
    }
  } else if ((h1 === 2 && h2 === 7 && length === 10) || (h1 === 3 && h2 === 8 && length === 11)) {
    if (h3 < 0) {
      assign(
        lower(tag.slice(0, h1)),
        upper(tag.slice(h1 + 1, h1 + 2)) + lower(tag.slice(h1 + 2, h1 + 5)),
        upper(tag.slice(h2 + 1, h2 + 3)),
        "",
        "",
      );
      result = Extraction.EXTRACTED_LSC;
    }
  } else if ((h1 === 2 && h2 === 7 && length === 11) || (h1 === 3 && h2 === 8 && length === 12)) {
    if (h3 < 0) {
      assign(
        lower(tag.slice(0, h1)),
        upper(tag.slice(h1 + 1, h1 + 2)) + lower(tag.slice(h1 + 2, h1 + 5)),
        "",
        tag.slice(h2 + 1, h2 + 4),
        "",
      );
      result = Extraction.EXTRACTED_LR;
    }
  } else if (
    (h1 === 2 && h2 === 7 && h3 === 10 && length >= 15) ||
    (h1 === 3 && h2 === 8 && h3 === 11 && length >= 16)
  ) {
    const end = h4 < 0 ? length : h4;
    if (end - h3 > 4 && end - h3 <= 9) {
      assign(
        lower(tag.slice(0, h1)),
        upper(tag.slice(h1 + 1, h1 + 2)) + lower(tag.slice(h1 + 2, h1 + 5)),
        upper(tag.slice(h2 + 1, h2 + 3)),
        "",
        tag.slice(h3 + 1),
      );
      result = Extraction.EXTRACTED_LV;
    }
  } else if (
    (h1 === 2 && h2 === 7 && h3 === 11 && length >= 16) ||
    (h1 === 3 && h2 === 8 && h3 === 12 && length >= 17)
  ) {
    const end = h4 < 0 ? length : h4;
    if (end - h3 > 4 && end - h3 <= 9) {
      assign(
        lower(tag.slice(0, h1)),
        upper(tag.slice(h1 + 1, h1 + 2)) + lower(tag.slice(h1 + 2, h1 + 5)),
        "",
        tag.slice(h2 + 1, h2 + 4),
        tag.slice(h3 + 1),
      );
      result = Extraction.EXTRACTED_LR;
    }
  } else if ((h1 === 2 && h2 === 5 && h3 === 7) || (h1 === 3 && h2 === 6 && h3 === 8)) {
    if (tag[h3 - 1] === "u") {
      if (equalAscii(tag, "es-ES-u-co-trad")) {
        assign("es", "", "ES", "", "u-co-trad");
        result = Extraction.EXTRACTED_LV;
      }
    }
  } else if ((h1 === 2 && h2 === 5 && length >= 10) || (h1 === 3 && h2 === 6 && length >= 11)) {
    const end = h3 < 0 ? length : h3;
    if (end - h2 > 4 && end - h2 <= 9) {
      assign(lower(tag.slice(0, h1)), "", upper(tag.slice(h1 + 1, h1 + 3)), "", tag.slice(h2 + 1));
      result = Extraction.EXTRACTED_LV;
    }
  } else if ((h1 === 2 && h2 === 6 && length >= 11) || (h1 === 3 && h2 === 7 && length >= 12)) {
    const end = h3 < 0 ? length : h3;
    if (end - h2 > 4 && end - h2 <= 9) {
      assign(lower(tag.slice(0, h1)), "", "", tag.slice(h1 + 1, h1 + 4), tag.slice(h2 + 1));
      result = Extraction.EXTRACTED_LR;
    }
  } else if ((h1 === 2 && length >= 8) || (h1 === 3 && length >= 9)) {
    const end = h2 < 0 ? length : h2;
    if (end - h1 > 5 && end - h1 <= 9) {
      assign(lower(tag.slice(0, h1)), "", "", "", tag.slice(h1 + 1));
      result = Extraction.EXTRACTED_LV;
    } else if (equalAscii(tag, "en-GB-oed")) {
      assign("en", "", "GB", "", "oed");
      result = Extraction.EXTRACTED_LV;
    } else if (equalAscii(tag, "es-ES_tradnl")) {
      assign("es", "", "ES", "", "tradnl");
      result = Extraction.EXTRACTED_KNOWN_BAD;
    }
  }
  if (result === Extraction.EXTRACTED_NONE) assign("", "", "", "", "");
  return result;
}
