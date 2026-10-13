/** @fileoverview Complete original SearchParam initialized values/defaults/copy/borrow and mode conversion stream comparison. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { SearchParam } from "../../inc/textsearch";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import fixture from "./native-search-param-cases.json";
/** Constructs original initialized UTF16 input values. @param text - Contents including NUL and supplementary pairs. @returns Actual string owner. */
function string(text: string): OUString {
  const units = Uint16Array.from(
    text
      .split("")
      .map(
        /** Encodes one original UTF16 code unit. @param unit - Unit. @returns Unsigned unit. */ (
          unit,
        ) => unit.charCodeAt(0),
      ),
  );
  return new OUString(units, units.length);
}
/** Formats original initialized string contents without its terminator. @param value - String reference. @returns Native field text. */
function contents(value: OUStringConstReference): string {
  return Array.from(value.getStr().slice(0, value.getLength()))
    .map(
      /** Emits one original code unit. @param unit - Unit. @returns Native field. */ (unit) =>
        unit + ",",
    )
    .join("");
}
it("matches complete original shared search parameter stream", /** Replays legal public state/conversion/copy histories. @returns Nothing. */ () => {
  const lines: string[] = [];
  /** Emits every original observable value field. @param name - Stage. @param q - Parameters. @returns Nothing. */
  function state(name: string, q: SearchParam): void {
    lines.push(
      `${name} ${q.GetSrchType()} ${+q.IsCaseSensitive()} ${q.GetWildEscChar()} ${+q.IsWildMatchSel()} ${contents(q.GetSrchStr())}`,
    );
  }
  lines.push("enum " + Object.values(SearchParam.SearchType).join(" "));
  for (const wildcard of [false, true])
    for (const regex of [false, true]) {
      const out = { value: regex };
      const type = SearchParam.ConvertToSearchType(wildcard, out);
      lines.push(`mode ${+wildcard} ${+regex} ${type} ${+out.value}`);
    }
  for (const type of [-2147483648, -1, 0, 1, 2, 3, 2147483647])
    for (const wildcard of [false, true])
      for (const regex of [false, true]) {
        const flags = { wildcard, regexp: regex };
        SearchParam.ConvertToBool(type, flags);
        lines.push(`flags ${type} ${+wildcard} ${+regex} ${+flags.wildcard} ${+flags.regexp}`);
      }
  const text = string("A\0α😀"),
    changed = string("changed");
  const defaults = new SearchParam(text, SearchParam.SearchType.Normal);
  state("defaults", defaults);
  text.assign(changed);
  state("retained", defaults);
  const copy = new SearchParam(defaults);
  state("copy", copy);
  lines.push(
    `borrow ${+(copy.GetSrchStr() === defaults.GetSrchStr())} ${+(copy.GetSrchStr() === copy.GetSrchStr())}`,
  );
  const recipient = new SearchParam(text, SearchParam.SearchType.Regexp, false, 0xffffffff, true);
  const borrowed = recipient.GetSrchStr();
  recipient.copy_assign(copy);
  state("assigned", recipient);
  lines.push(`stable ${+(borrowed === recipient.GetSrchStr())} ${contents(borrowed)}`);
  recipient.copy_assign(recipient);
  state("selfassigned", recipient);
  const inputs = [string(""), string("abc"), string("A\0α😀")];
  for (const value of inputs)
    for (const type of [-1, 0, 1, 2, 3])
      for (const caseSensitive of [false, true])
        for (const match of [false, true])
          for (const escape of [0, 92, 0x80000000, 0xffffffff]) {
            const q = new SearchParam(value, type, caseSensitive, escape, match);
            state("parameter", q);
            const copied = new SearchParam(q);
            state("parametercopy", copied);
          }
  const output = lines.join("\n") + "\n";
  expect(Buffer.byteLength(fixture.output)).toBe(fixture.byteLength);
  expect(createHash("sha256").update(fixture.output).digest("hex")).toBe(fixture.sha256);
  expect(output).toBe(fixture.output);
  text.dispose();
  changed.dispose();
  for (const value of inputs) value.dispose();
});
