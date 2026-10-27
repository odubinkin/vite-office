/** @fileoverview ICU78.3 native keyword and C-buffer observations retain partial writes, sticky status and full guard bytes. */
import { expect, it } from "vitest";
import observations from "./uloc.keywordvalue.native-observations.json";
import { Locale } from "./locid";
import * as K from "./uloc.keywordvalue";
import * as C from "./uloc.buffer";
import { uloc_forLanguageTag } from "./uloc_tag.convert";
/** Serializes a native counted narrow output. @param text - Source span. @returns Original count/octet tuple. */
function units(text: string): number[] {
  return [
    text.length,
    ...Array.from(
      text,
      /** Projects one byte. @param unit - Narrow unit. @returns Octet. */ (unit) =>
        unit.charCodeAt(0),
    ),
  ];
}
it.each(observations.cases)(
  "matches native keyword query %s",
  /** Replays actual public buffer and locale owners. @param query - Native inputs. @param expected - Original scalar output. @returns Nothing. */ (
    query,
    expected,
  ) => {
    const [op, ...data] = query.split(" "),
      values = data.map(Number);
    const [flags = 0, incoming = 0, cap = 0, idLength = 0] = values;
    const id = String.fromCharCode(...values.slice(4, 4 + idLength));
    const keyLength = values[4 + idLength] ?? 0,
      key = String.fromCharCode(...values.slice(5 + idLength, 5 + idLength + keyLength));
    Locale.setDefault(new Locale("en_US"), [0]);
    const locale = new Locale(flags & 1 ? null : id);
    if (flags & 4) locale.setToBogus();
    const row = [];
    if (op === "I")
      for (let which = 0; which < 3; which++) {
        const s: [number] = [incoming];
        let output = "seed";
        const sink = {
          /** Retains actual partial output. @param value - Span. @returns Nothing. */ Append(
            value: string,
          ) {
            output += value;
          },
        };
        if (which === 0) K.ulocimp_getKeywordValue(flags & 1 ? null : id, key, sink, s);
        else if (which === 1) locale.getKeywordValue(key, sink, s);
        else locale.getUnicodeKeywordValue(key, sink, s);
        row.push(s[0], ...units(output));
      }
    else if (op === "K")
      for (let which = 0; which < 2; which++) {
        const s: [number] = [incoming],
          buffer = new Uint8Array(Math.max(cap, 0) + 8).fill(77),
          pointer = flags & 8 ? null : buffer;
        const n =
          which === 0
            ? K.uloc_getKeywordValue(flags & 1 ? null : id, flags & 2 ? null : key, pointer, cap, s)
            : locale.getKeywordValue(flags & 2 ? null : key, pointer, cap, s);
        row.push(n, s[0], ...buffer);
      }
    else if (op === "P")
      for (let which = 0; which < 8; which++) {
        const s: [number] = [incoming],
          buffer = new Uint8Array(Math.max(cap, 0) + 8).fill(77),
          pointer = flags & 8 ? null : buffer,
          parsed: [number] = [77];
        let n;
        if (which === 7) n = uloc_forLanguageTag(id, pointer, cap, flags & 16 ? null : parsed, s);
        else {
          const read = [
            C.uloc_getName,
            C.uloc_getBaseName,
            C.uloc_canonicalize,
            C.uloc_getLanguage,
            C.uloc_getScript,
            C.uloc_getCountry,
            C.uloc_getVariant,
          ][which];
          if (!read) throw new Error("Unknown native buffer operation");
          n = read(flags & 1 ? null : id, pointer, cap, s);
        }
        row.push(n, s[0], parsed[0], ...buffer);
      }

    expect(row.join(" ")).toBe(expected);
  },
);
