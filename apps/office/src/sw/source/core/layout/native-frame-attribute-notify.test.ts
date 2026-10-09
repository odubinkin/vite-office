/** @fileoverview Verifies native frame attribute dispatch with original items and connected model owners. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrame, SwLayoutFrame, InvalidationType } from "./wsfrm";
import { SwRowFrame, SwCellFrame } from "./tabfrm";
import type { SwFrameFormat } from "./atrfrm";
import { LegacyModifyHint } from "../../../inc/calbck";
import { PrepareHint } from "../../../inc/swtypes";
import { AttrSetChangeHint, SwAttrSetChg } from "../../../inc/hints";
import { SwAttrSet } from "../attr/swatrset";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";

/** Requires an actual native fixture owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native frame fixture owner");
  return value;
}
/** Observes native page/action/preparation calls without a browser adapter. */
class Probe extends SwLayoutFrame {
  public readonly events: unknown[] = [];
  public readonly deltas: unknown[] = [];
  /** Registers the original format. @param format - Native format. @returns Nothing. */
  public constructor(format: SwFrameFormat) {
    super(format);
  }
  /** Records page invalidation before local geometry actions. @returns Nothing. */
  protected override InvalidatePage(): void {
    this.events.push("page");
  }
  /** Records the native action. @param type - Geometry discriminator. @returns Nothing. */
  protected override ActionOnInvalidation(type: InvalidationType): void {
    this.events.push(type);
  }
  /** Records native preparation and preserves base behavior. @param hint - Native discriminator. @returns False for the base. */
  public override Prepare(hint = PrepareHint.Clear): boolean {
    this.events.push(["prepare", hint]);
    return super.Prepare(hint);
  }
  /** Captures exact borrowed items in ascending Which order. @param oldItem - Old item. @param newItem - New item. @param flags - Previous flags. @returns Native accumulated mask. */
  protected override UpdateAttrFrame(
    oldItem: SfxPoolItem | undefined,
    newItem: SfxPoolItem | undefined,
    flags: number,
  ): number {
    this.deltas.push([oldItem, newItem]);
    return super.UpdateAttrFrame(oldItem, newItem, flags);
  }
}
/** Supplies independently valid physical geometry. @param frame - Native frame. @returns Nothing. */
function ready(frame: SwFrame): void {
  frame.setFrameAreaSizeValid(true);
  frame.setFramePrintAreaValid(true);
  frame.setFrameAreaPositionValid(true);
  frame.ResetCompletePaint();
}
/** Reads actual physical state. @param frame - Original frame. @returns Size, print, position, paint flags. */
function state(frame: SwFrame): boolean[] {
  return [
    frame.isFrameAreaSizeValid(),
    frame.isFramePrintAreaValid(),
    frame.isFrameAreaPositionValid(),
    frame.IsCompletePaint(),
  ];
}
/** Builds exact original change descriptors. @param doc - Native pool owner. @param format - Changed owner. @param items - Original incoming items. @returns Borrowed delta hint. */
function delta(
  doc: SwDoc,
  format: SwFrameFormat,
  items: readonly SfxPoolItem[],
): AttrSetChangeHint {
  const oldSet = new SwAttrSet(doc.GetAttrPool(), [[90, 129]]),
    newSet = new SwAttrSet(doc.GetAttrPool(), [[90, 129]]);
  for (const item of items) {
    oldSet.Put(item);
    newSet.Put(item);
  }
  return new AttrSetChangeHint(
    new SwAttrSetChg(format.GetAttrSet(), oldSet),
    new SwAttrSetChg(format.GetAttrSet(), newSet),
  );
}
it.each([92, 93, 94, 99, 113, 117, 90, 109])(
  "native legacy Which%s invalidates the specified physical areas",
  /** Checks literal native mask and action ordering. @param which - Native item identity. @returns Nothing. */ (
    which,
  ) => {
    const doc = new SwDoc(),
      format = doc.MakeTableBoxFormat(),
      frame = new Probe(format);
    const item =
      which === 90
        ? new SwFormatFrameSize(SwFrameSize.Fixed, 300, 400)
        : new SfxUInt16Item(which, 1);
    try {
      ready(frame);
      format.CallSwClientNotify(new LegacyModifyHint(undefined, item));
      expect(state(frame)).toEqual(
        which === 109
          ? [true, true, true, false]
          : which === 117
            ? [true, true, false, false]
            : which === 90
              ? [false, false, true, false]
              : [false, false, true, true],
      );
      expect(frame.events).toEqual(
        which === 109
          ? []
          : which === 117
            ? ["page", InvalidationType.INVALID_POS]
            : [
                ...(which === 113 ? [["prepare", 2]] : []),
                "page",
                InvalidationType.INVALID_PRTAREA,
                InvalidationType.INVALID_SIZE,
              ],
      );
      expect(frame.deltas).toEqual([[undefined, item]]);
      expect(frame.Prepare()).toBe(false);
      expect(frame.events.at(-1)).toEqual(["prepare", 0]);
    } finally {
      frame.DestroyImpl();
    }
  },
);
it("native delta iteration accumulates once, preserves item identities and invalidates the next original sibling", /** Checks ascending direct delta order and complete state. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableBoxFormat(),
    parent = new Probe(doc.MakeTableLineFormat()),
    frame = new Probe(format),
    next = new Probe(doc.MakeTableBoxFormat());
  frame.InsertBehind(parent);
  next.InsertBehind(parent, frame);
  const hint = delta(doc, format, [
    new SfxUInt16Item(117, 1),
    new SvxBoxItem(113),
    new SwFormatFrameSize(SwFrameSize.Minimum, 100, 500),
  ]);
  try {
    ready(frame);
    ready(next);
    format.CallSwClientNotify(hint);
    expect(state(frame)).toEqual([false, false, false, true]);
    expect(state(next)).toEqual([true, true, false, false]);
    expect(frame.events).toEqual([
      ["prepare", 2],
      "page",
      InvalidationType.INVALID_PRTAREA,
      InvalidationType.INVALID_SIZE,
      InvalidationType.INVALID_POS,
    ]);
    expect(next.events).toEqual(["page", InvalidationType.INVALID_POS]);
    const originals = required(hint.m_pNew).GetChgSet().entries();
    expect(frame.deltas).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect((frame.deltas[i] as unknown[])[0]).toBe(
        required(hint.m_pOld).GetChgSet().entries()[i],
      );
      expect((frame.deltas[i] as unknown[])[1]).toBe(originals[i]);
    }
    expect(
      originals.map(
        /** Reads original native identity. @param item - Borrowed delta item. @returns Native Which. */ (
          item,
        ) => item.Which(),
      ),
    ).toEqual([90, 113, 117]);
    frame.events.length = 0;
    next.events.length = 0;
    format.CallSwClientNotify(hint);
    expect(frame.events).toEqual([["prepare", 2], "page"]);
    expect(next.events).toEqual(["page"]);
  } finally {
    parent.DestroyImpl();
  }
});
it("empty and incomplete native deltas retain state, while old items take precedence", /** Checks null, empty and original old-item contracts. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableBoxFormat(),
    frame = new Probe(format),
    item = new SfxUInt16Item(117, 1);
  try {
    ready(frame);
    const empty = delta(doc, format, []);
    for (const hint of [
      new LegacyModifyHint(undefined, undefined),
      empty,
      new AttrSetChangeHint(empty.m_pOld, undefined),
      new AttrSetChangeHint(undefined, empty.m_pNew),
      { kind: "document-state-changed" } as const,
    ])
      format.CallSwClientNotify(hint);
    expect(state(frame)).toEqual([true, true, true, false]);
    expect(frame.events).toEqual([]);
    expect(frame.deltas).toEqual([
      [undefined, undefined],
      [undefined, undefined],
    ]);
    const borrowed = new LegacyModifyHint(item, new SwFormatFrameSize());
    expect(borrowed.GetWhich()).toBe(117);
    expect(new LegacyModifyHint(undefined, item).GetWhich()).toBe(117);
    expect(new LegacyModifyHint(undefined, undefined).GetWhich()).toBe(0);
    format.CallSwClientNotify(borrowed);
    expect(state(frame)).toEqual([true, true, false, false]);
    ready(frame);
    format.CallSwClientNotify({ kind: "format-inheritance-changed", formatId: format.GetName() });
    expect(state(frame)).toEqual([false, false, false, true]);
    ready(frame);
    format.RunNotificationTransaction(
      /** Emits original hints through the existing transaction. @returns Nothing. */ () => {
        format.CallSwClientNotify(new LegacyModifyHint(undefined, item));
        format.CallSwClientNotify({ kind: "document-state-changed" });
      },
    );
    expect(state(frame)).toEqual([true, true, false, false]);
  } finally {
    frame.DestroyImpl();
  }
});
/** Observes row forwarding without replacing the native handler. */
class RowProbe extends SwRowFrame {
  public readonly selected: SfxPoolItem[] = [];
  /** Records the exact forwarded item. @param item - Original accepted item. @returns Nothing. */
  protected override OnFrameSize(item: SfxPoolItem): void {
    this.selected.push(item);
    super.OnFrameSize(item);
  }
}
it("row callbacks prioritize frame size over split and suppress unrelated legacy items", /** Checks actual native row dispatch and lower invalidation. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("NativeDeltas");
  table.AddColumnWidth(3000);
  const line = doc.nodes.AppendTableRow(table, 1),
    row = new RowProbe(line),
    peer = new RowProbe(line),
    format = line.GetFrameFormat();
  const hint = delta(doc, format, [
    new SvxBoxItem(113),
    new SwFormatRowSplit(false),
    new SwFormatFrameSize(SwFrameSize.Minimum, 0, 800),
  ]);
  try {
    ready(row);
    ready(peer);
    ready(required(row.Lower()));
    format.CallSwClientNotify(hint);
    expect(row.selected).toEqual([required(hint.m_pNew).GetChgSet().GetItemIfSet(90, false)]);
    expect(row.selected[0]).toBe(peer.selected[0]);
    expect(state(row)).toEqual([false, false, true, false]);
    expect(state(required(row.Lower()))).toEqual([false, false, true, false]);
    ready(row);
    const split = delta(doc, format, [new SvxBoxItem(113), new SwFormatRowSplit(false)]);
    format.CallSwClientNotify(split);
    expect(row.selected.at(-1)).toBe(required(split.m_pNew).GetChgSet().GetItemIfSet(129, false));
    expect(state(row)).toEqual([true, true, true, false]);
    for (const hint of [
      new LegacyModifyHint(undefined, new SvxBoxItem(113)),
      { kind: "format-inheritance-changed", formatId: format.GetName() } as const,
      { kind: "document-state-changed" } as const,
    ])
      format.CallSwClientNotify(hint);
    expect(state(row)).toEqual([true, true, true, false]);
    format.CallSwClientNotify(new LegacyModifyHint(undefined, new SwFormatRowSplit(false)));
    expect(state(row)).toEqual([true, true, true, false]);
    format.CallSwClientNotify(new LegacyModifyHint(undefined, new SwFormatFrameSize()));
    expect(state(row)).toEqual([false, false, true, false]);
    ready(row);
    format.CallSwClientNotify(new LegacyModifyHint(new SvxBoxItem(113), undefined));
    expect(state(row)).toEqual([false, false, true, true]);
    ready(row);
    format.CallSwClientNotify(new AttrSetChangeHint(hint.m_pOld, undefined));
    expect(state(row)).toEqual([true, true, true, false]);
    format.CallSwClientNotify(delta(doc, format, [new SvxBoxItem(113)]));
    expect(state(row)).toEqual([false, false, true, true]);
  } finally {
    row.Dispose();
    peer.Dispose();
  }
});
it("real shared cell attributes invalidate print areas, preserve locks and refresh inherited/reset values", /** Exercises actual model mutation over original physical clients. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Cells");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const line = doc.nodes.AppendTableRow(table, 2),
    box = required(line.GetTabBoxes()[0]),
    sibling = required(line.GetTabBoxes()[1]);
  sibling.ChgFrameFormat(box.GetFrameFormat());
  const frame = new SwCellFrame(box),
    peer = new SwCellFrame(sibling),
    format = box.GetFrameFormat();
  try {
    for (const f of [frame, peer]) ready(f);
    expect(format.SetFormatAttr(new SwFormatVertOrient(600, 3, 7))).toBe(true);
    for (const f of [frame, peer]) expect(state(f)).toEqual([true, false, true, true]);
    ready(frame);
    expect(format.SetFormatAttr(new SwFormatVertOrient(600, 3, 7))).toBe(false);
    expect(state(frame)).toEqual([true, true, true, false]);
    format.LockModify();
    expect(format.SetFormatAttr(new SwFormatVertOrient(700, 3, 7))).toBe(true);
    format.UnlockModify();
    expect(state(frame)).toEqual([true, true, true, false]);
    expect(format.ResetFormatAttr(109)).toBe(true);
    expect(state(frame)).toEqual([true, false, true, true]);
    ready(frame);
    format.CallSwClientNotify(new LegacyModifyHint(undefined, new SwFormatVertOrient()));
    expect(state(frame)).toEqual([true, false, true, true]);
    ready(frame);
    format.CallSwClientNotify(new LegacyModifyHint(new SwFormatVertOrient(), undefined));
    expect(state(frame)).toEqual([true, true, true, false]);
    const parent = doc.MakeTableBoxFormat();
    format.SetDerivedFrom(parent);
    ready(frame);
    parent.SetFormatAttr(new SwFormatVertOrient(800, 2, 7));
    expect(state(frame)).toEqual([true, false, true, true]);
    format.SetFormatAttr(new SwFormatVertOrient(900, 3, 7));
    ready(frame);
    parent.SetFormatAttr(new SwFormatVertOrient(1000, 2, 7));
    expect(state(frame)).toEqual([true, true, true, false]);
    format.RunNotificationTransaction(
      /** Delivers original cell hints atomically. @returns Nothing. */ () => {
        format.CallSwClientNotify(new LegacyModifyHint(undefined, new SwFormatVertOrient()));
        format.CallSwClientNotify({ kind: "document-state-changed" });
      },
    );
    expect(state(frame)).toEqual([true, false, true, true]);
  } finally {
    frame.Dispose();
    peer.Dispose();
  }
});
