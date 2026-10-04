/** @fileoverview Verifies copied text hints through real Writer node, content-operation and graph-codec boundaries. */
import { describe, expect, it } from "vitest";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { SwDoc } from "./doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwpHints } from "../txtnode/ndhints";
import { SwTextNode, projectWriterTextRuns } from "../txtnode/ndtxt";
import { SwFormatAutoFormat, SwTextAttr } from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
const masks = [0, 1, 2, 3, 4, 5, 6, 7];

/** Requires a real model owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing copy owner");
  return value;
}
/** Builds canonical source text and flagged attributes. @param mask - Flag combination. @returns Document and node. */
function fixture(mask: number) {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdef");
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(8, 15));
  const auto = new SwTextAttr(new SwFormatAutoFormat(set), 1, 4);
  const inet = new SwTextAttr(
    new SwFormatINetFormat({
      url: "https://example.test/node-copy",
      name: "Copy",
      targetFrame: "_blank",
      styleName: "Internet Link",
      visitedStyleName: "Visited Internet Link",
    }),
    1,
    4,
  );
  for (const hint of [auto, inet]) {
    hint.dontExpand = Boolean(mask & 1);
    hint.dontExpandStart = Boolean(mask & 2);
    hint.dontMoveAttr = Boolean(mask & 4);
  }
  node.SetTextHints(new SwpHints(doc.GetAttrPool(), [auto, inet]));
  return { doc, node };
}
/** Reads one automatic handle. @param node - Actual node. @returns Shared handle. */
function handle(node: SwTextNode): SfxItemSet {
  const auto = required(node.GetpSwpHints())
    .entries()
    .find(
      /** Selects the automatic attribute independently of range ordering. @param hint - Candidate attribute. @returns Whether automatic. */
      (hint) => hint.Which() === 53,
    );
  return (required(auto).format as SwFormatAutoFormat).GetStyleHandle();
}
/** Checks flags for attributes covering the supplied range. @param node - Actual node. @param start - Hint start. @param end - Hint end. @param mask - Expected flags. @returns Nothing. */
function expectFlags(node: SwTextNode, start: number, end: number, mask: number): void {
  const hints = required(node.GetpSwpHints())
    .entries()
    .filter(
      /** Selects copied or retained ranges. @param hint - Candidate. @returns Whether in range. */ (
        hint,
      ) => hint.start === start && hint.end === end,
    );
  expect(hints).toHaveLength(2);
  for (const hint of hints)
    expect(hint).toMatchObject({
      dontExpand: Boolean(mask & 1),
      dontExpandStart: Boolean(mask & 2),
      dontMoveAttr: Boolean(mask & 4),
    });
}

