/** @fileoverview Native item intersection, DelDiffs, page copying/changing and lossless page pool transport prerequisites for CSS page breaks. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SwClient } from "../../../inc/calbck";
import { AttrSetChangeHint } from "../../../inc/hints";
import { SwPageDesc, UseOnPage } from "../layout/pagedesc";
import { SwAttrSet } from "../attr/swatrset";
import { SfxItemSet, SfxItemState as S } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import {
  RES_BREAK,
  RES_KEEP,
  RES_LR_SPACE,
  RES_UL_SPACE,
  RES_BACKGROUND,
} from "../../../inc/hintids";
import { SvxLRSpaceItem, SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { Color } from "../../../../tools/inc/color";
import {
  encodePageFormats,
  restorePageFormats,
} from "../../../browser/filter/xml/writer-page-format-codec";
const docs: SwDoc[] = [];
it("broadcasts original DelDiffs effective changes only when modify is unlocked", /** Actual registered clients observe direct-to-default old/new values; locking suppresses notification without suppressing mutation. @returns Nothing. */ () => {
  const doc = document(),
    frame = doc.GetPageDesc().GetMaster();
  frame.ResetAllFormatAttr();
  frame.SetFormatAttr(new SfxBoolItem(RES_KEEP, true));
  frame.SetFormatAttr(new SfxInt16Item(RES_BREAK, 4));
  const items = new SfxItemSet(doc.GetAttrPool(), frame.GetAttrSet().GetRanges()),
    changes: boolean[][] = [];
  items.Put(new SfxInt16Item(RES_BREAK, 5));
  const client = new SwClient(
    /** Inspects the actual synchronous native delta. @param source - Emitting owner. @param hint - Original hint. @returns Nothing. */
    (source, hint) => {
      expect(source).toBe(frame);
      if (!(hint instanceof AttrSetChangeHint)) return;
      assert(hint.m_pOld && hint.m_pNew);
      changes.push([
        (hint.m_pOld.GetChgSet().Get(RES_KEEP) as SfxBoolItem).GetValue(),
        (hint.m_pNew.GetChgSet().Get(RES_KEEP) as SfxBoolItem).GetValue(),
      ]);
    },
  );
  client.RegisterToModify(frame);
  try {
    frame.DelDiffs(items);
    expect(changes).toEqual([[true, false]]);
    frame.LockModify();
    try {
      frame.SetFormatAttr(new SfxBoolItem(RES_KEEP, true));
      frame.DelDiffs(items);
    } finally {
      frame.UnlockModify();
    }
    expect(changes).toEqual([[true, false]]);
    expect(frame.GetAttrSet().GetItemIfSet(RES_KEEP, false)).toBeUndefined();
  } finally {
    client.EndListeningAll();
    items.Dispose();
  }
});
afterEach(
  /** Releases document ownership. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Constructs an actual native owner. @returns Document. */
function document(): SwDoc {
  const doc = new SwDoc();
  docs.push(doc);
  return doc;
}
it("intersects local identities without copying values or counting inherited values", /** Real native sets retain invalid/disabled identities and keep the destination's original value. @returns Nothing. */ () => {
  const pool = document().GetAttrPool(),
    ranges = [[RES_LR_SPACE, RES_KEEP]] as const;
  const parent = new SfxItemSet(pool, ranges),
    left = new SfxItemSet(pool, ranges),
    right = new SfxItemSet(pool, ranges);
  try {
    left.Put(new SfxInt16Item(RES_BREAK, 4));
    left.Put(new SfxBoolItem(RES_KEEP, true));
    right.Put(new SfxInt16Item(RES_BREAK, 5));
    parent.Put(new SfxBoolItem(RES_KEEP, true));
    right.SetParent(parent);
    left.Intersect(right);
    expect((left.Get(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
    expect(left.GetItemState(RES_KEEP, false)).toBe(S.DEFAULT);
    left.InvalidateItem(RES_KEEP);
    right.DisableItem(RES_KEEP);
    left.Intersect(right);
    expect(left.GetItemState(RES_KEEP, false)).toBe(S.INVALID);
    left.Intersect(left);
    expect(left.Count()).toBe(2);
    right.ClearItem();
    left.Intersect(right);
    expect(left.Count()).toBe(0);
  } finally {
    right.Dispose();
    left.Dispose();
    parent.Dispose();
  }
});
it("collects original Intersect_BC old/new effective values and clears its receiver borrows", /** The native result is the new receiver count; a following unrelated write must not append to those receivers. @returns Nothing. */ () => {
  const doc = document(),
    pool = doc.GetAttrPool(),
    ranges = [[RES_BREAK, RES_KEEP]] as const;
  const set = new SwAttrSet(pool, ranges),
    other = new SfxItemSet(pool, ranges),
    old = new SwAttrSet(pool, ranges),
    next = new SwAttrSet(pool, ranges);
  try {
    set.Put(new SfxBoolItem(RES_KEEP, true));
    expect(set.Intersect_BC(other, old, next)).toBe(1);
    expect((old.Get(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
    expect((next.Get(RES_KEEP) as SfxBoolItem).GetValue()).toBe(false);
    set.Put(new SfxInt16Item(RES_BREAK, 4));
    expect([old.Count(), next.Count()]).toEqual([1, 1]);
    expect(set.Intersect_BC(other, old)).toBe(2);
  } finally {
    set.Dispose();
    other.Dispose();
    old.Dispose();
    next.Dispose();
  }
});
it("uses DelDiffs in locked and normal format paths before applying source values", /** Intersection deletes missing identities but keeps a differing existing value until SetFormatAttrSet. @returns Nothing. */ () => {
  const doc = document(),
    frame = doc.GetPageDesc().GetMaster(),
    items = new SfxItemSet(doc.GetAttrPool(), frame.GetAttrSet().GetRanges());
  try {
    frame.SetFormatAttr(new SfxBoolItem(RES_KEEP, true));
    frame.SetFormatAttr(new SfxInt16Item(RES_BREAK, 4));
    items.Put(new SfxInt16Item(RES_BREAK, 5));
    frame.DelDiffs(items);
    expect(frame.GetAttrSet().GetItemIfSet(RES_KEEP, false)).toBeUndefined();
    expect((frame.GetAttrSet().Get(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
    frame.SetFormatAttrSet(items);
    expect((frame.GetAttrSet().Get(RES_BREAK) as SfxInt16Item).GetValue()).toBe(5);
    const empty = new SfxItemSet(doc.GetAttrPool(), frame.GetAttrSet().GetRanges());
    frame.LockModify();
    try {
      frame.DelDiffs(empty);
    } finally {
      frame.UnlockModify();
      empty.Dispose();
    }
    expect(frame.GetAttrSet().Count()).toBe(0);
  } finally {
    items.Dispose();
  }
});
it("copies four independent frame sets while preserving target identity and the native source-self-follow omission", /** Source self-follow does not reset an existing destination follow; false preserves the destination pool ID. @returns Nothing. */ () => {
  const doc = document(),
    source = doc.MakePageDesc("source"),
    target = doc.MakePageDesc("target"),
    follow = doc.MakePageDesc("follow");
  source.SetPoolFormatId(P.PAGE_HTML);
  target.SetPoolFormatId(P.PAGE_LEFT);
  target.SetFollow(follow);
  const originals = [
    source.GetMaster(),
    source.GetLeft(),
    source.GetFirstMaster(),
    source.GetFirstLeft(),
  ];
  originals.forEach(
    /** Gives all four source owners distinct direct spacing. @param frame - Frame. @param index - Source order. @returns Nothing. */
    (frame, index) => frame.SetFormatAttr(new SvxULSpaceItem(10 + index, 20 + index, RES_UL_SPACE)),
  );
  target.GetMaster().SetFormatAttr(new SfxBoolItem(RES_KEEP, true));
  doc.CopyPageDesc(source, target, false);
  expect(target.GetName()).toBe("target");
  expect(target.GetPoolFormatId()).toBe(P.PAGE_LEFT);
  expect(target.GetFollow()).toBe(follow);
  expect(target.GetMaster().GetAttrSet().GetItemIfSet(RES_KEEP, false)).toBeUndefined();
  expect(
    [target.GetMaster(), target.GetLeft(), target.GetFirstMaster(), target.GetFirstLeft()].map(
      /** Reads actual independent copied frame values. @param frame - Frame. @returns Upper spacing. */
      (frame) => frame.GetULSpace().GetUpper(),
    ),
  ).toEqual([10, 11, 12, 13]);
  doc.CopyPageDesc(source, target);
  expect(target.GetPoolFormatId()).toBe(P.PAGE_HTML);
});
it("rebases copied follow graphs into the destination document, including mutual cycles", /** Original CopyPageDesc looks up destination owners by name before recursive creation. @returns Nothing. */ () => {
  const source = document(),
    target = document(),
    a = source.MakePageDesc("a"),
    b = source.MakePageDesc("b"),
    destination = target.MakePageDesc("a");
  a.SetFollow(b);
  b.SetFollow(a);
  target.CopyPageDesc(a, destination);
  const copied = target.FindPageDesc("b");
  assert(copied);
  expect(destination.GetFollow()).toBe(copied);
  expect(copied.GetFollow()).toBe(destination);
  expect(copied).not.toBe(b);
});
it("keeps MakePageDesc's copied source follow and resets pool ID for a new name", /** Native copy construction differs from the explicit browser Clone rebasing helper. @returns Nothing. */ () => {
  const doc = document(),
    source = doc.GetPageDesc(),
    copied = doc.MakePageDesc("copied", source);
  expect(copied.GetFollow()).toBe(source);
  expect(copied.GetPoolFormatId()).toBe(P.UNKNOWN);
  const position: [number] = [99];
  expect(doc.ContainsPageDesc(copied, position)).toBe(true);
  expect(position[0]).toBe(1);
  expect(doc.ContainsPageDesc(undefined, position)).toBe(false);
  expect(position[0]).toBe(1);
});
it("applies the native change table and mutates the supplied copy's left/first frames", /** Paragraph KEEP and brush are excluded from lcl_DescSetAttr; page geometry and pool identities are copied. @returns Nothing. */ () => {
  const doc = document(),
    page = doc.MakePageDesc("page"),
    changed = new SwPageDesc(page);
  try {
    changed.SetPoolFormatId(P.PAGE_FIRST);
    changed.SetFollow(doc.GetPageDesc());
    changed.GetMaster().SetFormatAttr(new SvxULSpaceItem(100, 200, RES_UL_SPACE));
    changed.GetLeft().SetFormatAttr(new SvxULSpaceItem(300, 400, RES_UL_SPACE));
    changed.GetMaster().SetFormatAttr(new SfxBoolItem(RES_KEEP, true));
    changed.GetMaster().SetFormatAttr(new SvxBrushItem(new Color(0xff0000), RES_BACKGROUND));
    doc.ChgPageDesc(1, changed);
    expect(page.GetFollow()).toBe(doc.GetPageDesc());
    expect(page.GetPoolFormatId()).toBe(P.PAGE_FIRST);
    expect(changed.GetLeft().GetULSpace().GetUpper()).toBe(100);
    expect(page.GetFirstLeft().GetULSpace().GetUpper()).toBe(100);
    expect(page.GetMaster().GetAttrSet().GetItemIfSet(RES_KEEP, false)).toBeUndefined();
    expect(page.GetMaster().GetAttrSet().GetItemIfSet(RES_BACKGROUND, false)).toBeUndefined();
  } finally {
    changed.DisposeModify();
  }
});
it("mirrors original margin measures and the source gutter field into left before native change", /** Source Mirror constructs a fresh LR item and writes the original left gutter into the right gutter. @returns Nothing. */ () => {
  const doc = document(),
    page = doc.GetPageDesc(),
    changed = new SwPageDesc(page),
    lr = new SvxLRSpaceItem(RES_LR_SPACE);
  try {
    lr.SetLeft(SvxIndentValue.twips(100));
    lr.SetRight(SvxIndentValue.twips(200));
    lr.SetGutterMargin(30);
    changed.GetMaster().SetFormatAttr(lr);
    changed.SetUseOn(UseOnPage.Mirror);
    doc.ChgPageDesc(0, changed);
    const left = page.GetLeft().GetLRSpace();
    expect([left.ResolveLeft(), left.ResolveRight(), left.GetRightGutterMargin()]).toEqual([
      200, 100, 30,
    ]);
  } finally {
    lr.Dispose();
    changed.DisposeModify();
  }
});
it.each([
  [1, 2],
  [-1, 2, 3, 4],
  [1.5, 2, 3, 4],
  [1, 2, 3, 65536],
  [1, 2, "3", 4],
])(
  "rejects malformed page-frame pool IDs %j",
  /** Worker metadata validates the complete four-ID domain before assigning native IDs. @param ids - Invalid boundary data. @returns Nothing. */
  (...ids) => {
    const page = document().GetPageDesc(),
      record = encodePageFormats(page);
    expect(
      /** Uses the actual host decoder. @returns Native restoration. */
      () => restorePageFormats(page, { ...record, poolIds: ids }),
    ).toThrow("pool identities");
  },
);
