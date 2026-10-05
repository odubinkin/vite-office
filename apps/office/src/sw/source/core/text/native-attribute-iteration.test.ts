/** @fileoverview Checks native attribute stacks and cursor traversal against literal effective values, without upstream execution. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwAttrIter } from "./itratr";
import { SwAttrHandler } from "./atrstck";
import { SwFormatAutoFormat, SwTextAttrEnd } from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SvxWeightItem, SvxPostureItem } from "../../../../editeng/source/items/textitem";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";

/** Requires a native test owner. @param value - Actual owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native iteration owner");
  return value;
}
/** Builds a real automatic item containing independent Which families. @param doc - Owner. @param items - Actual items. @returns Native format. */
function format(doc: SwDoc, ...items: SfxPoolItem[]): SwFormatAutoFormat {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 200]]);
  for (const item of items) set.Put(item);
  return new SwFormatAutoFormat(set);
}
/** Enables the existing native priority flag at literal fixture construction. */
class PriorityHint extends SwTextAttrEnd {
  /** Creates a native prioritized ranged hint. @param item - Format. @param start - Start. @param end - End. @returns Nothing. */
  public constructor(item: SwFormatAutoFormat, start: number, end: number) {
    super(item, start, end);
    this.SetPriorityAttr(true);
  }
}

for (const cell of [false, true])
  for (const priority of [false, true])
    for (const mode of ["forward", "jump", "backward"] as const)
      it(`native attribute stacks compose independent items cell=${cell}/priority=${priority}/seek=${mode}`, /** Checks overlapping handles, identity borrowing, literal values and restoration. @returns Nothing. */ () => {
        const doc = new SwDoc(),
          body = required(doc.paragraphs[0]);
        const node = cell
          ? required(
              required(
                doc.nodes
                  .AppendTableRow(doc.nodes.MakeTableNode("A", {}, body), 1)
                  .GetTabBoxes()[0],
              ).GetParagraphs()[0],
            )
          : body;
        node.SetText("abcdefgh");
        doc.GetDfltTextFormatColl().SetFormatAttr(new SvxWeightItem(5, 15));
        const outer = format(doc, new SvxWeightItem(8, 15)),
          inner = format(doc, new SvxPostureItem(2, 11), new SfxStringItem(3, "#123456"));
        const normal = format(doc, new SvxWeightItem(5, 15)),
          zero = format(doc, new SvxWeightItem(8, 15));
        const hints = node.GetOrCreateSwpHints();
        hints.Insert(priority ? new PriorityHint(outer, 0, 8) : new SwTextAttrEnd(outer, 0, 8));
        hints.Insert(new SwTextAttrEnd(inner, 2, 6));
        hints.Insert(new SwTextAttrEnd(normal, 4, 7));
        hints.Insert(new SwTextAttrEnd(zero, 3, 3));
        hints.Insert(
          new SwTextAttrEnd(new SwFormatINetFormat({ url: "https://example.test/native" }), 1, 5),
        );
        const iterator = new SwAttrIter(node),
          handler = iterator.GetAttrHandler();
        expect(iterator.MaybeHasHints()).toBe(true);
        const positions =
          mode === "forward"
            ? [0, 1, 2, 3, 4, 5, 6, 7, 8]
            : mode === "jump"
              ? [4, 7, 8, 2, 6, 0]
              : [6, 4, 2, 1, 0, 8, 4, 4];
        for (const pos of positions) {
          iterator.Seek(pos);
          expect((handler.ReadItem(15) as SvxWeightItem).GetBoolValue()).toBe(
            pos < 8 && (priority || pos < 4 || pos >= 7),
          );
          expect((handler.ReadItem(11) as SvxPostureItem).GetBoolValue()).toBe(pos >= 2 && pos < 6);
          expect((handler.ReadItem(3) as SfxStringItem).GetValue()).toBe(
            pos >= 2 && pos < 6 ? "#123456" : "auto",
          );
          if (pos >= 2 && pos < 6) expect(handler.ReadItem(3)).toBe(inner.GetStyleHandle().Get(3));
          if (pos === 8) expect(handler.ReadItem(15)).toBe(node.GetAttr(15));
        }
        expect(node.GetText()).toBe("abcdefgh");
        expect(hints.Count()).toBe(5);
        if (cell) expect(node.StartOfSectionNode()?.GetNodes()).toBe(doc.nodes);
      });

