/** @fileoverview Independent native font-size script/Which/pool/range contracts over real Writer graph owners. */
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import { MakeTextAttr } from "../txtnode/thints";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { GetWhichOfScript } from "../attr/hints";
import {
  SvtScriptType,
  FromI18NToSvtScriptType,
  FromSvtScriptTypeToI18N,
  GetScriptTypeOfLanguage,
  GetI18NScriptTypeOfLanguage,
} from "../../../../svl/inc/languageoptions";
import {
  setConfiguredSystemLanguage,
  setConfiguredSystemUILanguage,
} from "../../../../i18nlangtag/source/isolang/mslangid";
import { SetAttrMode } from "../../../inc/swtypes";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual frame graphs and restores the real language configuration ports. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
    setConfiguredSystemLanguage(0);
    setConfiguredSystemUILanguage(0);
  },
);
/** Creates a real document/shell. @returns Native fixture. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abcdef");
  return { session, shell, doc, node };
}
/** Assigns actual selection endpoints. @param f - Fixture. @param start - Start offset. @param end - End offset. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, start: number, end: number): void {
  const a = new SwPosition(f.node, end),
    b = new SwPosition(f.node, start);
  f.shell.SetPaM(a, b);
  a.Dispose();
  b.Dispose();
}
it("keeps original script scalar conversions and system versus explicit language admission", /** No language registry or dummy font provider is substituted. @returns Nothing. */ () => {
  for (const [source, flags] of [
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 4],
    [9, 0],
  ])
    expect(FromI18NToSvtScriptType(source as number)).toBe(flags);
  for (const [flags, source] of [
    [0, 0],
    [1, 1],
    [2, 2],
    [4, 3],
    [8, 0],
    [7, 0],
  ])
    expect(FromSvtScriptTypeToI18N(flags as SvtScriptType)).toBe(source);
  setConfiguredSystemLanguage(0x401);
  expect(GetScriptTypeOfLanguage(0)).toBe(4);
  expect(GetScriptTypeOfLanguage(0x400)).toBe(4);
  expect(GetScriptTypeOfLanguage(0x3ff)).toBe(1);
  expect(GetScriptTypeOfLanguage(0x800)).toBe(1);
  expect(GetI18NScriptTypeOfLanguage(0x411)).toBe(2);
  expect(GetI18NScriptTypeOfLanguage(0x401)).toBe(3);
  expect(GetI18NScriptTypeOfLanguage(0x409)).toBe(1);
});
it("maps every original font/language family while WEAK uses actual application language", /** Other Which families stay unchanged. @returns Nothing. */ () => {
  for (const family of [
    [10, 24, 29],
    [7, 22, 27],
    [8, 23, 28],
    [15, 26, 31],
    [11, 25, 30],
  ])
    for (const which of family)
      for (const [script, index] of [
        [1, 0],
        [2, 1],
        [3, 2],
        [9, 0],
      ])
        expect(GetWhichOfScript(which, script as number)).toBe(family[index as number]);
  setConfiguredSystemLanguage(0x401);
  expect(GetWhichOfScript(8, 4)).toBe(28);
  setConfiguredSystemLanguage(0x411);
  expect(GetWhichOfScript(28, 4)).toBe(23);
  setConfiguredSystemLanguage(0x409);
  expect(GetWhichOfScript(23, 4)).toBe(8);
  expect(GetWhichOfScript(3, 4)).toBe(3);
});
it("reads original layout-absent script ranges, preceding caret character and real language fallback", /** Actual BreakIteratorImpl handles UTF16/script transitions. @returns Nothing. */ () => {
  const f = fixture();
  f.node.SetText("A漢ش");
  select(f, 0, 3);
  expect(f.shell.GetScriptType()).toBe(7);
  select(f, 2, 2);
  expect(f.shell.GetScriptType()).toBe(2);
  select(f, 1, 1);
  expect(f.shell.GetScriptType()).toBe(1);
  select(f, 3, 3);
  expect(f.shell.GetScriptType()).toBe(4);
  setConfiguredSystemLanguage(0x401);
  f.node.SetText(" ");
  select(f, 0, 1);
  expect(f.shell.GetScriptType()).toBe(4);
  setConfiguredSystemLanguage(0x411);
  f.node.SetText("");
  select(f, 0, 0);
  expect(f.shell.GetScriptType()).toBe(2);
});
it("emits source node and automatic contributions without partitioning overlaps", /** Source order and original clipping remain observable. @returns Nothing. */ () => {
  const f = fixture();
  f.node.SetAttr(new SvxFontHeightItem(240, 100, 8));
  const set = new SfxItemSet(f.doc.GetAttrPool(), [[1, 48]]);
  set.Put(new SvxFontHeightItem(400, 100, 8));
  f.node.GetOrCreateSwpHints().Insert(MakeTextAttr(f.doc, set, 2, 4));
  select(f, 1, 5);
  const values = f.shell.GetItemWithPaM(8);
  try {
    expect(
      values.map(
        /** Reads independent original item/range contributions. @param entry - Borrowed item plus owned range. @returns Literal projection. */ ([
          item,
          pam,
        ]) => [
          (item as SvxFontHeightItem).GetHeight(),
          pam.Start().GetContentIndex(),
          pam.End().GetContentIndex(),
        ],
      ),
    ).toEqual([
      [240, 1, 5],
      [400, 2, 4],
    ]);
  } finally {
    for (const [, pam] of values) pam.Dispose();
  }
});
it("retains original empty-set null/default and nonmatching-item suppression", /** An absent contribution is not repaired with an invented effective-run default. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 0, 6);
  expect(f.shell.GetItemWithPaM(8)).toEqual([]);
  const empty = new SfxItemSet(f.doc.GetAttrPool(), [[1, 48]]);
  f.node.GetOrCreateSwpHints().Insert(MakeTextAttr(f.doc, empty, 0, 3));
  const nonmatching = new SfxItemSet(f.doc.GetAttrPool(), [[1, 48]]);
  nonmatching.Put(new SvxFontHeightItem(400, 100, 23));
  f.node.GetOrCreateSwpHints().Insert(MakeTextAttr(f.doc, nonmatching, 3, 6));
  const values = f.shell.GetItemWithPaM(8);
  try {
    expect(values).toHaveLength(1);
    expect(values[0]?.[0]).toBeUndefined();
    expect(values[0]?.[1].End().GetContentIndex()).toBe(6);
  } finally {
    for (const [, pam] of values) pam.Dispose();
  }
});
it("uses actual slot metadata for all three native font heights without replacing the pool", /** Both mapping directions and duplicate admission retain native identities. @returns Nothing. */ () => {
  const f = fixture(),
    pool = f.doc.GetAttrPool();
  for (const [slot, which] of [
    [10015, 8],
    [10888, 23],
    [10893, 28],
  ]) {
    expect(pool.GetWhichIDFromSlotID(slot as number)).toBe(which);
    expect(pool.GetSlotId(which as number)).toBe(slot);
  }
  const standalone = new SfxItemPool();
  standalone.RegisterDefaultItem(new SfxInt16Item(1, 7), undefined, 10015);
  standalone.RegisterDefaultItem(new SfxInt16Item(2, 9));
  expect(standalone.GetWhichIDFromSlotID(10015)).toBe(1);
  expect(standalone.GetSlotId(1)).toBe(10015);
  expect(standalone.GetSlotId(2)).toBe(2);
  const unmapped = new SfxItemPool();
  unmapped.RegisterDefaultItem(new SfxInt16Item(1, 5));
  expect(unmapped.GetSlotId(1)).toBe(1);
  const parent = new SfxItemPool();
  parent.SetSecondaryPool(standalone);
  expect(parent.GetSlotId(1)).toBe(10015);
  expect(parent.GetUserDefaultItem(1)).toBeNull();
  expect(
    /** Invalid repeated native slot field. @returns Nothing. */ () =>
      standalone.RegisterDefaultItem(new SfxInt16Item(3, 11), undefined, 10015),
  ).toThrow("Duplicate pool slot");
});

