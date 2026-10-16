/** @fileoverview Native transform extension callback data using the actual recursive tag parser.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */
import { ErrorCode, type DiagnosticSlot, type TagDiagnostic } from "../liblangtag/lt-error";
import { lt_tag_new, lt_tag_get_string } from "../liblangtag/lt-tag";
import { lt_tag_parse, lt_tag_parse_with_extra_token } from "../liblangtag/lt-tag.parse";
import { getCldrKeywords } from "../liblangtag/lt-xml.cldr";
import { lt_strcasecmp, lt_strlower } from "../liblangtag/lt-utils";

/** Original reachable t state ordinals; VARIANT2 and END are never assigned. */
enum State {
  NONE = 0,
  LANG = 1,
  SCRIPT = 2,
  REGION = 3,
  VARIANT = 4,
  FIELD = 6,
  FIELD2 = 7,
}

/** Actual private t data; nested normal tag ownership uses ordinary JS references. */
export class TransformExtensionData {
  #state = State.NONE;
  readonly #tag = lt_tag_new();
  readonly #fields: string[] = [];

  /** Preserves native singleton callback. @returns t. */
  getSingleton(): "t" {
    return "t";
  }

  /** Parses one source token using real normal parsing where required. @param subtag - Native token value. @returns Fresh-slot diagnostic or success. */
  parseTag(subtag: string): TagDiagnostic | null {
    if (this.#state !== State.FIELD && this.#state !== State.FIELD2 && this.#lookupKey(subtag)) {
      this.#setupField(subtag);
      return null;
    }
    const error: DiagnosticSlot = { error: null };
    switch (this.#state) {
      case State.NONE:
        if (!lt_tag_parse(this.#tag, subtag, error)) return error.error;
        if (!this.#tag.language) return this.#error(`No such language subtag: ${subtag}`);
        this.#state = State.LANG;
        return null;
      case State.LANG:
        if (!lt_tag_parse_with_extra_token(this.#tag, subtag, error)) return error.error;
        if (this.#tag.extlang) return this.#error(`Extlang tag isn't allowed: ${subtag}`);
        if (this.#tag.script) {
          this.#state = State.SCRIPT;
          return null;
        }
        return this.#checkRegion();
      case State.SCRIPT:
        if (!lt_tag_parse_with_extra_token(this.#tag, subtag, error)) return error.error;
        return this.#checkRegion();
      case State.REGION:
      case State.VARIANT:
        if (!lt_tag_parse_with_extra_token(this.#tag, subtag, error)) return error.error;
        return this.#checkVariant();
      case State.FIELD:
      case State.FIELD2:
        if (this.#state === State.FIELD2 && !this.#tag.language && this.#lookupKey(subtag)) {
          this.#setupField(subtag);
          return null;
        }
        if (subtag.length < 3 || subtag.length > 8)
          return this.#error(`Invalid syntax: expected to see an field value, but \`${subtag}'`);
        {
          const diagnostic = this.#lookupType(subtag);
          if (diagnostic) return diagnostic;
        }
        this.#fields[this.#fields.length - 1] += "-" + subtag;
        this.#state = State.FIELD2;
        return null;
    }
  }

  /** Emits original nested tag string and lowercase fields in insertion order. @returns Native payload. */
  getTag(): string {
    const tag = lt_tag_get_string(this.#tag),
      fields = this.#fields.map(lt_strlower);
    return (tag ? [tag, ...fields] : fields).join("-");
  }

  /** Preserves native unconditional validation. @returns True. */
  validateTag(): true {
    return true;
  }

  /** Discovers t-registered field names in the merged transform document. @param token - Original key spelling. @returns Presence. */
  #lookupKey(token: string): boolean {
    return getCldrKeywords(6).some(
      /** Applies original t attribute filter then ASCII name comparison. @param key - Source keyword. @returns Match. */
      (key) => key.attributes.extension === "t" && lt_strcasecmp(key.attributes.name, token) === 0,
    );
  }

  /** Enters native field state. @param token - Registered raw key. @returns Nothing. */
  #setupField(token: string): void {
    this.#state = State.FIELD;
    this.#fields.push(token);
  }

  /** Validates source field types or x0 private alphanumeric values. @param token - Type token. @returns Diagnostic or success. */
  #lookupType(token: string): TagDiagnostic | null {
    const name = (this.#fields[this.#fields.length - 1] as string).slice(0, 2);
    if (lt_strcasecmp(name, "x0") === 0)
      return /[^A-Za-z0-9]/.test(token)
        ? this.#error(`subtag for -t-x0- has to be 3-8 alphanum characters but: ${token}`)
        : null;
    for (const key of getCldrKeywords(6))
      if (key.attributes.extension === "t" && key.attributes.name === name)
        for (const type of key.types) if (lt_strcasecmp(type.name, token) === 0) return null;
    return this.#error(`Unknown -t- extension type: ${token}`);
  }

  /** Preserves script/region/variant source fallthrough after real parsing. @returns Diagnostic or success. */
  #checkRegion(): TagDiagnostic | null {
    if (this.#tag.region) {
      this.#state = State.REGION;
      return null;
    }
    return this.#checkVariant();
  }

  /** Preserves forbidden extension/private checks and the successful variant state. @returns Diagnostic or success. */
  #checkVariant(): TagDiagnostic | null {
    if (this.#tag.extension) return this.#error("Extension tag isn't allowed");
    if (this.#tag.privateuse) return this.#error("PrivateUse tag isn't allowed");
    this.#state = State.VARIANT;
    return null;
  }

  /** Projects one fresh native callback error. @param message - Source diagnostic. @returns Diagnostic value. */
  #error(message: string): TagDiagnostic {
    return { code: ErrorCode.LT_ERR_FAIL_ON_SCANNER, message };
  }
}
