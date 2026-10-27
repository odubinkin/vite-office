/** @fileoverview Retains native ICU78.3 parser/getter/predicate regressions selected from the unchanged uloc_tag.cpp witness. */
import { expect, it } from "vitest";
import observations from "./uloc_tag.native-observations.json";
import * as T from "./uloc_tag";
/** Encodes original nullable counted narrow strings. @param text - Getter result. @returns Native length and octets. */
function encode(text: string | null): number[] {
  return text === null
    ? [-1]
    : [
        text.length,
        ...Array.from(
          text,
          /** Projects one invariant byte. @param unit - Narrow unit. @returns Code unit. */ (
            unit,
          ) => unit.charCodeAt(0),
        ),
      ];
}
it.each(observations.cases)(
  "matches original language tag query %s",
  /** Replays original syntax and owner getters. @param query - Source parser operands. @param expected - Original native observation. @returns Nothing. */ (
    query,
    expected,
  ) => {
    const [op, , length, incoming, hasParsed, ...units] = query.split(" ");
    const text = units
      .map(
        /** Decodes one counted narrow unit. @param unit - Octet. @returns Source unit. */ (unit) =>
          String.fromCharCode(Number(unit)),
      )
      .join("");
    const len = Number(length),
      status: [number] = [Number(incoming)],
      parsed: [number] = [77];
    let row: number[];
    if (op === "P")
      row = [
        T.ultag_isLanguageSubtag,
        T.ultag_isScriptSubtag,
        T.ultag_isRegionSubtag,
        T.ultag_isVariantSubtags,
        T.ultag_isExtensionSubtags,
        T.ultag_isPrivateuseValueSubtags,
        T.ultag_isUnicodeLocaleAttribute,
        T.ultag_isUnicodeLocaleAttributes,
        T.ultag_isUnicodeLocaleKey,
        T.ultag_isUnicodeLocaleType,
      ].map(
        /** Observes the original predicate. @param predicate - Source syntax query. @returns Native boolean. */ (
          predicate,
        ) => Number(predicate(text, len)),
      );
    else {
      const tag = T.ultag_parse(text, len, Number(hasParsed) ? parsed : null, status);
      row = [status[0], parsed[0], Number(tag !== null)];
      if (tag !== null) {
        row.push(
          ...encode(T.ultag_getLanguage(tag)),
          ...encode(T.ultag_getScript(tag)),
          ...encode(T.ultag_getRegion(tag)),
          ...encode(T.ultag_getPrivateUse(tag)),
          T.ultag_getExtlangSize(tag),
        );
        for (let i = -1; i <= 3; i++) row.push(...encode(T.ultag_getExtlang(tag, i)));
        let size = T.ultag_getVariantsSize(tag);
        row.push(size);
        for (let i = -1; i <= size; i++) row.push(...encode(T.ultag_getVariant(tag, i)));
        size = T.ultag_getExtensionsSize(tag);
        row.push(size);
        for (let i = -1; i <= size; i++)
          row.push(
            ...encode(T.ultag_getExtensionKey(tag, i)),
            ...encode(T.ultag_getExtensionValue(tag, i)),
          );
      }
    }
    expect(row.join(" ")).toBe(expected);
  },
);
