/** @fileoverview Original normal tag grammar over actual scanner, registry and callback owners.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */
import { setDiagnostic, type DiagnosticSlot } from "./lt-error";
import { TagScanner } from "./lt-tag.scanner";
import { lookupRegistry } from "./lt-registry";
import { ExtensionData } from "./lt-extension";
import { TagState as S, addTagString, lt_tag_clear, lt_tag_get_string, type Tag } from "./lt-tag";
import { lt_tag_canonicalize } from "./lt-tag.canonicalize";
import { lt_strcasecmp, lt_strlower } from "./lt-utils";

/** Original separator transitions; unlisted states reject a separator. */
const prestate: Partial<Record<S, S>> = {
  [S.PRE_EXTLANG]: S.EXTLANG,
  [S.PRE_SCRIPT]: S.SCRIPT,
  [S.PRE_REGION]: S.REGION,
  [S.PRE_VARIANT]: S.VARIANT,
  [S.PRE_EXTENSION]: S.EXTENSION,
  [S.IN_EXTENSION]: S.EXTENSIONTOKEN,
  [S.IN_EXTENSIONTOKEN]: S.EXTENSIONTOKEN2,
  [S.PRE_PRIVATEUSE]: S.PRIVATEUSE,
  [S.IN_PRIVATEUSE]: S.PRIVATEUSETOKEN,
  [S.IN_PRIVATEUSETOKEN]: S.PRIVATEUSETOKEN2,
};
/** Original valid terminal states, including private native sentinel defaults. */
const terminal = new Set([
  S.PRE_EXTLANG,
  S.PRE_SCRIPT,
  S.PRE_REGION,
  S.PRE_VARIANT,
  S.PRE_EXTENSION,
  S.PRE_PRIVATEUSE,
  S.IN_EXTENSIONTOKEN,
  S.IN_PRIVATEUSETOKEN,
  S.NONE,
]);

/** Resets values/state and parses a normal tag. @param tag - Actual owner. @param text - C-string value. @param error - Optional diagnostic destination. @returns Native success. */
export function lt_tag_parse(tag: Tag, text: string, error?: DiagnosticSlot): boolean {
  lt_tag_clear(tag);
  tag.state = S.NONE;
  return parse(tag, text, error);
}

/** Continues the original parser state. @param tag - Previously parsed actual owner. @param text - Additional C-string tokens. @param error - Optional diagnostic destination. @returns Native success, false without error for the original NONE precondition. */
export function lt_tag_parse_with_extra_token(
  tag: Tag,
  text: string,
  error?: DiagnosticSlot,
): boolean {
  if (tag.state === S.NONE) return false;
  return parse(tag, text, error);
}

/** Executes the non-wildcard source scanner loop. @param tag - Actual owner. @param text - Incoming C-string value. @param error - Optional destination. @returns Native result. */
function parse(tag: Tag, text: string, error?: DiagnosticSlot): boolean {
  const nul = text.indexOf("\0"),
    value = nul < 0 ? text : text.slice(0, nul),
    err: DiagnosticSlot = { error: null };
  if (tag.state === S.NONE) {
    tag.grandfathered = lookupRegistry("grandfathered", value);
    if (tag.grandfathered) {
      addTagString(tag, value);
      return true;
    }
    tag.state = S.LANG;
  } else if (
    [
      S.PRE_EXTLANG,
      S.PRE_SCRIPT,
      S.PRE_REGION,
      S.PRE_VARIANT,
      S.PRE_EXTENSION,
      S.PRE_PRIVATEUSE,
    ].includes(tag.state)
  )
    tag.state++;
  const scanner = new TagScanner(new TextEncoder().encode(value)),
    output = { token: null as string | null, length: 0 };
  let count = 0,
    token: string | null = null;
  while (!scanner.isEof()) {
    if (!scanner.getToken(output, err)) break;
    token = output.token as string;
    count++;
    if (token === "-") {
      const next = prestate[tag.state];
      if (next === undefined) {
        setDiagnostic(err, `Invalid syntax found during parsing a token: ${token}`);
        break;
      }
      tag.state = next;
    } else if (!parseState(tag, token, err)) break;
  }
  if (!err.error && !terminal.has(tag.state))
    setDiagnostic(
      err,
      `Invalid tag: ${value}, last token = '${token ?? "(null)"}', state = ${tag.state}, parsed count = ${count}`,
    );
  addTagString(tag, value);
  if (err.error) {
    if (error) error.error = err.error;
    return false;
  }
  return true;
}