it("native iterator orders end-before-start and suppresses only format-ignore boundaries", /** Checks literal attribute transitions including empty ranges and equivalent split hints. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdef");
  const value = format(doc, new SvxWeightItem(8, 15));
  const first = new SwTextAttrEnd(value, 0, 3),
    second = new SwTextAttrEnd(value, 3, 6);
  first.SetFormatIgnoreEnd(true);
  second.SetFormatIgnoreStart(true);
  const hints = node.GetOrCreateSwpHints();
  hints.Insert(second);
  hints.Insert(first);
  const iterator = new SwAttrIter(node);
  iterator.Seek(0);
  expect(iterator.GetNextAttr()).toBe(6);
  iterator.Seek(3);
  expect(iterator.GetAttrHandler().ReadItem(15)).toBe(value.GetStyleHandle().Get(15));
  expect(iterator.GetNextAttr()).toBe(6);
  iterator.Seek(6);
  expect(iterator.GetAttrHandler().ReadItem(15)).toBe(node.GetAttr(15));
  first.SetFormatIgnoreEnd(false);
  second.SetFormatIgnoreStart(false);
  iterator.Seek(0);
  expect(iterator.GetNextAttr()).toBe(3);
  iterator.Seek(3);
  expect(iterator.GetNextAttr()).toBe(6);
});

it("native iterator equal-start order restores the enclosing item after the shorter range", /** Checks actual start/end maps rather than a single covering-hint choice. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdef");
  const outer = format(doc, new SvxWeightItem(8, 15)),
    inner = format(doc, new SvxWeightItem(5, 15));
  node.GetOrCreateSwpHints().Insert(new SwTextAttrEnd(inner, 0, 2));
  node.GetOrCreateSwpHints().Insert(new SwTextAttrEnd(outer, 0, 6));
  const iterator = new SwAttrIter(node);
  iterator.Seek(0);
  expect(iterator.GetAttrHandler().ReadItem(15)).toBe(inner.GetStyleHandle().Get(15));
  expect(iterator.GetNextAttr()).toBe(2);
  iterator.Seek(2);
  expect(iterator.GetAttrHandler().ReadItem(15)).toBe(outer.GetStyleHandle().Get(15));
});

it("native iterator retains absent versus allocated empty maps and rejects invalid positions", /** Checks initialized defaults and native node-length sentinel at empty/end positions. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]),
    iterator = new SwAttrIter(node);
  expect(iterator.MaybeHasHints()).toBe(false);
  iterator.Seek(0);
  expect(iterator.GetNextAttr()).toBe(0);
  expect(iterator.GetAttrHandler().ReadItem(15)).toBe(node.GetAttr(15));
  for (const pos of [-1, 1, 0.5, Number.NaN])
    expect(/** Reads an invalid position. @returns Nothing. */ () => iterator.Seek(pos)).toThrow(
      "outside",
    );
  node.GetOrCreateSwpHints();
  expect(iterator.MaybeHasHints()).toBe(true);
  iterator.Seek(0);
  expect(iterator.GetNextAttr()).toBe(0);
  node.SetText("abc");
  iterator.Seek(2);
  expect(iterator.GetNextAttr()).toBe(3);
  iterator.Seek(1);
  expect(iterator.GetNextAttr()).toBe(3);
});

it("native attribute handler retains priority stacks and paragraph defaults across Reset", /** Checks initialization, unsupported paragraph items and exact identity removal. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]),
    handler = new SwAttrHandler();
  expect(
    /** Reads before required initialization. @returns Item. */ () => handler.ReadItem(15),
  ).toThrow("requires Init");
  handler.Init(node.GetSwAttrSet());
  const high = new PriorityHint(format(doc, new SvxWeightItem(8, 15)), 0, 1);
  const low = new SwTextAttrEnd(
    format(doc, new SvxWeightItem(5, 15), new SfxStringItem(52, "ignored")),
    0,
    1,
  );
  handler.PushAndChg(high);
  handler.PushAndChg(low);
  expect(handler.ReadItem(15)).toBe(high.GetAttr().GetStyleHandle().Get(15));
  handler.PopAndChg(high);
  expect(handler.ReadItem(15)).toBe(low.GetAttr().GetStyleHandle().Get(15));
  handler.PopAndChg(high);
  handler.Reset();
  expect(handler.ReadItem(15)).toBe(node.GetAttr(15));
});

it("native attribute handler gives the later priority owner precedence and restores the earlier one", /** Checks native highest-priority insertion and non-top removal without value snapshots. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]),
    handler = new SwAttrHandler();
  handler.Init(node.GetSwAttrSet());
  const first = new PriorityHint(format(doc, new SvxWeightItem(8, 15)), 0, 6);
  const ordinary = new SwTextAttrEnd(format(doc, new SvxWeightItem(8, 15)), 2, 5);
  const later = new PriorityHint(format(doc, new SvxWeightItem(5, 15)), 3, 4);
  handler.PushAndChg(first);
  handler.PushAndChg(ordinary);
  handler.PushAndChg(later);
  expect(handler.ReadItem(15)).toBe(later.GetAttr().GetStyleHandle().Get(15));
  handler.PopAndChg(ordinary);
  expect(handler.ReadItem(15)).toBe(later.GetAttr().GetStyleHandle().Get(15));
  handler.PopAndChg(later);
  expect(handler.ReadItem(15)).toBe(first.GetAttr().GetStyleHandle().Get(15));
  handler.PopAndChg(first);
  expect(handler.ReadItem(15)).toBe(node.GetAttr(15));
});

it("native attribute handler reinitializes defaults without clearing active owners", /** Checks repeated native Init independently of explicit Reset. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]),
    handler = new SwAttrHandler();
  handler.Init(node.GetSwAttrSet());
  const active = new SwTextAttrEnd(format(doc, new SvxWeightItem(8, 15)), 0, 2);
  handler.PushAndChg(active);
  const defaults = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  defaults.Put(new SvxWeightItem(5, 15));
  defaults.Put(new SvxPostureItem(2, 11));
  handler.Init(defaults);
  expect(handler.ReadItem(15)).toBe(active.GetAttr().GetStyleHandle().Get(15));
  expect(handler.ReadItem(11)).toBe(defaults.Get(11));
  handler.PopAndChg(active);
  expect(handler.ReadItem(15)).toBe(defaults.Get(15));
  handler.PushAndChg(active);
  handler.Reset();
  expect(handler.ReadItem(15)).toBe(defaults.Get(15));
  expect(handler.ReadItem(11)).toBe(defaults.Get(11));
});
