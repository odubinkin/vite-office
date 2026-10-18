/** @fileoverview Complete liblangtag Unicode-extension callback value/state responsibilities.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */
import { ErrorCode, type TagDiagnostic } from "../liblangtag/lt-error";
import type { RegistryEntry } from "../liblangtag/lt-registry";
import { lt_strcasecmp, lt_strlower } from "../liblangtag/lt-utils";
import { getCldrKeywords, type CldrBcp47Group } from "../liblangtag/lt-xml.cldr";

/** Reachable private state values; native STATE_END is never assigned. */
enum State {
  NONE = 0,
  ATTRIBUTE = 1,
  KEY = 2,
  TYPE = 3,
}

/** Preserves source prechecks over borrowed real registry values. @param grandfathered - Parent grandfathered value. @param extlang - Parent extlang value. @returns One fresh-slot diagnostic, or success. */
export function precheckUnicodeExtension(
  grandfathered: RegistryEntry | null,
  extlang: RegistryEntry | null,
): TagDiagnostic | null {
  if (grandfathered)
    return {
      code: ErrorCode.LT_ERR_FAIL_ON_SCANNER,
      message: "Grandfathered tags aren't allowed to have LDML.",
    };
  if (extlang)
    return {
      code: ErrorCode.LT_ERR_FAIL_ON_SCANNER,
      message: "Extlang tags aren't allowed to have LDML.",
    };
  return null;
}

/** Actual private ldml_u data; managed strings/arrays replace physical module allocation. */
export class UnicodeExtensionData {
  #currentType: CldrBcp47Group | 0 = 0;
  #state = State.NONE;
  readonly #attributes: string[] = [];
  readonly #tags: string[] = [];

  /** Preserves the native module's singleton callback. @returns The u extension identifier. */
  getSingleton(): "u" {
    return "u";
  }

  /** Parses one scanner-produced ASCII subtag. @param subtag - NUL-free token value. @returns The callback's fresh-slot diagnostic, or success. */
  parseTag(subtag: string): TagDiagnostic | null {
    const len = subtag.length;
    for (;;) {
      switch (this.#state) {
        case State.NONE:
          if (len >= 3 && len <= 8) this.#state = State.ATTRIBUTE;
          else if (len === 2) this.#state = State.KEY;
          else
            return this.#error(
              `Invalid syntax: expected to see an attribute or a key, but \`${subtag}'`,
            );
          continue;
        case State.ATTRIBUTE:
          if (len >= 3 && len <= 8) {
            this.#attributes.push(subtag);
            return null;
          }
          this.#state = State.KEY;
          continue;
        case State.KEY: {
          if (len !== 2)
            return this.#error(`Invalid syntax: expected to see a key, but \`${subtag}'`);
          const diagnostic = this.#lookupKey(subtag);
          this.#tags.push(subtag);
          return diagnostic;
        }
        case State.TYPE:
          if (len >= 3 && len <= 8) {
            if (!this.#lookupType(subtag))
              return this.#error(`Unknown -u- extension type: ${subtag}`);
            const last = this.#tags.length - 1;
            this.#tags[last] += "-" + subtag;
            return null;
          }
          if (len === 2) {
            this.#state = State.KEY;
            continue;
          }
          return this.#error(`Invalid syntax: expected to see a type or a key, but \`${subtag}'`);
      }
    }
  }

  /** Produces native canonical extension payload, retaining in-place sorting. @returns Attributes with original spelling, followed by lowercase keyword containers. */
  getTag(): string {
    this.#attributes.sort(lt_strcasecmp);
    this.#tags.sort(lt_strcasecmp);
    return [...this.#attributes, ...this.#tags.map(lt_strlower)].join("-");
  }

  /** Preserves the original unconditional final-state callback. @returns True even for clipped keys; outer grammar is separate. */
  validateTag(): true {
    return true;
  }

  /** Finds the first registered key in native document order. @param subtag - Original key spelling. @returns Diagnostic or success, updating native state on a match. */
  #lookupKey(subtag: string): TagDiagnostic | null {
    for (let type = 1; type <= 7; type++)
      for (const key of getCldrKeywords(type as CldrBcp47Group))
        if (lt_strcasecmp(key.attributes.name, subtag) === 0) {
          this.#currentType = type as CldrBcp47Group;
          this.#state = State.TYPE;
          return null;
        }
    return this.#error(`Invalid key for -u- extension: ${subtag}`);
  }

  /** Uses exact raw-key XPath selection and case-insensitive registered type values. @param subtag - Current type token. @returns Whether accepted, including the source CODEPOINTS exception. */
  #lookupType(subtag: string): boolean {
    const keyName = (this.#tags[this.#tags.length - 1] as string).slice(0, 2);
    for (const key of getCldrKeywords(this.#currentType as CldrBcp47Group)) {
      if (key.attributes.name !== keyName) continue;
      for (const type of key.types) {
        if (lt_strcasecmp(type.name, subtag) === 0) return true;
        if (
          type.name === "CODEPOINTS" &&
          subtag.length >= 4 &&
          subtag.length <= 6 &&
          !/[^0-9a-fA-F]/.test(subtag) &&
          Number.parseInt(subtag, 16) <= 0x10ffff
        )
          return true;
      }
    }
    return false;
  }

  /** Projects the one diagnostic set on a fresh native error slot. @param message - Exact source message. @returns Scanner diagnostic value. */
  #error(message: string): TagDiagnostic {
    return { code: ErrorCode.LT_ERR_FAIL_ON_SCANNER, message };
  }
}