/** Parses one non-separator token, preserving original fallthrough and mutations. @param tag - Actual owner. @param token - Scanner value. @param error - Fresh internal error slot. @returns Native result. */
function parseState(tag: Tag, token: string, error: DiagnosticSlot): boolean {
  const length = token.length;
  let dispatch = tag.state;
  for (;;) {
    switch (dispatch) {
      case S.LANG:
        if (length === 1) {
          if (lt_strcasecmp(token, "x") === 0) {
            tag.privateuse += token;
            tag.state = S.IN_PRIVATEUSE;
            return true;
          }
          return setDiagnostic(error, `Invalid language subtag: ${token}`);
        }
        if (length >= 2 && length <= 3) {
          tag.language = lookupRegistry("language", token);
          if (!tag.language) return setDiagnostic(error, `Unknown ISO 639 code: ${token}`);
          // Every immutable exact-key language entry has its shortest stored key; no ISO alias trie keys exist.
          tag.state = S.PRE_EXTLANG;
          return true;
        }
        if (length === 4) return setDiagnostic(error, `Reserved for future use: ${token}`);
        if (length >= 5 && length <= 8)
          return setDiagnostic(error, `XXX: registered language tag: ${token}`);
        return setDiagnostic(error, `Invalid language subtag: ${token}`);
      case S.EXTLANG:
        if (length === 3) {
          tag.extlang = lookupRegistry("extlang", token);
          if (tag.extlang) {
            const prefix = tag.extlang.prefixes[0] as string,
              lang =
                (tag.language as NonNullable<Tag["language"]>).preferredTag ??
                (tag.language as NonNullable<Tag["language"]>).tag;
            // All registered non-wildcard extlangs have exactly one nonempty prefix in the pinned registry.
            if (lt_strcasecmp(prefix, lang) !== 0) {
              const subtag = tag.extlang.tag;
              tag.extlang = null;
              return setDiagnostic(
                error,
                `extlang '${subtag}' is supposed to be used with ${prefix}, but ${lang}`,
              );
            }
            tag.state = S.PRE_SCRIPT;
            return true;
          }
        }
        dispatch = S.SCRIPT;
        continue;
      case S.SCRIPT:
        if (length === 4) {
          tag.script = lookupRegistry("script", token);
          if (tag.script) {
            tag.state = S.PRE_REGION;
            return true;
          }
        }
        dispatch = S.REGION;
        continue;
      case S.REGION:
        if (length === 2 || /^[0-9]{3}$/.test(token)) {
          tag.region = lookupRegistry("region", token);
          if (tag.region) {
            tag.state = S.PRE_VARIANT;
            return true;
          }
        }
        dispatch = S.VARIANT;
        continue;
      case S.VARIANT:
        if ((length >= 5 && length <= 8) || (length === 4 && /^[0-9]/.test(token))) {
          const variant = lookupRegistry("variant", token);
          if (variant) {
            // A parsed primary plus valid pinned alias/redundant targets cannot fail canonicalization.
            const langtag = lt_tag_canonicalize(tag) as string;
            let prefixes = "",
              matched = false;
            for (const prefix of variant.prefixes) {
              prefixes += (prefixes ? "," : "") + prefix;
              if (lt_strlower(langtag as string).startsWith(lt_strlower(prefix))) {
                matched = true;
                break;
              }
            }
            if (variant.prefixes.length && !matched)
              return setDiagnostic(
                error,
                `variant '${token}' is supposed to be used with ${prefixes}, but ${langtag}`,
              );
            if (!tag.variants.length) tag.variants.push(variant);
            else {
              tag.tagString = null;
              const text = lt_tag_get_string(tag) as string;
              if (variant.prefixes.length && !variant.prefixes.includes(text))
                setDiagnostic(error, `Variant isn't allowed for ${text}: ${variant.tag}`);
              else if (!variant.prefixes.length && tag.variants.includes(variant))
                setDiagnostic(error, `Duplicate variants: ${variant.tag}`);
              else tag.variants.push(variant);
            }
            tag.state = S.PRE_VARIANT;
            return error.error === null;
          }
        }
        dispatch = S.EXTENSION;
        continue;
      case S.EXTENSION:
        return extensionOrPrivate(tag, token, error);
      // Standalone PRIVATEUSE state is assigned only by the omitted wildcard parser.
      case S.EXTENSIONTOKEN:
      case S.EXTENSIONTOKEN2:
        if (length >= 2 && length <= 8) {
          const diagnostic = (tag.extension as ExtensionData).addTag(token);
          if (diagnostic) {
            error.error = diagnostic;
            return false;
          }
          tag.state = S.IN_EXTENSIONTOKEN;
          return true;
        }
        if (tag.state === S.EXTENSIONTOKEN2 && (tag.extension as ExtensionData).validateState())
          return extensionOrPrivate(tag, token, error);
        (tag.extension as ExtensionData).cancelTag();
        return false;
      case S.PRIVATEUSETOKEN:
      case S.PRIVATEUSETOKEN2:
        if (length <= 8) {
          tag.privateuse += "-" + token;
          tag.state = S.IN_PRIVATEUSETOKEN;
          return true;
        }
        return setDiagnostic(error, `Invalid tag for the private use: token = '${token}'`);
      default:
        return setDiagnostic(
          error,
          `Unable to parse tag: ${tag.tagString ?? "(null)"}, token = '${token}' state = ${tag.state}`,
        );
    }
  }
}

/** Preserves native singleton discovery before private-use fallback. @param tag - Actual owner. @param token - Scanner token. @param error - Internal slot. @returns Success. */
function extensionOrPrivate(tag: Tag, token: string, error: DiagnosticSlot): boolean {
  if (token.length === 1 && !["x", "X", "*", "-"].includes(token)) {
    tag.extension ??= new ExtensionData();
    if (tag.extension.hasSingleton(token))
      return setDiagnostic(error, `Duplicate singleton for extension: ${token}`);
    const diagnostic = tag.extension.addSingleton(token, tag);
    if (diagnostic) {
      error.error = diagnostic;
      return false;
    }
    tag.state = S.IN_EXTENSION;
    return true;
  }
  return privateUse(tag, token);
}

/** Preserves source private-use singleton spelling. @param tag - Actual owner. @param token - Token. @returns Success or native no-alternative failure. */
function privateUse(tag: Tag, token: string): boolean {
  if (token.length !== 1 || !["x", "X"].includes(token)) return false;
  tag.privateuse += token;
  tag.state = S.IN_PRIVATEUSE;
  return true;
}