it("retains absent item state and independent internet hints without inventing a character-style provider", /** Native item lookup can produce a null contribution from initialized INVALID node state. @returns Nothing. */ () => {
  const f = fixture();
  f.node.SetAttr(new SvxFontHeightItem(240, 100, 8));
  f.node.GetSwAttrSet().InvalidateItem(8);
  select(f, 0, 6);
  const values = f.shell.GetItemWithPaM(8);
  try {
    expect(values).toHaveLength(1);
    expect(values[0]?.[0]).toBeUndefined();
  } finally {
    for (const [, pam] of values) pam.Dispose();
  }
});

it("retains actual text-node traversal through table section boundaries and cross-node selection", /** Nontext nodes are skipped without collapsing source ranges or script queries. @returns Nothing. */ () => {
  const f = fixture(),
    table = f.doc.nodes.MakeTableNode("Script ranges");
  table.AddColumnWidth(2000);
  const row = f.doc.nodes.AppendTableRow(table, 1),
    middle = row.GetTabBoxes()[0]?.GetParagraphs()[0] as SwTextNode;
  middle.SetText("漢字");
  const tail = f.doc.nodes.MakeTextNode("شس");
  f.node.SetAttr(new SvxFontHeightItem(240, 100, 8));
  middle.SetAttr(new SvxFontHeightItem(300, 100, 8));
  tail.SetAttr(new SvxFontHeightItem(400, 100, 8));
  const point = new SwPosition(tail, 2),
    mark = new SwPosition(f.node, 1);
  f.shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  expect(f.shell.GetScriptType()).toBe(7);
  const values = f.shell.GetItemWithPaM(8);
  try {
    expect(
      values.map(
        /** Reads original per-node ranges. @param entry - Source contribution. @returns Value and limits. */ ([
          item,
          pam,
        ]) => [
          (item as SvxFontHeightItem).GetHeight(),
          pam.Start().GetContentIndex(),
          pam.End().GetContentIndex(),
        ],
      ),
    ).toEqual([
      [240, 1, 6],
      [300, 0, 2],
      [400, 0, 2],
    ]);
  } finally {
    for (const [, pam] of values) pam.Dispose();
  }
});

