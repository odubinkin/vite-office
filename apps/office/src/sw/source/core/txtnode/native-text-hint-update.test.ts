/** @fileoverview Verifies literal native AUTO/INET text-update coordinates and actual ownership without upstream access. */
import { describe, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwFormatAutoFormat, SwTextAttrEnd, createWriterCharacterItemSet } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwPosition } from "../crsr/pam";
/** Requires one graph object. @param value - Optional value. @returns Existing value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native text-update object");
  return value;
}
/** Creates supported literal flags/items. @param doc - Document. @param family - Native Which. @param mask - Flags. @param start - Start. @param end - End. @returns Detached attribute. */
function attr(
  doc: SwDoc,
  family: number,
  mask: number,
  start: number,
  end: number,
): SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat> {
  const format =
    family === 54
      ? new SwFormatINetFormat({ url: "owned", name: "Link" })
      : new SwFormatAutoFormat(
          createWriterCharacterItemSet(doc.GetAttrPool(), {
            bold: true,
            italic: false,
            underline: false,
          }),
        );
  const result = new SwTextAttrEnd(format, start, end);
  result.dontExpand = Boolean(mask & 1);
  result.dontExpandStart = Boolean(mask & 2);
  result.dontMoveAttr = Boolean(mask & 4);
  return result;
}
/** Checks actual map and item identity after one native update. @param owner - Existing container. @param original - Actual attribute. @param start - Literal start. @param end - Literal end. @returns Nothing. */
function owned(
  owner: SwpHints,
  original: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>,
  start: number,
  end: number,
): void {
  expect(owner.Count()).toBe(1);
  expect(owner.Get(0)).toBe(original);
  expect(owner.GetSortedByEnd(0)).toBe(original);
  expect(owner.GetSortedByWhichAndStart(0)).toBe(original);
  expect(original.m_pHints).toBe(owner);
  expect([original.start, original.end]).toEqual([start, end]);
}
const insertions = [
  { start: 2, offset: 0, outStart: 4, outEnd: 8 },
  { start: 2, offset: 2, outStart: 4, outEnd: 8 },
  { start: 2, offset: 3, outStart: 2, outEnd: 8 },
  { start: 2, offset: 6, outStart: 2, outEnd: 8 },
  { start: 2, offset: 7, outStart: 2, outEnd: 6 },
  { start: 2, offset: 8, outStart: 2, outEnd: 6 },
  { start: 0, offset: 0, outStart: 0, outEnd: 8 },
  { start: 0, offset: 6, outStart: 0, outEnd: 8 },
] as const;
const deletions = [
  { start: 0, end: 1, outStart: 1, outEnd: 5 },
  { start: 0, end: 3, outStart: 0, outEnd: 3 },
  { start: 1, end: 3, outStart: 1, outEnd: 4 },
  { start: 2, end: 4, outStart: 2, outEnd: 4 },
  { start: 3, end: 5, outStart: 2, outEnd: 4 },
  { start: 4, end: 6, outStart: 2, outEnd: 4 },
  { start: 5, end: 7, outStart: 2, outEnd: 5 },
  { start: 6, end: 8, outStart: 2, outEnd: 6 },
  { start: 7, end: 8, outStart: 2, outEnd: 6 },
] as const;
describe("native owned text hint updates", /** Registers literal boundary and flag matrices. @returns Nothing. */ () => {
  for (const family of [53, 54])
    for (const insertion of insertions)
      it.each([0, 1, 2, 3, 4, 5, 6, 7])(
        "inserts through actual " +
          family +
          " range " +
          insertion.start +
          " at " +
          insertion.offset +
          " flags=%s",
        /** Checks default InsertText geometry, retained item identity and registered content indexes. @param mask - Flags. @returns Nothing. */ (
          mask,
        ) => {
          const doc = new SwDoc(),
            node = required(doc.paragraphs[0]),
            caller = attr(doc, family, mask, insertion.start, 6);
          node.SetText("abcdefgh");
          node.SetTextHints(new SwpHints(doc.GetAttrPool(), [caller]));
          const hints = required(node.GetpSwpHints()),
            original = hints.Get(0),
            item = original.format,
            position = new SwPosition(node, insertion.offset),
            snapshot = node.CaptureTextFragment(0, 8);
          expect(doc.GetDocumentContentOperationsManager().InsertString(position, "XY")).toBe(true);
          expect(position.GetContentIndex()).toBe(insertion.offset + 2);
          const start =
            insertion.start === 0 && insertion.offset === 0 && mask & 2 ? 2 : insertion.outStart;
          const end = insertion.offset === 6 && mask & 1 ? 6 : insertion.outEnd;
          expect(required(node.GetpSwpHints())).toBe(hints);
          owned(hints, original, start, end);
          expect(original.format).toBe(item);
          expect(original.dontExpand).toBe(insertion.offset === 6 ? false : Boolean(mask & 1));
          expect(original.dontExpandStart).toBe(Boolean(mask & 2));
          expect(original.dontMoveAttr).toBe(Boolean(mask & 4));
          expect(caller).toMatchObject({
            start: insertion.start,
            end: 6,
            dontExpand: Boolean(mask & 1),
          });
          expect(snapshot.hints.Get(0)).toMatchObject({
            start: insertion.start,
            end: 6,
            dontExpand: Boolean(mask & 1),
          });
          expect(node.GetText()).toBe(
            "abcdefgh".slice(0, insertion.offset) + "XY" + "abcdefgh".slice(insertion.offset),
          );
          expect(node.InsertText("", insertion.offset)).toBe("");
          expect(node.GetpSwpHints()).toBe(hints);
        },
      );
  for (const family of [53, 54])
    for (const deletion of deletions)
      it.each([0, 1, 2, 3, 4, 5, 6, 7])(
        "erases through actual " +
          family +
          " range at " +
          deletion.start +
          ".." +
          deletion.end +
          " flags=%s",
        /** Checks negative coordinate update preserves one original continuous item. @param mask - Flags. @returns Nothing. */ (
          mask,
        ) => {
          const doc = new SwDoc(),
            node = required(doc.paragraphs[0]);
          node.SetText("abcdefgh");
          node.SetTextHints(new SwpHints(doc.GetAttrPool(), [attr(doc, family, mask, 2, 6)]));
          const hints = required(node.GetpSwpHints()),
            original = hints.Get(0),
            item = original.format,
            snapshot = node.CaptureTextFragment(0, 8);
          node.EraseText(deletion.start, deletion.end - deletion.start);
          owned(hints, original, deletion.outStart, deletion.outEnd);
          expect(node.GetpSwpHints()).toBe(hints);
          expect(original.format).toBe(item);
          expect(original.dontExpand).toBe(Boolean(mask & 1));
          expect(original.dontExpandStart).toBe(Boolean(mask & 2));
          expect(original.dontMoveAttr).toBe(Boolean(mask & 4));
          expect(snapshot.hints.Get(0)).toMatchObject({ start: 2, end: 6 });
          expect(node.GetText()).toBe(
            "abcdefgh".slice(0, deletion.start) + "abcdefgh".slice(deletion.end),
          );
        },
      );
  for (const linkDontExpand of [false, true])
    for (const autoDontExpand of [false, true])
      it.each([0, 1, 2, 3])(
        "handles same-end INET=" + linkDontExpand + " AUTO=" + autoDontExpand + " otherFlags=%s",
        /** Checks native INET-first suppression and AUTO collector merging. @param mask - Start/move flags. @returns Nothing. */ (
          mask,
        ) => {
          const doc = new SwDoc(),
            node = required(doc.paragraphs[0]),
            flags = mask * 2;
          node.SetText("abcdefgh");
          node.SetTextHints(
            new SwpHints(doc.GetAttrPool(), [
              attr(doc, 53, flags + Number(autoDontExpand), 2, 6),
              attr(doc, 54, flags + Number(linkDontExpand), 2, 6),
            ]),
          );
          const hints = required(node.GetpSwpHints()),
            link = hints.Get(0),
            auto = hints.Get(1);
          node.InsertText("XY", 6);
          expect(hints.Count()).toBe(2);
          expect(hints.entries()).toContain(link);
          expect(hints.entries()).toContain(auto);
          expect(link).toMatchObject({ start: 2, end: linkDontExpand ? 6 : 8, dontExpand: false });
          expect(auto).toMatchObject({ start: 2, end: autoDontExpand ? 6 : 8, dontExpand: false });
          for (const hint of hints.entries()) {
            expect(hint.m_pHints).toBe(hints);
            expect(hints.GetSortedByEnd(0) === hint || hints.GetSortedByEnd(1) === hint).toBe(true);
            expect(
              hints.GetSortedByWhichAndStart(0) === hint ||
                hints.GetSortedByWhichAndStart(1) === hint,
            ).toBe(true);
          }
        },
      );
  it("retains explicit formatted insertion and hyperlink-only adapters", /** Checks independent formatting fragments and owned ordinary subsequent insertion. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      node = required(doc.paragraphs[0]);
    node.InsertText(
      "abcd",
      0,
      createWriterCharacterItemSet(doc.GetAttrPool(), {
        bold: true,
        italic: false,
        underline: false,
      }),
      {
        url: "explicit",
      },
    );
    node.InsertText("X", 2);
    expect(node.GetText()).toBe("abXcd");
    expect(required(node.GetpSwpHints()).Count()).toBe(2);
    expect(node.getHyperlinkAt(3)?.url).toBe("explicit");
    node.InsertText(
      "Y",
      3,
      createWriterCharacterItemSet(doc.GetAttrPool(), {
        bold: false,
        italic: true,
        underline: false,
      }),
    );
    expect(node.getHyperlinkAt(4)?.url).toBe("explicit");
    const plain = doc.GetNodes().MakeTextNode();
    plain.InsertText("link", 0, undefined, { url: "link-only" });
    expect(required(plain.GetpSwpHints()).Count()).toBe(1);
    expect(plain.getHyperlinkAt(4)?.url).toBe("link-only");
    const direct = new SwpHints(doc.GetAttrPool());
    expect(
      direct.insertText(0, 0, 2, undefined, plain.GetSwAttrSet(), { url: "direct" }).Count(),
    ).toBe(1);
  });
  it("rejects invalid updates before mutating an owned map and retains zero updates", /** Checks length/range guards and zero/no-hint paths. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      hints = new SwpHints(doc.GetAttrPool(), [attr(doc, 54, 7, 2, 6)]),
      original = hints.Get(0);
    expect(hints.Update(8, 3, 0)).toBe(hints);
    for (const length of [-1, 0.5, NaN])
      expect(
        /** Attempts an invalid insertion. @returns No valid update. */ () =>
          hints.Update(8, 3, length),
      ).toThrow("length is invalid");
    expect(
      /** Attempts an invalid deletion range. @returns No valid update. */ () =>
        hints.Update(8, 7, 2, true),
    ).toThrow("outside the text node");
    owned(hints, original, 2, 6);
    const node = required(doc.paragraphs[0]);
    node.InsertText("plain", 0);
    expect(node.GetpSwpHints()).toBeUndefined();
    node.EraseText(1, 2);
    expect(node.GetText()).toBe("pin");
    node.SetText("abcdefgh");
    node.SetTextHints(hints);
    node.EraseText(0);
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(original).toMatchObject({ start: 2, end: 6 });
  });
});
