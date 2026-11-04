/** @fileoverview Native UNO absolute correction branch over actual weak/shared cursor owners, physical position rings and section boundaries. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "./doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { CorrectUnoCursorsAbsolute, lcl_FindUnoCursorSection } from "./doccorr";
import { SwUnoTableCursor, UnoCursorPointer } from "../../../inc/unocrsr";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwXText } from "../unocore/unotext";
import { SwXTextCursor } from "../unocore/unoobj";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { SfxHintId } from "../../../../svl/inc/hint";
/** Requires an actual fixture owner without inventing fallback nodes. @param value - Actual optional owner. @returns Checked owner. */
function present<T>(value: T | undefined): T {
  assert(value !== undefined);
  return value;
}
/** Builds actual body/cell sections and owns test operand positions. @returns Native document fixture. */
function fixture() {
  const doc = new SwDoc(),
    body = present(doc.paragraphs[0]);
  body.SetText("abcdef");
  const table = doc.nodes.MakeTableNode("correction");
  const line = doc.nodes.AppendTableRow(table, 2);
  const first = present(line.GetTabBoxes()[0]).GetStartNode();
  const second = present(line.GetTabBoxes()[1]).GetStartNode();
  const one = doc.nodes.at(first.GetIndex() + 1),
    two = doc.nodes.at(second.GetIndex() + 1);
  assert(one instanceof SwTextNode);
  assert(two instanceof SwTextNode);
  one.SetText("abcdef");
  two.SetText("uvwxyz");
  const positions: SwPosition[] = [];
  return {
    doc,
    body,
    one,
    two,
    first,
    second,
    /** Owns a native operand snapshot. @param node - Actual node. @param offset - Actual content offset. @returns Position. */
    at(node: SwTextNode, offset = 0) {
      const p = new SwPosition(node, offset);
      positions.push(p);
      return p;
    },
    /** Releases snapshots after actual cursor owners. @returns Nothing. */
    close() {
      for (const p of positions) p.Dispose();
      doc.Dispose();
    },
  };
}
it("finds the actual fixed section for content, start and end nodes", /** No transparent section type is represented by the current node model. @returns Nothing. */ () => {
  const f = fixture();
  expect(lcl_FindUnoCursorSection(f.one)).toBe(f.first);
  expect(lcl_FindUnoCursorSection(f.first)).toBe(f.first);
  expect(lcl_FindUnoCursorSection(f.first.EndOfSectionNode())).toBe(f.first);
  expect(lcl_FindUnoCursorSection(f.body)).toBe(f.body.StartOfSectionNode());
  f.close();
});
it.each([1, 2, 3])(
  "corrects native closed interval endpoints at offset%s without section invalidation",
  /** Uses actual cursor point/mark aliases. @param offset - Original inclusive offset. @returns Nothing. */ (
    offset,
  ) => {
    const f = fixture(),
      held = f.doc.CreateUnoCursor(f.at(f.one, offset));
    const cursor = present(held.get()),
      pointer = new UnoCursorPointer(held);
    cursor.SetMark();
    cursor.GetMark().Assign(f.one, 5);
    const broadcast = vi.spyOn(cursor.m_aNotifier, "Broadcast");
    CorrectUnoCursorsAbsolute(f.doc, f.at(f.one, 1), f.at(f.one, 3), f.at(f.one, 0));
    expect(cursor.GetPoint().GetContentIndex()).toBe(0);
    expect(cursor.GetMark().GetContentIndex()).toBe(5);
    expect(pointer.get()).toBe(cursor);
    expect(broadcast).not.toHaveBeenCalled();
    broadcast.mockRestore();
    pointer.Dispose();
    held.reset();
    f.close();
  },
);
it("corrects every physical bound of every ordinary ring member after an earlier match", /** Preserves non-short-circuit ring traversal and bound identity. @returns Nothing. */ () => {
  const f = fixture(),
    held = f.doc.CreateUnoCursor(f.at(f.one, 2));
  const cursor = present(held.get()),
    peer = new SwPaM(f.at(f.one, 3), f.at(f.one, 1), cursor);
  const physical = [
    cursor.GetBound(),
    cursor.GetBound(false),
    peer.GetBound(),
    peer.GetBound(false),
  ];
  CorrectUnoCursorsAbsolute(f.doc, f.at(f.one, 1), f.at(f.one, 3), f.at(f.one, 6));
  expect(
    [cursor.GetPoint(), peer.GetPoint(), peer.GetMark()].map(
      /** Reads actual corrected content offsets. @param p - Native position. @returns Offset. */ (
        p,
      ) => p.GetContentIndex(),
    ),
  ).toEqual([6, 6, 6]);
  expect([
    cursor.GetBound(),
    cursor.GetBound(false),
    peer.GetBound(),
    peer.GetBound(false),
  ]).toEqual(physical);
  held.reset();
  f.close();
});
it("invalidates the actual text API cursor when its corrected point leaves its cell", /** Leave-section comparison must use the pre-correction point. @returns Nothing. */ () => {
  const f = fixture(),
    range = new SwPaM(f.at(f.one, 2));
  const api = new SwXTextCursor(range, new SwXText(f.doc, f.first));
  range.Dispose();
  const weak = present(f.doc.mvUnoCursorTable[0]);
  CorrectUnoCursorsAbsolute(f.doc, f.at(f.one, 1), f.at(f.one, 3), f.at(f.two, 1));
  expect(weak.expired()).toBe(true);
  let failure: unknown;
  try {
    api.GetCursor();
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(RuntimeException);
  api.dispose();
  f.close();
});
it("retains a cursor whose point never enters the correction range despite a different target section", /** Leaving the section alone does not trigger source invalidation without a correction. @returns Nothing. */ () => {
  const f = fixture(),
    held = f.doc.CreateUnoCursor(f.at(f.one, 5)),
    pointer = new UnoCursorPointer(held);
  const cursor = present(held.get()),
    broadcast = vi.spyOn(cursor.m_aNotifier, "Broadcast");
  CorrectUnoCursorsAbsolute(f.doc, f.at(f.one, 1), f.at(f.one, 3), f.at(f.two, 1));
  expect(cursor.GetPoint().GetNode()).toBe(f.one);
  expect(broadcast).not.toHaveBeenCalled();
  expect(pointer.get()).toBe(cursor);
  broadcast.mockRestore();
  pointer.Dispose();
  held.reset();
  f.close();
});
it("respects RemainInSection false while still correcting cross-cell endpoints", /** Uses the actual native flag rather than text-owner heuristics. @returns Nothing. */ () => {
  const f = fixture(),
    held = f.doc.CreateUnoCursor(f.at(f.one, 2)),
    pointer = new UnoCursorPointer(held);
  const cursor = present(held.get());
  cursor.SetRemainInSection(false);
  const broadcast = vi.spyOn(cursor.m_aNotifier, "Broadcast");
  CorrectUnoCursorsAbsolute(f.doc, f.at(f.one, 1), f.at(f.one, 3), f.at(f.two, 1));
  expect(cursor.GetPoint().GetNode()).toBe(f.two);
  expect(cursor.GetPoint().GetContentIndex()).toBe(1);
  expect(pointer.get()).toBe(cursor);
  expect(broadcast).not.toHaveBeenCalled();
  broadcast.mockRestore();
  pointer.Dispose();
  held.reset();
  f.close();
});
it("corrects the independent table selection ring and its peers after ordinary cursor correction", /** Table construction's source false flag avoids invalidation while preserving every selection owner. @returns Nothing. */ () => {
  const f = fixture(),
    held = f.doc.CreateUnoCursor(f.at(f.one, 2), true);
  const cursor = held.get();
  assert(cursor instanceof SwUnoTableCursor);
  const pointer = new UnoCursorPointer(held),
    selection = cursor.GetSelRing();
  selection.SetMark();
  selection.GetMark().Assign(f.one, 1);
  const peer = new SwPaM(f.at(f.one, 3), undefined, selection);
  CorrectUnoCursorsAbsolute(f.doc, f.at(f.one, 1), f.at(f.one, 3), f.at(f.two, 4));
  for (const p of [cursor.GetPoint(), selection.GetPoint(), selection.GetMark(), peer.GetPoint()]) {
    expect(p.GetNode()).toBe(f.two);
    expect(p.GetContentIndex()).toBe(4);
  }
  expect(pointer.get()).toBe(cursor);
  pointer.Dispose();
  held.reset();
  f.close();
});
it("preserves upstream invalidation when only an inactive physical bound is corrected", /** WRITER335's changed result reaches its native notification consumer. @returns Nothing. */ () => {
  const f = fixture(),
    held = f.doc.CreateUnoCursor(f.at(f.one, 5)),
    cursor = present(held.get());
  const pointer = new UnoCursorPointer(held),
    broadcast = vi.spyOn(cursor.m_aNotifier, "Broadcast");
  cursor.GetBound(false).Assign(f.one, 2);
  CorrectUnoCursorsAbsolute(f.doc, f.at(f.one, 1), f.at(f.one, 3), f.at(f.two, 1));
  expect(cursor.GetPoint().GetNode()).toBe(f.one);
  expect(cursor.GetPoint().GetContentIndex()).toBe(5);
  expect(cursor.GetBound(false).GetNode()).toBe(f.two);
  expect(broadcast).toHaveBeenCalledOnce();
  expect(broadcast.mock.calls[0]?.[0].GetId()).toBe(SfxHintId.SwUnoCursorHint);
  expect(pointer.get()).toBeUndefined();
  broadcast.mockRestore();
  pointer.Dispose();
  held.reset();
  f.close();
});
it("cleans expired weak owners and corrects every remaining document cursor", /** Native cleanup precedes weak-lock traversal without an owning registry. @returns Nothing. */ () => {
  const f = fixture(),
    expired = f.doc.CreateUnoCursor(f.at(f.one, 2));
  expired.reset();
  const a = f.doc.CreateUnoCursor(f.at(f.one, 1)),
    b = f.doc.CreateUnoCursor(f.at(f.one, 3));
  CorrectUnoCursorsAbsolute(f.doc, f.at(f.one, 1), f.at(f.one, 3), f.at(f.one, 4));
  expect(f.doc.mvUnoCursorTable).toHaveLength(2);
  expect(present(a.get()).GetPoint().GetContentIndex()).toBe(4);
  expect(present(b.get()).GetPoint().GetContentIndex()).toBe(4);
  a.reset();
  b.reset();
  f.close();
});
