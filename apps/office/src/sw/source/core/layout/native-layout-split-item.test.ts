/** @fileoverview Verifies original native table split ownership, copied master reactions and authoritative dialog input. */
import { expect, it } from "vitest";
import { SwAttrSet } from "../attr/swatrset";
import { SwDoc } from "../doc/doc";
import { SwTabFrame, SwTabFrameInvFlags } from "./tabfrm";
import { SwTextFlowPage } from "../../ui/table/tabledlg";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { RES_LAYOUT_SPLIT } from "../../../inc/hintids";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { AttrSetChangeHint, SwAttrSetChg } from "../../../inc/hints";
import { LegacyModifyHint } from "../../../inc/calbck";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { createDefaultWriterPageDescriptor } from "./pagedesc";
import { createSwPageFrames } from "./newfrm";
/** Observes copied native delta consumption without replacing layout ownership. */
class Frame extends SwTabFrame {
  public readonly copies: (readonly [SwAttrSetChg | undefined, SwAttrSetChg | undefined])[] = [];
  public readonly masks: number[] = [];
  /** Captures borrowed items and copy-owned descriptors. @param oldItem - Original previous value. @param newItem - Original new value. @param flags - Accumulated native flags. @param oldSet - Optional copied old delta. @param newSet - Optional copied new delta. @returns Native mask. */
  protected override UpdateAttr_(
    oldItem: SfxPoolItem | undefined,
    newItem: SfxPoolItem | undefined,
    flags: SwTabFrameInvFlags,
    oldSet?: SwAttrSetChg,
    newSet?: SwAttrSetChg,
  ): SwTabFrameInvFlags {
    const result = super.UpdateAttr_(oldItem, newItem, flags, oldSet, newSet);
    this.copies.push([oldSet, newSet]);
    this.masks.push(result);
    return result;
  }
}
it.each([undefined, false, true])(
  "native split construction retains direct-only boundary value %s",
  /** Checks literal pooled true and original concrete items. @param value - Optional authored bool. @returns Nothing. */ (
    value,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("NativeSplit", { width: 6000, layoutSplit: value }),
      frame = new SwTabFrame(table),
      owner = table.GetFrameFormat();
    try {
      expect(owner.GetAttrSet().Get(RES_LAYOUT_SPLIT)).toBeInstanceOf(SwFormatLayoutSplit);
      expect(frame.IsLayoutSplitAllowed()).toBe(value ?? true);
      expect(table.GetFormat()).toEqual(
        value === undefined ? { width: 6000 } : { width: 6000, layoutSplit: value },
      );
      owner.SetFormatAttr(new SwFormatLayoutSplit(false));
      expect(table.GetFormat().layoutSplit).toBe(false);
      expect(frame.IsLayoutSplitAllowed()).toBe(false);
      const parent = doc.GetDfltFrameFormat();
      parent.SetFormatAttr(new SwFormatLayoutSplit(false));
      owner.SetDerivedFrom(parent);
      table.SetFormat({ width: 5000 });
      expect(table.GetFormat()).toEqual({ width: 5000 });
      expect(owner.GetAttrSet().GetItemIfSet(RES_LAYOUT_SPLIT, false)).toBeUndefined();
      expect(frame.IsLayoutSplitAllowed()).toBe(false);
      expect(new SwTextFlowPage(table).IsSplit()).toBe(false);
      owner.SetFormatAttr(new SwFormatLayoutSplit(true));
      expect(frame.IsLayoutSplitAllowed()).toBe(true);
      owner.ResetFormatAttr(RES_LAYOUT_SPLIT);
      parent.ResetFormatAttr(RES_LAYOUT_SPLIT);
      expect(frame.IsLayoutSplitAllowed()).toBe(true);
      expect(table.GetFrameFormat()).toBe(owner);
    } finally {
      frame.DestroyImpl();
      doc.Dispose();
    }
  },
);
it.each(["false", "true", "default", "unknown", "invalid", "disabled", "inherited"])(
  "Text Flow native direct input is authoritative for %s",
  /** Checks source GetItemIfSet120false and saved changed-only values. @param state - Native input state. @returns Nothing. */ (
    state,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Input", { layoutSplit: false }),
      input = new SfxItemSet(doc.GetAttrPool(), state === "unknown" ? [[113, 113]] : [[120, 120]]),
      parent = new SfxItemSet(doc.GetAttrPool(), [[120, 120]]);
    parent.Put(new SwFormatLayoutSplit(false));
    input.SetParent(parent);
    if (state === "false" || state === "true") input.Put(new SwFormatLayoutSplit(state === "true"));
    if (state === "invalid") input.InvalidateItem(120);
    if (state === "disabled") input.DisableItem(120);
    if (state === "default") input.SetParent(undefined);
    const page = new SwTextFlowPage(table, undefined, input),
      expected = state !== "false",
      output = new SfxItemSet(doc.GetAttrPool(), [[120, 120]]);
    try {
      expect(page.IsSplit()).toBe(expected);
      expect(page.FillItemSet(output)).toEqual({});
      expect(output.Count()).toBe(0);
      page.SplitHdl_Impl(!expected);
      expect(page.FillItemSet(output)).toEqual({ layoutSplit: !expected });
      expect(output.Get(120)).toBeInstanceOf(SwFormatLayoutSplit);
      expect((output.Get(120) as SwFormatLayoutSplit).GetValue()).toBe(!expected);
      expect(table.GetFormat().layoutSplit).toBe(false);
      page.Reset();
      expect(page.IsSplit()).toBe(expected);
      expect(page.FillItemSet()).toEqual({});
    } finally {
      doc.Dispose();
    }
  },
);
it("native split batches consume only copied descriptors and invalidate represented master position", /** Checks original borrowed values remain intact and native legacy old/new notifications. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Position"),
    frame = new Frame(table),
    owner = table.GetFrameFormat(),
    old = new SwAttrSet(doc.GetAttrPool(), [[120, 120]]),
    next = new SwAttrSet(doc.GetAttrPool(), [[120, 120]]);
  old.Put(new SwFormatLayoutSplit(true));
  next.Put(new SwFormatLayoutSplit(false));
  const previous = new SwAttrSetChg(owner.GetAttrSet(), old),
    accepted = new SwAttrSetChg(owner.GetAttrSet(), next);
  try {
    frame.setFrameAreaPositionValid(true);
    frame.setFrameAreaSizeValid(true);
    frame.setFramePrintAreaValid(true);
    owner.CallSwClientNotify(new AttrSetChangeHint(previous, accepted));
    expect(frame.masks).toEqual([0x40]);
    expect(frame.isFrameAreaPositionValid()).toBe(false);
    expect(frame.isFrameAreaSizeValid()).toBe(true);
    expect(frame.isFramePrintAreaValid()).toBe(true);
    expect(previous.Count()).toBe(1);
    expect(accepted.Count()).toBe(1);
    expect(previous.GetChgSet().Get(120)).toBeInstanceOf(SwFormatLayoutSplit);
    expect(frame.copies[0]?.[0]).not.toBe(previous);
    expect(frame.copies[0]?.[1]).not.toBe(accepted);
    expect(frame.copies[0]?.[0]?.Count()).toBe(0);
    expect(frame.copies[0]?.[1]?.Count()).toBe(0);
    for (const hint of [
      new LegacyModifyHint(undefined, new SwFormatLayoutSplit(false)),
      new LegacyModifyHint(new SwFormatLayoutSplit(false), undefined),
    ]) {
      frame.setFrameAreaPositionValid(true);
      owner.CallSwClientNotify(hint);
      expect(frame.isFrameAreaPositionValid()).toBe(false);
      expect(frame.masks.at(-1)).toBe(0x40);
    }
    expect(frame.IsLayoutSplitAllowed()).toBe(true);
    frame.setFrameAreaPositionValid(true);
    owner.SetFormatAttr(new SwFormatLayoutSplit(false));
    expect(frame.isFrameAreaPositionValid()).toBe(false);
    expect(frame.IsLayoutSplitAllowed()).toBe(false);
  } finally {
    frame.DestroyImpl();
    doc.Dispose();
  }
});
it.each([false, true])(
  "original native effective split controls existing page budget inherited=%s",
  /** Checks actual row owners without changing boundary snapshots or deriving follow identity. @param inherited - Parent item ownership. @returns Nothing. */ (
    inherited,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Pages"),
      owner = inherited ? doc.GetDfltFrameFormat() : table.GetFrameFormat();
    table.AddColumnWidth(4000);
    for (let i = 0; i < 3; i++) doc.nodes.AppendTableRow(table, 1);
    if (inherited) table.GetFrameFormat().SetDerivedFrom(owner);
    const rows = [...table.GetTabLines()],
      nodes = doc.nodes.entries().length,
      page = {
        ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
        width: 6000,
        leftMargin: 100,
        rightMargin: 100,
        height: 1000,
        topMargin: 100,
        bottomMargin: 100,
      },
      before = [
        {
          id: "before",
          lines: [{ start: 0, end: 6, height: 400 }],
          style: "body-text" as const,
          upperSpacing: 0,
          lowerSpacing: 0,
          contextualSpacing: false,
        },
      ],
      input = { table, tableName: "Pages", afterParagraphIndex: 0, rowHeights: [200, 200, 200] };
    /** Reads measured physical ranges on original page owners. @returns Literal source row ranges. */
    function ranges() {
      return createSwPageFrames(before, page, undefined, [input]).map(
        /** Reads actual original table rows. @param p - Native page. @returns First/last source rows. */ (
          p,
        ) =>
          p.tableFrames.map(
            /** Reads actual represented table range. @param f - Native table device. @returns Original row indexes. */ (
              f,
            ) => [f.firstRow, f.lastRow],
          ),
      );
    }
    try {
      owner.SetFormatAttr(new SwFormatLayoutSplit(false));
      expect(ranges()).toEqual([[], [[0, 2]]]);
      expect(table.GetFormat().layoutSplit).toBe(inherited ? undefined : false);
      owner.SetFormatAttr(new SwFormatLayoutSplit(true));
      expect(ranges()).toEqual([[[0, 1]], [[2, 2]]]);
      expect(table.GetTabLines()).toEqual(rows);
      expect(doc.nodes.entries()).toHaveLength(nodes);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    } finally {
      doc.Dispose();
    }
  },
);
