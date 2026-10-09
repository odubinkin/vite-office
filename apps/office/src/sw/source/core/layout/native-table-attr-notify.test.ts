/** @fileoverview Verifies native table masks, copied delta consumption and original flat sibling reactions. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrame, SwLayoutFrame } from "./wsfrm";
import { SwTabFrame, SwTabFrameInvFlags } from "./tabfrm";
import type { SwTable } from "../table/swtable";
import type { SwModify } from "../../../inc/calbck";
import { LegacyModifyHint } from "../../../inc/calbck";
import { AttrSetChangeHint, SwAttrSetChg, SwFormatChangeHint } from "../../../inc/hints";
import { SwAttrSet } from "../attr/swatrset";
import type { SwFrameFormat } from "./atrfrm";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { RES_BOX, RES_COLLAPSING_BORDERS, RES_UL_SPACE } from "../../../inc/hintids";
/** Requires a supplied native descriptor. @param value - Optional descriptor. @returns Original descriptor. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native descriptor");
  return value;
}
/** Observes native processing with original clients, never a model mirror. */
class Table extends SwTabFrame {
  public readonly generic: (readonly [SfxPoolItem | undefined, SfxPoolItem | undefined])[] = [];
  public readonly tableMasks: number[] = [];
  public readonly copies: (readonly [SwAttrSetChg | undefined, SwAttrSetChg | undefined])[] = [];
  /** Registers an original table. @param table - Native owner. @returns Nothing. */
  public constructor(table: SwTable) {
    super(table);
  }
  /** Captures forwarding to the native generic frame. @param oldItem - Borrowed old item. @param newItem - Borrowed new item. @param flags - Generic mask. @returns Generic mask. */
  protected override UpdateAttrFrame(
    oldItem: SfxPoolItem | undefined,
    newItem: SfxPoolItem | undefined,
    flags: number,
  ): number {
    this.generic.push([oldItem, newItem]);
    return super.UpdateAttrFrame(oldItem, newItem, flags);
  }
  /** Captures native copied descriptors and resulting masks. @param oldItem - Borrowed old item. @param newItem - Borrowed new item. @param flags - Table mask. @param oldSet - Optional copy. @param newSet - Optional copy. @returns Table mask. */
  protected override UpdateAttr_(
    oldItem: SfxPoolItem | undefined,
    newItem: SfxPoolItem | undefined,
    flags: SwTabFrameInvFlags,
    oldSet?: SwAttrSetChg,
    newSet?: SwAttrSetChg,
  ): SwTabFrameInvFlags {
    this.copies.push([oldSet, newSet]);
    const result = super.UpdateAttr_(oldItem, newItem, flags, oldSet, newSet);
    this.tableMasks.push(result);
    return result;
  }
  /** Applies the native optional descriptor contract directly. @param oldItem - Borrowed old item. @param newItem - Borrowed new item. @param oldSet - Optional copied descriptor. @param newSet - Optional copied descriptor. @returns Table mask. */
  public update(
    oldItem: SfxPoolItem | undefined,
    newItem: SfxPoolItem | undefined,
    oldSet?: SwAttrSetChg,
    newSet?: SwAttrSetChg,
  ): SwTabFrameInvFlags {
    return this.UpdateAttr_(oldItem, newItem, SwTabFrameInvFlags.NONE, oldSet, newSet);
  }
  /** Keeps native source registration observable. @returns Original owner. */
  public owner(): SwModify {
    return this.GetFormat();
  }
}
/** Original flat sibling layout. */
class Layout extends SwLayoutFrame {
  /** Registers the actual format. @param format - Original owner. @returns Nothing. */
  public constructor(format: SwFrameFormat) {
    super(format);
  }
}
/** Supplies valid original geometry without deriving values from implementation. @param frame - Native owner. @returns Nothing. */
function ready(frame: SwFrame): void {
  frame.setFrameAreaSizeValid(true);
  frame.setFramePrintAreaValid(true);
  frame.setFrameAreaPositionValid(true);
  frame.ResetCompletePaint();
}
/** Reads independent original geometry. @param frame - Actual owner. @returns Size, print, position, paint. */
function state(frame: SwFrame): boolean[] {
  return [
    frame.isFrameAreaSizeValid(),
    frame.isFramePrintAreaValid(),
    frame.isFrameAreaPositionValid(),
    frame.IsCompletePaint(),
  ];
}
/** Constructs an original native table and optional flat siblings. @param siblings - Whether linked. @returns Actual owners. */
function fixture(siblings = true) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("NativeTableDelta"),
    parent = new Layout(doc.MakeTableLineFormat()),
    prev = new Layout(doc.MakeTableLineFormat()),
    next = new Layout(doc.MakeTableLineFormat());
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 1);
  const frame = new Table(table),
    owner = table.GetFrameFormat();
  if (siblings) {
    prev.InsertBehind(parent, undefined);
    frame.InsertBehind(parent, prev);
    next.InsertBehind(parent, frame);
  }
  for (const f of [prev, frame, next]) ready(f);
  return { doc, table, parent, prev, next, frame, owner };
}
/** Releases all original represented registrations. @param f - Native fixture. @returns Nothing. */
function close(f: ReturnType<typeof fixture>): void {
  f.parent.DestroyImpl();
  f.frame.DestroyImpl();
  f.prev.DestroyImpl();
  f.next.DestroyImpl();
}
/** Creates exact borrowed descriptors and independently cloned items. @param f - Original fixture. @param items - Supplied native values. @returns Original hint. */
function delta(f: ReturnType<typeof fixture>, items: readonly SfxPoolItem[]): AttrSetChangeHint {
  const oldSet = new SwAttrSet(f.doc.GetAttrPool(), [[90, 132]]),
    newSet = new SwAttrSet(f.doc.GetAttrPool(), [[90, 132]]);
  for (const item of items) {
    oldSet.Put(item);
    newSet.Put(item);
  }
  return new AttrSetChangeHint(
    new SwAttrSetChg(f.owner.GetAttrSet(), oldSet),
    new SwAttrSetChg(f.owner.GetAttrSet(), newSet),
  );
}
it.each([90, 110, 101, 132, 99, 113, 117, 0])(
  "legacy table Which%s uses native mask and exact admission",
  /** Checks literal masks and original sibling state. @param which - Native WhichId. @returns Nothing. */ (
    which,
  ) => {
    const f = fixture(),
      item =
        which === 90
          ? new SwFormatFrameSize(SwFrameSize.Fixed, 3000, 600)
          : which === 132
            ? new SfxBoolItem(132, true)
            : new SfxUInt16Item(which, 1);
    try {
      f.owner.CallSwClientNotify(new LegacyModifyHint(undefined, item));
      expect(f.frame.tableMasks).toEqual([
        which === 90 || which === 110
          ? 0x22
          : which === 101
            ? 0xc0
            : which === 132
              ? 0x02
              : which === 99
                ? 0x1c
                : 0,
      ]);
      expect(state(f.frame)).toEqual(
        which === 90
          ? [false, false, true, false]
          : which === 110
            ? [true, false, true, false]
            : which === 101
              ? [true, true, false, false]
              : which === 132
                ? [false, false, true, true]
                : [true, true, true, false],
      );
      expect(state(f.prev)).toEqual(
        which === 99 ? [true, false, true, false] : [true, true, true, false],
      );
      expect(state(f.next)).toEqual(
        which === 99
          ? [true, false, true, true]
          : which === 90 || which === 101
            ? [true, true, false, false]
            : [true, true, true, false],
      );
      expect(f.frame.generic).toEqual(
        [90, 110, 101, 132].includes(which) ? [[undefined, item]] : [],
      );
      expect(f.frame.owner()).toBe(f.owner);
    } finally {
      close(f);
    }
  },
);
it("copied table deltas consume handled items and preserve original borrowed descriptors", /** Checks residual generic items, copies and original identity. @returns Nothing. */ () => {
  const f = fixture(),
    hint = delta(f, [
      new SwFormatFrameSize(SwFrameSize.Fixed, 3000, 600),
      new SvxULSpaceItem(60, 90, RES_UL_SPACE),
      new SvxBoxItem(RES_BOX),
      new SfxBoolItem(RES_COLLAPSING_BORDERS, true),
    ]),
    old = required(hint.m_pOld),
    next = required(hint.m_pNew),
    oldItems = old.GetChgSet().entries(),
    newItems = next.GetChgSet().entries();
  try {
    f.owner.CallSwClientNotify(hint);
    expect(old.Count()).toBe(4);
    expect(next.Count()).toBe(4);
    expect(old.GetChgSet().entries()).toEqual(oldItems);
    expect(next.GetChgSet().entries()).toEqual(newItems);
    for (const [copyOld, copyNew] of f.frame.copies) {
      expect(copyOld).not.toBe(old);
      expect(copyNew).not.toBe(next);
      expect(copyOld?.GetTheChgdSet()).toBe(f.owner.GetAttrSet());
      expect(copyNew?.GetTheChgdSet()).toBe(f.owner.GetAttrSet());
      expect(
        copyOld
          ?.GetChgSet()
          .entries()
          .map(
            /** Reads original native identity. @param item - Native pool item. @returns WhichId. */ (
              item,
            ) => item.Which(),
          ),
      ).toEqual([99, 113]);
      expect(
        copyNew
          ?.GetChgSet()
          .entries()
          .map(
            /** Reads original native identity. @param item - Native pool item. @returns WhichId. */ (
              item,
            ) => item.Which(),
          ),
      ).toEqual([99, 113]);
    }
    expect(
      f.frame.generic.map(
        /** Reads a forwarded pair. @param pair - Borrowed values. @returns Which identities. */ (
          pair,
        ) =>
          pair.map(
            /** Reads one native identity. @param item - Optional pool item. @returns WhichId. */ (
              item,
            ) => item?.Which(),
          ),
      ),
    ).toEqual([
      [99, 99],
      [113, 113],
    ]);
    expect(f.frame.generic[0]?.[0]).not.toBe(oldItems[1]);
    expect(state(f.frame)).toEqual([false, false, true, true]);
    expect(state(f.prev)).toEqual([true, false, true, false]);
    expect(state(f.next)).toEqual([true, false, true, true]);
    expect(f.frame.tableMasks).toEqual([0x22, 0x3e, 0x3e, 0x3e]);
    expect((f.owner.GetAttrSet().Get(RES_COLLAPSING_BORDERS) as SfxBoolItem).GetValue()).toBe(
      false,
    );
  } finally {
    close(f);
  }
});
it("handled-only size batches bypass generic size and next-position reactions", /** Checks actual native broadcasts rather than borrowed legacy simulation. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.owner.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 4500, 700));
    expect(state(f.frame)).toEqual([true, false, true, false]);
    expect(state(f.next)).toEqual([true, true, true, false]);
    expect(f.frame.generic).toEqual([]);
    expect(f.frame.tableMasks).toEqual([0x22]);
    expect(f.frame.copies[0]?.[0]?.Count()).toBe(0);
    expect(f.frame.copies[0]?.[1]?.Count()).toBe(0);
    expect(f.table.GetFrameFormat()).toBe(f.owner);
  } finally {
    close(f);
  }
});
it("old-before-new Which and separately copied descriptors retain native clearing ownership", /** Checks native helper optional-copy and asymmetric Which contracts. @returns Nothing. */ () => {
  const f = fixture(false),
    oldItem = new SfxBoolItem(132, true),
    newItem = new SwFormatFrameSize(SwFrameSize.Fixed, 3000, 600);
  try {
    const h = delta(f, [oldItem, newItem]);
    const old = new SwAttrSetChg(required(h.m_pOld)),
      next = new SwAttrSetChg(required(h.m_pNew));
    expect(f.frame.update(oldItem, newItem, old)).toBe(0x02);
    expect(old.Count()).toBe(1);
    expect(h.m_pOld?.Count()).toBe(2);
    expect(f.frame.update(oldItem, newItem, undefined, next)).toBe(0x02);
    expect(next.Count()).toBe(1);
    expect(h.m_pNew?.Count()).toBe(2);
    expect(f.frame.update(undefined, undefined)).toBe(0);
    f.owner.CallSwClientNotify(new LegacyModifyHint(new SfxUInt16Item(117, 1), oldItem));
    expect(f.frame.tableMasks.at(-1)).toBe(0);
    expect(f.frame.generic).toEqual([]);
  } finally {
    close(f);
  }
});
it("empty unpaired transaction and unrelated format hints preserve native table admission", /** Checks original lifecycle hints and absent flat siblings without invented follow/root state. @returns Nothing. */ () => {
  const f = fixture(false),
    h = delta(f, []);
  try {
    f.owner.CallSwClientNotify(new SwFormatChangeHint(f.owner, f.owner));
    f.owner.CallSwClientNotify({ kind: "format-inheritance-changed", formatId: f.owner.GetName() });
    f.owner.CallSwClientNotify(new AttrSetChangeHint(h.m_pOld, undefined));
    f.owner.CallSwClientNotify(new AttrSetChangeHint(undefined, h.m_pNew));
    f.owner.CallSwClientNotify(h);
    expect(f.frame.generic).toEqual([]);
    const breakItem = new SfxUInt16Item(101, 1);
    f.owner.Broadcast({
      kind: "model-transaction",
      hints: [
        new LegacyModifyHint(undefined, new SfxUInt16Item(99, 1)),
        new LegacyModifyHint(undefined, breakItem),
      ],
    });
    expect(state(f.frame)).toEqual([true, true, false, false]);
    expect(f.frame.generic).toEqual([[undefined, breakItem]]);
    expect(f.frame.GetNext()).toBeUndefined();
    expect(f.frame.GetPrev()).toBeUndefined();
  } finally {
    close(f);
  }
});
it("residual-only batch forwards copy values while legacy default does not", /** Checks source default bClear=false and retained copy behavior. @returns Nothing. */ () => {
  const f = fixture(false);
  try {
    f.owner.CallSwClientNotify(delta(f, [new SvxBoxItem(113)]));
    expect(state(f.frame)).toEqual([false, false, true, true]);
    expect(f.frame.generic).toHaveLength(1);
    ready(f.frame);
    f.owner.CallSwClientNotify(new LegacyModifyHint(new SvxBoxItem(113), undefined));
    expect(state(f.frame)).toEqual([true, true, true, false]);
    expect(f.frame.generic).toHaveLength(1);
    expect(
      Object.values(SwTabFrameInvFlags).filter(
        /** Selects native numeric mask values. @param v - Enum member. @returns Whether numeric. */ (
          v,
        ) => typeof v === "number",
      ),
    ).toEqual([0, 2, 4, 8, 16, 32, 64, 128]);
  } finally {
    close(f);
  }
});
