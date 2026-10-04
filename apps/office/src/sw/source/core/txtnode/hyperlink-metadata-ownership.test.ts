/** @fileoverview Verifies native hyperlink string value ownership against literal metadata, without upstream access. */
import { describe, expect, it } from "vitest";
import { SwFormatINetFormat, type WriterHyperlink } from "./fmtatr2";
/** Mutable caller boundary used to prove readonly TypeScript views do not provide ownership. */
type MutableHyperlink = { -readonly [Key in keyof WriterHyperlink]: WriterHyperlink[Key] };
/** Constructs independent literal values for four optional string combinations. @param mask - Optional field bits. @returns Fresh caller values. */
function metadata(mask: number): MutableHyperlink {
  const result: MutableHyperlink = { url: "https://example.test/owned" };
  if (mask & 1) result.name = "Owned link";
  if (mask & 2) result.targetFrame = "_blank";
  if (mask & 4) result.styleName = "Internet Link";
  if (mask & 8) result.visitedStyleName = "Visited Internet Link";
  return result;
}
/** Changes all string sources, inserts absent fields and deletes one supplied field. @param value - Mutable caller. @returns Nothing. */
function mutate(value: MutableHyperlink): void {
  value.url = "";
  value.name = "Later caller name";
  delete value.targetFrame;
  value.styleName = "Later caller style";
  value.visitedStyleName = "Later visited style";
}
describe("owned hyperlink item metadata", /** Registers explicit value ownership checks. @returns Nothing. */ () => {
  for (const prototype of [false, true])
    it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])(
      "owns supported values with prototype=" + prototype + " mask=%s",
      /** Checks input mutation before later clone/projection/equality. @param mask - Optional fields. @returns Nothing. */ (
        mask,
      ) => {
        const expected = metadata(mask),
          source = metadata(mask),
          caller: WriterHyperlink = prototype ? (Object.create(source) as WriterHyperlink) : source;
        const item = new SwFormatINetFormat(caller);
        expect(item.Which()).toBe(54);
        expect(item.isShareable()).toBe(false);
        expect(item.GetHyperlink()).toEqual(expected);
        expect(item.QueryValue()).toBe(JSON.stringify(expected));
        mutate(source);
        expect(source.url).toBe("");
        expect(source.name).toBe("Later caller name");
        expect(source.targetFrame).toBeUndefined();
        expect(item.GetValue()).toBe("https://example.test/owned");
        expect(item.GetHyperlink()).toEqual(expected);
        const returned = item.GetHyperlink() as MutableHyperlink;
        mutate(returned);
        expect(item.GetHyperlink()).toEqual(expected);
        const clone = item.Clone();
        expect(clone).not.toBe(item);
        expect(clone.Which()).toBe(54);
        expect(clone.isShareable()).toBe(false);
        expect(clone.GetHyperlink()).toEqual(expected);
        expect(clone.QueryValue()).toBe(JSON.stringify(expected));
        expect(clone.equals(item)).toBe(true);
        expect(item.equals(new SwFormatINetFormat(expected))).toBe(true);
        mutate(clone.GetHyperlink() as MutableHyperlink);
        expect(item.GetHyperlink()).toEqual(expected);
        expect(clone.GetHyperlink()).toEqual(expected);
      },
    );
  it.each(["name", "targetFrame", "styleName", "visitedStyleName"] as const)(
    "preserves an explicit empty %s as distinct from omitted metadata",
    /** Checks current optional-value contracts while copying strings. @param field - Optional metadata field. @returns Nothing. */ (
      field,
    ) => {
      const caller: MutableHyperlink = { url: "https://example.test/empty", [field]: "" },
        item = new SwFormatINetFormat(caller);
      caller[field] = "Later";
      expect(item.GetHyperlink()).toEqual({ url: "https://example.test/empty", [field]: "" });
      expect(item.equals(new SwFormatINetFormat({ url: "https://example.test/empty" }))).toBe(
        false,
      );
      expect(item.Clone().GetHyperlink()).toEqual({
        url: "https://example.test/empty",
        [field]: "",
      });
    },
  );
  it("creates later items from new caller values without changing an earlier item", /** Checks separate construction snapshots and plain JSON property order. @returns Nothing. */ () => {
    const caller = {
        visitedStyleName: "Visited",
        name: "First",
        url: "https://example.test/first",
        targetFrame: "_self",
        styleName: "Normal",
      },
      first = new SwFormatINetFormat(caller);
    expect(first.QueryValue()).toBe(
      '{"visitedStyleName":"Visited","name":"First","url":"https://example.test/first","targetFrame":"_self","styleName":"Normal"}',
    );
    caller.url = "https://example.test/second";
    caller.name = "Second";
    const second = new SwFormatINetFormat(caller);
    expect(first.GetValue()).toBe("https://example.test/first");
    expect(second.GetValue()).toBe("https://example.test/second");
    expect(first.equals(second)).toBe(false);
    caller.url = "https://example.test/third";
    expect(first.Clone().GetValue()).toBe("https://example.test/first");
    expect(second.Clone().GetValue()).toBe("https://example.test/second");
  });
  it("rejects an empty URL without freezing or changing caller metadata", /** Checks retained empty-URL guard and caller mutability. @returns Nothing. */ () => {
    const caller = { url: "", name: "Unchanged" };
    expect(
      /** Attempts an invalid owned value. @returns No item. */ () =>
        new SwFormatINetFormat(caller),
    ).toThrow("URL must not be empty");
    expect(caller).toEqual({ url: "", name: "Unchanged" });
    caller.url = "https://example.test/valid";
    const item = new SwFormatINetFormat(caller);
    expect(Object.isFrozen(caller)).toBe(false);
    expect(item.GetValue()).toBe("https://example.test/valid");
  });
});
