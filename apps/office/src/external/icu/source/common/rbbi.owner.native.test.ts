/** @fileoverview Replays the original linked OpenOffice rule iterator and UChars owner. */
import { afterAll, beforeAll, expect, it } from "vitest";
import native from "./rbbi.owner.native-observations.json" with { type: "json" };
import { OpenOffice_dat } from "../../../../i18npool/source/breakiterator/data/OpenOffice_dat";
import { RuleBasedBreakIterator } from "./rbbi";
import { udata_cleanup } from "./udata";
import { udata_open, udata_setAppData } from "./unicode/udata";
import {
  UTextStorage,
  type OpenUText,
  utext_char32At,
  utext_clone,
  utext_close,
  utext_getNativeIndex,
  utext_nativeLength,
  utext_openUChars,
} from "./unicode/utext";

/** Concrete fixture for the rules and inputs whose native traversal uses no dictionary engine. */
class IteratorFixture extends RuleBasedBreakIterator {
  /** Fails if an input unexpectedly requires a dictionary. @returns Never. */
  override getLanguageBreakEngine(): never {
    throw new Error("Native rule replay reached a dictionary character");
  }
}

beforeAll(
  /** Registers the original generated package through the actual public loader. @returns Nothing. */ () => {
    const status: [number] = [0];
    udata_setAppData("OpenOffice", OpenOffice_dat, status);
    expect(status[0]).toBe(0);
  },
);

afterAll(
  /** Releases the package cache. @returns Nothing. */ () => {
    udata_cleanup();
  },
);

it("matches the original UChars storage and clone observations", /** Exercises owned, borrowed and closed providers. @returns Nothing. */ () => {
  const chars = new Uint16Array([97, 0xd83d, 0xde00, 98, 0, 122, 0]);
  const source = new UTextStorage(),
    shallow = new UTextStorage(),
    deep = new UTextStorage();
  const status: [number] = [0];
  const text = utext_openUChars(source, chars, -1, status) as OpenUText;
  const rows = [text.flags, text.providerProperties, text.a, text.chunkLength];
  rows.push(utext_char32At(text, 2), utext_getNativeIndex(text));
  rows.push(utext_nativeLength(text), text.providerProperties, text.chunkLength);
  utext_clone(shallow, text, false, true, status);
  utext_clone(deep, text, true, false, status);
  rows.push(
    Number(shallow.context === text.context),
    Number(deep.context === text.context),
    Number(deep.chunkContents === text.chunkContents),
    deep.providerProperties,
  );
  chars[0] = 81;
  rows.push(utext_char32At(deep as OpenUText, 0), (deep.context as Uint16Array)[0] as number);
  utext_close(deep);
  rows.push(deep.flags, Number(deep.context === null), Number(deep.pFuncs === null));
  utext_close(shallow);
  rows.push(shallow.flags, Number(shallow.context === text.context));
  utext_close(text);
  const heap = utext_openUChars(null, null, 0, status) as OpenUText;
  rows.push(heap.flags, Number(utext_close(heap) === null), status[0]);
  expect(rows).toEqual(native.utext);
});

/** Executes a source public boundary query. @param owner - Rule iterator. @param op - Operation selector. @param arg - Native index or count. @returns Original result. */
function run(owner: RuleBasedBreakIterator, op: string, arg: number): number {
  switch (op) {
    case "F":
      return owner.first();
    case "L":
      return owner.last();
    case "N":
      return owner.next();
    case "P":
      return owner.previous();
    case "A":
      return owner.following(arg);
    case "B":
      return owner.preceding(arg);
    case "I":
      return Number(owner.isBoundary(arg));
    case "C":
      return owner.next(arg);
    default:
      throw new Error("Unknown witness operation");
  }
}

for (const [index, c] of native.cases.entries()) {
  it(`matches native linked iterator sequence ${index} (${c.rule})`, /** Uses one real data handle and compares every initialized public result and cursor/tag. @returns Nothing. */ () => {
    const status: [number] = [0];
    const memory = udata_open("OpenOffice", "brk", c.rule, status);
    expect(status[0]).toBe(0);
    expect(memory?.length).toBe(-1);
    const iterator = new IteratorFixture(memory, status);
    const chars = new Uint16Array(c.text.length + 1);
    for (let i = 0; i < c.text.length; ++i) chars[i] = c.text.charCodeAt(i);
    const source = utext_openUChars(new UTextStorage(), chars, c.text.length, status) as OpenUText;
    iterator.setText(source, status);
    expect(status[0]).toBe(0);
    const result: number[] = [];
    for (const [op, arg] of c.operations) {
      result.push(
        run(iterator, op as string, arg as number),
        iterator.current(),
        iterator.getRuleStatus(),
      );
    }
    expect(result).toEqual(native.boundaries[index]);
    const borrowed = iterator.getUText(null, status) as OpenUText;
    expect(borrowed.context).toBe(chars);
    utext_close(borrowed);
    iterator.dispose();
    expect(memory?.pHeader).toBeNull();
    utext_close(source);
  });
}