it("clips selected automatic contributions and ignores source ranges outside the selection", /** Start/end inequalities remain the native ones, including end-at-start exclusion. @returns Nothing. */ () => {
  const f = fixture(),
    set = new SfxItemSet(f.doc.GetAttrPool(), [[8, 8]]);
  set.Put(new SvxFontHeightItem(400, 100, 8));
  for (const [start, end] of [
    [0, 1],
    [1, 5],
    [6, 6],
  ])
    f.node.GetOrCreateSwpHints().Insert(MakeTextAttr(f.doc, set, start as number, end as number));
  select(f, 2, 4);
  const values = f.shell.GetItemWithPaM(8);
  try {
    expect(values).toHaveLength(1);
    expect([
      values[0]?.[1].Start().GetContentIndex(),
      values[0]?.[1].End().GetContentIndex(),
    ]).toEqual([2, 4]);
  } finally {
    for (const [, pam] of values) pam.Dispose();
  }
});
it("applies an explicit source PaM while retaining the current selection and rejecting unported flags before mutation", /** Per-contribution font commands must not reset the real cursor. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 0, 6);
  const point = f.shell.GetCursor().GetPoint();
  const a = new SwPosition(f.node, 1),
    b = new SwPosition(f.node, 4),
    pam = new SwPaM(a, b);
  a.Dispose();
  b.Dispose();
  const set = new SfxItemSet(f.doc.GetAttrPool(), [[8, 8]]);
  set.Put(new SvxFontHeightItem(300, 100, 8));
  try {
    expect(
      /** Unsupported modes stay explicit at the checked boundary. @returns Change result. */ () =>
        f.shell.SetAttrSet(set, SetAttrMode.DONTEXPAND, pam),
    ).toThrow("not implemented");
    expect(f.shell.SetAttrSet(set, SetAttrMode.DEFAULT, pam)).toBe(true);
    expect(f.shell.GetCursor().GetPoint()).toBe(point);
    const result = new SfxItemSet(f.doc.GetAttrPool(), [[8, 8]]);
    f.node.GetParaAttr(result, 1, 4);
    expect((result.Get(8) as SvxFontHeightItem).GetHeight()).toBe(300);
  } finally {
    pam.Dispose();
  }
});