describe("real text hint copy boundaries", /** Registers document-owner cases. @returns Nothing. */ () => {
  for (const foreign of [false, true])
    it.each(masks)(
      "reconstructs CloneTo attributes with foreign=" + foreign + " and mask %s",
      /** Checks same-document and foreign-document actual copies. @param mask - Source flags. @returns Nothing. */ (
        mask,
      ) => {
        const f = fixture(mask),
          target = foreign ? new SwDoc() : f.doc;
        f.node.SetParagraphAlignment("right");
        const original = handle(f.node),
          clone = f.node.CloneTo(target.GetNodes());
        expect(clone.GetDoc()).toBe(target);
        expect(clone.GetText()).toBe("abcdef");
        expect(clone.GetParagraphAlignment()).toBe("right");
        expect(clone.GetTextFormatColl()).toBe(target.CopyTextColl(f.node.GetTextFormatColl()));
        expectFlags(clone, 1, 4, 0);
        expectFlags(f.node, 1, 4, mask);
        expect(handle(clone).GetPool()).toBe(target.GetAttrPool());
        if (foreign) expect(handle(clone)).not.toBe(original);
        else expect(handle(clone)).toBe(original);
        expect(required(clone.GetpSwpHints()).Get(1).format).not.toBe(
          required(f.node.GetpSwpHints()).Get(1).format,
        );
        expect(required(clone.GetpSwpHints()).Get(1).format.QueryValue()).toBe(
          required(f.node.GetpSwpHints()).Get(1).format.QueryValue(),
        );
        expect(projectWriterTextRuns(clone)).toMatchObject([
          { text: "a" },
          {
            text: "bcd",
            attributes: { bold: true },
            hyperlink: { name: "Copy", targetFrame: "_blank" },
          },
          { text: "ef" },
        ]);
        clone.SetText("independent");
        expectFlags(f.node, 1, 4, mask);
        expect(f.node.GetText()).toBe("abcdef");
      },
    );
  for (const sameNode of [false, true])
    it.each(masks)(
      "copies clipped ranges with sameNode=" + sameNode + " and mask %s",
      /** Checks actual manager copying and source retention. @param mask - Source flags. @returns Nothing. */ (
        mask,
      ) => {
        const f = fixture(mask),
          target = sameNode ? f.node : f.doc.GetNodes().MakeTextNode();
        if (!sameNode) target.SetText("XY");
        const offset = sameNode ? 6 : 1,
          before = f.node.CaptureTextFragment(0, f.node.Len());
        const source = new SwPaM(new SwPosition(f.node, 4), new SwPosition(f.node, 2));
        expect(
          f.doc
            .GetDocumentContentOperationsManager()
            .CopyRange(source, new SwPosition(target, offset)),
        ).toBe(2);
        expect(target.GetText()).toBe(sameNode ? "abcdefcd" : "XcdY");
        expectFlags(target, offset, offset + 2, 0);
        expectFlags(f.node, 1, 4, mask);
        const copied = required(target.GetpSwpHints())
          .entries()
          .find(
            /** Finds copied automatic format. @param hint - Candidate. @returns Whether copied. */ (
              hint,
            ) => hint.Which() === 53 && hint.start === offset,
          );
        expect((required(copied).format as SwFormatAutoFormat).GetStyleHandle()).toBe(
          handle(f.node),
        );
        if (sameNode) f.node.SetText("abcdef");
        f.node.SetTextHints(before.hints);
        expectFlags(f.node, 1, 4, mask);
        expect(handle(f.node)).toBe(
          (before.hints.Get(0).format as SwFormatAutoFormat).GetStyleHandle(),
        );
      },
    );
  it.each(masks)(
    "binds foreign SetTextHints and inserted fragments for mask %s",
    /** Checks imported containers rather than only automatic item arrays. @param mask - Source flags. @returns Nothing. */ (
      mask,
    ) => {
      const f = fixture(mask),
        target = new SwDoc(),
        node = required(target.paragraphs[0]),
        original = handle(f.node);
      node.SetText("ABCDEF");
      node.SetTextHints(required(f.node.GetpSwpHints()));
      expectFlags(node, 1, 4, 0);
      expect(handle(node).GetPool()).toBe(target.GetAttrPool());
      expect(handle(node)).not.toBe(original);
      const destinationHandle = handle(node);
      node.SetText("XY");
      expect(
        target
          .GetDocumentContentOperationsManager()
          .InsertTextFragment(new SwPosition(node, 1), f.node.CaptureTextFragment(1, 4)),
      ).toBe(true);
      expect(node.GetText()).toBe("XbcdY");
      expectFlags(node, 1, 4, 0);
      expect(handle(node)).toBe(destinationHandle);
      expectFlags(f.node, 1, 4, mask);
      expect(original.GetPool()).toBe(f.doc.GetAttrPool());
    },
  );
  it("binds foreign internet-only containers and clears converted marker-only containers", /** Checks owner binding even without concrete automatic items. @returns Nothing. */ () => {
    const f = fixture(7),
      target = new SwDoc(),
      node = required(target.paragraphs[0]);
    node.SetText("abcdef");
    const internet = new SwpHints(f.doc.GetAttrPool(), [required(f.node.GetpSwpHints()).Get(1)]);
    node.SetTextHints(internet);
    expect(required(node.GetpSwpHints()).Get(0)).toMatchObject({
      start: 1,
      end: 4,
      dontExpand: false,
      dontExpandStart: false,
      dontMoveAttr: false,
    });
    node.SetText("XY");
    target
      .GetDocumentContentOperationsManager()
      .InsertTextFragment(new SwPosition(node, 1), { text: "bcd", hints: internet.slice(1, 4) });
    expect(required(node.GetpSwpHints()).Get(0)).toMatchObject({
      start: 1,
      end: 4,
      dontExpand: false,
      dontExpandStart: false,
      dontMoveAttr: false,
    });
    const states = new SfxItemSet(f.doc.GetAttrPool(), [[1, 49]]);
    states.InvalidateItem(11);
    states.DisableItem(14);
    const markers = new SwpHints(f.doc.GetAttrPool(), [
      new SwTextAttr(new SwFormatAutoFormat(states), 0, 3),
    ]);
    node.SetTextHints(markers);
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(markers.Count()).toBe(1);
  });
  it.each(masks)(
    "retains whole moved attributes and captured history for mask %s",
    /** Checks a whole attribute move separately from actual copying. @param mask - Source flags. @returns Nothing. */ (
      mask,
    ) => {
      const f = fixture(mask),
        target = f.doc.GetNodes().MakeTextNode();
      target.SetText("XY");
      const before = f.node.CaptureTextFragment(0, 6),
        original = handle(f.node);
      expectFlags(f.node, 1, 4, mask);
      f.doc
        .GetDocumentContentOperationsManager()
        .MoveRange(
          new SwPaM(new SwPosition(f.node, 4), new SwPosition(f.node, 1)),
          new SwPosition(target, 1),
        );
      expect(f.node.GetText()).toBe("aef");
      expect(f.node.GetpSwpHints()).toBeUndefined();
      expect(target.GetText()).toBe("XbcdY");
      expectFlags(target, 1, 4, mask);
      expect(handle(target)).toBe(original);
      f.node.ReplaceRange(0, f.node.Len(), before);
      expect(f.node.GetText()).toBe("abcdef");
      expectFlags(f.node, 1, 4, mask);
      expect(handle(f.node)).toBe(original);
    },
  );
  it("keeps destination ownership through continued formatting and graph-codec round trips", /** Checks imported styles through later production consumers. @returns Nothing. */ () => {
    const f = fixture(7),
      target = new SwDoc(),
      node = required(target.paragraphs[0]);
    node.SetText("abcdef");
    node.SetTextHints(required(f.node.GetpSwpHints()));
    node.ToggleTextRangeFormat(1, 4, "italic");
    expect(handle(node).GetPool()).toBe(target.GetAttrPool());
    expect(projectWriterTextRuns(node)[1]).toMatchObject({
      text: "bcd",
      attributes: { bold: true, italic: true },
      hyperlink: { url: "https://example.test/node-copy" },
    });
    const restored = decodeWriterDocument(encodeWriterDocument(target)),
      restoredNode = required(restored.paragraphs[0]);
    expect(handle(restoredNode).GetPool()).toBe(restored.GetAttrPool());
    expect(handle(restoredNode)).not.toBe(handle(node));
    expect(projectWriterTextRuns(restoredNode)).toEqual(projectWriterTextRuns(node));
    expectFlags(restoredNode, 1, 4, 0);
    expectFlags(f.node, 1, 4, 7);
  });
});
