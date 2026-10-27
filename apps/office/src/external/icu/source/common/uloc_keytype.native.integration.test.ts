/** @fileoverview Original ICU78.3 resource-backed key/type observations include counted view identity and nullable C facades. */
import { expect, it } from "vitest";
import observations from "./uloc_keytype.native-observations.json";
import * as K from "./uloc_keytype";
import * as F from "./uloc.keytype";
/** Observes exact narrow code units. @param text - Counted source span. @returns Native octets. */
function units(text: string): number[] {
  return Array.from(
    text,
    /** Projects the original narrow unit. @param unit - Octet string. @returns Code unit. */ (
      unit,
    ) => unit.charCodeAt(0),
  );
}
/** Observes original optional view ownership. @param view - Source lookup result. @returns Native scalar row. */
function encode(view: K.KeyTypeStringView | null): number[] {
  return view === null ? [-1] : [view.value.length, Number(view.inputAlias), ...units(view.value)];
}
/** Observes original C facade null/string result. @param text - Source result. @returns Native scalar row. */
function cencode(text: string | null): number[] {
  return text === null ? [-1] : [text.length, ...units(text)];
}
it.each(observations.cases)(
  "matches original key/type query %s",
  /** Replays key/type public entry points with unchanged mapped resource data. @param query - Original operands. @param expected - Native library output. @returns Nothing. */ (
    query,
    expected,
  ) => {
    const [keyLength = 0, typeLength = 0, flagText = 0, ...encoded] = query.split(" ").map(Number);
    const key = String.fromCharCode(...encoded.slice(0, keyLength)),
      type = String.fromCharCode(...encoded.slice(keyLength, keyLength + typeLength));
    const flags = flagText,
      ckey = flags & 1 ? null : key,
      ctype = flags & 2 ? null : type;
    const row = [
      ...encode(K.ulocimp_toBcpKey(key)),
      ...encode(K.ulocimp_toLegacyKey(key)),
      ...encode(K.ulocimp_toBcpType(key, type)),
      ...encode(K.ulocimp_toLegacyType(key, type)),
      ...encode(F.ulocimp_toBcpKeyWithFallback(key)),
      ...encode(F.ulocimp_toLegacyKeyWithFallback(key)),
      ...encode(F.ulocimp_toBcpTypeWithFallback(key, type)),
      ...encode(F.ulocimp_toLegacyTypeWithFallback(key, type)),
      ...cencode(F.uloc_toUnicodeLocaleKey(ckey)),
      ...cencode(F.uloc_toLegacyKey(ckey)),
      ...cencode(F.uloc_toUnicodeLocaleType(ckey, ctype)),
      ...cencode(F.uloc_toLegacyType(ckey, ctype)),
    ];
    expect(row.join(" ")).toBe(expected);
  },
);
